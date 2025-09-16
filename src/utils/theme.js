// Centralized Instagram Story Gradient Colors
export const STORY_GRADIENT_COLORS = ["#ffffff", "#ff6666", "#ff0000"];
// Mobile App Color Palettes following Material Design 3 and iOS HIG best practices

// Light Theme - Following Material Design 3 and iOS HIG guidelines
export const LIGHT_COLORS = {
  // Primary colors
  primary: '#6750A4',           // Primary brand color
  primaryVariant: '#5E47A1',    // Darker variant
  primaryContainer: '#EADDFF',  // Light container
  onPrimary: '#FFFFFF',         // Text on primary
  onPrimaryContainer: '#21005D', // Text on primary container

  // Secondary colors
  secondary: '#625B71',         // Secondary accent
  secondaryVariant: '#5D5A6E',  // Darker variant
  secondaryContainer: '#E8DEF8', // Light container
  onSecondary: '#FFFFFF',       // Text on secondary
  onSecondaryContainer: '#1D192B', // Text on secondary container

  // Surface colors
  surface: '#FFFBFE',           // Main surface
  surfaceVariant: '#E7E0EC',    // Variant surface
  surfaceContainer: '#F3EDF7',  // Container surface
  surfaceContainerHigh: '#ECE6F0', // High emphasis container
  surfaceContainerHighest: '#E6E0E9', // Highest emphasis container
  onSurface: '#1C1B1F',         // Text on surface
  onSurfaceVariant: '#49454F',  // Text on surface variant

  // Background colors
  background: '#FFFBFE',        // Main background
  onBackground: '#1C1B1F',      // Text on background

  // Outline and borders
  outline: '#79747E',           // Borders and dividers
  outlineVariant: '#CAC4D0',    // Light borders

  // Error colors
  error: '#B3261E',             // Error state
  errorContainer: '#F9DEDC',    // Error container
  onError: '#FFFFFF',           // Text on error
  onErrorContainer: '#410E0B',  // Text on error container

  // Instagram-specific colors
  accent: '#405DE6',            // Instagram blue
  accentVariant: '#5851DB',     // Variant blue
  like: '#ED4956',              // Like red
  notification: '#FF3040',      // Notification badge

  // Text hierarchy
  textPrimary: '#1C1B1F',       // Primary text
  textSecondary: '#49454F',     // Secondary text
  textTertiary: '#79747E',      // Tertiary text
  textDisabled: '#C4C4C4',      // Disabled text

  // Component specific
  cardBackground: '#FFFFFF',    // Card background
  modalBackground: '#FFFFFF',   // Modal background
  navigationBackground: '#FFFBFE', // Navigation background
  statusBarStyle: 'dark-content' // StatusBar style
};

// Dark Theme - Following Material Design 3 and iOS HIG guidelines
export const DARK_COLORS = {
  // Primary colors
  primary: '#D0BCFF',           // Primary brand color
  primaryVariant: '#CDB4FF',    // Lighter variant
  primaryContainer: '#4F378B',  // Dark container
  onPrimary: '#371E73',         // Text on primary
  onPrimaryContainer: '#EADDFF', // Text on primary container

  // Secondary colors
  secondary: '#CCC2DC',         // Secondary accent
  secondaryVariant: '#D5C7E3',  // Lighter variant
  secondaryContainer: '#4A4458', // Dark container
  onSecondary: '#332D41',       // Text on secondary
  onSecondaryContainer: '#E8DEF8', // Text on secondary container

  // Surface colors
  surface: '#141218',           // Main surface
  surfaceVariant: '#49454F',    // Variant surface
  surfaceContainer: '#211F26',  // Container surface
  surfaceContainerHigh: '#2B2930', // High emphasis container
  surfaceContainerHighest: '#36343B', // Highest emphasis container
  onSurface: '#E6E0E9',         // Text on surface
  onSurfaceVariant: '#CAC4D0',  // Text on surface variant

  // Background colors
  background: '#101014',        // Main background
  onBackground: '#E6E0E9',      // Text on background

  // Outline and borders
  outline: '#938F99',           // Borders and dividers
  outlineVariant: '#49454F',    // Dark borders

  // Error colors
  error: '#F2B8B5',             // Error state
  errorContainer: '#8C1D18',    // Error container
  onError: '#601410',           // Text on error
  onErrorContainer: '#F9DEDC',  // Text on error container

  // Instagram-specific colors
  accent: '#8BB7FF',            // Instagram blue (adapted for dark)
  accentVariant: '#7FA8F5',     // Variant blue
  like: '#FF6B75',              // Like red (adapted for dark)
  notification: '#FF5A6B',      // Notification badge

  // Text hierarchy
  textPrimary: '#E6E0E9',       // Primary text
  textSecondary: '#CAC4D0',     // Secondary text
  textTertiary: '#938F99',      // Tertiary text
  textDisabled: '#5A5A5A',      // Disabled text

  // Component specific
  cardBackground: '#1D1B20',    // Card background
  modalBackground: '#211F26',   // Modal background
  navigationBackground: '#141218', // Navigation background
  statusBarStyle: 'light-content' // StatusBar style
};

// Semantic color mappings for easy theming
export const createTheme = (isDark = false) => {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      round: 50,
    },
    typography: {
      // Font sizes following mobile typography scale
      heading1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
      heading2: { fontSize: 28, fontWeight: '600', lineHeight: 36 },
      heading3: { fontSize: 24, fontWeight: '600', lineHeight: 32 },
      heading4: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
      body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
      body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
      caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
      overline: { fontSize: 10, fontWeight: '500', lineHeight: 16 },
    },
    shadows: {
      none: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },
      sm: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      },
      md: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 4,
      },
      lg: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
    },
  };
};

// Export default themes
export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

// Legacy support - map to current color usage
export const COLORS = DARK_COLORS; // Maintain backward compatibility
export const updatedGradientColors = [
  DARK_COLORS.accent,
  DARK_COLORS.accentVariant,
  DARK_COLORS.primary
];