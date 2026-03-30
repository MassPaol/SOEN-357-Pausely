import { useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSession } from '../context/sessionStore';

export type VisibleModal = null | 'mid' | 'endSession' | 'exit';

type Props = {
  visibleModal: VisibleModal;
  onMidContinue: () => void;
  onMidExit: () => void;
  onEndContinue: () => void;
  onEndExit: () => void;
  onExitContinue: () => void;
  onExitEnd: () => void;
};

export default function SessionPromptOverlay({
  visibleModal,
  onMidContinue,
  onMidExit,
  onEndContinue,
  onEndExit,
  onExitContinue,
  onExitEnd,
}: Props) {
  const saveMidSessionResponse = useSession(
    (state) => state.saveMidSessionResponse,
  );
  const saveEndSessionResponse = useSession(
    (state) => state.saveEndSessionResponse,
  );
  const saveExitPromptResponse = useSession(
    (state) => state.saveExitPromptResponse,
  );
  const intendedDuration = useSession((state) => state.intendedDuration);

  const [midEstimateText, setMidEstimateText] = useState('');
  const [midGoalStatus, setMidGoalStatus] = useState<
    'yes' | 'not_yet' | 'forgot' | null
  >(null);
  const [midRecallText, setMidRecallText] = useState('');

  const [endGoalStatus, setEndGoalStatus] = useState<
    'yes' | 'partial' | 'no' | null
  >(null);
  const [endFeelingText, setEndFeelingText] = useState('');

  const [exitReasonText, setExitReasonText] = useState('');
  const [exitGoalStatus, setExitGoalStatus] = useState<
    'yes' | 'partial' | 'no' | null
  >(null);

  useEffect(() => {
    if (!visibleModal) return;

    if (visibleModal === 'mid') {
      setMidEstimateText('');
      setMidGoalStatus(null);
      setMidRecallText('');
    }

    if (visibleModal === 'endSession') {
      setEndGoalStatus(null);
      setEndFeelingText('');
    }

    if (visibleModal === 'exit') {
      setExitReasonText('');
      setExitGoalStatus(null);
    }
  }, [visibleModal]);

  const intendedMinutes = useMemo(() => {
    if (!intendedDuration) return null;
    return Math.round(intendedDuration / 60000);
  }, [intendedDuration]);

  const parseMinutes = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleMidContinue = () => {
    saveMidSessionResponse({
      estimateMinutes: parseMinutes(midEstimateText),
      goalStatus: midGoalStatus,
      recall: midRecallText.trim() || null,
    });
    onMidContinue();
  };

  const handleMidExit = () => {
    saveMidSessionResponse({
      estimateMinutes: parseMinutes(midEstimateText),
      goalStatus: midGoalStatus,
      recall: midRecallText.trim() || null,
    });
    onMidExit();
  };

  const handleEndContinue = () => {
    saveEndSessionResponse({
      goalStatus: endGoalStatus,
      feeling: endFeelingText.trim() || null,
    });
    onEndContinue();
  };

  const handleEndExit = () => {
    saveEndSessionResponse({
      goalStatus: endGoalStatus,
      feeling: endFeelingText.trim() || null,
    });
    onEndExit();
  };

  const handleExitContinue = () => {
    saveExitPromptResponse({
      reason: exitReasonText.trim() || null,
      goalStatus: exitGoalStatus,
    });
    onExitContinue();
  };

  const handleExitEnd = () => {
    saveExitPromptResponse({
      reason: exitReasonText.trim() || null,
      goalStatus: exitGoalStatus,
    });
    onExitEnd();
  };

  return (
    <Modal
      visible={visibleModal !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardAvoider}
        >
          <Pressable style={styles.card} onPress={() => {}}>
            <View style={styles.accentBar} />
            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {visibleModal === 'mid' && (
                <MidPromptContent
                  estimateText={midEstimateText}
                  onEstimateChange={setMidEstimateText}
                  goalStatus={midGoalStatus}
                  onGoalStatusChange={setMidGoalStatus}
                  recallText={midRecallText}
                  onRecallChange={setMidRecallText}
                  onContinue={handleMidContinue}
                  onExit={handleMidExit}
                />
              )}
              {visibleModal === 'endSession' && (
                <EndPromptContent
                  intendedMinutes={intendedMinutes}
                  goalStatus={endGoalStatus}
                  onGoalStatusChange={setEndGoalStatus}
                  feelingText={endFeelingText}
                  onFeelingChange={setEndFeelingText}
                  onContinue={handleEndContinue}
                  onExit={handleEndExit}
                />
              )}
              {visibleModal === 'exit' && (
                <ExitPromptContent
                  reasonText={exitReasonText}
                  onReasonChange={setExitReasonText}
                  goalStatus={exitGoalStatus}
                  onGoalStatusChange={setExitGoalStatus}
                  onContinue={handleExitContinue}
                  onExit={handleExitEnd}
                />
              )}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function MidPromptContent({
  onContinue,
  onExit,
  estimateText,
  onEstimateChange,
  goalStatus,
  onGoalStatusChange,
  recallText,
  onRecallChange,
}: {
  onContinue: () => void;
  onExit: () => void;
  estimateText: string;
  onEstimateChange: (value: string) => void;
  goalStatus: 'yes' | 'not_yet' | 'forgot' | null;
  onGoalStatusChange: (value: 'yes' | 'not_yet' | 'forgot') => void;
  recallText: string;
  onRecallChange: (value: string) => void;
}) {
  return (
    <>
      <Text style={styles.icon}>⏸️</Text>
      <Text style={styles.title}>Quick check-in</Text>

      <Text style={styles.question}>
        How long do you think you've been scrolling?
      </Text>
      <TextInput
        style={styles.input}
        value={estimateText}
        onChangeText={onEstimateChange}
        placeholder="Minutes"
        placeholderTextColor="#9A9A9A"
        keyboardType={
          Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'
        }
      />

      <Text style={styles.question}>Have you accomplished your goal yet?</Text>
      <View style={styles.choiceRow}>
        <ChoiceButton
          label="Yes"
          isActive={goalStatus === 'yes'}
          onPress={() => onGoalStatusChange('yes')}
        />
        <ChoiceButton
          label="Not yet"
          isActive={goalStatus === 'not_yet'}
          onPress={() => onGoalStatusChange('not_yet')}
        />
        <ChoiceButton
          label="I forgot"
          isActive={goalStatus === 'forgot'}
          onPress={() => onGoalStatusChange('forgot')}
        />
      </View>

      <Text style={styles.question}>
        Can you name the last 3 posts you saw?
      </Text>
      <TextInput
        style={[styles.input, styles.inputArea]}
        value={recallText}
        onChangeText={onRecallChange}
        placeholder="Optional"
        placeholderTextColor="#9A9A9A"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Pressable
        style={[styles.button, styles.buttonPrimary]}
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          Keep Scrolling
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={onExit}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          Stop Now
        </Text>
      </Pressable>
    </>
  );
}

function EndPromptContent({
  onContinue,
  onExit,
  intendedMinutes,
  goalStatus,
  onGoalStatusChange,
  feelingText,
  onFeelingChange,
}: {
  onContinue: () => void;
  onExit: () => void;
  intendedMinutes: number | null;
  goalStatus: 'yes' | 'partial' | 'no' | null;
  onGoalStatusChange: (value: 'yes' | 'partial' | 'no') => void;
  feelingText: string;
  onFeelingChange: (value: string) => void;
}) {
  const intendedCopy =
    intendedMinutes === null
      ? 'Your intended time is now up.'
      : `You set a goal of ${intendedMinutes} minutes. Your time is now up.`;

  return (
    <>
      <Text style={styles.icon}>⏰</Text>
      <Text style={styles.title}>Your time is up!</Text>
      <Text style={styles.body}>{intendedCopy}</Text>

      <Text style={styles.question}>Did you accomplish what you intended?</Text>
      <View style={styles.choiceRow}>
        <ChoiceButton
          label="Yes"
          isActive={goalStatus === 'yes'}
          onPress={() => onGoalStatusChange('yes')}
        />
        <ChoiceButton
          label="Partially"
          isActive={goalStatus === 'partial'}
          onPress={() => onGoalStatusChange('partial')}
        />
        <ChoiceButton
          label="No"
          isActive={goalStatus === 'no'}
          onPress={() => onGoalStatusChange('no')}
        />
      </View>

      <Text style={styles.question}>How do you feel right now?</Text>
      <TextInput
        style={[styles.input, styles.inputArea]}
        value={feelingText}
        onChangeText={onFeelingChange}
        placeholder="Optional"
        placeholderTextColor="#9A9A9A"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onExit}>
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          I'm done, exit
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          Keep scrolling
        </Text>
      </Pressable>
    </>
  );
}

function ExitPromptContent({
  reasonText,
  onReasonChange,
  goalStatus,
  onGoalStatusChange,
  onContinue,
  onExit,
}: {
  reasonText: string;
  onReasonChange: (value: string) => void;
  goalStatus: 'yes' | 'partial' | 'no' | null;
  onGoalStatusChange: (value: 'yes' | 'partial' | 'no') => void;
  onContinue: () => void;
  onExit: () => void;
}) {
  return (
    <>
      <Text style={styles.icon}>👋</Text>
      <Text style={styles.title}>Leaving so soon?</Text>

      <Text style={styles.question}>Why are you stopping?</Text>
      <TextInput
        style={[styles.input, styles.inputArea]}
        value={reasonText}
        onChangeText={onReasonChange}
        placeholder="Optional"
        placeholderTextColor="#9A9A9A"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.question}>Did you accomplish your goal?</Text>
      <View style={styles.choiceRow}>
        <ChoiceButton
          label="Yes"
          isActive={goalStatus === 'yes'}
          onPress={() => onGoalStatusChange('yes')}
        />
        <ChoiceButton
          label="Partially"
          isActive={goalStatus === 'partial'}
          onPress={() => onGoalStatusChange('partial')}
        />
        <ChoiceButton
          label="No"
          isActive={goalStatus === 'no'}
          onPress={() => onGoalStatusChange('no')}
        />
      </View>

      <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onExit}>
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          Yes, end session
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          Actually, keep scrolling
        </Text>
      </Pressable>
    </>
  );
}

function ChoiceButton({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.choiceButton, isActive ? styles.choiceButtonActive : null]}
      onPress={onPress}
    >
      <Text
        style={[styles.choiceText, isActive ? styles.choiceTextActive : null]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  keyboardAvoider: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    maxHeight: '88%',
  },
  content: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#F4A261',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444444',
    textAlign: 'center',
    marginBottom: 28,
  },
  question: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginTop: 6,
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111111',
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  inputArea: {
    minHeight: 84,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  choiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    backgroundColor: '#FFFFFF',
  },
  choiceButtonActive: {
    backgroundColor: '#111111',
    borderColor: '#111111',
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: '#F4A261',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#333333',
  },
});
