export type PromptDecisions = {
  mid: 'continue' | 'exit' | null;
  endSession: 'continue' | 'exit' | null;
  exit: null;
};

export type SessionExportData = {
  participantID: string;
  group: string | null;
  intendedDuration: number | null;
  reasonForSession: string | null;
  sessionStartTime: number | null;
  actualEndTime: number | null;
  postsViewed: number;
  scrollCount: number;
  midSessionEstimate: number | null;
  promptDecisions: PromptDecisions;
  questionnaireResponses: object;
};

const CSV_HEADERS = [
  'participant_id',
  'group',
  'intended_duration_ms',
  'reason_for_session',
  'session_start_time_ms',
  'session_start_time_iso',
  'actual_end_time_ms',
  'actual_end_time_iso',
  'posts_viewed',
  'scroll_count',
  'mid_session_estimate',
  'prompt_mid_decision',
  'prompt_end_session_decision',
  'questionnaire_responses_json',
] as const;

const csvEscape = (value: string) => `"${value.replace(/"/g, '""')}"`;

const formatCsvValue = (value: string | number | null) => {
  if (value === null || value === '') {
    return '""';
  }

  return csvEscape(String(value));
};

const toIsoString = (value: number | null) =>
  value === null ? null : new Date(value).toISOString();

export const buildSessionCsvHeader = () =>
  CSV_HEADERS.map((header) => csvEscape(header)).join(',');

export const buildSessionCsvRow = (session: SessionExportData) => {
  const row = [
    session.participantID,
    session.group,
    session.intendedDuration,
    session.reasonForSession,
    session.sessionStartTime,
    toIsoString(session.sessionStartTime),
    session.actualEndTime,
    toIsoString(session.actualEndTime),
    session.postsViewed,
    session.scrollCount,
    session.midSessionEstimate,
    session.promptDecisions.mid,
    session.promptDecisions.endSession,
    JSON.stringify(session.questionnaireResponses),
  ];

  return row.map((value) => formatCsvValue(value)).join(',');
};

export const buildSessionCsv = (session: SessionExportData) => {
  return [buildSessionCsvHeader(), buildSessionCsvRow(session)].join('\n');
};

export const buildSessionCsvFileName = (session: SessionExportData) => {
  const participant = session.participantID.trim() || 'participant';
  const timestamp =
    toIsoString(session.actualEndTime ?? session.sessionStartTime)?.replace(
      /[:.]/g,
      '-',
    ) ?? 'session';

  return `pausely-session-${participant}-${timestamp}.csv`;
};
