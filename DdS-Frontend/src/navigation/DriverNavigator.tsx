import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import HomeDriverScreen from '../screens/driver/HomeDriverScreen';
import ProfileScreen from '../screens/driver/ProfileScreen';
import MyShipmentsScreen from '../screens/driver/MyShipmentsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3066BE', // Azul más vibrante
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8, // Sombra para Android
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 90 : 80,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'MyShipments') {
            iconName = 'local-shipping';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return (
            <View style={styles.iconContainer}>
              <MaterialIcons name={iconName} color={color} size={size + 2} />
              {focused && <View style={styles.indicator} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeDriverScreen} 
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="MyShipments" 
        component={MyShipmentsScreen} 
        options={{
          tabBarLabel: 'Mis Envíos',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Mi Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 28,
  },
  indicator: {
    position: 'absolute',
    bottom: -25,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#3066BE',
  },
});