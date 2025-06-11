import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  RefreshControl,
  Switch,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, DarkColors } from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';
import { ProfileService, DriverProfile } from '../../services/driver/ProfileService';

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Reemplazamos el estado local con el del contexto
  const { isDark, toggleTheme } = useTheme();
  
  const [profileData, setProfileData] = useState<DriverProfile>({
    nombre: '',
    correo: '',
    telefono: '',
    estado: '',
    licencencia: '',
    vehiculo: '',
    foto_url: null,
    entregas_completadas: 0,
    valoracion: 0,
  });

  // Referencias para animaciones
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getCurrentProfile();
      setProfileData(data);
    } catch (error: any) {
      console.error('Error al cargar datos del perfil:', error.message);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = async () => {
    try {
      await ProfileService.logout();
      
      // Navegar a la pantalla de login después de cerrar sesión exitosamente
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error.message);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  };

  // Configurar animaciones cuando estamos en estado de carga
  useEffect(() => {
    if (loading) {
      // Animación de la barra de progreso
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      }).start();
      
      // Animación pulsante para el icono
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          }),
        ])
      ).start();
    }
  }, [loading]);
  
  // El resto del componente ahora usa isDark en vez de isDarkMode
  if (loading) {
    const progressWidth = loadingAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '80%'],
    });
    
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <LinearGradient
          colors={isDark ? Colors.darkBackgroundGradient || ['#1a1a2e', '#16213e'] : Colors.backgroundGradient}
          style={styles.background}
        />
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingCard, isDark && styles.darkLoadingCard]}>
            <Animated.View 
              style={[
                styles.loadingIconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: isDark 
                    ? 'rgba(91, 103, 202, 0.15)' 
                    : 'rgba(57, 73, 171, 0.1)'
                }
              ]}
            >
              <Ionicons 
                name="person" 
                size={40} 
                color={isDark ? DarkColors.primary : Colors.primary} 
              />
            </Animated.View>
            
            <Text style={[styles.loadingTitle, isDark && styles.darkText]}>
              Cargando tu perfil
            </Text>
            <Text style={[styles.loadingSubtext, isDark && styles.darkSecondaryText]}>
              Estamos preparando tus datos...
            </Text>
            
            <View style={styles.loadingProgressBar}>
              <Animated.View 
                style={[
                  styles.loadingProgress, 
                  isDark && styles.darkLoadingProgress,
                  { width: progressWidth }
                ]} 
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={isDark ? Colors.darkBackgroundGradient || ['#1a1a2e', '#16213e'] : Colors.backgroundGradient}
        style={styles.background}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Theme Toggle */}
        <View style={styles.themeToggleContainer}>
          <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={isDark ? "#f1c40f" : "#f39c12"} />
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDark ? "#f5dd4b" : "#f4f3f4"}
            style={styles.themeToggle}
          />
        </View>
        
        {/* Header con foto de perfil */}
        <View style={[styles.header, isDark && styles.darkHeader]}>
          <View style={styles.profileImageContainer}>
            {profileData.foto_url ? (
              <Image 
                source={{ uri: profileData.foto_url }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={50} color={Colors.textInverse} />
              </View>
            )}
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={18} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.profileName, isDark && styles.darkProfileName]}>{profileData.nombre}</Text>
          <Text style={styles.profileRole}>Conductor</Text>
          
          {/* Sección de estadísticas (entregas y valoración) */}
          <View style={[styles.statsContainer, isDark && styles.darkInfoCard]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isDark && styles.darkText]}>{profileData.entregas_completadas}</Text>
              <Text style={[styles.statLabel, isDark && styles.darkSecondaryText]}>Entregas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Text style={[styles.statValue, isDark && styles.darkText]}>{profileData.valoracion.toFixed(1)}</Text>
                <Ionicons name="star" size={16} color={Colors.gold} />
              </View>
              <Text style={[styles.statLabel, isDark && styles.darkSecondaryText]}>Valoración</Text>
            </View>
          </View>
        </View>
        
        {/* Sección de información personal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Información Personal</Text>
          
          <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, isDark && styles.darkSecondaryText]}>Correo Electrónico</Text>
                <Text style={[styles.infoValue, isDark && styles.darkText]}>{profileData.correo}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, isDark && styles.darkSecondaryText]}>Teléfono</Text>
                <Text style={[styles.infoValue, isDark && styles.darkText]}>{profileData.telefono}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, isDark && styles.darkSecondaryText]}>Estado</Text>
                <Text style={[styles.infoValue, isDark && styles.darkText]}>{profileData.estado}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Sección de información del conductor */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Información del Conductor</Text>
          
          <View style={[styles.infoCard, isDark && styles.darkInfoCard]}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="card-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, isDark && styles.darkSecondaryText]}>Número de Licencia</Text>
                <Text style={[styles.infoValue, isDark && styles.darkText]}>{profileData.licencencia}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="car-sport-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, isDark && styles.darkSecondaryText]}>Vehículo</Text>
                <Text style={[styles.infoValue, isDark && styles.darkText]}>{profileData.vehiculo}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Botón de editar perfil */}
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color={Colors.textInverse} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Editar Perfil</Text>
        </TouchableOpacity>
        
        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={[styles.logoutButton, isDark && styles.darkLogoutButton]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 30,
    width: '90%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  darkLoadingCard: {
    backgroundColor: DarkColors.cardBackground,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 25,
    textAlign: 'center',
  },
  loadingProgressBar: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  darkLoadingProgress: {
    backgroundColor: DarkColors.primary,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  darkHeader: {
    // Dark theme specific styles for header
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.cardBackground,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.cardBackground,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary, // Cambiar de textName a textPrimary para mejor consistencia
    marginBottom: 5,
  },
  darkProfileName: {
    color: DarkColors.textPrimary, // Usar el color textPrimary del tema oscuro
  },
  profileRole: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: Colors.divider,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  darkInfoCard: {
    backgroundColor: '#2c3e50',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.iconBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    width: '100%',
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.danger,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  darkLogoutButton: {
    backgroundColor: '#2c3e50',
    borderColor: Colors.danger,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: Colors.textInverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButtonText: {
    color: Colors.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10,
    paddingRight: 10,
  },
  themeToggle: {
    marginLeft: 8,
  },
  darkText: {
    color: '#f4f4f4',
  },
  darkSecondaryText: {
    color: '#bdc3c7',
  },
});