import React, { ReactNode, useId, useMemo } from "react";
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from "react-native-svg";

type Point = { x: number; y: number };

type Props = {
  colors: string[];
  start?: Point;
  end?: Point;
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  pointerEvents?: ViewProps["pointerEvents"];
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function GradientView({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  locations,
  style,
  children,
  pointerEvents,
}: Props) {
  const gradientId = useId();

  const stops = useMemo(() => {
    const defaultOffsets =
      colors.length > 1 ? colors.map((_, idx) => idx / (colors.length - 1)) : [0];
    const offsets =
      locations && locations.length === colors.length ? locations : defaultOffsets;

    return colors.map((color, idx) => ({
      color,
      offset: clamp01(offsets[idx] ?? defaultOffsets[idx] ?? 0),
    }));
  }, [colors, locations]);

  const x1 = `${clamp01(start?.x ?? 0) * 100}%`;
  const y1 = `${clamp01(start?.y ?? 0) * 100}%`;
  const x2 = `${clamp01(end?.x ?? 0) * 100}%`;
  const y2 = `${clamp01(end?.y ?? 1) * 100}%`;

  return (
    <View style={[styles.container, style]} pointerEvents={pointerEvents}>
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <SvgLinearGradient id={gradientId} x1={x1} y1={y1} x2={x2} y2={y2}>
            {stops.map(({ color, offset }, idx) => (
              <Stop key={`${color}-${idx}`} offset={`${offset * 100}%`} stopColor={color} />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
});
