import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/AppButton';
import { useSession } from '../context/sessionStore';
import { useSessionCsvExport } from '../hooks/useSessionCsvExport';

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
    actualDurationMs,
    overrunDurationMs,
    postsViewed,
    resetSession,
  } = useSession();
  const { exportSessionCsv, canExportSessionCsv } = useSessionCsvExport();
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const overrunMinutes = useMemo(() => {
    if (overrunDurationMs === null || intendedDuration === null) {
      return null;
    }

    if (overrunDurationMs <= 0) {
      return null;
    }

    return Math.max(0, Math.round(overrunDurationMs / 60000));
  }, [intendedDuration, overrunDurationMs]);

  const handleStartNewSession = () => {
    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'ResearcherConfig' }] });
  };

  const handleExportData = async () => {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setExportMessage(null);

    try {
      const exported = await exportSessionCsv();
      setHasExported(exported);
      setExportMessage(
        exported
          ? 'Export complete'
          : 'Export unavailable. Check the local export server configuration.',
      );
    } catch {
      setHasExported(false);
      setExportMessage(
        'Export failed. Check that the local export server is running.',
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Session complete. Thank you!</Text>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Stop Here</Text>
          <Text style={styles.noticeText}>
            Please return the device to the researcher. Do not start another
            session yourself.
          </Text>
        </View>

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
          title="Researcher Only: Start New Session"
          onPress={handleStartNewSession}
          style={styles.primaryButton}
        />
      </View>

      {!hasExported ? (
        <TouchableOpacity
          style={styles.exportLink}
          onPress={handleExportData}
          activeOpacity={0.6}
          disabled={isExporting}
        >
          <Text
            style={[
              styles.exportText,
              !canExportSessionCsv || isExporting
                ? styles.exportTextDisabled
                : null,
            ]}
          >
            {isExporting ? 'Exporting data...' : 'Export data'}
          </Text>
        </TouchableOpacity>
      ) : null}
      {exportMessage ? (
        <Text style={styles.exportStatus}>{exportMessage}</Text>
      ) : null}
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
    marginBottom: 10,
  },
  noticeCard: {
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: '#fff1f0',
    borderWidth: 1,
    borderColor: '#d96c5f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b04437',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 15,
    color: '#6a2b24',
    textAlign: 'center',
    lineHeight: 21,
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
  exportTextDisabled: {
    opacity: 0.55,
  },
  exportStatus: {
    marginTop: -6,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
  },
});

export default ResultsScreen;
