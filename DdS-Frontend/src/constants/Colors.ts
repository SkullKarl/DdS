type ColorScheme = {
  // Background colors
  background: string;
  backgroundGradient: string[];
  cardBackground: string;
  inputBackground: string;
  iconBackground: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // UI elements
  primary: string;
  primaryDark: string;
  primaryGradient: string[];
  error: string;
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  warning: string;
  neutral: string;
  
  // Special colors
  gold: string;
  danger: string;
};

const LightColors: ColorScheme = {
  // Background colors
  background: '#F8F9FE',
  backgroundGradient: ['#f0f2ff', '#e2e6ff'],
  cardBackground: '#ffffff',
  inputBackground: '#f7f7fa',
  iconBackground: '#F6F7FF',
  
  // Text colors
  textPrimary: '#1a237e',
  textSecondary: '#7986cb',
  textTertiary: '#888888',
  textInverse: '#ffffff',
  
  // UI elements
  primary: '#3949ab',
  primaryDark: '#283593',
  primaryGradient: ['#5B67CA', '#4353BB'],
  error: '#f44336',
  border: '#e0e0e0',
  divider: '#F0F0F0',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  neutral: '#9E9E9E',
  
  // Special colors
  gold: '#FFD700',
  danger: '#FF3B30',
};

const DarkColors: ColorScheme = {
  // Background colors
  background: '#121212',
  backgroundGradient: ['#1E1E2E', '#141428'],
  cardBackground: '#1E1E2E',
  inputBackground: '#2D2D3A',
  iconBackground: '#252536',
  
  // Text colors
  textPrimary: '#E0E0FF',
  textSecondary: '#A2A2CF',
  textTertiary: '#8F8FA8',
  textInverse: '#121212',
  
  // UI elements
  primary: '#5B67CA',
  primaryDark: '#4353BB',
  primaryGradient: ['#6979DB', '#5566CC'],
  error: '#F55246',
  border: '#3D3D50',
  divider: '#2D2D3A',
  
  // Status colors
  success: '#66BB6A',
  warning: '#FFA726',
  neutral: '#BDBDBD',
  
  // Special colors
  gold: '#FFD54F',
  danger: '#FF5252',
};

// Default to light theme for now
const Colors = LightColors;

export { Colors, LightColors, DarkColors, ColorScheme };