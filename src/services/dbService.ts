import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  InstitutionSettings,
  Student,
  TestResult,
  TestSubmission,
} from '../types';
import { evaluateSubmission } from '../utils/diagnosticEvaluator';

const DEFAULT_SETTINGS: InstitutionSettings = {
  institutionName: 'Lembaga Asesmen & Diagnostik Potensi Siswa',
  address: 'Jl. Pendidikan Karakter No. 108, Kompleks Akademik',
  phone: '(021) 7890-1234 / 0812-9876-5432',
  email: 'info@asesmendiagnostik.sch.id',
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

// Local storage helpers for instantaneous resilience
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

// 1. SETTINGS OPERATIONS
export async function getInstitutionSettings(): Promise<InstitutionSettings> {
  const path = 'settings/institution';
  try {
    const docRef = doc(db, 'settings', 'institution');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as InstitutionSettings;
      setLocal(LOCAL_STORAGE_KEY_SETTINGS, data);
      return data;
    } else {
      // Initialize default
      await setDoc(docRef, DEFAULT_SETTINGS);
      setLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.warn('Using local settings cache due to Firestore read state:', error);
    return getLocal(LOCAL_STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
  }
}

export async function updateInstitutionSettings(settings: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
  const path = 'settings/institution';
  const current = await getInstitutionSettings();
  const updated: InstitutionSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  setLocal(LOCAL_STORAGE_KEY_SETTINGS, updated);

  try {
    await setDoc(doc(db, 'settings', 'institution'), updated, { merge: true });
  } catch (error) {
    console.warn('Saved settings locally, Firestore sync pending:', error);
  }

  return updated;
}

// 2. STUDENT OPERATIONS
export async function registerStudent(studentData: Omit<Student, 'id' | 'regNumber' | 'createdAt' | 'status'>): Promise<Student> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const regNumber = `${dateStr}${randomSuffix}`;

  const newStudent: Student = {
    ...studentData,
    regNumber,
    status: 'registered',
    createdAt: new Date().toISOString(),
  };

  // Local sync
  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
  // Check username uniqueness
  const exists = localStudents.find((s) => s.username.toLowerCase() === newStudent.username.toLowerCase());
  if (exists) {
    throw new Error(`Username '${newStudent.username}' sudah terdaftar. Silakan pilih username lain.`);
  }

  const studentId = `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  newStudent.id = studentId;

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

  // Try Firestore first
  try {
    const q = query(collection(db, 'students'), where('username', '==', normUser));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const match = snap.docs[0].data() as Student;
      if (match.password === normPass) {
        match.id = snap.docs[0].id;
        return match;
      }
    }
  } catch (error) {
    console.warn('Firestore query fallback to local check:', error);
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
    if (list.length > 0) {
      setLocal(LOCAL_STORAGE_KEY_STUDENTS, list);
      return list;
    }
  } catch (error) {
    console.warn('Fallback to local students list:', error);
  }
  return getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []);
}

export async function deleteStudent(studentId: string): Promise<void> {
  // Local remove
  const localStudents = getLocal<Student[]>(LOCAL_STORAGE_KEY_STUDENTS, []).filter((s) => s.id !== studentId);
  setLocal(LOCAL_STORAGE_KEY_STUDENTS, localStudents);

  try {
    await deleteDoc(doc(db, 'students', studentId));
    await deleteDoc(doc(db, 'submissions', studentId));
    await deleteDoc(doc(db, 'results', studentId));
  } catch (err) {
    console.warn('Error deleting document from Firestore:', err);
  }
}

// 3. TEST SUBMISSION & EVALUATION
export async function submitTestAnswers(
  submissionData: Omit<TestSubmission, 'id' | 'submittedAt' | 'status'>
): Promise<{ submission: TestSubmission; result: TestResult }> {
  const submission: TestSubmission = {
    ...submissionData,
    submittedAt: new Date().toISOString(),
    status: 'analyzed',
  };

  const studentId = submission.studentId;

  // Local storage save
  const localSubs = getLocal<Record<string, TestSubmission>>(LOCAL_STORAGE_KEY_SUBMISSIONS, {});
  localSubs[studentId] = submission;
  setLocal(LOCAL_STORAGE_KEY_SUBMISSIONS, localSubs);

  // Evaluate result
  const calculatedResult = evaluateSubmission(submission);

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
    // 'manual' mode: awaits admin release
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

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'submissions', studentId), submission);
    await setDoc(doc(db, 'results', studentId), calculatedResult);
    await updateDoc(doc(db, 'students', studentId), { status: 'evaluated' });
  } catch (error) {
    console.warn('Saved submission locally, Firestore sync pending:', error);
  }

  return { submission, result: calculatedResult };
}

export async function getStudentResult(studentId: string): Promise<TestResult | null> {
  // Check Firestore first
  try {
    const snap = await getDoc(doc(db, 'results', studentId));
    if (snap.exists()) {
      return snap.data() as TestResult;
    }
  } catch (error) {
    console.warn('Fallback checking local test results:', error);
  }

  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  return localResults[studentId] || null;
}

export async function getAllResults(): Promise<TestResult[]> {
  try {
    const snap = await getDocs(collection(db, 'results'));
    const list: TestResult[] = [];
    snap.forEach((d) => {
      list.push(d.data() as TestResult);
    });
    if (list.length > 0) {
      return list;
    }
  } catch (error) {
    console.warn('Fallback to local results:', error);
  }

  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  return Object.values(localResults);
}

export async function toggleResultRelease(studentId: string, isReleased: boolean): Promise<void> {
  const localResults = getLocal<Record<string, TestResult>>(LOCAL_STORAGE_KEY_RESULTS, {});
  if (localResults[studentId]) {
    localResults[studentId].isReleased = isReleased;
    setLocal(LOCAL_STORAGE_KEY_RESULTS, localResults);
  }

  try {
    await updateDoc(doc(db, 'results', studentId), { isReleased });
  } catch (error) {
    console.warn('Toggle release locally saved, Firestore update error:', error);
  }
}
