import Constants from 'expo-constants';
import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { useSession } from '../context/sessionStore';
import {
  buildSessionCsvHeader,
  buildSessionCsvRow,
  SessionExportData,
} from '../utils/sessionCsv';

const EXPORT_SERVER_PORT = 4001;
const EXPORT_ENDPOINT = '/session-export';

let requestQueue = Promise.resolve();
let hasWarnedMissingServerConfig = false;
let hasWarnedExportFailure = false;

const queueRequest = async (task: () => Promise<void>) => {
  const nextRequest = requestQueue.then(task);
  requestQueue = nextRequest.catch(() => undefined);

  try {
    await nextRequest;
    hasWarnedExportFailure = false;
  } catch (error) {
    if (!hasWarnedExportFailure) {
      hasWarnedExportFailure = true;
      console.warn(
        'Local CSV export failed. Start `npm run export-server` at the repo root and keep Expo on the same network.',
        error,
      );
    }

    throw error;
  }
};

const getSessionSnapshot = (
  state = useSession.getState(),
): SessionExportData => {
  return {
    participantID: state.participantID,
    group: state.group,
    intendedDuration: state.intendedDuration,
    reasonForSession: state.reasonForSession,
    sessionStartTime: state.sessionStartTime,
    actualEndTime: state.actualEndTime,
    totalPausedMs: state.totalPausedMs,
    actualDurationMs: state.actualDurationMs,
    overrunDurationMs: state.overrunDurationMs,
    postsViewed: state.postsViewed,
    scrollCount: state.scrollCount,
    midPromptShownAt: state.midPromptShownAt,
    midSessionEstimate: state.midSessionEstimate,
    midSessionGoalStatus: state.midSessionGoalStatus,
    midSessionRecall: state.midSessionRecall,
    endSessionGoalStatus: state.endSessionGoalStatus,
    endSessionFeeling: state.endSessionFeeling,
    exitReason: state.exitReason,
    exitGoalStatus: state.exitGoalStatus,
    promptDecisions: state.promptDecisions,
    questionnaireResponses: state.questionnaireResponses,
    questionnaireSubmittedAt: state.questionnaireSubmittedAt,
  };
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const resolveExportServerUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_EXPORT_SERVER_URL?.trim();

  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  const hostUri = Constants.expoConfig?.hostUri?.replace(/^https?:\/\//, '');
  const host = hostUri?.split(':')[0];

  if (!host) {
    return null;
  }

  if (host === 'localhost' || host === '127.0.0.1') {
    const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${fallbackHost}:${EXPORT_SERVER_PORT}`;
  }

  return `http://${host}:${EXPORT_SERVER_PORT}`;
};

const postSessionCsv = async (baseUrl: string, session: SessionExportData) => {
  const response = await fetch(`${baseUrl}${EXPORT_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      header: buildSessionCsvHeader(),
      row: buildSessionCsvRow(session),
    }),
  });

  if (!response.ok) {
    throw new Error(`Export server responded with ${response.status}`);
  }
};

type UseSessionCsvExportResult = {
  exportSessionCsv: () => Promise<boolean>;
  canExportSessionCsv: boolean;
};

export function useSessionCsvExport(): UseSessionCsvExportResult {
  const exportServerUrl = useMemo(() => resolveExportServerUrl(), []);

  const exportSessionCsv = useCallback(async () => {
    if (!exportServerUrl) {
      if (!hasWarnedMissingServerConfig) {
        hasWarnedMissingServerConfig = true;
        console.warn(
          'Local CSV export is disabled because the Expo host could not be resolved. Set EXPO_PUBLIC_EXPORT_SERVER_URL if needed.',
        );
      }

      return false;
    }

    const session = getSessionSnapshot();
    await queueRequest(() => postSessionCsv(exportServerUrl, session));
    return true;
  }, [exportServerUrl]);

  return {
    exportSessionCsv,
    canExportSessionCsv: exportServerUrl !== null,
  };
}
