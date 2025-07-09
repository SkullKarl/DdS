import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthService, ClientRegistrationData } from '../../services/AuthService';

const { width, height } = Dimensions.get('window');

export default function ClientRegisterScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [preferenciaNotificacion, setPreferenciaNotificacion] = useState('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    if (!AuthService.validateEmail(email)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateEmail(email)) return;

    if (!password) {
      Alert.alert("Error", "Por favor ingresa una contraseña");
      return;
    }

    if (!nombre || !telefono || !direccion) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);

    try {
      const clientData: ClientRegistrationData = {
        email,
        password,
        nombre,
        telefono,
        direccion,
        preferencia_notificacion: preferenciaNotificacion
      };

      await AuthService.registerClient(clientData);
      Alert.alert('¡Registro exitoso!', 'Revisa tu correo para confirmar tu cuenta.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message || "Ocurrió un problema con el servidor. Intenta nuevamente.");
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const renderContent = () => (
    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
      <View style={[styles.headerContainer, { backgroundColor: theme.primary + '15' }]}>
        <Ionicons name="person-add" size={32} color={theme.primary} />
      </View>
      
      <Text style={[styles.title, { color: theme.textPrimary }]}>Registro de Cliente</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Crea tu cuenta para enviar paquetes
      </Text>

      {/* Email input */}
      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
          placeholder="Correo Electrónico"
          placeholderTextColor={theme.textTertiary}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          style={[styles.input, { color: theme.textPrimary }]}
          autoCapitalize="none"
          keyboardType="email-address"
          onBlur={() => validateEmail(email)}
        />
      </View>
      {emailError ? <Text style={[styles.errorText, { color: theme.error }]}>{emailError}</Text> : null}

      {/* Password input */}
      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor={theme.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { color: theme.textPrimary, paddingRight: 40 }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={theme.textTertiary}
          />
        </TouchableOpacity>
      </View>

      {/* Personal Information */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Información Personal</Text>
      
      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Ionicons name="person-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
          placeholder="Nombre completo"
          placeholderTextColor={theme.textTertiary}
          value={nombre}
          onChangeText={setNombre}
          style={[styles.input, { color: theme.textPrimary }]}
        />
      </View>

      <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Ionicons name="call-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
          placeholder="Teléfono"
          placeholderTextColor={theme.textTertiary}
          value={telefono}
          onChangeText={setTelefono}
          style={[styles.input, { color: theme.textPrimary }]}
          keyboardType="phone-pad"
        />
      </View>

      <View style={[styles.inputContainer, styles.addressInput, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
        <Ionicons name="home-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
        <TextInput
          placeholder="Dirección completa"
          placeholderTextColor={theme.textTertiary}
          value={direccion}
          onChangeText={setDireccion}
          style={[styles.input, { color: theme.textPrimary }]}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Notification Preferences */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Preferencia de Notificación</Text>
      <View style={styles.preferenceContainer}>
        <TouchableOpacity
          style={[
            styles.preferenceButton,
            { borderColor: theme.primary },
            preferenciaNotificacion === 'email' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setPreferenciaNotificacion('email')}
        >
          <Ionicons
            name="mail-outline"
            size={16}
            color={preferenciaNotificacion === 'email' ? '#fff' : theme.primary}
          />
          <Text style={[
            styles.preferenceText,
            { color: preferenciaNotificacion === 'email' ? '#fff' : theme.primary }
          ]}>
            Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.preferenceButton,
            { borderColor: theme.primary },
            preferenciaNotificacion === 'sms' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setPreferenciaNotificacion('sms')}
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={preferenciaNotificacion === 'sms' ? '#fff' : theme.primary}
          />
          <Text style={[
            styles.preferenceText,
            { color: preferenciaNotificacion === 'sms' ? '#fff' : theme.primary }
          ]}>
            SMS
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.textInverse} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.textInverse }]}>
            CREAR CUENTA
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: theme.textSecondary }]}>
          ← Volver a selección de tipo
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    Platform.OS === 'web' ? (
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? theme.backgroundGradient as [string, string, ...string[]] : ['#f0f2ff', '#e2e6ff']}
          style={styles.background}
        />
        <StatusBar style={isDark ? "light" : "dark"} />
        
        <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
          <Ionicons 
            name={isDark ? "sunny-outline" : "moon-outline"} 
            size={24} 
            color={theme.textPrimary} 
          />
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          decelerationRate="normal"
          overScrollMode="auto"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          scrollIndicatorInsets={{ right: 1 }}
        >
          {renderContent()}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>© 2025 Nombre app</Text>
        </View>
      </View>
    ) : (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <LinearGradient
            colors={isDark ? theme.backgroundGradient as [string, string, ...string[]] : ['#f0f2ff', '#e2e6ff']}
            style={styles.background}
          />
          <StatusBar style={isDark ? "light" : "dark"} />
          
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons 
              name={isDark ? "sunny-outline" : "moon-outline"} 
              size={24} 
              color={theme.textPrimary} 
            />
          </TouchableOpacity>

          <ScrollView 
            contentContainerStyle={styles.scrollContainer} 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            decelerationRate="normal"
            bounces={true}
            alwaysBounceVertical={true}
            overScrollMode="auto"
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={Platform.OS === 'android'}
            scrollIndicatorInsets={{ right: 1 }}
            automaticallyAdjustKeyboardInsets={true}
            automaticallyAdjustContentInsets={false}
          >
            {renderContent()}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>© 2025 Nombre app</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
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
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'web' ? 40 : 60,
    paddingBottom: Platform.OS === 'web' ? 80 : 100,
    paddingHorizontal: Platform.OS === 'web' ? 40 : 20,
    width: '100%',
    minHeight: Platform.OS === 'web' ? height : height * 1.2,
  },
  card: {
    borderRadius: 24,
    padding: Platform.OS === 'web' ? 40 : 30,
    width: Platform.OS === 'web' 
      ? Math.min(500, width * 0.9) 
      : width > 400 ? width * 0.85 : width * 0.9,
    maxWidth: 500,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  headerContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : width < 400 ? 24 : 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 18 : width < 400 ? 14 : 16,
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: Platform.OS === 'web' ? 26 : 22,
  },
  sectionTitle: {
    fontSize: Platform.OS === 'web' ? 18 : width < 400 ? 14 : 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    height: Platform.OS === 'web' ? 60 : width < 400 ? 50 : 56,
    paddingHorizontal: 16,
  },
  addressInput: {
    height: Platform.OS === 'web' ? 100 : width < 400 ? 70 : 80,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  errorText: {
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 4,
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    gap: Platform.OS === 'web' ? 16 : 8,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: Platform.OS === 'web' ? 16 : width < 400 ? 10 : 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  preferenceText: {
    fontSize: Platform.OS === 'web' ? 16 : width < 400 ? 13 : 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  button: {
    paddingVertical: Platform.OS === 'web' ? 20 : width < 400 ? 14 : 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: Platform.OS === 'web' ? 18 : width < 400 ? 14 : 16,
    letterSpacing: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
