import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';
import { useState } from 'react';

const EntryPromptScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EntryPrompt'>) => {
  const { startSession } = useSession();
  const [selectedMinutes, setSelectedMinutes] = useState(30);

  const handleBegin = () => {
    startSession(selectedMinutes * 60 * 1000); // Store in milliseconds since the input is minutes but Date.now() uses milliseconds
    navigation.navigate('Feed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Entry Prompt Screen</Text>
      <Text style={styles.text}>This is a placeholder.</Text>
      <AppButton title="Start Session" onPress={() => handleBegin()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    marginBottom: 20,
  },
});

export default EntryPromptScreen;
