// src/navigation/AppNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeAdminScreen from '../screens/admin/HomeAdminScreen';
import HomeClientScreen from '../screens/client/HomeClientScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeAdminScreen} />
      <Stack.Screen name="Details" component={HomeClientScreen} />
    </Stack.Navigator>
  );
}
