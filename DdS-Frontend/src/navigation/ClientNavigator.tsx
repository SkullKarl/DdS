import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import HomeClientScreen from '../screens/client/HomeClientScreen';
import ProfileScreen from '../screens/client/ProfileScreen';
import CreatePackageScreen from '../screens/client/CreatePackageScreen';
import MyShipmentsScreen from '../screens/client/MyShipmentsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="HomeMain" component={HomeClientScreen} />
      <Stack.Screen name="CreatePackage" component={CreatePackageScreen} />
      <Stack.Screen name="MyShipments" component={MyShipmentsScreen} />
    </Stack.Navigator>
  );
}

export default function ClientNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      id={undefined}
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
          } else if (route.name === 'MyShipments') {
            iconName = 'local-shipping';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return (
            <MaterialIcons
              name={iconName}
              size={focused ? 26 : 24}
              color={color}
              style={{
                opacity: focused ? 1 : 0.7,
                transform: [{ scale: focused ? 1.1 : 1 }],
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
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
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}