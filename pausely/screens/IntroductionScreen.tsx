import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';
import { RootStackParamList } from '../navigation/AppNavigator';

const SHARED_INTRO_LINES = [
  'You are participating in a study exploring how people interact with social media applications.',
  'In this study, you will use a simulated social media environment. Your interactions will be recorded for research purposes only.',
  'No personally identifiable information will be collected.',
  'There are no right or wrong behaviors.',
  'Please interact naturally.',
];

const CONTROL_INSTRUCTIONS = [
  'You will be using a simulated social media feed.',
  'Use the app as you normally would.',
  'You may scroll and interact freely.',
  'You may end the session at any time by clicking the STOP button located at the top right of the screen.',
  'Once your session is complete, you will be asked to complete a short questionnaire.',
  'When you are finished with the questionnaire, submit your answers, and return the device to the researcher.',
];

const EXPERIMENTAL_INSTRUCTIONS = [
  'You will be using a simulated social media feed.',
  'Before starting, you will select how long you intend to use the app.',
  'During your session, you may receive prompts related to your usage. Answer to the best of abilities.',
  'You may continue using the app after prompts appear.',
  'You may end the session at any time by clicking the STOP button located at the top right of the screen.',
  'Once your session is complete, you will be asked to complete a short questionnaire.',
  'When you are finished with the questionnaire, submit your answers, and return the device to the researcher.',
];

const IntroductionScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Introduction'>) => {
  const group = useSession((state) => state.group);
  const [hasParticipationConsent, setHasParticipationConsent] = useState(false);
  const [hasDataConsent, setHasDataConsent] = useState(false);

  const instructions = useMemo(() => {
    if (group === 'experimental') {
      return EXPERIMENTAL_INSTRUCTIONS;
    }

    return CONTROL_INSTRUCTIONS;
  }, [group]);

  const canContinue = hasParticipationConsent && hasDataConsent;

  const handleContinue = () => {
    navigation.reset({ index: 0, routes: [{ name: 'EntryPrompt' }] });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Welcome to the Pausely Study</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          {SHARED_INTRO_LINES.map((line) => (
            <Text key={line} style={styles.bodyText}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {instructions.map((line, index) => (
            <View key={line} style={styles.instructionRow}>
              <Text style={styles.instructionIndex}>{index + 1}.</Text>
              <Text style={styles.instructionText}>{line}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={styles.consentRow}
          onPress={() => setHasParticipationConsent((current) => !current)}
        >
          <View
            style={[
              styles.checkbox,
              hasParticipationConsent ? styles.checkboxChecked : null,
            ]}
          >
            {hasParticipationConsent ? (
              <Text style={styles.checkboxMark}>✓</Text>
            ) : null}
          </View>
          <Text style={styles.consentText}>
            I have read the information above and consent to participate in this
            study.
          </Text>
        </Pressable>

        <Pressable
          style={styles.consentRow}
          onPress={() => setHasDataConsent((current) => !current)}
        >
          <View
            style={[
              styles.checkbox,
              hasDataConsent ? styles.checkboxChecked : null,
            ]}
          >
            {hasDataConsent ? <Text style={styles.checkboxMark}>✓</Text> : null}
          </View>
          <Text style={styles.consentText}>
            I agree to the collection and use of my data for research purposes.
          </Text>
        </Pressable>

        <Text style={styles.footerHint}>
          By clicking Continue you will begin the session.
        </Text>

        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={!canContinue}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1c',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ead8bf',
    backgroundColor: '#fff9f1',
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1c',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#454545',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  instructionIndex: {
    width: 20,
    fontSize: 15,
    fontWeight: '700',
    color: '#c1761f',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#454545',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#c8c8c8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#f2a84e',
    borderColor: '#f2a84e',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  footerHint: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginTop: 2,
  },
  button: {
    marginTop: 16,
  },
});

export default IntroductionScreen;
