import React from 'react';
import { Button, Text, View } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Pantalla de Login</Text>
      <Button 
        title="Ir a Registro"
        onPress={() => navigation.navigate('Register')}
      />
      <Button 
        title="Entrar como Cliente"
        onPress={() => navigation.navigate('HomeClient')}
      />
      <Button 
        title="Entrar como Conductor"
        onPress={() => navigation.navigate('HomeDriver')}
      />
    </View>
  );
}
