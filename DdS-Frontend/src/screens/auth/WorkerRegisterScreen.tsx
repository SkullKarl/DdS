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
import {
  AuthService,
  DriverRegistrationData,
  DispatcherRegistrationData
} from '../../services/AuthService';

const { width, height } = Dimensions.get('window');

export default function WorkerRegisterScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'despachador' | 'conductor' | ''>('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  // Driver-only fields
  const [estado, setEstado] = useState('');
  const [licencia, setLicencia] = useState('');
  const [vehiculo, setVehiculo] = useState('');
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

    if (!role) {
      Alert.alert("Error", "Por favor selecciona un rol");
      return;
    }

    if (!nombre || !telefono) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos");
      return;
    }

    if (role === 'conductor' && (!estado || !licencia || !vehiculo)) {
      Alert.alert("Error", "Por favor completa todos los campos del conductor");
      return;
    }

    setLoading(true);

    try {
      if (role === 'despachador') {
        const dispatcherData: DispatcherRegistrationData = {
          email,
          password,
          nombre,
          telefono
        };

        await AuthService.registerDispatcher(dispatcherData);
      } else if (role === 'conductor') {
        const driverData: DriverRegistrationData = {
          email,
          password,
          nombre,
          telefono,
          estado,
          licencia,
          vehiculo
        };

        await AuthService.registerDriver(driverData);
      }

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
        <Ionicons name="briefcase" size={32} color={theme.primary} />
      </View>
      
      <Text style={[styles.title, { color: theme.textPrimary }]}>Registro de Trabajador</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Crea tu cuenta como empleado de la empresa
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

      {/* Role selection */}
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Selecciona tu rol:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            { borderColor: theme.primary },
            role === 'despachador' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setRole('despachador')}
        >
          <Ionicons
            name="briefcase-outline"
            size={20}
            color={role === 'despachador' ? '#fff' : theme.primary}
            style={styles.roleIcon}
          />
          <Text style={[
            styles.roleText,
            { color: role === 'despachador' ? '#fff' : theme.primary }
          ]}>
            Despachador
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            { borderColor: theme.primary },
            role === 'conductor' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setRole('conductor')}
        >
          <Ionicons
            name="car-outline"
            size={20}
            color={role === 'conductor' ? '#fff' : theme.primary}
            style={styles.roleIcon}
          />
          <Text style={[
            styles.roleText,
            { color: role === 'conductor' ? '#fff' : theme.primary }
          ]}>
            Conductor
          </Text>
        </TouchableOpacity>
      </View>

      {/* Common fields */}
      {(role === 'despachador' || role === 'conductor') && (
        <>
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
        </>
      )}

      {/* Driver specific fields */}
      {role === 'conductor' && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Información del Conductor</Text>
          
          <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
            <Ionicons name="location-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="Estado/Región"
              placeholderTextColor={theme.textTertiary}
              value={estado}
              onChangeText={setEstado}
              style={[styles.input, { color: theme.textPrimary }]}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
            <Ionicons name="card-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="Número de licencia"
              placeholderTextColor={theme.textTertiary}
              value={licencia}
              onChangeText={setLicencia}
              style={[styles.input, { color: theme.textPrimary }]}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
            <Ionicons name="car-sport-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="Tipo de vehículo"
              placeholderTextColor={theme.textTertiary}
              value={vehiculo}
              onChangeText={setVehiculo}
              style={[styles.input, { color: theme.textPrimary }]}
            />
          </View>
        </>
      )}

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
    paddingVertical: Platform.OS === 'web' ? 20 : 0,
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
  roleContainer: {
    width: '100%',
    marginBottom: 16,
    gap: Platform.OS === 'web' ? 12 : 8,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: Platform.OS === 'web' ? 16 : width < 400 ? 10 : 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    fontSize: Platform.OS === 'web' ? 16 : width < 400 ? 13 : 14,
    fontWeight: '600',
  },
  button: {
    paddingVertical: Platform.OS === 'web' ? 20 : width < 400 ? 14 : 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
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
