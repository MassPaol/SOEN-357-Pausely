import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle; // Allows overriding container style
  textStyle?: TextStyle; // Allows overriding text style
}

export const AppButton = ({
  title,
  onPress,
  style,
  textStyle,
}: AppButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#f2a84e', // Your primary brand color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
