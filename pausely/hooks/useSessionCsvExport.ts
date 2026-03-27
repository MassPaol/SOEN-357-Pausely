import Constants from 'expo-constants';
import { useEffect, useMemo } from 'react';
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

const queueRequest = (task: () => Promise<void>) => {
  requestQueue = requestQueue.then(task).catch((error) => {
    if (!hasWarnedExportFailure) {
      hasWarnedExportFailure = true;
      console.warn(
        'Local CSV export failed. Start `npm run export-server` at the repo root and keep Expo on the same network.',
        error,
      );
    }
  });

  return requestQueue;
};

const getSessionSnapshot = (): SessionExportData => {
  const state = useSession.getState();

  return {
    participantID: state.participantID,
    group: state.group,
    intendedDuration: state.intendedDuration,
    reasonForSession: state.reasonForSession,
    sessionStartTime: state.sessionStartTime,
    actualEndTime: state.actualEndTime,
    postsViewed: state.postsViewed,
    scrollCount: state.scrollCount,
    midSessionEstimate: state.midSessionEstimate,
    promptDecisions: state.promptDecisions,
    questionnaireResponses: state.questionnaireResponses,
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

  hasWarnedExportFailure = false;
};

export function useSessionCsvExport() {
  const exportServerUrl = useMemo(() => resolveExportServerUrl(), []);

  useEffect(() => {
    if (!exportServerUrl) {
      if (!hasWarnedMissingServerConfig) {
        hasWarnedMissingServerConfig = true;
        console.warn(
          'Local CSV export is disabled because the Expo host could not be resolved. Set EXPO_PUBLIC_EXPORT_SERVER_URL if needed.',
        );
      }

      return;
    }

    const queueCompletedSessionExport = (session: SessionExportData) =>
      queueRequest(() => postSessionCsv(exportServerUrl, session));

    const unsubscribe = useSession.subscribe((state, previousState) => {
      if (
        state.actualEndTime !== null &&
        previousState.actualEndTime === null
      ) {
        queueCompletedSessionExport(getSessionSnapshot());
      }
    });

    return () => {
      unsubscribe();
    };
  }, [exportServerUrl]);
}
