// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { login } from '../../api/authService';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      Alert.alert("Login exitoso", `Bienvenido ${user.email}`);
      if (user.role === 'conductor') {
        navigation.navigate('HomeDriver');
      } else if (user.role === 'despachador') {
        navigation.navigate('HomeDispatcher');
      }
    } catch (error) {
      Alert.alert("Error", "Credenciales inválidas o usuario no encontrado.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Iniciar sesión" onPress={handleLogin} />
      <View style={styles.spacer} />
      <Button title="Ir a Registro" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  spacer: { height: 10 },
});
