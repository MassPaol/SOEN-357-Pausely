import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';
import { AppWheelPicker } from '../components/AppWheelPicker';
import { AppTextArea } from '../components/AppTextArea';

const DURATION_OPTIONS = [
  { label: '1 min', value: 1 },
  { label: '2 min', value: 2 },
  { label: '3 min', value: 3 },
  { label: '4 min', value: 4 },
  { label: '5 min', value: 5 },
];

const EntryPromptScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EntryPrompt'>) => {
  const startSession = useSession((state) => state.startSession);
  const group = useSession((state) => state.group);
  const sessionStartTime = useSession((state) => state.sessionStartTime);
  const [selectedMinutes, setSelectedMinutes] = useState(2);
  const [goal, setGoal] = useState('');

  const isReady = useMemo(() => goal.trim().length > 0, [goal]);

  useEffect(() => {
    if (sessionStartTime) {
      navigation.navigate('Feed');
      return;
    }

    if (group === 'control') {
      startSession(null, '');
      navigation.navigate('Feed');
    }
  }, [group, navigation, sessionStartTime, startSession]);

  const handleBegin = () => {
    startSession(selectedMinutes * 60 * 1000, goal);
    navigation.navigate('Feed');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Before you start...</Text>

        <AppTextArea
          label="What do you plan to do?"
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. catch up on posts"
          style={styles.field}
        />

        <AppWheelPicker
          label="How long do you plan to use the app?"
          options={DURATION_OPTIONS}
          selectedValue={selectedMinutes}
          onValueChange={setSelectedMinutes}
          style={styles.field}
        />

        <AppButton
          title="Start Session"
          onPress={handleBegin}
          disabled={!isReady}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 28,
    color: '#111',
    textAlign: 'center',
  },
  field: {
    marginBottom: 24,
  },
});

export default EntryPromptScreen;
