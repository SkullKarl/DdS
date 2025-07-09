import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  RefreshControl,
  Switch,
  Animated,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ClientProfile } from '../../domain/Cliente';
import { ClientService } from '../../services/client/ClientService';
import { AuthService } from '../../services/AuthService';

export default function ProfileClientScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();

  const [profileData, setProfileData] = useState<ClientProfile>({
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    preferencia_notificacion: 'email',
  });

  // Animation references
  const loadingAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const profile = await ClientService.getCurrentClientProfile();
      setProfileData(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
      // Set default values if error
      setProfileData({
        nombre: 'Cliente',
        correo: 'cliente@example.com',
        telefono: '',
        direccion: '',
        preferencia_notificacion: 'email',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  const ProfileOption = ({ icon, title, subtitle, onPress, rightIcon = 'chevron-forward' }: any) => (
    <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme.cardBackground }]} onPress={onPress}>
      <View style={styles.optionLeft}>
        <View style={[styles.optionIcon, { backgroundColor: theme.iconBackground }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.optionText}>
          <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name={rightIcon} size={20} color={theme.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando perfil...
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

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Perfil</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={40} color={theme.textInverse} />
          </View>
          <Text style={[styles.profileName, { color: theme.textPrimary }]}>
            {profileData.nombre || 'Cliente'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            {profileData.correo || 'No especificado'}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Información Personal</Text>
          
          <ProfileOption
            icon="person-outline"
            title="Nombre"
            subtitle={profileData.nombre || 'No especificado'}
            onPress={() => Alert.alert('Info', 'Función de edición próximamente')}
          />
          
          <ProfileOption
            icon="mail-outline"
            title="Correo Electrónico"
            subtitle={profileData.correo || 'No especificado'}
            onPress={() => Alert.alert('Info', 'Función de edición próximamente')}
          />
          
          <ProfileOption
            icon="call-outline"
            title="Teléfono"
            subtitle={profileData.telefono || 'No especificado'}
            onPress={() => Alert.alert('Info', 'Función de edición próximamente')}
          />
          
          <ProfileOption
            icon="location-outline"
            title="Dirección"
            subtitle={profileData.direccion || 'No especificada'}
            onPress={() => Alert.alert('Info', 'Función de edición próximamente')}
          />
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Configuración</Text>
          
          <View style={[styles.optionItem, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: theme.iconBackground }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={theme.primary} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: theme.textPrimary }]}>Tema Oscuro</Text>
                <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                  {isDark ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.cardBackground}
            />
          </View>
          
          <ProfileOption
            icon="notifications-outline"
            title="Notificaciones"
            subtitle="Configurar alertas"
            onPress={() => Alert.alert('Info', 'Función de configuración próximamente')}
          />
          
          <ProfileOption
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            subtitle="Obtener ayuda"
            onPress={() => Alert.alert('Info', 'Función de soporte próximamente')}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: theme.error }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.textInverse} />
            <Text style={[styles.logoutText, { color: theme.textInverse }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
