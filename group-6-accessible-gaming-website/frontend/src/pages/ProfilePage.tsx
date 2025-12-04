import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AccessibilityContext } from '../context/AccessibilityContext';
import { applyTheme, applyTextSize, applyDyslexiaFont, applyColorblindFilter } from '../context/accessibilityHelpers';

const ProfilePage = () => {
  const { theme, textSize, dyslexiaFont, colorblindFilter } = useContext(AccessibilityContext);

  useEffect(() => {
    applyTheme(theme);
    applyTextSize(textSize);
    applyDyslexiaFont(dyslexiaFont);
    applyColorblindFilter(colorblindFilter);
  }, [theme, textSize, dyslexiaFont, colorblindFilter]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Page</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default ProfilePage;