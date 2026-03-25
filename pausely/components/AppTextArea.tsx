import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';

interface AppTextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const AppTextArea = ({
  label,
  value,
  onChangeText,
  placeholder,
  numberOfLines = 4,
  style,
}: AppTextAreaProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, { height: numberOfLines * 24 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
    lineHeight: 22,
  },
});
