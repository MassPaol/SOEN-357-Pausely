import { View, Text, StyleSheet, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const QuestionnaireScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Questionnaire'>) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questionnaire Screen</Text>
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

export default QuestionnaireScreen;
