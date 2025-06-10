import React, { useState, useEffect, useRef } from 'react';
import { Text, View, FlatList, StyleSheet, ActivityIndicator, StatusBar, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { supabase } from '../../api/supabaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

// Definir la interfaz para los datos del paquete
interface Package {
  id_paquete: number;
  fecha_e: string;
  direccion_entrega: string;
  estado: string;
  id_envio: number;
  id_cliente: number;
  peso: number;
  dimensiones: string;
  // Add dispatcher information
  despachador_nombre?: string;
  despachador_id?: number;
}

export default function MyShipmentsScreen() {
  const { theme, isDark } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewPackages, setHasNewPackages] = useState(false);
  const currentPackageIds = useRef<number[]>([]);
  const [driverId, setDriverId] = useState<number | null>(null);
  
  // Animation values
  const notificationOpacity = useRef(new Animated.Value(0)).current;
  const notificationTranslateY = useRef(new Animated.Value(-50)).current;
  const refreshIconRotation = useRef(new Animated.Value(0)).current;

  // Get the current driver ID when component mounts
  useEffect(() => {
    getCurrentDriverId();
  }, []);

  // Initial fetch after we have the driver ID
  useEffect(() => {
    if (driverId) {
      fetchPackages();
    }
  }, [driverId]);

  // Get the current driver ID from the logged-in user
  const getCurrentDriverId = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('No se pudo obtener información del usuario actual');
      }
      
      console.log('Current user email:', user.email); // Debug log
      
      // Find the driver record associated with this user's email
      // Note the change from 'id' to 'id_conductor' here
      const { data: driverData, error: driverError } = await supabase
        .from('conductor')
        .select('id_conductor') // Changed from 'id' to 'id_conductor'
        .eq('correo', user.email)
        .single();
      
      if (driverError || !driverData) {
        throw new Error('No se encontró el conductor asociado a este usuario');
      }
      
      // Set the driver ID for use in fetching packages
      // Note the change from 'id' to 'id_conductor' here
      setDriverId(driverData.id_conductor); // Changed from driverData.id
    
    } catch (error: any) {
      setError(error.message);
      console.error('Error getting current driver ID:', error);
    }
  };

  // Set up subscription to listen for changes
  useEffect(() => {
    if (!driverId) return;
    
    const subscription = supabase
      .channel('asignacion-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'asignacion',
          filter: `id_conductor=eq.${driverId}`
        }, 
        () => {
          // New assignment detected for this driver
          setHasNewPackages(true);
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [driverId]);

  const fetchPackages = async () => {
    if (!driverId) return;
    
    try {
      setLoading(true);
      setHasNewPackages(false);
      
      // First, get all assignments for this driver
      const { data: assignments, error: assignmentError } = await supabase
        .from('asignacion')
        .select(`
          id_envio,
          despachador:id_despachador(id_despachador, nombre)
        `)
        .eq('id_conductor', driverId);
      
      if (assignmentError) {
        throw assignmentError;
      }
      
      if (!assignments || assignments.length === 0) {
        // No assignments for this driver
        setPackages([]);
        setLoading(false);
        return;
      }
      
      // Get the list of shipment IDs assigned to this driver
      const envioIds = assignments.map(assignment => assignment.id_envio);
      
      // Now query the paquete table to get package details
      const { data: packageData, error: packageError } = await supabase
        .from('paquete')
        .select('*')
        .in('id_envio', envioIds);
      
      if (packageError) {
        throw packageError;
      }
      
      console.log('Package data:', packageData);
      
      // Combine the data to include dispatcher information
      const transformedData = packageData?.map(pkg => {
        // Find the matching assignment to get dispatcher info
        const matchingAssignment = assignments.find(a => a.id_envio === pkg.id_envio);
        
        return {
          ...pkg,
          despachador_nombre: matchingAssignment?.despachador?.nombre || 'Desconocido',
          despachador_id: matchingAssignment?.despachador?.id_despachador  // Changed from .id to .id_despachador
        };
      }) || [];
      
      setPackages(transformedData);
      
      // Store current package IDs for comparison later
      currentPackageIds.current = transformedData.map(pkg => pkg.id_paquete);
      
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'entregado':
        return { name: 'checkmark-circle', color: theme.success };
      case 'en tránsito':
        return { name: 'time', color: theme.warning };
      case 'pendiente':
        return { name: 'hourglass', color: theme.neutral };
      case 'asignado':
        return { name: 'person', color: theme.primary };
      default:
        return { name: 'help-circle', color: theme.textTertiary };
    }
  };

  const renderItem = ({ item }: { item: Package }) => {
    const statusIcon = getStatusIcon(item.estado);
    
    return (
      <View style={[styles.packageItem, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.packageHeader}>
          <View style={styles.idContainer}>
            <Text style={[styles.packageId, { color: theme.textPrimary }]}>
              Paquete #{item.id_paquete}
            </Text>
            <Text style={[styles.packageDate, { color: theme.textTertiary }]}>
              Entrega: {item.fecha_e}
            </Text>
          </View>
          <View style={[styles.statusContainer, { backgroundColor: theme.iconBackground }]}>
            <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
            <Text style={[styles.statusText, { color: statusIcon.color }]}>
              {item.estado}
            </Text>
          </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              {item.direccion_entrega}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              Peso: {item.peso} kg · Dimensiones: {item.dimensiones}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="briefcase" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              Asignado por: {item.despachador_nombre}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="information-circle" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              Cliente ID: {item.id_cliente} · Envío ID: {item.id_envio}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Show notification with animation
  useEffect(() => {
    if (hasNewPackages) {
      // Animate notification in
      Animated.parallel([
        Animated.timing(notificationOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.spring(notificationTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
      
      // Start rotating refresh icon
      Animated.loop(
        Animated.timing(refreshIconRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ).start();
    } else {
      // Animate notification out
      Animated.parallel([
        Animated.timing(notificationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(notificationTranslateY, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      // Stop rotation animation
      refreshIconRotation.setValue(0);
    }
  }, [hasNewPackages]);

  const handleRefresh = () => {
    // Animate rotation for feedback
    Animated.timing(refreshIconRotation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start(() => {
      fetchPackages();
    });
  };

  const NewPackagesNotification = () => {
    // Don't render anything if we have no new packages
    if (!hasNewPackages) return null;
    
    // Create rotation interpolation for the refresh icon
    const spin = refreshIconRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    
    return (
      <Animated.View 
        style={[
          styles.newPackagesButtonContainer,
          {
            opacity: notificationOpacity,
            transform: [{ translateY: notificationTranslateY }]
          }
        ]}
      >
        <LinearGradient
          colors={theme.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.newPackagesButton}
        >
          <TouchableOpacity 
            style={styles.newPackagesButtonContent}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={18} color={theme.textInverse} />
            </Animated.View>
            <Text style={[styles.newPackagesText, { color: theme.textInverse }]}>
              Nuevos paquetes asignados
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando tus paquetes asignados...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.backgroundGradient}
        style={styles.background}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Mis Envíos</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {packages.length} paquete{packages.length !== 1 ? 's' : ''} asignados
        </Text>
      </View>
      
      <NewPackagesNotification />
      
      {packages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.noPackages, { color: theme.textTertiary }]}>
            No tienes paquetes asignados
          </Text>
        </View>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_paquete.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  newPackagesButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  newPackagesButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  newPackagesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  newPackagesText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 80,
  },
  packageItem: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  idContainer: {
    flex: 1,
  },
  packageId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  packageDate: {
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  detailsContainer: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPackages: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});