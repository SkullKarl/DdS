import React, { useState, useEffect } from 'react';
import {
  Text, View, StyleSheet, ActivityIndicator, StatusBar,
  ScrollView, TouchableOpacity, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { ClientService } from '../../services/client/ClientService';

export default function HomeClientScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clientInfo, setClientInfo] = useState<{nombre: string, correo: string}>({
    nombre: '',
    correo: ''
  });

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const fetchClientInfo = async () => {
    try {
      const info = await ClientService.getCurrentClientInfo();
      setClientInfo(info);
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClientInfo();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Cargando...
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
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Bienvenido {clientInfo.nombre || 'Cliente'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Panel de control del cliente
          </Text>
        </View>

        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.cardBackground }]}
            onPress={() => navigation.navigate('CreatePackage')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={48} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Crear Paquete
            </Text>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Crea un nuevo envío
            </Text>
          </TouchableOpacity>

          <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="notifications-outline" size={48} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              Notificaciones
            </Text>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
              Mantente al día con tus entregas
            </Text>
          </View>
        </View>
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
  contentContainer: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
