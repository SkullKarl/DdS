// @ts-nocheck

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
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import {
  AuthService,
  DriverRegistrationData,
  DispatcherRegistrationData,
  ClientRegistrationData
} from '../../services/AuthService';

export default function RegisterScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'despachador' | 'conductor' | 'cliente' | ''>('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  // Driver-only fields
  const [estado, setEstado] = useState('');
  const [licencia, setLicencia] = useState('');
  const [vehiculo, setVehiculo] = useState('');
  // Client-only fields
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

    if (role === 'cliente' && !direccion) {
      Alert.alert("Error", "Por favor ingresa tu dirección");
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
      } else if (role === 'cliente') {
        const clientData: ClientRegistrationData = {
          email,
          password,
          nombre,
          telefono,
          direccion,
          preferencia_notificacion: preferenciaNotificacion
        };

        await AuthService.registerClient(clientData);
      }

      Alert.alert('¡Registro exitoso!', 'Revisa tu correo para confirmar tu cuenta.');
      navigation.goBack(); // Return to login screen
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

  return (
    Platform.OS === 'web' ? (
      <View style={[styles.container, isDark && styles.darkContainer]}>
        <LinearGradient
          colors={isDark ? theme.backgroundGradient : ['#f0f2ff', '#e2e6ff']}
          style={styles.background}
        />
        <StatusBar style={isDark ? "light" : "dark"} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isDark && styles.darkCard]}>
            <Text style={[styles.title, isDark && styles.darkTitle]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>Únete a nuestra plataforma de gestión</Text>

            {/* Email input */}
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="mail-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                placeholder="Correo Electrónico"
                placeholderTextColor={isDark ? "#999" : "#888"}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                style={[styles.input, isDark && styles.darkInput]}
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={() => validateEmail(email)}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password input */}
            <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
              <Ionicons name="lock-closed-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={isDark ? "#999" : "#888"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[styles.input, isDark && styles.darkInput, { paddingRight: 40 }]}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={isDark ? "#aaa" : "#888"}
                />
              </TouchableOpacity>
            </View>

            {/* Roles selection */}
            <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Selecciona un rol:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  isDark && styles.darkRoleButton,
                  role === 'despachador' && styles.roleButtonSelected,
                  role === 'despachador' && isDark && styles.darkRoleButtonSelected
                ]}
                onPress={() => setRole('despachador')}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={role === 'despachador'
                    ? '#fff'
                    : (isDark ? theme.primary : '#3949ab')}
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText,
                  isDark && styles.darkRoleText,
                  role === 'despachador' && styles.roleTextSelected
                ]}>
                  Despachador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  isDark && styles.darkRoleButton,
                  role === 'conductor' && styles.roleButtonSelected,
                  role === 'conductor' && isDark && styles.darkRoleButtonSelected
                ]}
                onPress={() => setRole('conductor')}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color={role === 'conductor'
                    ? '#fff'
                    : (isDark ? theme.primary : '#3949ab')}
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText,
                  isDark && styles.darkRoleText,
                  role === 'conductor' && styles.roleTextSelected
                ]}>
                  Conductor
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  isDark && styles.darkRoleButton,
                  role === 'cliente' && styles.roleButtonSelected,
                  role === 'cliente' && isDark && styles.darkRoleButtonSelected
                ]}
                onPress={() => setRole('cliente')}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={role === 'cliente'
                    ? '#fff'
                    : (isDark ? theme.primary : '#3949ab')}
                  style={styles.roleIcon}
                />
                <Text style={[
                  styles.roleText,
                  isDark && styles.darkRoleText,
                  role === 'cliente' && styles.roleTextSelected
                ]}>
                  Cliente
                </Text>
              </TouchableOpacity>
            </View>

            {/* Common fields */}
            {(role === 'despachador' || role === 'conductor' || role === 'cliente') && (
              <>
                <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información personal</Text>
                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="person-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Nombre completo"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={nombre}
                    onChangeText={setNombre}
                    style={[styles.input, isDark && styles.darkInput]}
                  />
                </View>

                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="call-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Teléfono"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={telefono}
                    onChangeText={setTelefono}
                    style={[styles.input, isDark && styles.darkInput]}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            {/* Driver fields */}
            {role === 'conductor' && (
              <>
                <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información del conductor</Text>
                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="location-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Estado"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={estado}
                    onChangeText={setEstado}
                    style={[styles.input, isDark && styles.darkInput]}
                  />
                </View>

                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="card-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Número de licencia"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={licencia}
                    onChangeText={setLicencia}
                    style={[styles.input, isDark && styles.darkInput]}
                  />
                </View>

                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="car-sport-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Tipo de vehículo"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={vehiculo}
                    onChangeText={setVehiculo}
                    style={[styles.input, isDark && styles.darkInput]}
                  />
                </View>
              </>
            )}

            {/* Client fields */}
            {role === 'cliente' && (
              <>
                <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información del cliente</Text>
                <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                  <Ionicons name="home-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                  <TextInput
                    placeholder="Dirección"
                    placeholderTextColor={isDark ? "#999" : "#888"}
                    value={direccion}
                    onChangeText={setDireccion}
                    style={[styles.input, isDark && styles.darkInput]}
                    multiline
                  />
                </View>

                <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Preferencia de notificación</Text>
                <View style={styles.preferenceContainer}>
                  <TouchableOpacity
                    style={[
                      styles.preferenceButton,
                      isDark && styles.darkPreferenceButton,
                      preferenciaNotificacion === 'email' && styles.preferenceButtonSelected,
                      preferenciaNotificacion === 'email' && isDark && styles.darkPreferenceButtonSelected
                    ]}
                    onPress={() => setPreferenciaNotificacion('email')}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={16}
                      color={preferenciaNotificacion === 'email'
                        ? '#fff'
                        : (isDark ? theme.primary : '#3949ab')}
                    />
                    <Text style={[
                      styles.preferenceText,
                      isDark && styles.darkPreferenceText,
                      preferenciaNotificacion === 'email' && styles.preferenceTextSelected
                    ]}>
                      Email
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.preferenceButton,
                      isDark && styles.darkPreferenceButton,
                      preferenciaNotificacion === 'sms' && styles.preferenceButtonSelected,
                      preferenciaNotificacion === 'sms' && isDark && styles.darkPreferenceButtonSelected
                    ]}
                    onPress={() => setPreferenciaNotificacion('sms')}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color={preferenciaNotificacion === 'sms'
                        ? '#fff'
                        : (isDark ? theme.primary : '#3949ab')}
                    />
                    <Text style={[
                      styles.preferenceText,
                      isDark && styles.darkPreferenceText,
                      preferenciaNotificacion === 'sms' && styles.preferenceTextSelected
                    ]}>
                      SMS
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[styles.button, isDark && styles.darkButton]}
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
              <Text style={[styles.loginLink, isDark && styles.darkLoginLink]}>
                ¿Ya tienes cuenta? <Text style={[styles.loginLinkBold, isDark && styles.darkLoginLinkBold]}>Iniciar sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.darkFooterText]}>© 2025 Nombre app</Text>
        </View>
      </View>
    ) : (
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={[styles.container, isDark && styles.darkContainer]}>
          <LinearGradient
            colors={isDark ? theme.backgroundGradient as [string, string, ...string[]] : ['#f0f2ff', '#e2e6ff']}
            style={styles.background}
          />
          <StatusBar style={isDark ? "light" : "dark"} />

          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, isDark && styles.darkCard]}>
              <Text style={[styles.title, isDark && styles.darkTitle]}>Crear cuenta</Text>
              <Text style={[styles.subtitle, isDark && styles.darkSubtitle]}>Únete a nuestra plataforma de gestión</Text>

              {/* Email input */}
              <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                <Ionicons name="mail-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo Electrónico"
                  placeholderTextColor={isDark ? "#999" : "#888"}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  style={[styles.input, isDark && styles.darkInput]}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onBlur={() => validateEmail(email)}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              {/* Password input */}
              <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                <Ionicons name="lock-closed-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor={isDark ? "#999" : "#888"}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, isDark && styles.darkInput, { paddingRight: 40 }]}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={isDark ? "#aaa" : "#888"}
                  />
                </TouchableOpacity>
              </View>

              {/* Roles selection */}
              <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Selecciona un rol:</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    isDark && styles.darkRoleButton,
                    role === 'despachador' && styles.roleButtonSelected,
                    role === 'despachador' && isDark && styles.darkRoleButtonSelected
                  ]}
                  onPress={() => setRole('despachador')}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={20}
                    color={role === 'despachador'
                      ? '#fff'
                      : (isDark ? theme.primary : '#3949ab')}
                    style={styles.roleIcon}
                  />
                  <Text style={[
                    styles.roleText,
                    isDark && styles.darkRoleText,
                    role === 'despachador' && styles.roleTextSelected
                  ]}>
                    Despachador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    isDark && styles.darkRoleButton,
                    role === 'conductor' && styles.roleButtonSelected,
                    role === 'conductor' && isDark && styles.darkRoleButtonSelected
                  ]}
                  onPress={() => setRole('conductor')}
                >
                  <Ionicons
                    name="car-outline"
                    size={20}
                    color={role === 'conductor'
                      ? '#fff'
                      : (isDark ? theme.primary : '#3949ab')}
                    style={styles.roleIcon}
                  />
                  <Text style={[
                    styles.roleText,
                    isDark && styles.darkRoleText,
                    role === 'conductor' && styles.roleTextSelected
                  ]}>
                    Conductor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    isDark && styles.darkRoleButton,
                    role === 'cliente' && styles.roleButtonSelected,
                    role === 'cliente' && isDark && styles.darkRoleButtonSelected
                  ]}
                  onPress={() => setRole('cliente')}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={role === 'cliente'
                      ? '#fff'
                      : (isDark ? theme.primary : '#3949ab')}
                    style={styles.roleIcon}
                  />
                  <Text style={[
                    styles.roleText,
                    isDark && styles.darkRoleText,
                    role === 'cliente' && styles.roleTextSelected
                  ]}>
                    Cliente
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Common fields */}
              {(role === 'despachador' || role === 'conductor' || role === 'cliente') && (
                <>
                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información personal</Text>
                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="person-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Nombre completo"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={nombre}
                      onChangeText={setNombre}
                      style={[styles.input, isDark && styles.darkInput]}
                    />
                  </View>

                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="call-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Teléfono"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={telefono}
                      onChangeText={setTelefono}
                      style={[styles.input, isDark && styles.darkInput]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </>
              )}

              {/* Driver fields */}
              {role === 'conductor' && (
                <>
                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información del conductor</Text>
                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="location-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Estado"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={estado}
                      onChangeText={setEstado}
                      style={[styles.input, isDark && styles.darkInput]}
                    />
                  </View>

                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="card-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Número de licencia"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={licencia}
                      onChangeText={setLicencia}
                      style={[styles.input, isDark && styles.darkInput]}
                    />
                  </View>

                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="car-sport-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Tipo de vehículo"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={vehiculo}
                      onChangeText={setVehiculo}
                      style={[styles.input, isDark && styles.darkInput]}
                    />
                  </View>
                </>
              )}

              {/* Client fields */}
              {role === 'cliente' && (
                <>
                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Información del cliente</Text>
                  <View style={[styles.inputContainer, isDark && styles.darkInputContainer]}>
                    <Ionicons name="home-outline" size={20} color={isDark ? "#aaa" : "#888"} style={styles.inputIcon} />
                    <TextInput
                      placeholder="Dirección"
                      placeholderTextColor={isDark ? "#999" : "#888"}
                      value={direccion}
                      onChangeText={setDireccion}
                      style={[styles.input, isDark && styles.darkInput]}
                      multiline
                    />
                  </View>

                  <Text style={[styles.sectionTitle, isDark && styles.darkSectionTitle]}>Preferencia de notificación</Text>
                  <View style={styles.preferenceContainer}>
                    <TouchableOpacity
                      style={[
                        styles.preferenceButton,
                        isDark && styles.darkPreferenceButton,
                        preferenciaNotificacion === 'email' && styles.preferenceButtonSelected,
                        preferenciaNotificacion === 'email' && isDark && styles.darkPreferenceButtonSelected
                      ]}
                      onPress={() => setPreferenciaNotificacion('email')}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={16}
                        color={preferenciaNotificacion === 'email'
                          ? '#fff'
                          : (isDark ? theme.primary : '#3949ab')}
                      />
                      <Text style={[
                        styles.preferenceText,
                        isDark && styles.darkPreferenceText,
                        preferenciaNotificacion === 'email' && styles.preferenceTextSelected
                      ]}>
                        Email
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.preferenceButton,
                        isDark && styles.darkPreferenceButton,
                        preferenciaNotificacion === 'sms' && styles.preferenceButtonSelected,
                        preferenciaNotificacion === 'sms' && isDark && styles.darkPreferenceButtonSelected
                      ]}
                      onPress={() => setPreferenciaNotificacion('sms')}
                    >
                      <Ionicons
                        name="chatbubble-outline"
                        size={16}
                        color={preferenciaNotificacion === 'sms'
                          ? '#fff'
                          : (isDark ? theme.primary : '#3949ab')}
                      />
                      <Text style={[
                        styles.preferenceText,
                        isDark && styles.darkPreferenceText,
                        preferenciaNotificacion === 'sms' && styles.preferenceTextSelected
                      ]}>
                        SMS
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.button, isDark && styles.darkButton]}
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
                <Text style={[styles.loginLink, isDark && styles.darkLoginLink]}>
                  ¿Ya tienes cuenta? <Text style={[styles.loginLinkBold, isDark && styles.darkLoginLinkBold]}>Iniciar sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, isDark && styles.darkFooterText]}>© 2025 Nombre app</Text>
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
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60, // Espacio adicional al final
    width: '100%',
    maxWidth: '100%', // Add this to prevent overflow
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
  darkCard: {
    backgroundColor: '#1E1E2E',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  darkTitle: {
    color: '#E0E0FF',
  },
  subtitle: {
    fontSize: 16,
    color: '#7986cb',
    marginBottom: 30,
    textAlign: 'center',
  },
  darkSubtitle: {
    color: '#A2A2CF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3949ab',
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 10,
  },
  darkSectionTitle: {
    color: '#5B67CA',
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
  darkInputContainer: {
    backgroundColor: '#2D2D3A',
    borderColor: '#3D3D50',
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
  darkInput: {
    color: '#E0E0FF',
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
    width: '100%',
    marginBottom: 16,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3949ab',
    marginBottom: 8,
  },
  darkRoleButton: {
    borderColor: '#5B67CA',
  },
  roleButtonSelected: {
    backgroundColor: '#3949ab',
  },
  darkRoleButtonSelected: {
    backgroundColor: '#5B67CA',
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    fontSize: 14,
    color: '#3949ab',
    fontWeight: '600',
  },
  darkRoleText: {
    color: '#5B67CA',
  },
  roleTextSelected: {
    color: '#fff',
  },
  preferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3949ab',
  },
  darkPreferenceButton: {
    borderColor: '#5B67CA',
  },
  preferenceButtonSelected: {
    backgroundColor: '#3949ab',
  },
  darkPreferenceButtonSelected: {
    backgroundColor: '#5B67CA',
  },
  preferenceText: {
    fontSize: 13,
    color: '#3949ab',
    fontWeight: '600',
    marginLeft: 6,
  },
  darkPreferenceText: {
    color: '#5B67CA',
  },
  preferenceTextSelected: {
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
  darkButton: {
    backgroundColor: '#5B67CA',
    shadowColor: '#5B67CA',
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
  darkLoginLink: {
    color: '#A2A2CF',
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#3949ab',
  },
  darkLoginLinkBold: {
    color: '#5B67CA',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
  },
  footerText: {
    color: '#9e9e9e',
    fontSize: 12,
  },
  darkFooterText: {
    color: '#8F8FA8',
  }
});