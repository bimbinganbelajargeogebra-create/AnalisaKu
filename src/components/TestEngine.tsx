import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InstitutionSettings, Student, TestSubmission } from '../types';
import { getQuestionsForLevel, getSessionsForLevel } from '../data/diagnosticQuestions';
import { FiguralDiagram } from './FiguralDiagram';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  Grid,
  X,
  FileCheck,
  CheckCircle2,
  ListTodo,
  Wifi,
  WifiOff,
  HardDrive,
  RotateCcw,
  Sparkles,
  BookOpen,
  Info,
  Type,
} from 'lucide-react';

interface TestEngineProps {
  student: Student;
  institution: InstitutionSettings;
  onSubmit: (submissionData: Omit<TestSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  onCancel: () => void;
}

interface SavedDraft {
  studentId: string;
  regNumber: string;
  level: string;
  answers: Record<number, string>;
  currentQuestionId: number;
  currentSessionIndex: number;
  savedAt: string;
  timeStr: string;
}

export const TestEngine: React.FC<TestEngineProps> = ({
  student,
  institution,
  onSubmit,
  onCancel,
}) => {
  const level = student.educationLevel || 'SMA';
  const questions = useMemo(() => getQuestionsForLevel(level), [level]);
  const sessionsInfo = useMemo(() => getSessionsForLevel(level), [level]);

  // Unique local storage key per student & level
  const studentKey = student.regNumber || student.username || student.id || 'siswa_aktif';
  const STORAGE_KEY = `diagnostic_test_draft_${studentKey}_${level}`;
  const FONT_PREF_KEY = 'diagnostic_preferred_font_size';

  // Check initial draft synchronously
  const initialDraft = useMemo<SavedDraft | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.answers && typeof parsed.answers === 'object') {
          return parsed as SavedDraft;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca draf lokal:', e);
    }
    return null;
  }, [STORAGE_KEY]);

  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(() => {
    if (initialDraft && typeof initialDraft.currentSessionIndex === 'number') {
      const idx = initialDraft.currentSessionIndex;
      if (idx >= 0 && idx < sessionsInfo.length) return idx;
    }
    return 0;
  });

  const [currentQuestionId, setCurrentQuestionId] = useState<number>(() => {
    if (initialDraft && typeof initialDraft.currentQuestionId === 'number') {
      const qId = initialDraft.currentQuestionId;
      if (qId >= 1 && qId <= questions.length) return qId;
    }
    return 1;
  });

  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    return initialDraft?.answers || {};
  });

  // Local storage auto-save state
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    initialDraft?.timeStr || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => {
    return !!(initialDraft && Object.keys(initialDraft.answers).length > 0);
  });

  // Font size control: 'normal' (15px), 'large' (17px), 'xlarge' (20px)
  // Default to 'large' for SD to enhance readability, 'normal' for SMP/SMA
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>(() => {
    const saved = localStorage.getItem(FONT_PREF_KEY);
    if (saved === 'normal' || saved === 'large' || saved === 'xlarge') return saved;
    return level === 'SD' ? 'large' : 'normal';
  });

  // Online / Offline connectivity listener
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // UI state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Connectivity event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save font size preference
  const handleChangeFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSize(size);
    try {
      localStorage.setItem(FONT_PREF_KEY, size);
    } catch {}
  };

  // AUTO-SAVE TO LOCAL STORAGE: continuous real-time save on any answer/navigation change
  useEffect(() => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const draft: SavedDraft = {
          studentId: studentKey,
          regNumber: student.regNumber,
          level,
          answers,
          currentQuestionId,
          currentSessionIndex,
          savedAt: now.toISOString(),
          timeStr,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        setLastSavedTime(timeStr);
      } catch (err) {
        console.warn('Gagal menyimpan otomatis jawaban:', err);
      } finally {
        setIsSaving(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [answers, currentQuestionId, currentSessionIndex, STORAGE_KEY, studentKey, student.regNumber, level]);

  // Current session config
  const currentSession = sessionsInfo[currentSessionIndex] || sessionsInfo[0];

  // Duration in seconds
  const sessionDurationSeconds = (currentSession.timeLimitMinutes || 15) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(sessionDurationSeconds);

  useEffect(() => {
    setSecondsRemaining(sessionDurationSeconds);
  }, [currentSessionIndex, sessionDurationSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSessionIndex]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = useMemo(() => {
    return questions.find((q) => q.id === currentQuestionId) || questions[0];
  }, [questions, currentQuestionId]);

  const handleSelectOption = useCallback((label: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: label,
    }));
  }, [currentQuestionId]);

  const handleNext = useCallback(() => {
    if (currentQuestionId < currentSession.endQuestion) {
      setCurrentQuestionId((prev) => prev + 1);
    } else if (currentSessionIndex < sessionsInfo.length - 1) {
      const nextSession = sessionsInfo[currentSessionIndex + 1];
      setCurrentSessionIndex((prev) => prev + 1);
      setCurrentQuestionId(nextSession.startQuestion);
    } else {
      setShowConfirmModal(true);
    }
  }, [currentQuestionId, currentSession.endQuestion, currentSessionIndex, sessionsInfo]);

  const handlePrev = useCallback(() => {
    if (currentQuestionId > currentSession.startQuestion) {
      setCurrentQuestionId((prev) => prev - 1);
    } else if (currentSessionIndex > 0) {
      const prevSession = sessionsInfo[currentSessionIndex - 1];
      setCurrentSessionIndex((prev) => prev - 1);
      setCurrentQuestionId(prevSession.endQuestion);
    }
  }, [currentQuestionId, currentSession.startQuestion, currentSessionIndex, sessionsInfo]);

  // Keyboard shortcut listener for PC / Laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirmModal || isPaletteOpen) return;

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D', 'E'].includes(key)) {
          const validOpt = currentQuestion.options.find((o) => o.label === key);
          if (validOpt) {
            handleSelectOption(key);
          }
        } else if (['1', '2', '3', '4', '5'].includes(key)) {
          const mapNum: Record<string, string> = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E' };
          const label = mapNum[key];
          const validOpt = currentQuestion.options.find((o) => o.label === label);
          if (validOpt) {
            handleSelectOption(label);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleSelectOption, currentQuestion.options, showConfirmModal, isPaletteOpen]);

  // Progress metrics
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const remainingCount = totalQuestions - answeredCount;
  const totalProgressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  const answeredInSession = questions.filter(
    (q) => q.session === currentSession.session && answers[q.id]
  ).length;
  const totalInSession = currentSession.endQuestion - currentSession.startQuestion + 1;
  const remainingInSession = totalInSession - answeredInSession;
  const sessionProgressPercentage = Math.round((answeredInSession / totalInSession) * 100);

  // SUBMIT HANDLER:
  // 1. Re-persist to localStorage immediately so no answer is lost.
  // 2. Submit to backend / Firestore.
  // 3. ONLY purge localStorage draft when submit succeeds.
  // 4. If submission fails due to network or server, keep draft intact and notify student.
  const handleSubmitFinal = async () => {
    if (!dataConfirmed) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // Final backup to localStorage
    try {
      const now = new Date();
      const finalDraft: SavedDraft = {
        studentId: studentKey,
        regNumber: student.regNumber,
        level,
        answers,
        currentQuestionId,
        currentSessionIndex,
        savedAt: now.toISOString(),
        timeStr: now.toLocaleTimeString('id-ID'),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalDraft));
    } catch (e) {
      console.warn('Backup draft notice:', e);
    }

    try {
      await onSubmit({
        studentId: student.id || student.username,
        regNumber: student.regNumber,
        username: student.username,
        fullName: student.fullName,
        educationLevel: level,
        schoolOrigin: student.schoolOrigin,
        grade: student.grade,
        answers,
        dataConfirmed: true,
      });

      // Purge draft only on verified success
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    } catch (err) {
      console.error('Submission error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setSubmitError(
        `Koneksi server terganggu (${errMsg}). Jangan panik! Seluruh ${answeredCount} jawaban Anda tetap tersimpan AMAN di memori perangkat ini. Silakan periksa jaringan internet dan coba kirim kembali.`
      );
      setIsSubmitting(false);
    }
  };

  // Font size styling helpers
  const questionTextClass =
    fontSize === 'xlarge'
      ? 'text-lg sm:text-xl md:text-2xl leading-relaxed'
      : fontSize === 'large'
      ? 'text-base sm:text-lg md:text-xl leading-relaxed'
      : 'text-sm sm:text-base md:text-lg leading-relaxed';

  const optionTextClass =
    fontSize === 'xlarge'
      ? 'text-base sm:text-lg md:text-xl font-medium'
      : fontSize === 'large'
      ? 'text-sm sm:text-base md:text-lg font-medium'
      : 'text-xs sm:text-sm md:text-base font-medium';

  const optionBadgeClass =
    fontSize === 'xlarge'
      ? 'w-10 h-10 sm:w-11 sm:h-11 text-base'
      : fontSize === 'large'
      ? 'w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base'
      : 'w-8 h-8 sm:w-9 sm:h-9 text-sm';

  return (
    <div className="min-h-screen bg-slate-100/75 pb-36 sm:pb-32 selection:bg-indigo-100 selection:text-indigo-900">
      {/* OFFLINE RESILIENCE BANNER */}
      {!isOnline && (
        <div className="sticky top-0 z-40 bg-linear-to-r from-amber-600 to-orange-600 text-white px-4 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <WifiOff className="w-4 h-4 shrink-0 animate-bounce" />
            <span>
              <strong>Mode Offline:</strong> Jaringan terputus. Tenang! Seluruh jawaban Anda tetap tersimpan otomatis 100% aman di perangkat ini. Lanjutkan menjawab, lalu hubungkan internet saat mengirim.
            </span>
          </div>
        </div>
      )}

      {/* RESTORED DRAFT WELCOME BANNER */}
      {showRestoredNotice && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between">
          <div className="max-w-7xl mx-auto px-2 flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Sesi Dipulihkan Otomatis:</strong> Memuat {answeredCount} jawaban yang tersimpan di perangkat ini (Terakhir disimpan: {lastSavedTime}). Anda dapat langsung melanjutkan pengerjaan!
              </span>
            </div>
            <button
              onClick={() => setShowRestoredNotice(false)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-md hover:bg-emerald-100 cursor-pointer ml-3 shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Test Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
            {/* Left: Session badge, Student info & Level badge */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div
                className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl text-white font-extrabold flex items-center justify-center text-xs sm:text-sm shrink-0 shadow-sm transition-colors ${
                  level === 'SD'
                    ? 'bg-amber-600'
                    : level === 'SMP'
                    ? 'bg-sky-600'
                    : 'bg-indigo-600'
                }`}
              >
                S{currentSession.session}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate">
                    {currentSession.name}
                  </h2>
                  <span
                    className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                      level === 'SD'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : level === 'SMP'
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    }`}
                  >
                    Jenjang {level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 truncate">
                  <span className="font-semibold text-slate-800 truncate">{student.fullName}</span>
                  <span className="hidden xs:inline text-slate-400">•</span>
                  <span className="font-mono text-slate-600 hidden xs:inline">{student.regNumber}</span>
                </div>
              </div>
            </div>

            {/* Right: Auto-save status, Timer, Palette button, and Submit */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* REAL-TIME AUTO-SAVE BADGE */}
              <div
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/90 text-emerald-800 text-[11px] font-semibold"
                title={`Jawaban tersimpan otomatis di penyimpanan lokal browser pada ${lastSavedTime}`}
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping absolute" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                </div>
                <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {isSaving ? 'Menyimpan...' : 'Tersimpan Otomatis'}
                </span>
                <span className="text-[10px] font-mono text-emerald-700/80">({lastSavedTime})</span>
              </div>

              {/* Countdown Timer */}
              <div
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border font-mono text-xs sm:text-sm font-bold transition-colors ${
                  secondsRemaining <= 120
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                }`}
                title="Sisa Waktu Sesi Ini"
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Question Drawer Palette button */}
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer active:scale-95"
                title="Buka Palet Nomor Soal"
              >
                <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                <span className="hidden md:inline">Palet Soal</span>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {answeredCount}/{totalQuestions}
                </span>
              </button>

              {/* Submit Button */}
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Selesai & Kirim</span>
              </button>
            </div>
          </div>

          {/* DUAL RESPONSIVE PROGRESS BAR: Total & Remaining Soal */}
          <div className="py-2 border-t border-slate-100 space-y-1.5">
            {/* Metrics Row */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] sm:text-xs">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-slate-700 hidden xs:inline">Progres Asesmen:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                  <span>{answeredCount}/{totalQuestions} ({totalProgressPercentage}%)</span>
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    remainingCount > 0
                      ? 'text-amber-800 bg-amber-50 border-amber-300'
                      : 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  }`}
                >
                  <ListTodo className="w-3 h-3 text-amber-600" />
                  <span>{remainingCount > 0 ? `${remainingCount} Soal Tersisa` : 'Semua Terjawab!'}</span>
                </span>

                {/* Mobile Auto-Save Indicator */}
                <span className="md:hidden inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Draft Aman ({lastSavedTime})</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] sm:text-[11px]">
                <span className="hidden sm:inline font-semibold">Sesi {currentSession.session}:</span>
                <span className="font-bold text-slate-800">{answeredInSession}/{totalInSession}</span>
                <span className="text-slate-400">({remainingInSession} sisa di sesi ini)</span>
              </div>
            </div>

            {/* Visual Animated Progress Bar */}
            <div className="relative w-full bg-slate-200 h-2.5 sm:h-3 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-linear-to-r from-indigo-600 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-300 relative"
                style={{ width: `${totalProgressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>

            {/* Session tabs quick switch - touch scrollable */}
            <div className="flex items-center justify-between pt-1 overflow-x-auto pb-0.5 -mx-1 px-1">
              <div className="flex gap-1 sm:gap-1.5 items-center shrink-0">
                {sessionsInfo.map((s, idx) => {
                  const sAnswered = questions.filter((q) => q.session === s.session && answers[q.id]).length;
                  const sTotal = s.endQuestion - s.startQuestion + 1;
                  const isCurrent = idx === currentSessionIndex;
                  return (
                    <button
                      key={s.session}
                      onClick={() => {
                        setCurrentSessionIndex(idx);
                        setCurrentQuestionId(s.startQuestion);
                      }}
                      className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 whitespace-nowrap active:scale-95 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : sAnswered === sTotal
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>Sesi {s.session}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          isCurrent ? 'bg-indigo-800 text-white' : 'bg-white/80 text-slate-600'
                        }`}
                      >
                        {sAnswered}/{sTotal}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Helpful Tips */}
              <span className="text-[10px] text-slate-400 hidden lg:inline pl-3">
                Tips: Gunakan tombol keyboard ◄ ► untuk ganti soal, dan angka 1-5 atau A-E untuk memilih jawaban.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Workspace */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6 space-y-3">
        {/* Level Encouragement Card (tailored for SD vs SMP vs SMA) */}
        <div
          className={`px-3.5 py-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            level === 'SD'
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : level === 'SMP'
              ? 'bg-sky-50/90 border-sky-200 text-sky-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              {level === 'SD'
                ? 'Semangat, Sobat Cilik! Baca soal dengan tenang & teliti ya. Tidak perlu terburu-buru.'
                : level === 'SMP'
                ? 'Asesmen Diagnostik SMP/MTs: Teliti setiap pertanyaan dan optimalkan ketepatan pilihanmu.'
                : 'Asesmen Diagnostik SMA/MA/SMK: Kerjakan dengan konsentrasi penuh dan manajemen waktu terbaik.'}
            </span>
          </div>

          {/* Quick Font Size Switcher for Accessibility & Comfort */}
          <div className="flex items-center gap-1 shrink-0 bg-white/80 border border-slate-200/80 rounded-lg p-0.5">
            <span className="text-[10px] font-bold text-slate-500 px-1 hidden sm:inline flex items-center gap-0.5">
              <Type className="w-3 h-3" /> Ukuran Teks:
            </span>
            <button
              type="button"
              onClick={() => handleChangeFontSize('normal')}
              className={`px-1.5 py-0.5 text-[11px] font-bold rounded-md cursor-pointer transition ${
                fontSize === 'normal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Ukuran Standar (SMA)"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => handleChangeFontSize('large')}
              className={`px-1.5 py-0.5 text-xs font-bold rounded-md cursor-pointer transition ${
                fontSize === 'large' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Ukuran Sedang (SMP/SD)"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => handleChangeFontSize('xlarge')}
              className={`px-1.5 py-0.5 text-sm font-bold rounded-md cursor-pointer transition ${
                fontSize === 'xlarge' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Ukuran Ekstra Besar (Ramah Anak SD)"
            >
              A++
            </button>
          </div>
        </div>

        {/* Question Container Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Question Meta Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                Soal #{currentQuestion.id} dari {totalQuestions}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">
                {currentSession.name}
              </span>
            </div>

            {answers[currentQuestion.id] ? (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pilihan Kamu: <strong>{answers[currentQuestion.id]}</strong></span>
              </span>
            ) : (
              <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl font-medium shrink-0">
                Belum Terjawab
              </span>
            )}
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <div className={`font-semibold text-slate-800 whitespace-pre-line ${questionTextClass}`}>
              {currentQuestion.text}
            </div>

            {/* Diagram for figural questions in Session 4 */}
            {currentQuestion.type === 'image' && (
              <div className="my-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
                <div className="text-xs text-slate-500 font-semibold mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  <span>Perhatikan dan cermati susunan gambar berikut:</span>
                </div>
                <FiguralDiagram questionId={currentQuestion.id} level={level} />
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Pilihan Jawaban :</p>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Klik opsi di bawah ini atau tekan tombol keyboard (A, B, C, D, E)
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 sm:gap-4 group cursor-pointer touch-manipulation active:scale-[0.99] ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 ring-3 ring-indigo-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Tactile Option Badge */}
                    <div
                      className={`rounded-xl flex items-center justify-center font-extrabold shrink-0 transition-all ${optionBadgeClass} ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </div>

                    {currentQuestion.type === 'image' ? (
                      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
                        <FiguralDiagram questionId={currentQuestion.id} optionLabel={opt.label} level={level} />
                        <span className={optionTextClass}>{opt.text}</span>
                      </div>
                    ) : (
                      <span className={`flex-1 leading-snug ${optionTextClass}`}>
                        {opt.text}
                      </span>
                    )}

                    {isSelected && (
                      <div className="shrink-0 text-indigo-600">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inline Navigation (PC / Laptop / Tablet) */}
          <div className="pt-4 border-t border-slate-100 hidden sm:flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestionId === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya (◄)</span>
            </button>

            {/* Middle: Save Status indicator */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span>Draft tersimpan otomatis</span>
              <span className="text-slate-400">•</span>
              <span>Sisa: <strong className="text-amber-700">{remainingCount} Soal</strong></span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              <span>{currentQuestionId === totalQuestions ? 'Review & Selesai' : 'Berikutnya (►)'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Small Footer Notice */}
        <div className="text-center text-[11px] text-slate-400 py-2">
          <span>Semua jawaban otomatis tersimpan di perangkat lokal. Tidak perlu takut kehilangan progres saat koneksi terputus.</span>
          <p className="font-semibold text-slate-600 pt-1">@copyright Pak GuruAI</p>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (Mobile HP & Tablet) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2.5 px-3 shadow-xl flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={currentQuestionId === 1}
          className="flex-1 min-h-[48px] py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-30 cursor-pointer active:bg-slate-100 touch-manipulation shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {/* Center: Tap to open drawer + clear remaining questions count */}
        <button
          type="button"
          onClick={() => setIsPaletteOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-center cursor-pointer touch-manipulation active:scale-95 transition"
          title="Buka Palet Soal"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold">
            <Grid className="w-3 h-3 text-slate-500" />
            <span>Palet</span>
          </div>
          <div className="text-xs font-bold font-mono text-amber-700">
            {remainingCount} <span className="text-[10px] font-normal text-slate-600">Sisa</span>
          </div>
        </button>

        <button
          onClick={handleNext}
          className="flex-1 min-h-[48px] py-2.5 rounded-xl bg-indigo-600 active:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-md shadow-indigo-200 cursor-pointer touch-manipulation"
        >
          <span>{currentQuestionId === totalQuestions ? 'Selesai' : 'Berikutnya'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Question Grid Drawer */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Palet Navigasi Soal (Jenjang {level})
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Terjawab: <span className="font-bold text-emerald-700">{answeredCount}</span> | Tersisa: <span className="font-bold text-amber-700">{remainingCount}</span> dari {totalQuestions} Soal
                </p>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Legend */}
            <div className="px-4 sm:px-6 py-2 bg-slate-100 border-b border-slate-200/80 flex items-center justify-between text-[10px] sm:text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
                <span>Sedang Dibuka</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
                <span>Belum Dijawab</span>
              </div>
            </div>

            {/* Questions Grid per Session */}
            <div className="p-4 sm:px-6 py-4 overflow-y-auto space-y-5">
              {sessionsInfo.map((s, idx) => (
                <div key={s.session} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-100 pb-1">
                    <span>{s.name}</span>
                    <span className="text-slate-400 text-[11px]">Soal #{s.startQuestion} - #{s.endQuestion}</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                    {questions.filter((q) => q.session === s.session).map((q) => {
                      const isAnswered = !!answers[q.id];
                      const isCurrent = q.id === currentQuestionId;
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentSessionIndex(idx);
                            setCurrentQuestionId(q.id);
                            setIsPaletteOpen(false);
                          }}
                          className={`h-9 sm:h-10 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer touch-manipulation ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white shadow-sm'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{q.id}</span>
                          {answers[q.id] && !isCurrent && (
                            <span className="text-[9px] font-bold text-emerald-900 leading-none">
                              {answers[q.id]}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Data Truth Integrity Checkbox Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 sm:p-6 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Konfirmasi Pengiriman Jawaban</h3>
                <p className="text-xs text-slate-500">Pastikan seluruh jawaban telah terisi dengan seksama</p>
              </div>
            </div>

            {/* Error Notice if submission failed */}
            {submitError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Kendala Pengiriman:</span>
                </div>
                <p>{submitError}</p>
              </div>
            )}

            {/* Auto-save Security Confirmation */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Perlindungan Jawaban:</strong> Seluruh {answeredCount} jawaban Anda telah tercatat aman di penyimpanan lokal perangkat (Local Storage).
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Nama Lengkap :</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{student.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jenjang Asesmen :</span>
                <span className="font-bold text-indigo-700">{level} ({student.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Nomor Registrasi :</span>
                <span className="font-mono font-bold text-slate-900">{student.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Asal Sekolah :</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{student.schoolOrigin}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Soal Terjawab :</span>
                <span className="font-bold text-emerald-700">
                  {answeredCount} dari {totalQuestions} Soal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Soal Belum Terjawab :</span>
                <span className={`font-bold ${remainingCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                  {remainingCount} Soal Tersisa
                </span>
              </div>
            </div>

            {remainingCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Terdapat {remainingCount} butir soal yang belum Anda jawab. Anda dapat kembali melengkapi atau tetap mengirimkannya.
                </span>
              </div>
            )}

            {/* Mandatory Checkbox */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataConfirmed}
                  onChange={(e) => setDataConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-md text-indigo-600 focus:ring-indigo-500 border-slate-300 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-800 leading-snug font-medium select-none">
                  Saya menyatakan dengan sungguh-sungguh dan jujur bahwa seluruh data identitas serta jawaban tes yang saya berikan adalah benar dan sesuai dengan kondisi saya yang sebenarnya.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSubmitError(null);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cek Kembali
              </button>
              <button
                type="button"
                disabled={!dataConfirmed || isSubmitting}
                onClick={handleSubmitFinal}
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition flex items-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isSubmitting ? 'Mengirim...' : submitError ? 'Coba Kirim Ulang' : 'Kirim Jawaban'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
