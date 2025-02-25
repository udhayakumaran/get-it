import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Load icon fonts for web
if (Platform.OS === 'web') {
  const iconFontStyles = `
    @font-face {
      src: url(${require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf')});
      font-family: MaterialCommunityIcons;
    }
  `;

  // Create stylesheet
  const style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = iconFontStyles;
  } else {
    style.appendChild(document.createTextNode(iconFontStyles));
  }

  // Inject stylesheet
  document.head.appendChild(style);
}

export async function loadIcons() {
  if (Platform.OS !== 'web') {
    await MaterialCommunityIcons.loadFont();
  }
}