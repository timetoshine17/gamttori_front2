import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import CustomText from './CustomText';

type Variant = 'primary' | 'ghost';
type Size = 'md' | 'lg' | 'xl';

type BtnProps = PressableProps & {
  title: string;
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

const SIZE_STYLE: Record<Size, { height: number; radius: number; fontSize: number }> = {
  md: { height: 44, radius: 10, fontSize: 14 },
  lg: { height: 56, radius: 12, fontSize: 16 },
  xl: { height: 64, radius: 14, fontSize: 18 }, // ← 아주 크게
};

export default function Button({ title, variant = 'primary', size = 'md', style, ...rest }: BtnProps) {
  const sz = SIZE_STYLE[size];
  return (
    <Pressable
      {...rest}
      style={[
        styles.base,
        { height: sz.height, borderRadius: sz.radius },
        variant === 'primary' ? styles.primary : styles.ghost,
        style,
      ]}
      android_ripple={{ color: variant === 'primary' ? '#e5e7eb' : '#d1d5db' }}
    >
      <CustomText weight="Bold" style={[variant === 'primary' ? styles.primaryTxt : styles.ghostTxt, { fontSize: sz.fontSize }]}>
        {title}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minWidth: 96 },
  primary: { backgroundColor: '#4b5563' },
  primaryTxt: { color: '#fff' },
  ghost: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  ghostTxt: { color: '#111827' },
});
