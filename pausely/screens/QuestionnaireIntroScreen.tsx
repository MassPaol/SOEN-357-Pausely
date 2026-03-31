import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { RootStackParamList } from '../navigation/AppNavigator';

const QuestionnaireIntroScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'QuestionnaireIntro'>) => {
  const handleContinue = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Questionnaire' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Next Step</Text>
        <Text style={styles.title}>Thank You</Text>
        <Text style={styles.body}>
          Thank you for participating in this session.
        </Text>
        <Text style={styles.body}>
          You will now be directed to the questionnaire.
        </Text>

        <AppButton
          title="Continue to Questionnaire"
          onPress={handleContinue}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ead8bf',
    backgroundColor: '#fff9f1',
    padding: 18,
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c1761f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1c',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#454545',
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    marginTop: 18,
    alignSelf: 'stretch',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default QuestionnaireIntroScreen;
