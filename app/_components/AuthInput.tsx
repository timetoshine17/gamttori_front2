import { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import CustomText from './CustomText';

type Props = Omit<TextInputProps, 'style'> & {
  secure?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AuthInput({ secure, style, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isSecure = !!secure && !show;

  return (
    <View style={[styles.wrap, style]}>
      <TextInput
        {...rest}
        style={styles.input}
        secureTextEntry={isSecure}
        placeholderTextColor="#9ca3af"
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        importantForAutofill="no"
      />
      {secure ? (
        <Pressable style={styles.eye} hitSlop={8} onPress={() => setShow(s => !s)}>
          <CustomText style={{ fontSize: 16, opacity: 0.7 }}>{show ? '🙈' : '👁️'}</CustomText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    minHeight: 52,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'MaruBuri-Regular',
    color: '#000000',
    backgroundColor: 'transparent',
    width: '100%',
  },
  eye: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
