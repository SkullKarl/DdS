// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeAdminScreen from '../screens/admin/HomeAdminScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeClientScreen from '../screens/client/HomeClientScreen';
import HomeDriverScreen from '../screens/driver/HomeDriverScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
      />
      <Stack.Screen 
        name="HomeAdmin" 
        component={HomeAdminScreen} 
        options={{ title: "Panel de Administrador" }}
      />
      <Stack.Screen 
        name="HomeClient" 
        component={HomeClientScreen} 
        options={{ title: "Inicio Cliente" }}
      />
      <Stack.Screen 
        name="HomeDriver" 
        component={HomeDriverScreen} 
        options={{ title: "Inicio Conductor" }}
      />
    </Stack.Navigator>
  );
}