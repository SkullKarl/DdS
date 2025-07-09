import React, { useState, useEffect } from 'react';
import { 
  Text, 
  View, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  StatusBar, 
  Dimensions, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ClientService } from '../../services/client/ClientService';

const { width } = Dimensions.get('window');

interface Package {
  id_paquete: number;
  fecha_e: string;
  direccion_entrega: string;
  estado: string;
  peso: number;
  dimensiones: string;
}

export default function MyShipmentsScreen() {
  const { theme, isDark } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setError(null);
      const clientPackages = await ClientService.getCurrentClientPackages();
      setPackages(clientPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Error al cargar los paquetes');
      Alert.alert('Error', 'No se pudieron cargar los paquetes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en bodega':
        return '#FFA500';
      case 'en transito':
        return '#007AFF';
      case 'entregado':
        return '#34C759';
      case 'cancelado':
        return '#FF3B30';
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'en bodega':
        return 'archive-outline';
      case 'en transito':
        return 'car-outline';
      case 'entregado':
        return 'checkmark-circle-outline';
      case 'cancelado':
        return 'close-circle-outline';
      default:
        return 'cube-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPackageItem = ({ item }: { item: Package }) => (
    <View style={[styles.packageCard, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.packageHeader}>
        <View style={styles.packageInfo}>
          <Text style={[styles.packageId, { color: theme.textPrimary }]}>
            Paquete #{item.id_paquete}
          </Text>
          <Text style={[styles.deliveryDate, { color: theme.textSecondary }]}>
            Entrega: {formatDate(item.fecha_e)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.estado) as any} 
            size={16} 
            color={getStatusColor(item.estado)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.estado) }]}>
            {item.estado}
          </Text>
        </View>
      </View>
      
      <View style={styles.packageDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.address, { color: theme.textPrimary }]}>
            {item.direccion_entrega}
          </Text>
        </View>
        
        <View style={styles.packageSpecs}>
          <View style={styles.specItem}>
            <Ionicons name="scale-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.specText, { color: theme.textSecondary }]}>
              {item.peso} kg
            </Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="cube-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.specText, { color: theme.textSecondary }]}>
              {item.dimensiones}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef']}
        style={styles.container}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando paquetes...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef']}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Mis Envíos
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {packages.length} paquete{packages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {packages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No tienes paquetes
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Cuando crees un paquete, aparecerá aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={packages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id_paquete.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    padding: 20,
  },
  packageCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  packageId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  deliveryDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  packageDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  address: {
    fontSize: 14,
    flex: 1,
  },
  packageSpecs: {
    flexDirection: 'row',
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});