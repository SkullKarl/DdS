import { StatusBar } from 'expo-status-bar';
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
  Dimensions
} from 'react-native';
import { supabase } from '../../api/supabaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'despachador' | 'conductor' | ''>('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  // Solo para conductor
  const [estado, setEstado] = useState('');
  const [licencia, setLicencia] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }
      
      let insertError = null;
      if (role === 'despachador') {
        const { error: dbError } = await supabase
          .from('despachador')
          .insert([{ 
            nombre, 
            correo: email, 
            contraseña: password, 
            telefono, 
          }]);
        insertError = dbError;
      } else if (role === 'conductor') {
        const { error: dbError } = await supabase
          .from('conductor')
          .insert([{ 
            nombre, 
            correo: email, 
            contraseña: password, 
            telefono, 
            estado, 
            licencencia: licencia, 
            vehiculo,
          }]);
        insertError = dbError;
      }

      if (insertError) {
        Alert.alert('Error', insertError.message);
        return;
      }

      Alert.alert('¡Registro exitoso!', 'Revisa tu correo para confirmar tu cuenta.');
      navigation.goBack(); // Cambiar de navigation.navigate('Login')
    } catch (error: any) {
      Alert.alert('Error', "Ocurrió un problema con el servidor. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#f0f2ff', '#e2e6ff']}
          style={styles.background}
        />
        <StatusBar style="dark" />
        
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          horizontal={false}
          scrollEnabled={true}
          bounces={true}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={true}
          directionalLockEnabled={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a nuestra plataforma de gestión</Text>
            
            {/* Email input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Correo Electrónico"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={() => validateEmail(email)}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            
            {/* Password input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, { paddingRight: 40 }]}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
            
            {/* Roles selection */}
            <Text style={styles.sectionTitle}>Selecciona un rol:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'despachador' && styles.roleButtonSelected
                ]}
                onPress={() => setRole('despachador')}
              >
                <Ionicons 
                  name="briefcase-outline" 
                  size={20} 
                  color={role === 'despachador' ? '#fff' : '#3949ab'} 
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText, 
                  role === 'despachador' && styles.roleTextSelected
                ]}>
                  Despachador
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'conductor' && styles.roleButtonSelected
                ]}
                onPress={() => setRole('conductor')}
              >
                <Ionicons 
                  name="car-outline" 
                  size={20} 
                  color={role === 'conductor' ? '#fff' : '#3949ab'} 
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText, 
                  role === 'conductor' && styles.roleTextSelected
                ]}>
                  Conductor
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Common fields */}
            {(role === 'despachador' || role === 'conductor') && (
              <>
                <Text style={styles.sectionTitle}>Información personal</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nombre completo"
                    value={nombre}
                    onChangeText={setNombre}
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Teléfono"
                    value={telefono}
                    onChangeText={setTelefono}
                    style={styles.input}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}
            
            {/* Conductor fields */}
            {role === 'conductor' && (
              <>
                <Text style={styles.sectionTitle}>Información del conductor</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Estado"
                    value={estado}
                    onChangeText={setEstado}
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="card-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Número de licencia"
                    value={licencia}
                    onChangeText={setLicencia}
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Ionicons name="car-sport-outline" size={20} color="#888" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Tipo de vehículo"
                    value={vehiculo}
                    onChangeText={setVehiculo}
                    style={styles.input}
                  />
                </View>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>REGISTRARSE</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>¿Ya tienes cuenta? <Text style={styles.loginLinkBold}>Iniciar sesión</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 DeliverTrack</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60, // Espacio adicional al final
    width: '100%',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#1a237e',
  },
  subtitle: {
    fontSize: 16,
    color: '#7986cb',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3949ab',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f7f7fa',
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
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3949ab',
  },
  roleButtonSelected: {
    backgroundColor: '#3949ab',
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#3949ab',
    fontWeight: '600',
  },
  roleTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#3949ab',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#3949ab',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  loginLink: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#3949ab',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    color: '#9e9e9e',
    fontSize: 12,
  }
});