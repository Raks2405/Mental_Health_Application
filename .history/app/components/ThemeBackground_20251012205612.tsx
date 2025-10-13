import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function ThemeBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {/* background gradient (behind everything) */}
      <LinearGradient
        colors={['#2372a7ff', '#168895ff', '#032527ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* soft glow (non-interactive) */}
      <LinearGradient
        colors={['rgba(255,255,255,0.36)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.2 }}
        style={styles.glow}
        pointerEvents="none"
      />

      {/* your screen content goes above */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: 60,
    left: -20,
    width: 250,
    height: 170,
    borderRadius: 100,
    opacity: 0.85,
  },
  content: {
    flex: 1,
  },
});
