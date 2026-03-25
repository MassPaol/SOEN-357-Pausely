import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';
import { AppWheelPicker } from '../components/AppWheelPicker';
import { AppTextArea } from '../components/AppTextArea';
import { AppLogo } from '../components/AppLogo';

const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const minutes = (i + 1) * 5;
  return { label: `${minutes} minutes`, value: minutes };
});

const EntryPromptScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'EntryPrompt'>) => {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { startSession } = useSession();
  const [selectedMinutes, setSelectedMinutes] = useState(30);
  const [goal, setGoal] = useState('');

  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      navigation.navigate('ResearcherConfig');
    } else {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 3000);
    }
  };

  const handleBegin = () => {
    startSession(selectedMinutes * 60 * 1000, goal);
    console.log(
      'DEBUG: EntryPromptScreen.tsx -> Session state:',
      useSession.getState(),
    );
    navigation.navigate('Feed');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Set your intention</Text>

        <AppWheelPicker
          label="How long do you plan to use the app?"
          options={DURATION_OPTIONS}
          selectedValue={selectedMinutes}
          onValueChange={setSelectedMinutes}
          style={styles.field}
        />

        <AppTextArea
          label="What do you want to accomplish?"
          value={goal}
          onChangeText={setGoal}
          placeholder="e.g. catch up on news, check in with friends..."
          style={styles.field}
        />

        <AppButton title="Begin Session" onPress={handleBegin} />
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
    fontSize: 22,
    fontWeight: '500',
    marginBottom: 32,
    color: '#333',
  },
  field: {
    marginBottom: 24,
  },
});

export default EntryPromptScreen;
