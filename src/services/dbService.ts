import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  InstitutionSettings,
  Student,
  TestResult,
  TestSessionState,
  TestSubmission,
} from '../types';
import { evaluateSubmission } from '../utils/diagnosticEvaluator';

export type FirebaseSyncStatus = 'connecting' | 'live' | 'cache' | 'error';

const DEFAULT_SETTINGS: InstitutionSettings = {
  institutionName: 'Lembaga Pemetaan Unlock Your Potential',
  address: 'Jl. Pendidikan Karakter No. 108, Kompleks Akademik',
  phone: '(021) 7890-1234 / 0812-9876-5432',
  email: 'info@unlockyourpotential.sch.id',
  isTestOpen: true,
  testScheduleMode: 'unlimited',
  resultReleaseMode: 'instant',
  resultReleaseDate: '',
  updatedAt: new Date().toISOString(),
};

const LOCAL_STORAGE_KEY_SETTINGS = 'diagnostic_app_settings';
const LOCAL_STORAGE_KEY_STUDENTS = 'diagnostic_app_students';
const LOCAL_STORAGE_KEY_SUBMISSIONS = 'diagnostic_app_submissions';
const LOCAL_STORAGE_KEY_RESULTS = 'diagnostic_app_results';
const LOCAL_STORAGE_KEY_SESSIONS = 'diagnostic_app_test_sessions';

export const LOCK_TERMINATION_REASON =
  'Tidak dapat menyelesaikan tes karena keluar dari halaman tes sebanyak 3 kali.';

// Local storage helpers for instantaneous offline resilience
function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// Strip undefined keys because Firestore rejects `undefined` values
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((k) => {
    const val = obj[k];
    if (val === undefined) return;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      clean[k] = sanitizeForFirestore(val);
    } else {
      clean[k] = val;
    }
  });
  return clean as T;
}

// 1. SETTINGS OPERATIONS & REAL-TIME SUBSCRIPTION
export async function getInstitutionSettings(): Promise<InstitutionSettings> {
  try {
    const docRef = doc(db, 'settings', 'institution');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as InstitutionSettings;
      setLocal(LOCAL_STORAGE_KEY_SETTINGS, data);
      return data;
    } else {
      await setDoc(docRef, sanitizeForFirestore(DEFAULT_SETTINGS));
      setLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.warn('Using local settings cache due to Firestore read state:', error);
    return getLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  }
}

export function subscribeInstitutionSettings(
  onData: (settings: InstitutionSettings) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  const docRef = doc(db, 'settings', 'institution');
  onStatus?.('connecting');

  return onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    async (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      if (snap.exists()) {
        const data = snap.data() as InstitutionSettings;
        setLocal(LOCAL_STORAGE_KEY_SETTINGS, data);
        onData(data);
      } else {
        try {
          await setDoc(docRef, sanitizeForFirestore(DEFAULT_SETTINGS));
          setLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
          onData(DEFAULT_SETTINGS);
        } catch (err) {
          console.warn('Could not initialize default settings in Firestore:', err);
          onData(getLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS));
        }
      }
    },
    (error) => {
      console.error('Firestore settings subscription error:', error);
      onStatus?.('error', error.message);
      onData(getLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS));
    }
  );
}

export async function updateInstitutionSettings(
  settings: Partial<InstitutionSettings>
): Promise<InstitutionSettings> {
  const current = await getInstitutionSettings();
  const updated: InstitutionSettings = sanitizeForFirestore({
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  });

  setLocal(LOCAL_STORAGE_KEY_SETTINGS, updated);
  await setDoc(doc(db, 'settings', 'institution'), updated, { merge: true });

  return updated;
}

