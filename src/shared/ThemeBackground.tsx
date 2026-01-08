import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import GradientView from './GradientView';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function ThemeBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      {/* background gradient (behind everything) */}
      <GradientView
        colors={['#2372a7ff', '#168895ff', '#06474aff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* soft glow (non-interactive) */}
      

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
