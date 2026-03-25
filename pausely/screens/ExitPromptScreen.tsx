import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const ExitPromptScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ExitPrompt'>) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exit Prompt Screen</Text>
      <Text>This is a placeholder.</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
});

export default ExitPromptScreen;