// 2. STUDENT OPERATIONS & REAL-TIME SUBSCRIPTION
export async function registerStudent(
  studentData: Omit<Student, 'id' | 'regNumber' | 'createdAt' | 'status'>
): Promise<Student> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const regNumber = `${dateStr}${randomSuffix}`;
  const normUsername = studentData.username.trim().toLowerCase();

  // Check username uniqueness in Firestore first
  try {
    const q = query(collection(db, 'students'), where('username', '==', normUsername));
    const existingSnap = await getDocs(q);
    if (!existingSnap.empty) {
      throw new Error(`Username '${normUsername}' sudah terdaftar. Silakan pilih username lain.`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('sudah terdaftar')) {
      throw err;
    }
    console.warn('Firestore username check fallback to local:', err);
  }

  // Also check local cache
  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  const existsLocally = localStudents.find((s) => s.username.toLowerCase() === normUsername);
  if (existsLocally) {
    throw new Error(`Username '${normUsername}' sudah terdaftar. Silakan pilih username lain.`);
  }

  const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newStudent: Student = sanitizeForFirestore({
    ...studentData,
    id: studentId,
    username: normUsername,
    regNumber,
    status: 'registered',
    createdAt: new Date().toISOString(),
  });

  localStudents.push(newStudent);
  setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);

  try {
    await setDoc(doc(db, 'students', studentId), newStudent);
  } catch (error) {
    console.warn('Saved student locally, Firestore sync pending:', error);
  }

  return newStudent;
}

export async function loginStudent(username: string, password: string): Promise<Student | null> {
  const normUser = username.trim().toLowerCase();
  const normPass = password.trim();

  // Check Firestore first
  try {
    const q = query(collection(db, 'students'), where('username', '==', normUser));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docSnap = snap.docs[0];
      const match = docSnap.data() as Student;
      if (match.password === normPass) {
        match.id = docSnap.id;
        const localList = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
        const idx = localList.findIndex((s) => s.id === match.id || s.username.toLowerCase() === normUser);
        if (idx >= 0) {
          localList[idx] = match;
        } else {
          localList.push(match);
        }
        setLocal(LOCAL_STORAGE_KEY_STUDENTS, localList);
        return match;
      }
      return null;
    }
  } catch (error) {
    console.warn('Firestore login query fallback to local check:', error);
  }

  // Fallback to local
  const localList = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  const found = localList.find((s) => s.username.toLowerCase() === normUser && s.password === normPass);
  return found || null;
}

export async function getAllStudents(): Promise<Student[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    const list: Student[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Student) });
    });
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    setLocal(LOCAL_STORAGE_KEY_STUDENTS, list);
    return list;
  } catch (error) {
    console.warn('Fallback to local students list:', error);
    return getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  }
}

export function subscribeAllStudents(
  onData: (students: Student[]) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  onStatus?.('connecting');
  return onSnapshot(
    collection(db, 'students'),
    { includeMetadataChanges: true },
    (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      const list: Student[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Student) });
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setLocal(LOCAL_STORAGE_KEY_STUDENTS, list);
      onData(list);
    },
    (error) => {
      console.error('Firestore students subscription error:', error);
      onStatus?.('error', error.message);
      onData(getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []));
    }
  );
}

export async function deleteStudent(studentId: string): Promise<void> {
  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []).filter((s) => s.id !== studentId);
  setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);

  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  delete localResults[studentId];
  setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);

  const localSubs = getLocal<Record<string, TestSubmission>>(LOCAL_STORAGE_KEY_SUBMISSIONS, {});
  delete localSubs[studentId];
  setLocal(LOCAL_STORAGE_KEY_SUBMISSIONS, localSubs);

  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  delete localSessions[studentId];
  setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);

  await Promise.all([
    deleteDoc(doc(db, 'students', studentId)),
    deleteDoc(doc(db, 'submissions', studentId)),
    deleteDoc(doc(db, 'results', studentId)),
    deleteDoc(doc(db, 'test_sessions', studentId)),
  ]);
}

// 3. REAL-TIME TEST SESSION (FOCUS LOCK, VIOLATIONS, ADMIN UNLOCK)
export async function saveTestSessionProgress(
  sessionData: Omit<TestSessionState, 'updatedAt'>
): Promise<TestSessionState> {
  const payload: TestSessionState = sanitizeForFirestore({
    ...sessionData,
    updatedAt: new Date().toISOString(),
  });

  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  localSessions[payload.studentId] = payload;
  setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);

  try {
    await Promise.all([
      setDoc(doc(db, 'test_sessions', payload.studentId), payload, { merge: true }),
      setDoc(
        doc(db, 'students', payload.studentId),
        { status: payload.isLocked ? 'locked' : 'in_progress' },
        { merge: true }
      ),
    ]);
  } catch (err) {
    console.warn('Firestore session progress sync notice:', err);
  }

  return payload;
}

