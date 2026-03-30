import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppTextArea';
import { useSession } from '../context/sessionStore';

type LikertValue = 1 | 2 | 3 | 4 | 5;
type TriChoice = 'yes' | 'no' | 'unsure';

const LIKERT_OPTIONS: LikertValue[] = [1, 2, 3, 4, 5];
const TRI_OPTIONS: { value: TriChoice; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
];

type LikertScaleProps = {
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  leftLabel: string;
  rightLabel: string;
};

const LikertScale = ({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: LikertScaleProps) => {
  return (
    <View>
      <View style={styles.likertRow}>
        {LIKERT_OPTIONS.map((option) => {
          const isActive = value === option;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.likertOption,
                isActive ? styles.likertOptionActive : null,
              ]}
              onPress={() => onChange(option)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.likertOptionText,
                  isActive ? styles.likertOptionTextActive : null,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.likertLabels}>
        <Text style={[styles.likertLabelText, styles.likertLabelLeft]}>
          {leftLabel}
        </Text>
        <Text style={[styles.likertLabelText, styles.likertLabelRight]}>
          {rightLabel}
        </Text>
      </View>
    </View>
  );
};

type ChoiceGroupProps = {
  value: TriChoice | null;
  onChange: (value: TriChoice) => void;
};

const ChoiceGroup = ({ value, onChange }: ChoiceGroupProps) => {
  return (
    <View style={styles.choiceRow}>
      {TRI_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.choiceButton,
              isActive ? styles.choiceButtonActive : null,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.choiceText,
                isActive ? styles.choiceTextActive : null,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const QuestionnaireScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Questionnaire'>) => {
  const group = useSession((state) => state.group);
  const saveQuestionnaireResponse = useSession(
    (state) => state.saveQuestionnaireResponse,
  );

  const [q1Control, setQ1Control] = useState<LikertValue | null>(null);
  const [q2Awareness, setQ2Awareness] = useState<LikertValue | null>(null);
  const [q3Influence, setQ3Influence] = useState<TriChoice | null>(null);
  const [q4Intrusive, setQ4Intrusive] = useState<LikertValue | null>(null);
  const [q5PromptEffect, setQ5PromptEffect] = useState<TriChoice | null>(null);
  const [q6Comments, setQ6Comments] = useState('');

  const isExperimental = group === 'experimental';
  const isSubmitDisabled = useMemo(
    () => q1Control === null || q2Awareness === null || q3Influence === null,
    [q1Control, q2Awareness, q3Influence],
  );

  const handleSubmit = () => {
    saveQuestionnaireResponse({
      q1Control,
      q2Awareness,
      q3Influence,
      q4Intrusive: isExperimental ? q4Intrusive : null,
      q5PromptEffect: isExperimental ? q5PromptEffect : null,
      q6Comments: q6Comments.trim() || null,
    });

    navigation.reset({ index: 0, routes: [{ name: 'Results' }] });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={120}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Post-session questionnaire</Text>
          <Text style={styles.subtitle}>
            Please answer the questions below about your session.
          </Text>

          <View style={styles.questionBlock}>
            <Text style={styles.questionText}>
              1. How in control of your usage did you feel during the session?
            </Text>
            <LikertScale
              value={q1Control}
              onChange={setQ1Control}
              leftLabel="No control"
              rightLabel="Full control"
            />
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionText}>
              2. How aware were you of how much time was passing?
            </Text>
            <LikertScale
              value={q2Awareness}
              onChange={setQ2Awareness}
              leftLabel="Not at all aware"
              rightLabel="Very aware"
            />
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionText}>
              3. Did anything influence your decision about when to stop?
            </Text>
            <ChoiceGroup value={q3Influence} onChange={setQ3Influence} />
          </View>

          {isExperimental ? (
            <>
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  4. How intrusive did the prompts feel?
                </Text>
                <LikertScale
                  value={q4Intrusive}
                  onChange={setQ4Intrusive}
                  leftLabel="Not at all"
                  rightLabel="Very intrusive"
                />
              </View>

              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  5. Did the prompts affect your behavior?
                </Text>
                <ChoiceGroup
                  value={q5PromptEffect}
                  onChange={setQ5PromptEffect}
                />
              </View>
            </>
          ) : null}

          <View style={styles.questionBlock}>
            <AppTextArea
              label="Any other comments about your experience?"
              value={q6Comments}
              onChangeText={setQ6Comments}
              placeholder="Optional"
              numberOfLines={4}
              style={styles.commentField}
            />
          </View>

          <AppButton
            title="Submit"
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
  },
  questionBlock: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  likertRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likertOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: '#fff',
  },
  likertOptionActive: {
    backgroundColor: '#f2a84e',
    borderColor: '#f2a84e',
  },
  likertOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  likertOptionTextActive: {
    color: '#fff',
  },
  likertLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  likertLabelText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  likertLabelLeft: {
    textAlign: 'left',
  },
  likertLabelRight: {
    textAlign: 'right',
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  choiceButtonActive: {
    backgroundColor: '#f2a84e',
    borderColor: '#f2a84e',
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  choiceTextActive: {
    color: '#fff',
  },
  commentField: {
    marginTop: 4,
  },
  submitButton: {
    marginTop: 4,
  },
});

export default QuestionnaireScreen;
