import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import './src/api/firebaseConfig';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