export async function lockTestSessionAndGenerateResult(
  sessionData: Omit<TestSessionState, 'updatedAt' | 'isLocked' | 'status'>
): Promise<{ session: TestSessionState; submission: TestSubmission; result: TestResult }> {
  const nowIso = new Date().toISOString();
  const lockedSession: TestSessionState = sanitizeForFirestore({
    ...sessionData,
    isLocked: true,
    lockedAt: nowIso,
    lockReason: LOCK_TERMINATION_REASON,
    status: 'locked',
    updatedAt: nowIso,
  });

  // Save locked session locally
  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  localSessions[lockedSession.studentId] = lockedSession;
  setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);

  // Build submission & auto-generate evaluation result with violation notice
  const submission: TestSubmission = sanitizeForFirestore({
    studentId: lockedSession.studentId,
    regNumber: lockedSession.regNumber,
    username: lockedSession.username,
    fullName: lockedSession.fullName,
    educationLevel: lockedSession.educationLevel,
    schoolOrigin: lockedSession.schoolOrigin,
    grade: lockedSession.grade,
    answers: lockedSession.answers || {},
    dataConfirmed: false,
    submittedAt: nowIso,
    status: 'analyzed',
    completionStatus: 'locked_violation',
    violationCount: lockedSession.violationCount,
    terminationReason: LOCK_TERMINATION_REASON,
  });

  const calculatedResult = sanitizeForFirestore(evaluateSubmission(submission));
  const settings = await getInstitutionSettings();
  let isReleased = false;
  if (settings.resultReleaseMode === 'instant') {
    isReleased = true;
  } else if (settings.resultReleaseMode === 'scheduled' && settings.resultReleaseDate) {
    if (Date.now() >= new Date(settings.resultReleaseDate).getTime()) {
      isReleased = true;
    }
  }
  calculatedResult.isReleased = isReleased;

  // Save locally
  const localSubs = getLocal<Record<string, TestSubmission>>(LOCAL_STORAGE_KEY_SUBMISSIONS, {});
  localSubs[lockedSession.studentId] = submission;
  setLocal(LOCAL_STORAGE_KEY_SUBMISSIONS, localSubs);

  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  localResults[lockedSession.studentId] = calculatedResult;
  setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);

  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  const stdIdx = localStudents.findIndex((s) => s.id === lockedSession.studentId);
  if (stdIdx >= 0) {
    localStudents[stdIdx].status = 'locked';
    setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);
  }

  // Sync all 4 documents to Firestore immediately
  await Promise.all([
    setDoc(doc(db, 'test_sessions', lockedSession.studentId), lockedSession),
    setDoc(doc(db, 'submissions', lockedSession.studentId), submission),
    setDoc(doc(db, 'results', lockedSession.studentId), calculatedResult),
    setDoc(doc(db, 'students', lockedSession.studentId), { status: 'locked' }, { merge: true }),
  ]);

  return { session: lockedSession, submission, result: calculatedResult };
}

export async function requestSessionUnlock(studentId: string, note: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const patch = sanitizeForFirestore({
    unlockRequested: true,
    unlockRequestNote: note.trim() || 'Mohon izin membuka kunci ujian agar dapat melanjutkan tes.',
    unlockRequestedAt: nowIso,
    updatedAt: nowIso,
  });

  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  if (localSessions[studentId]) {
    localSessions[studentId] = { ...localSessions[studentId], ...patch };
    setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);
  }

  await setDoc(doc(db, 'test_sessions', studentId), patch, { merge: true });
}

export async function unlockTestSessionByAdmin(studentId: string): Promise<void> {
  const nowIso = new Date().toISOString();
  const unlockPatch = sanitizeForFirestore({
    isLocked: false,
    violationCount: 0,
    status: 'in_progress' as const,
    lockReason: '',
    unlockRequested: false,
    unlockedByAdmin: true,
    unlockedAt: nowIso,
    updatedAt: nowIso,
  });

  // Update local caches
  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  if (localSessions[studentId]) {
    localSessions[studentId] = { ...localSessions[studentId], ...unlockPatch };
    setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);
  }

  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  const stdIdx = localStudents.findIndex((s) => s.id === studentId);
  if (stdIdx >= 0) {
    localStudents[stdIdx].status = 'in_progress';
    setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);
  }

  // Clear preliminary locked result/submission so student completes normally
  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  delete localResults[studentId];
  setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);

  const localSubs = getLocal<Record<string, TestSubmission>>(LOCAL_STORAGE_KEY_SUBMISSIONS, {});
  delete localSubs[studentId];
  setLocal(LOCAL_STORAGE_KEY_SUBMISSIONS, localSubs);

  await Promise.all([
    setDoc(doc(db, 'test_sessions', studentId), unlockPatch, { merge: true }),
    setDoc(doc(db, 'students', studentId), { status: 'in_progress' }, { merge: true }),
    deleteDoc(doc(db, 'results', studentId)),
    deleteDoc(doc(db, 'submissions', studentId)),
  ]);
}

