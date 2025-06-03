import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { LightColors, DarkColors } from '../constants/Colors';

type ThemeContextType = {
  theme: typeof LightColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: LightColors,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Get initial colorScheme directly from Appearance API for immediate value
  const initialColorScheme = Appearance.getColorScheme();
  const deviceTheme = useColorScheme();
  
  // Initialize with current device theme
  const [isDark, setIsDark] = useState(initialColorScheme === 'dark');
  
  // Update theme when device theme changes
  useEffect(() => {
    if (deviceTheme) {
      setIsDark(deviceTheme === 'dark');
    }
  }, [deviceTheme]);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };
  
  const theme = isDark ? DarkColors : LightColors;
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);