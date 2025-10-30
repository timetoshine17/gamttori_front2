import { Platform, StyleSheet, Text, TextProps } from 'react-native';

type Weight = 'Light' | 'Regular' | 'Medium' | 'Bold' | 'SemiBold';
type CTProps = TextProps & { weight?: Weight };

const familyByWeight: Record<Weight, string> = {
  Light: 'MaruBuri-Light',
  Regular: 'MaruBuri-Regular',
  Medium: 'MaruBuri-SemiBold',
  SemiBold: 'MaruBuri-SemiBold',
  Bold: 'MaruBuri-Bold',
};

// 안드로이드 폰트 폴백
const getFontFamily = (weight: Weight) => {
  const primaryFont = familyByWeight[weight];
  
  if (Platform.OS === 'android') {
    // 안드로이드에서 마루부리 폰트가 로드되지 않을 경우 폴백
    return `${primaryFont}, 'Noto Sans CJK KR', 'Malgun Gothic', sans-serif`;
  }
  
  return primaryFont;
};

const CustomText = ({ weight = 'Regular', style, children, ...rest }: CTProps) => {
  return (
    <Text {...rest} style={[styles.base, { fontFamily: getFontFamily(weight) }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({ base: {} });

export default CustomText;