export async function getTestSession(studentId: string): Promise<TestSessionState | null> {
  try {
    const snap = await getDoc(doc(db, 'test_sessions', studentId));
    if (snap.exists()) {
      const data = snap.data() as TestSessionState;
      const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
      localSessions[studentId] = data;
      setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);
      return data;
    }
  } catch (err) {
    console.warn('Fallback checking local test session:', err);
  }
  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  return localSessions[studentId] || null;
}

export function subscribeTestSession(
  studentId: string,
  onData: (session: TestSessionState | null) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  onStatus?.('connecting');
  return onSnapshot(
    doc(db, 'test_sessions', studentId),
    { includeMetadataChanges: true },
    (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      if (snap.exists()) {
        const data = snap.data() as TestSessionState;
        const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
        localSessions[studentId] = data;
        setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);
        onData(data);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error('Firestore test_session subscription error:', error);
      onStatus?.('error', error.message);
      const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
      onData(localSessions[studentId] || null);
    }
  );
}

export function subscribeAllTestSessions(
  onData: (sessions: TestSessionState[]) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  onStatus?.('connecting');
  return onSnapshot(
    collection(db, 'test_sessions'),
    { includeMetadataChanges: true },
    (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      const list: TestSessionState[] = [];
      const cacheMap: Record<string, TestSessionState> = {};
      snap.forEach((d) => {
        const data = d.data() as TestSessionState;
        list.push(data);
        cacheMap[d.id] = data;
      });
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      setLocal(LOCAL_STORAGE_KEY_SESSIONS, cacheMap);
      onData(list);
    },
    (error) => {
      console.error('Firestore all test_sessions subscription error:', error);
      onStatus?.('error', error.message);
      const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
      onData(Object.values(localSessions));
    }
  );
}

// 4. TEST SUBMISSION, EVALUATION & REAL-TIME RESULT SUBSCRIPTIONS
export async function submitTestAnswers(
  submissionData: Omit<TestSubmission, 'id' | 'submittedAt' | 'status'>
): Promise<{ submission: TestSubmission; result: TestResult }> {
  const nowIso = new Date().toISOString();
  const submission: TestSubmission = sanitizeForFirestore({
    ...submissionData,
    submittedAt: nowIso,
    status: 'analyzed',
    completionStatus: submissionData.completionStatus || 'completed',
    violationCount: submissionData.violationCount || 0,
  });

  const studentId = submission.studentId;

  // Save locally first for instantaneous resilience
  const localSubs = getLocal<Record<string, TestSubmission>>(LOCAL_STORAGE_KEY_SUBMISSIONS, {});
  localSubs[studentId] = submission;
  setLocal(LOCAL_STORAGE_KEY_SUBMISSIONS, localSubs);

  // Evaluate result
  const calculatedResult = sanitizeForFirestore(evaluateSubmission(submission));

  // Check institution release policy
  const settings = await getInstitutionSettings();
  let isReleased = false;

  if (settings.resultReleaseMode === 'instant') {
    isReleased = true;
  } else if (settings.resultReleaseMode === 'scheduled' && settings.resultReleaseDate) {
    const scheduledTime = new Date(settings.resultReleaseDate).getTime();
    if (Date.now() >= scheduledTime) {
      isReleased = true;
    }
  } else {
    isReleased = false;
  }

  calculatedResult.isReleased = isReleased;

  // Save result locally
  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  localResults[studentId] = calculatedResult;
  setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);

  // Update student status locally
  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  const stdIdx = localStudents.findIndex((s) => s.id === studentId);
  if (stdIdx >= 0) {
    localStudents[stdIdx].status = 'evaluated';
    setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);
  }

  const localSessions = getLocal<Record<string, TestSessionState>>(LOCAL_STORAGE_KEY_SESSIONS, {});
  if (localSessions[studentId]) {
    localSessions[studentId].status = 'completed';
    localSessions[studentId].isLocked = false;
    localSessions[studentId].updatedAt = nowIso;
    setLocal(LOCAL_STORAGE_KEY_SESSIONS, localSessions);
  }

  // Sync directly to Firestore
  await Promise.all([
    setDoc(doc(db, 'submissions', studentId), submission),
    setDoc(doc(db, 'results', studentId), calculatedResult),
    setDoc(doc(db, 'students', studentId), { status: 'evaluated' }, { merge: true }),
    setDoc(
      doc(db, 'test_sessions', studentId),
      {
        studentId,
        regNumber: submission.regNumber,
        username: submission.username,
        fullName: submission.fullName,
        educationLevel: submission.educationLevel,
        schoolOrigin: submission.schoolOrigin,
        grade: submission.grade,
        answers: submission.answers,
        answeredCount: Object.keys(submission.answers || {}).length,
        isLocked: false,
        status: 'completed',
        violationCount: submission.violationCount || 0,
        updatedAt: nowIso,
      },
      { merge: true }
    ),
  ]);

  return { submission, result: calculatedResult };
}

