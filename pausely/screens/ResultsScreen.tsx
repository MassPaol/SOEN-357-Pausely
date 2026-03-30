import { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';

const formatMinutes = (valueMs: number | null) => {
  if (valueMs === null) {
    return '—';
  }

  const minutes = Math.max(0, Math.round(valueMs / 60000));
  return `${minutes} min`;
};

const ResultsScreen = ({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Results'>) => {
  const {
    group,
    intendedDuration,
    sessionStartTime,
    actualEndTime,
    totalPausedMs,
    postsViewed,
    resetSession,
    startSession,
  } = useSession();

  const actualDurationMs = useMemo(() => {
    if (actualEndTime === null || sessionStartTime === null) {
      return null;
    }

    const elapsed = actualEndTime - sessionStartTime - totalPausedMs;
    return Math.max(0, elapsed);
  }, [actualEndTime, sessionStartTime, totalPausedMs]);

  const overrunMinutes = useMemo(() => {
    if (actualDurationMs === null || intendedDuration === null) {
      return null;
    }

    const diff = actualDurationMs - intendedDuration;
    if (diff <= 0) {
      return null;
    }

    return Math.max(0, Math.round(diff / 60000));
  }, [actualDurationMs, intendedDuration]);

  const handleStartNewSession = () => {
    if (group === 'control') {
      const randomMinutes = Math.floor(Math.random() * 4) + 2;
      startSession(randomMinutes * 60 * 1000, '');
      navigation.reset({ index: 0, routes: [{ name: 'Feed' }] });
      return;
    }

    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'EntryPrompt' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Session complete. Thank you!</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Intended duration</Text>
            <Text style={styles.summaryValue}>
              {formatMinutes(intendedDuration)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Actual duration</Text>
            <Text style={styles.summaryValue}>
              {formatMinutes(actualDurationMs)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Posts viewed</Text>
            <Text style={styles.summaryValue}>{postsViewed}</Text>
          </View>
        </View>

        {group === 'experimental' && overrunMinutes !== null ? (
          <Text style={styles.overrunText}>
            You exceeded your goal by {overrunMinutes} min
          </Text>
        ) : null}

        <AppButton
          title="Start New Session"
          onPress={handleStartNewSession}
          style={styles.primaryButton}
        />
      </View>

      <TouchableOpacity
        style={styles.exportLink}
        onPress={() => undefined}
        activeOpacity={0.6}
      >
        <Text style={styles.exportText}>Export data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    marginTop: 16,
  },
  checkCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f2a84e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkMark: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryCard: {
    alignSelf: 'stretch',
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#fff7ec',
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#777',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  overrunText: {
    fontSize: 14,
    color: '#c1761f',
    marginBottom: 12,
  },
  primaryButton: {
    alignSelf: 'stretch',
  },
  exportLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  exportText: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'underline',
  },
});

export default ResultsScreen;
