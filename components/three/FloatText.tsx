"use client";

import { Text } from "@react-three/drei";

type FloatTextProps = {
  children: string;
  size?: number;
  color?: string;
  opacity?: number;
  position?: [number, number, number];
  letterSpacing?: number;
  font?: string;
  outlineWidth?: number;
  outlineColor?: string;
};

export default function FloatText({
  children,
  size = 1,
  color = "#ffffff",
  opacity = 0.22,
  position = [0, 0, -3],
  letterSpacing = 0.08,
  font = "/fonts/PPNikkeiMaru-Ultrabold.otf",
  outlineWidth = 0,
  outlineColor = "#ffffff",
}: FloatTextProps) {
  return (
    <Text
      position={position}
      fontSize={size}
      letterSpacing={letterSpacing}
      color={color}
      fillOpacity={opacity}
      outlineWidth={outlineWidth}
      outlineColor={outlineColor}
      anchorX="center"
      anchorY="middle"
      font={font}
    >
      {children}
    </Text>
  );
}