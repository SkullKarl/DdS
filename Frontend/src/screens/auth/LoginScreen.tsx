// src/screens/LoginScreen.tsx
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, Button, ImageBackground, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <ImageBackground
    source={{uri: 'https://imgs.search.brave.com/fNHuNsDQIoveTNYT4ODt3rfRmP6uJun8mh1YSbVNewU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTgx/OTc1MDk4MS92ZWN0/b3IvZ3BzLWdyYXBo/aWMtdG91cmlzdC1t/YXAtb2YtdGVycml0/b3J5LXNtYXJ0cGhv/bmUtbWFwLWFwcGxp/Y2F0aW9uLWFwcC1z/ZWFyY2gtbWFwLW5h/dmlnYXRpb24uanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPVFR/MGc2WEdTY1RQQm9r/LWk5SlZ2U2ZrV0J6/Zjdxa3h0Z0xCQXUy/ZEY1REU9'}}
    style={styles.container}>
      <StatusBar
      style="dark"/>
      <Text style={styles.title}>Pantalla de Login</Text>
      
      <Button 
        title="Ir a Registro"
        onPress={() => navigation.navigate('Register')}
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
      
      <Button 
        title="Entrar como Cliente"
        onPress={() => navigation.navigate('HomeClient')}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Entrar como Conductor"
        onPress={() => navigation.navigate('HomeDriver')}
      />
      
      <View style={styles.spacer} />
      
      <Button 
        title="Entrar como Admin"
        onPress={() => navigation.navigate('HomeAdmin')}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  spacer: { height: 10 },
});
