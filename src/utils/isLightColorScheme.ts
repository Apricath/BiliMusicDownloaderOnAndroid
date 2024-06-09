import { Appearance } from 'react-native';

export const isLightColorScheme = () => {
  return Appearance.getColorScheme() === 'light';
};

export default isLightColorScheme;