export async function getStudentResult(studentId: string): Promise<TestResult | null> {
  try {
    const snap = await getDoc(doc(db, 'results', studentId));
    if (snap.exists()) {
      const data = snap.data() as TestResult;
      const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
      localResults[studentId] = data;
      setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);
      return data;
    }
  } catch (error) {
    console.warn('Fallback checking local test results:', error);
  }

  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  return localResults[studentId] || null;
}

export function subscribeStudentResult(
  studentId: string,
  onData: (result: TestResult | null) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  onStatus?.('connecting');
  return onSnapshot(
    doc(db, 'results', studentId),
    { includeMetadataChanges: true },
    (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      if (snap.exists()) {
        const data = snap.data() as TestResult;
        const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
        localResults[studentId] = data;
        setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);
        onData(data);
      } else {
        onData(null);
      }
    },
    (error) => {
      console.error('Firestore student result subscription error:', error);
      onStatus?.('error', error.message);
      const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
      onData(localResults[studentId] || null);
    }
  );
}

export async function getAllResults(): Promise<TestResult[]> {
  try {
    const snap = await getDocs(collection(db, 'results'));
    const list: TestResult[] = [];
    const cacheMap: Record<string, TestResult> = {};
    snap.forEach((d) => {
      const data = d.data() as TestResult;
      list.push(data);
      cacheMap[d.id] = data;
    });
    list.sort((a, b) => (b.evaluatedAt || '').localeCompare(a.evaluatedAt || ''));
    setLocal(LOCAL_STORAGE_KEY_RESULTS, cacheMap);
    return list;
  } catch (error) {
    console.warn('Fallback to local results:', error);
    const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
    return Object.values(localResults);
  }
}

export function subscribeAllResults(
  onData: (results: TestResult[]) => void,
  onStatus?: (status: FirebaseSyncStatus, errorMsg?: string) => void
): Unsubscribe {
  onStatus?.('connecting');
  return onSnapshot(
    collection(db, 'results'),
    { includeMetadataChanges: true },
    (snap) => {
      const status: FirebaseSyncStatus = snap.metadata.fromCache ? 'cache' : 'live';
      onStatus?.(status);

      const list: TestResult[] = [];
      const cacheMap: Record<string, TestResult> = {};
      snap.forEach((d) => {
        const data = d.data() as TestResult;
        list.push(data);
        cacheMap[d.id] = data;
      });
      list.sort((a, b) => (b.evaluatedAt || '').localeCompare(a.evaluatedAt || ''));
      setLocal(LOCAL_STORAGE_KEY_RESULTS, cacheMap);
      onData(list);
    },
    (error) => {
      console.error('Firestore results subscription error:', error);
      onStatus?.('error', error.message);
      const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
      onData(Object.values(localResults));
    }
  );
}

export async function toggleResultRelease(studentId: string, isReleased: boolean): Promise<void> {
  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  if (localResults[studentId]) {
    localResults[studentId].isReleased = isReleased;
    setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);
  }

  await setDoc(doc(db, 'results', studentId), { isReleased }, { merge: true });
}
