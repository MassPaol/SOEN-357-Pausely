import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export type VisibleModal = null | 'mid' | 'endSession' | 'exit';

type Props = {
  visibleModal: VisibleModal;
  onContinue: () => void;
  onExit: () => void;
  onFinish: () => void;
  onExitTransitionComplete: () => void;
};

export default function SessionPromptOverlay({
  visibleModal,
  onContinue,
  onExit,
  onFinish,
  onExitTransitionComplete,
}: Props) {
  return (
    <Modal
      visible={visibleModal !== null}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.accentBar} />
          {visibleModal === 'mid' && (
            <MidPromptContent onContinue={onContinue} onExit={onExit} />
          )}
          {visibleModal === 'endSession' && (
            <EndPromptContent onContinue={onContinue} onFinish={onFinish} />
          )}
          {visibleModal === 'exit' && (
            <ExitPromptContent onDone={onExitTransitionComplete} />
          )}
        </View>
      </View>
    </Modal>
  );
}

function MidPromptContent({
  onContinue,
  onExit,
}: {
  onContinue: () => void;
  onExit: () => void;
}) {
  return (
    <>
      <Text style={styles.icon}>⏸️</Text>
      <Text style={styles.title}>Halfway check-in</Text>
      <Text style={styles.body}>
        You're halfway through your intended session. Take a moment to reflect —
        is this still serving your original goal?
      </Text>
      <Pressable
        style={[styles.button, styles.buttonPrimary]}
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          Continue Scrolling
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={onExit}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          I'm Done
        </Text>
      </Pressable>
    </>
  );
}

function EndPromptContent({
  onContinue,
  onFinish,
}: {
  onContinue: () => void;
  onFinish: () => void;
}) {
  return (
    <>
      <Text style={styles.icon}>⏰</Text>
      <Text style={styles.title}>Time's up</Text>
      <Text style={styles.body}>
        You've reached the end of your intended session. Would you like to keep
        going or wrap up?
      </Text>
      <Pressable
        style={[styles.button, styles.buttonPrimary]}
        onPress={onContinue}
      >
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          Keep Going
        </Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.buttonSecondary]}
        onPress={onFinish}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          Finish Session
        </Text>
      </Pressable>
    </>
  );
}

function ExitPromptContent({ onDone }: { onDone: () => void }) {
  return (
    <>
      <Text style={styles.icon}>👋</Text>
      <Text style={styles.title}>Wrapping up</Text>
      <Text style={styles.body}>
        Thanks for being mindful of your time. Let's capture a few quick
        thoughts before you go.
      </Text>
      <Pressable style={[styles.button, styles.buttonPrimary]} onPress={onDone}>
        <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
          Continue to Questionnaire
        </Text>
      </Pressable>
    </>
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
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
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
