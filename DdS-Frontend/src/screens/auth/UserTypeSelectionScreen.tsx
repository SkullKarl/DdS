import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function UserTypeSelectionScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();

  const handleClientSelection = () => {
    navigation.navigate('ClientRegister');
  };

  const handleWorkerSelection = () => {
    navigation.navigate('WorkerRegister');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? theme.backgroundGradient as [string, string, ...string[]] : ['#f0f2ff', '#e2e6ff']}
        style={styles.background}
      />
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Theme toggle button */}
      <TouchableOpacity 
        style={styles.themeToggle}
        onPress={toggleTheme}
      >
        <Ionicons 
          name={isDark ? "sunny-outline" : "moon-outline"} 
          size={24} 
          color={theme.textPrimary} 
        />
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
          <Ionicons name="person-add" size={48} color={theme.primary} />
        </View>
        
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          ¡Bienvenido!
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Selecciona el tipo de cuenta que deseas crear
        </Text>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={handleClientSelection}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.optionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.optionContent}>
                <Ionicons name="person" size={32} color="white" />
                <Text style={styles.optionTitle}>Cliente</Text>
                <Text style={styles.optionDescription}>
                  Envía paquetes y realiza seguimiento de tus envíos
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={handleWorkerSelection}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2196F3', '#42A5F5']}
              style={styles.optionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.optionContent}>
                <Ionicons name="briefcase" size={32} color="white" />
                <Text style={styles.optionTitle}>Trabajador</Text>
                <Text style={styles.optionDescription}>
                  Conductor o despachador de la empresa
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.textSecondary }]}>
            ← Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          © 2025 Nombre app
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  themeToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    right: 30,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  card: {
    borderRadius: 24,
    padding: 35,
    width: width > 500 ? 450 : width * 0.9,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  optionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionGradient: {
    padding: 24,
  },
  optionContent: {
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
