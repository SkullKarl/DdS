import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { 
  Alert, 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthService } from '../../services/AuthService';
import { UserRole } from '../../domain/Auth';

export default function LoginScreen({ navigation }: any) {
  // Get the current theme from context
  const { theme, isDark, toggleTheme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    // Make sure to work with a trimmed value
    const trimmedEmail = email ? email.trim() : '';
    
    // Only show error if there's actually an email entered
    if (trimmedEmail && !AuthService.validateEmail(trimmedEmail)) {
      setEmailError('Por favor ingresa un correo electrónico válido');
      return false;
    }
    
    // Clear any error
    setEmailError('');
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) return;
    if (!password) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);
    
    try {
      const userRoleData = await AuthService.login(email, password);
      
      // Navigate based on the user's role
      if (userRoleData.role === 'dispatcher') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeDispatcher' }],
        });
      } else if (userRoleData.role === 'driver') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeDriver' }],
        });
      } else if (userRoleData.role === 'client') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeClient' }],
        });
      } else {
        Alert.alert("Error", "No se encontró el usuario en ninguna tabla de roles.");
      }
    } catch (error: any) {
      // Check if the error is because the user doesn't exist
      if (error.message && (
          error.message.includes('Invalid login credentials') || 
          error.message.includes('Email not confirmed') ||
          error.message.includes('No user found'))) {
        Alert.alert("Usuario no registrado", "El correo electrónico ingresado no está registrado en nuestro sistema. Por favor verifica tus datos o regístrate.");
      } else {
        Alert.alert("Error de inicio de sesión", error.message || "Ocurrió un problema con el servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    // Only use TouchableWithoutFeedback on mobile platforms
    Platform.OS === 'web' ? (
      <View style={styles.container}>
        <LinearGradient
          colors={theme.backgroundGradient}
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
          <Text style={[styles.title, { color: theme.textPrimary }]}>Bienvenido</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Gestión de despachos y envíos</Text>
          
          <View style={[styles.inputContainer, { 
            borderColor: theme.border, 
            backgroundColor: theme.inputBackground 
          }]}>
            <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="Correo Electrónico"
              value={email}
              onChangeText={(text) => {
                // Don't trim here, just set the value
                setEmail(text);
                
                // If we currently have an error showing, check if the new value is valid
                if (emailError && text.trim() && AuthService.validateEmail(text.trim())) {
                  setEmailError('');
                }
              }}
              style={[styles.input, { color: theme.textPrimary }]}
              autoCapitalize="none"
              keyboardType="email-address"
              // Only validate on blur, not on every change
              onBlur={() => validateEmail(email)}
              placeholderTextColor={theme.textTertiary}
            />
          </View>
          {emailError ? <Text style={[styles.errorText, { color: theme.error }]}>{emailError}</Text> : null}
          
          {/* Password input */}
          <View style={[styles.inputContainer, { 
            borderColor: theme.border, 
            backgroundColor: theme.inputBackground 
          }]}>
            <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, { color: theme.textPrimary, paddingRight: 40 }]}
              placeholderTextColor={theme.textTertiary}
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
          
          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={() => Alert.alert("Información", "Contacta al administrador para restablecer tu contraseña")}
          >
            <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { 
              backgroundColor: theme.primary,
              shadowColor: theme.primary 
            }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.textInverse} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.textInverse }]}>
                INICIAR SESIÓN
              </Text>
            )}
          </TouchableOpacity>            <TouchableOpacity onPress={() => navigation.navigate('UserTypeSelection')}>
              <Text style={[styles.register, { color: theme.neutral }]}>
                ¿No tienes cuenta? <Text style={[styles.registerBold, { color: theme.primary }]}>
                  Regístrate
                </Text>
              </Text>
            </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.neutral }]}>
            © 2025 Nombre app
          </Text>
        </View>
      </View>
    ) : (
      // Original TouchableWithoutFeedback for mobile
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          <LinearGradient
            colors={theme.backgroundGradient}
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
            <Text style={[styles.title, { color: theme.textPrimary }]}>Bienvenido</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Gestión de despachos y envíos</Text>
            
            <View style={[styles.inputContainer, { 
              borderColor: theme.border, 
              backgroundColor: theme.inputBackground 
            }]}>
              <Ionicons name="mail-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={(text) => {
                  // Don't trim here, just set the value
                  setEmail(text);
                  
                  // If we currently have an error showing, check if the new value is valid
                  if (emailError && text.trim() && AuthService.validateEmail(text.trim())) {
                    setEmailError('');
                  }
                }}
                style={[styles.input, { color: theme.textPrimary }]}
                autoCapitalize="none"
                keyboardType="email-address"
                // Only validate on blur, not on every change
                onBlur={() => validateEmail(email)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
            {emailError ? <Text style={[styles.errorText, { color: theme.error }]}>{emailError}</Text> : null}
            
            <View style={[styles.inputContainer, { 
              borderColor: theme.border, 
              backgroundColor: theme.inputBackground 
            }]}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { color: theme.textPrimary, paddingRight: 40 }]}
                placeholderTextColor={theme.textTertiary}
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
            
            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => Alert.alert("Información", "Contacta al administrador para restablecer tu contraseña")}
            >
              <Text style={[styles.forgotPasswordText, { color: theme.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, { 
                backgroundColor: theme.primary,
                shadowColor: theme.primary 
              }]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.textInverse} />
              ) : (
                <Text style={[styles.buttonText, { color: theme.textInverse }]}>
                  INICIAR SESIÓN
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.navigate('UserTypeSelection')}>
              <Text style={[styles.register, { color: theme.neutral }]}>
                ¿No tienes cuenta? <Text style={[styles.registerBold, { color: theme.primary }]}>
                  Regístrate
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.neutral }]}>
              © 2025 Nombre app
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  );
}

const { width, height } = Dimensions.get('window');

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
    top: 50,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 16,
    height: 56,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 16,
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
    fontSize: 16,
    letterSpacing: 1,
  },
  register: {
    fontSize: 14,
    marginTop: 10,
  },
  registerBold: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    fontSize: 12,
  }
});