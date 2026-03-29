import { useEffect, useRef } from 'react';
import { useSession } from '../context/sessionStore';

const HARD_CAP_MS = 600_000; // 10 minutes

type UseSessionTimerArgs = {
  intendedDuration: number;
  onMidSession: () => void;
  onEndSession: () => void;
  onHardCap: () => void;
};

export default function useSessionTimer({
  intendedDuration,
  onMidSession,
  onEndSession,
  onHardCap,
}: UseSessionTimerArgs) {
  const group = useSession((s) => s.group);
  const sessionStartTime = useSession((s) => s.sessionStartTime);

  const midTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hardCapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const firedRef = useRef({ mid: false, end: false, hardCap: false });
  const sessionEndedRef = useRef(false);

  const onMidSessionRef = useRef(onMidSession);
  const onEndSessionRef = useRef(onEndSession);
  const onHardCapRef = useRef(onHardCap);
  onMidSessionRef.current = onMidSession;
  onEndSessionRef.current = onEndSession;
  onHardCapRef.current = onHardCap;

  const clearAllTimers = () => {
    if (midTimerRef.current) clearTimeout(midTimerRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    if (hardCapTimerRef.current) clearTimeout(hardCapTimerRef.current);
    midTimerRef.current = null;
    endTimerRef.current = null;
    hardCapTimerRef.current = null;
  };

  useEffect(() => {
    if (group !== 'experimental' || !sessionStartTime || !intendedDuration) {
      return;
    }

    if (useSession.getState().actualEndTime !== null) {
      return;
    }

    sessionEndedRef.current = false;
    firedRef.current = { mid: false, end: false, hardCap: false };

    const elapsed = Date.now() - sessionStartTime;
    const midDelay = intendedDuration / 2 - elapsed;
    const endDelay = intendedDuration - elapsed;
    const hardCapDelay = HARD_CAP_MS - elapsed;

    if (__DEV__) {
      console.log('[useSessionTimer] scheduling timers', {
        intendedDuration,
        elapsed: Math.round(elapsed),
        midDelay: Math.round(midDelay),
        endDelay: Math.round(endDelay),
        hardCapDelay: Math.round(hardCapDelay),
      });
    }

    const fireMid = () => {
      if (sessionEndedRef.current || firedRef.current.mid) return;
      firedRef.current.mid = true;
      if (__DEV__) console.log('[useSessionTimer] FIRING mid-session prompt');
      onMidSessionRef.current();
    };

    const fireEnd = () => {
      if (sessionEndedRef.current || firedRef.current.end) return;
      firedRef.current.end = true;
      if (__DEV__) console.log('[useSessionTimer] FIRING end-session prompt');
      onEndSessionRef.current();
    };

    const fireHardCap = () => {
      if (sessionEndedRef.current || firedRef.current.hardCap) return;
      firedRef.current.hardCap = true;
      sessionEndedRef.current = true;
      if (__DEV__) console.log('[useSessionTimer] FIRING hard cap');
      onHardCapRef.current();
    };

    if (midDelay <= 0) {
      fireMid();
    } else {
      midTimerRef.current = setTimeout(fireMid, midDelay);
    }

    if (endDelay <= 0) {
      fireEnd();
    } else {
      endTimerRef.current = setTimeout(fireEnd, endDelay);
    }

    if (hardCapDelay <= 0) {
      fireHardCap();
    } else {
      hardCapTimerRef.current = setTimeout(fireHardCap, hardCapDelay);
    }

    return clearAllTimers;
  }, [group, sessionStartTime, intendedDuration]);

  useEffect(() => {
    const unsubscribe = useSession.subscribe((state, prev) => {
      if (state.actualEndTime !== null && prev.actualEndTime === null) {
        if (__DEV__)
          console.log('[useSessionTimer] session ended, clearing timers');
        sessionEndedRef.current = true;
        clearAllTimers();
      }
    });
    return unsubscribe;
  }, []);
}
