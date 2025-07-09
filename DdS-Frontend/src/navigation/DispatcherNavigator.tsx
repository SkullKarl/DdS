import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import HomeDispatcherScreen from '../screens/dispatcher/HomeDispatcherScreen';
import ProfileScreen from '../screens/dispatcher/ProfileScreen'; // Reusing the ProfileScreen
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();

export default function DispatcherNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#94A3B8',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: isDark ? '#000000' : '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: isDark ? 0.2 : 0.1,
          shadowRadius: 4,
          height: Platform.OS === 'ios' ? 90 : 80,
          paddingTop: -10,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          position: 'absolute',
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'dashboard';
          } else if (route.name === 'AssignPackages') {
            iconName = 'assignment';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return (
            <View style={styles.iconContainer}>
              <MaterialIcons name={iconName} color={color} size={size + 2} />
              {focused && <View style={[styles.indicator, { backgroundColor: theme.primary }]} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeDispatcherScreen}
        options={{
          tabBarLabel: 'Paquetes',
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
  },
});