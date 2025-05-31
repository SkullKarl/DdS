import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Login</Text>
      
      <Button 
        title="Ir a Registro"
        onPress={() => navigation.navigate('Register')}
      />
      
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  spacer: {
    height: 10,
  }
});