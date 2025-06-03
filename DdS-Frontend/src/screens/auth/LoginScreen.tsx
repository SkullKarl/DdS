import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../api/supabaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleLogin = async () => {
    if (!validateEmail(email)) return;
    if (!password) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    setIsLoading(true);
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Verificar si el error es porque el usuario no existe
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('No user found')) {
          Alert.alert("Usuario no registrado", "El correo electrónico ingresado no está registrado en nuestro sistema. Por favor verifica tus datos o regístrate.");
        } else {
          Alert.alert("Error de inicio de sesión", error.message);
        }
        setIsLoading(false);
        return;
      }

      // Buscar en la tabla DESPACHADOR
      const { data: despachador, error: errorDesp } = await supabase
        .from('despachador')
        .select('*')
        .eq('correo', email)
        .single();

      if (despachador) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeDispatcher' }],
        });
        return;
      }

      // Buscar en la tabla CONDUCTOR
      const { data: conductor, error: errorCond } = await supabase
        .from('conductor')
        .select('*')
        .eq('correo', email)
        .single();

      if (conductor) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeDriver' }],
        });
        return;
      }

      Alert.alert("Error", "No se encontró el usuario en ninguna tabla de roles.");
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema con el servidor. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
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
        
        <View style={styles.card}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Gestión de despachos y envíos</Text>
          
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
          
          <TouchableOpacity style={styles.forgotPassword} onPress={() => Alert.alert("Información", "Contacta al administrador para restablecer tu contraseña")}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.register}>¿No tienes cuenta? <Text style={styles.registerBold}>Regístrate</Text></Text>
          </TouchableOpacity>
        </View>

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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#3949ab',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#3949ab',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
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
  register: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  registerBold: {
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