import React, { useState, useEffect, useMemo } from 'react';
import { InstitutionSettings, Student, TestSubmission } from '../types';
import { getQuestionsForLevel, getSessionsForLevel } from '../data/diagnosticQuestions';
import { FiguralDiagram } from './FiguralDiagram';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertTriangle,
  CheckCircle,
  Grid,
  X,
  FileCheck,
} from 'lucide-react';

interface TestEngineProps {
  student: Student;
  institution: InstitutionSettings;
  onSubmit: (submissionData: Omit<TestSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
  onCancel: () => void;
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

  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataConfirmed, setDataConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentSession = sessionsInfo[currentSessionIndex];

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

  const handleSelectOption = (label: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: label,
    }));
  };

  const handleNext = () => {
    if (currentQuestionId < currentSession.endQuestion) {
      setCurrentQuestionId(currentQuestionId + 1);
    } else if (currentSessionIndex < sessionsInfo.length - 1) {
      const nextSession = sessionsInfo[currentSessionIndex + 1];
      setCurrentSessionIndex(currentSessionIndex + 1);
      setCurrentQuestionId(nextSession.startQuestion);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionId > currentSession.startQuestion) {
      setCurrentQuestionId(currentQuestionId - 1);
    } else if (currentSessionIndex > 0) {
      const prevSession = sessionsInfo[currentSessionIndex - 1];
      setCurrentSessionIndex(currentSessionIndex - 1);
      setCurrentQuestionId(prevSession.endQuestion);
    }
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const answeredInSession = questions.filter(
    (q) => q.session === currentSession.session && answers[q.id]
  ).length;
  const totalInSession = currentSession.endQuestion - currentSession.startQuestion + 1;

  const handleSubmitFinal = async () => {
    if (!dataConfirmed) return;
    setIsSubmitting(true);
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
    } catch (err) {
      alert('Terjadi kendala saat mengirim jawaban: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-24">
      {/* Test Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                S{currentSession.session}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    {currentSession.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Paket {level}
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Peserta: <span className="font-semibold text-slate-700">{student.fullName}</span> ({student.regNumber})
                </p>
              </div>
            </div>

            {/* Timer and Quick stats */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm sm:text-base font-bold transition-colors ${
                  secondsRemaining <= 120
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-slate-50 text-slate-800 border-slate-300'
                }`}
              >
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>

              <button
                onClick={() => setIsPaletteOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Daftar Soal</span>
                <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {answeredCount}/{totalQuestions}
                </span>
              </button>

              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Selesai & Kirim</span>
                <span className="sm:hidden">Kirim</span>
              </button>
            </div>
          </div>

          {/* Session Progress bar */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1.5">
            <span>
              Kemajuan Sesi: {answeredInSession} dari {totalInSession} terjawab
            </span>
            <div className="flex gap-1.5 items-center">
              {sessionsInfo.map((s, idx) => (
                <button
                  key={s.session}
                  onClick={() => {
                    setCurrentSessionIndex(idx);
                    setCurrentQuestionId(s.startQuestion);
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                    idx === currentSessionIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Sesi {s.session}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Workspace */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                Soal Nomor #{currentQuestion.id} dari {totalQuestions}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Tingkat {level}
              </span>
            </div>
            {answers[currentQuestion.id] ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Terjawab (Pilihan {answers[currentQuestion.id]})
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">Belum Dijawab</span>
            )}
          </div>

          {/* Question Content */}
          <div className="space-y-4">
            <div className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed whitespace-pre-line">
              {currentQuestion.text}
            </div>

            {/* Special diagram for figural questions in Session 4 */}
            {currentQuestion.type === 'image' && (
              <div className="my-4">
                <FiguralDiagram questionId={currentQuestion.id} level={level} />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-slate-500 tracking-wider uppercase">Pilihan Jawaban :</p>
            <div className="grid grid-cols-1 gap-2.5">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.label)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 group cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </div>

                    {currentQuestion.type === 'image' ? (
                      <div className="flex items-center gap-3">
                        <FiguralDiagram questionId={currentQuestion.id} optionLabel={opt.label} level={level} />
                        <span className="text-sm font-medium">{opt.text}</span>
                      </div>
                    ) : (
                      <span className="text-sm sm:text-base font-medium flex-1">{opt.text}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Nav Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentQuestionId === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-200 transition cursor-pointer"
            >
              <span>{currentQuestionId === totalQuestions ? 'Review & Selesai' : 'Berikutnya'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Question Grid Drawer */}
      {isPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Palet Soal Tingkat {level} (1 - 120)
                </h3>
                <p className="text-xs text-slate-500">
                  Terjawab: {answeredCount} | Belum: {totalQuestions - answeredCount}
                </p>
              </div>
              <button
                onClick={() => setIsPaletteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {sessionsInfo.map((s, idx) => (
                <div key={s.session} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>{s.name}</span>
                    <span className="text-slate-400">Soal #{s.startQuestion} - #{s.endQuestion}</span>
                  </div>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
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
                          className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            isCurrent
                              ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {q.id}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Pengiriman Jawaban</h3>
                <p className="text-xs text-slate-500">Pastikan seluruh jawaban telah terisi dengan seksama</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Nama Lengkap :</span>
                <span className="font-bold text-slate-900">{student.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Jenjang Ujian :</span>
                <span className="font-bold text-indigo-700">{level} ({student.grade})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Nomor Registrasi :</span>
                <span className="font-mono font-bold text-slate-900">{student.regNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Asal Sekolah :</span>
                <span className="font-semibold text-slate-900">{student.schoolOrigin}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">Total Soal Terjawab :</span>
                <span className="font-bold text-indigo-700">
                  {answeredCount} dari {totalQuestions} Soal
                </span>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Terdapat {totalQuestions - answeredCount} butir yang belum Anda jawab. Anda dapat kembali melengkapi atau tetap mengirimkannya.
                </span>
              </div>
            )}

            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dataConfirmed}
                  onChange={(e) => setDataConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs text-slate-800 leading-snug font-medium select-none">
                  Saya menyatakan dengan sungguh-sungguh dan jujur bahwa seluruh data identitas serta jawaban tes yang saya berikan adalah benar dan sesuai dengan kondisi saya yang sebenarnya.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Cek Kembali Jawaban
              </button>
              <button
                type="button"
                disabled={!dataConfirmed || isSubmitting}
                onClick={handleSubmitFinal}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 transition flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Mengirim Jawaban...' : 'Kirim Jawaban ke Analisa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
