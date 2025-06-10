// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeAdminScreen from '../screens/admin/HomeAdminScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeClientScreen from '../screens/client/HomeClientScreen';
import DriverNavigator from './DriverNavigator'; // Importa el DriverNavigator
import DispatcherNavigator from './DispatcherNavigator'; // Importa el DispatcherNavigator

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      id={undefined}
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Ocultar el header predeterminado
        contentStyle: { backgroundColor: '#ffffff' },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
      />
      <Stack.Screen 
        name="HomeAdmin" 
        component={HomeAdminScreen} 
      />
      <Stack.Screen 
        name="HomeClient" 
        component={HomeClientScreen} 
      />
      <Stack.Screen 
        name="HomeDriver" 
        component={DriverNavigator} // Cambia a usar el DriverNavigator
      />
      <Stack.Screen 
        name="HomeDispatcher" 
        component={DispatcherNavigator} // Cambia a usar el DispatcherNavigator
      />
    </Stack.Navigator>
  );
}