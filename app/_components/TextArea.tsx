import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

export default function TextArea(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      multiline
      numberOfLines={6}
      textAlignVertical="top"
      placeholderTextColor="#9ca3af"
      style={[styles.input, props.style, { fontFamily: 'MaruBuri-Regular' }]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
});
