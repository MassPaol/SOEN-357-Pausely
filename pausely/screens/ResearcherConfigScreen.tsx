import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSession } from '../context/sessionStore';
import { AppButton } from '../components/AppButton';

const ResearcherConfigScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'ResearcherConfig'>) => {
  const { group, setGroup } = useSession();

  const handleDone = () => {
    navigation.reset({ index: 0, routes: [{ name: 'EntryPrompt' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Researcher config</Text>
      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Participant notice</Text>
        <Text style={styles.noticeText}>
          If you are a participant and you see this screen, hand the device to
          the researcher.
        </Text>
      </View>
      <Text style={styles.subheading}>
        Set the participant group before handing the device over. This cannot be
        changed mid-session.
      </Text>

      <Text style={styles.label}>Current group</Text>
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.option, group === 'control' && styles.optionActive]}
          onPress={() => setGroup('control')}
        >
          <Text
            style={[
              styles.optionText,
              group === 'control' && styles.optionTextActive,
            ]}
          >
            Control
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.option,
            group === 'experimental' && styles.optionActive,
          ]}
          onPress={() => setGroup('experimental')}
        >
          <Text
            style={[
              styles.optionText,
              group === 'experimental' && styles.optionTextActive,
            ]}
          >
            Experimental
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        {group === 'control'
          ? 'Control: participant sees a plain feed with no reflective prompts.'
          : 'Experimental: participant sees reflective prompts at entry, mid-session, and exit.'}
      </Text>

      <AppButton
        title="Hand Off To Participant"
        onPress={handleDone}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  noticeCard: {
    borderRadius: 12,
    backgroundColor: '#fff7ec',
    borderWidth: 1,
    borderColor: '#f2a84e',
    padding: 16,
    marginBottom: 20,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#c1761f',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  toggle: {
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  option: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionActive: {
    backgroundColor: '#f2a84e',
  },
  optionText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 32,
    lineHeight: 18,
  },
  button: {
    marginTop: 8,
  },
});

export default ResearcherConfigScreen;
