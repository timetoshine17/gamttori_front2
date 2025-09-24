import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type Weight = 'Light' | 'Regular' | 'Medium' | 'Bold';
type CTProps = TextProps & { weight?: Weight };

const familyByWeight: Record<Weight, string> = {
  Light: 'MaruBuri-Light',
  Regular: 'MaruBuri-Regular',
  Medium: 'MaruBuri-SemiBold',
  Bold: 'MaruBuri-Bold',
};

const CustomText = ({ weight = 'Regular', style, children, ...rest }: CTProps) => {
  return (
    <Text {...rest} style={[styles.base, { fontFamily: familyByWeight[weight] }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({ base: {} });

export default CustomText;