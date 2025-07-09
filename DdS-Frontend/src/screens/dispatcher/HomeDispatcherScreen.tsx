import React, { useState, useEffect, useRef } from 'react';
import {
  Text, View, FlatList, StyleSheet, ActivityIndicator, StatusBar,
  Dimensions, TouchableOpacity, Modal, Alert, ScrollView, RefreshControl, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { DispatcherService } from '../../services/dispatcher/DispatcherService';
import { Package } from '../../domain/Package';
import { Driver } from '../../domain/Driver';

export default function HomeDispatcherScreen() {
  const { theme, isDark } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation value for smooth appearance of new items
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Old packages state for comparison during refresh
  const [oldPackages, setOldPackages] = useState<Package[]>([]);


  // Fetch initial data
  useEffect(() => {
    fetchPackages();
    fetchDrivers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Store current packages instead of clearing the view
    setOldPackages([...packages]);

    try {
      // Reset fade animation first
      fadeAnim.setValue(0.7);
      await fetchPackages();

      // Animate new items in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  const fetchPackages = async () => {
    try {
      if (!refreshing) setLoading(true);

      const data = await DispatcherService.getPackages();
      setPackages(data);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching packages:', error);
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const data = await DispatcherService.getDrivers();
      setDrivers(data);
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      // Don't set the main error state here to avoid blocking the UI
    }
  };

  const assignPackageToDriver = async () => {
    if (!selectedPackage || !selectedDriver) {
      Alert.alert('Error', 'Seleccione un paquete y un conductor');
      return;
    }

    try {
      setAssignmentLoading(true);

      const envio = await DispatcherService.getOrCreateEnvioForDriver(
        String(selectedDriver.id_conductor),
        selectedPackage
      );


      // 2. Asignar el paquete al conductor y al envío
      await DispatcherService.assignPackageToDriver(
        { ...selectedPackage, id_envio: envio.id_envio },
        String(selectedDriver.id_conductor)
      );

      Alert.alert(
        'Éxito',
        `Paquete #${selectedPackage.id_paquete} asignado a ${selectedDriver.nombre}`
      );

      // Refresh packages list
      fetchPackages();

      // Close modal
      fetchPackages();
      setModalVisible(false);
      setSelectedPackage(null);
      setSelectedDriver(null);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo asignar el paquete');
      console.error('Error assigning package:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const openAssignmentModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setModalVisible(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
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

  const filteredPackages = () => {
    if (activeFilter === 'all') return packages;
    return packages.filter(pkg => pkg.estado.toLowerCase() === activeFilter.toLowerCase());
  };

  const getStatusCount = (status: string) => {
    return packages.filter(pkg => pkg.estado.toLowerCase() === status.toLowerCase()).length;
  };

  // Add custom refresh control component
  const renderRefreshControl = () => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.primary, theme.primary]}
      tintColor={theme.primary}
      title="Actualizando..."
      titleColor={theme.textSecondary}
      progressBackgroundColor={theme.cardBackground}
    />
  );

  const renderItem = ({ item, index }: { item: Package, index: number }) => {
    const statusIcon = getStatusIcon(item.estado);

    // Staggered animation only for new items
    const isNewItem = refreshing && !oldPackages.some(pkg => pkg.id_paquete === item.id_paquete);
    const itemAnimationStyle = isNewItem ? {
      opacity: fadeAnim,
      transform: [{
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      }]
    } : {};

    return (
      <Animated.View
        style={[
          styles.packageItem,
          {
            backgroundColor: theme.cardBackground,
          },
          itemAnimationStyle
        ]}
      >
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
            <Ionicons name={statusIcon.name as any} size={16} color={statusIcon.color} />
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
            <Ionicons name="person" size={18} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textPrimary }]}>
              Cliente ID: {item.id_cliente} · Envío ID: {item.id_envio}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

        <TouchableOpacity
          style={[styles.assignButton,
          { opacity: item.estado.toLowerCase() === 'asignado' ? 0.5 : 1 }
          ]}
          onPress={() => openAssignmentModal(item)}
          disabled={item.estado.toLowerCase() === 'asignado'}
        >
          <LinearGradient
            colors={theme.primaryGradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.assignButtonGradient}
          >
            <Ionicons name="person-add" size={18} color={theme.textInverse} />
            <Text style={[styles.assignButtonText, { color: theme.textInverse }]}>
              {item.estado.toLowerCase() === 'asignado' ? 'Ya asignado' : 'Asignar a conductor'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      style={[
        styles.driverItem,
        {
          backgroundColor: selectedDriver?.id_conductor === item.id_conductor
            ? theme.primary
            : theme.cardBackground,
          borderColor: theme.border
        }
      ]}
      onPress={() => setSelectedDriver(item)}
    >
      <Ionicons
        name="person-circle"
        size={24}
        color={selectedDriver?.id_conductor === item.id_conductor
          ? theme.textInverse
          : theme.textPrimary
        }
      />
      <Text
        style={[
          styles.driverName,
          {
            color: selectedDriver?.id_conductor === item.id_conductor
              ? theme.textInverse
              : theme.textPrimary
          }
        ]}
      >
        {item.nombre}
      </Text>
    </TouchableOpacity>
  );

  // Update this conditional to check for refreshing state too
  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
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
        colors={theme.backgroundGradient as [string, string, ...string[]]}
        style={styles.background}
      />
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Panel de Despacho</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {packages.length} paquete{packages.length !== 1 ? 's' : ''} disponibles
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && styles.activeFilterTab,
              { borderColor: theme.primary }
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText,
                { color: activeFilter === 'all' ? theme.primary : theme.textSecondary }
              ]}
            >
              Todos ({packages.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'asignado' && styles.activeFilterTab,
              { borderColor: theme.primary }
            ]}
            onPress={() => setActiveFilter('asignado')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'asignado' && styles.activeFilterText,
                { color: activeFilter === 'asignado' ? theme.primary : theme.textSecondary }
              ]}
            >
              Asignados ({getStatusCount('asignado')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'en bodega' && styles.activeFilterTab,
              { borderColor: theme.primary }
            ]}
            onPress={() => setActiveFilter('en bodega')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'en bodega' && styles.activeFilterText,
                { color: activeFilter === 'en bodega' ? theme.primary : theme.textSecondary }
              ]}
            >
              En Bodega ({getStatusCount('en bodega')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'en camino' && styles.activeFilterTab,
              { borderColor: theme.primary }
            ]}
            onPress={() => setActiveFilter('en camino')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'en camino' && styles.activeFilterText,
                { color: activeFilter === 'en camino' ? theme.primary : theme.textSecondary }
              ]}
            >
              En Camino ({getStatusCount('en camino')})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'entregado' && styles.activeFilterTab,
              { borderColor: theme.primary }
            ]}
            onPress={() => setActiveFilter('entregado')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'entregado' && styles.activeFilterText,
                { color: activeFilter === 'entregado' ? theme.primary : theme.textSecondary }
              ]}
            >
              Entregados ({getStatusCount('entregado')})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {filteredPackages().length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={theme.textTertiary} />
          <Text style={[styles.noPackages, { color: theme.textTertiary }]}>
            {activeFilter === 'all'
              ? 'No hay paquetes disponibles'
              : `No hay paquetes con estado "${activeFilter}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPackages()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_paquete.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
          refreshControl={renderRefreshControl()}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Assignment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Asignar Paquete
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {selectedPackage && (
              <View style={styles.selectedPackageInfo}>
                <Text style={[styles.selectedPackageTitle, { color: theme.textPrimary }]}>
                  Paquete #{selectedPackage.id_paquete}
                </Text>
                <Text style={[styles.selectedPackageDetails, { color: theme.textSecondary }]}>
                  {selectedPackage.direccion_entrega}
                </Text>
                <Text style={[styles.selectedPackageDetails, { color: theme.textSecondary }]}>
                  Entrega: {selectedPackage.fecha_e}
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: theme.divider, marginVertical: 16 }]} />

            <Text style={[styles.driversTitle, { color: theme.textPrimary }]}>
              Seleccione un conductor:
            </Text>

            {drivers.length === 0 ? (
              <View style={styles.noDriversContainer}>
                <Ionicons name="person-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.noDriversText, { color: theme.textTertiary }]}>
                  No hay conductores disponibles
                </Text>
              </View>
            ) : (
              <FlatList
                data={drivers}
                renderItem={renderDriverItem}
                keyExtractor={(item) => item.id_conductor.toString()}
                contentContainerStyle={styles.driversListContainer}
                showsVerticalScrollIndicator={false}
                horizontal={false}
              />
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  opacity: (!selectedDriver || assignmentLoading) ? 0.5 : 1,
                  backgroundColor: theme.primary
                }
              ]}
              onPress={assignPackageToDriver}
              disabled={!selectedDriver || assignmentLoading}
            >
              {assignmentLoading ? (
                <ActivityIndicator size="small" color={theme.textInverse} />
              ) : (
                <Text style={[styles.confirmButtonText, { color: theme.textInverse }]}>
                  Confirmar Asignación
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  assignButton: {
    padding: 16,
  },
  assignButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  assignButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedPackageInfo: {
    marginBottom: 12,
  },
  selectedPackageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedPackageDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  driversTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  driversListContainer: {
    maxHeight: 300,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  driverName: {
    fontSize: 16,
    marginLeft: 12,
  },
  noDriversContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  noDriversText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    borderColor: '#e0e0e0',
  },
  activeFilterTab: {
    backgroundColor: 'rgba(57, 73, 171, 0.1)',
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    fontWeight: '700',
  },
  filterScrollContent: {
    paddingRight: 20,
  },
});