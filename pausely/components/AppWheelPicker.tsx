import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PickerOption {
  label: string;
  value: number;
}

interface AppWheelPickerProps {
  label: string;
  options: PickerOption[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  style?: ViewStyle;
}

export const AppWheelPicker = ({
  label,
  options,
  selectedValue,
  onValueChange,
  style,
}: AppWheelPickerProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(val) => onValueChange(val as number)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          {options.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>
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
  pickerWrapper: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
});
