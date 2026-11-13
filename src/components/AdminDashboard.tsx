import React, { useState, useEffect } from 'react';
import { EducationLevel, InstitutionSettings, Student, TestResult, TestSessionState } from '../types';
import {
  FirebaseSyncStatus,
  getAllStudents,
  getAllResults,
  subscribeAllStudents,
  subscribeAllResults,
  subscribeAllTestSessions,
  unlockTestSessionByAdmin,
  updateInstitutionSettings,
  registerStudent,
  deleteStudent,
  toggleResultRelease,
} from '../services/dbService';
import { testConnection } from '../firebase';
import { generateDiagnosticPdf } from '../utils/pdfGenerator';
import {
  Shield,
  Settings,
  Users,
  FileText,
  Download,
  PlusCircle,
  Trash2,
  CheckCircle,
  Clock,
  Save,
  Search,
  School,
  Phone,
  MapPin,
  Calendar,
  Eye,
  LogOut,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  RefreshCw,
  Database,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  institution: InstitutionSettings;
  onUpdateInstitution: (newSettings: InstitutionSettings) => void;
  onLogoutAdmin: () => void;
  onPreviewStudentResult: (result: TestResult) => void;
  onDirectTestStudent: (student: Student) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  institution,
  onUpdateInstitution,
  onLogoutAdmin,
  onPreviewStudentResult,
  onDirectTestStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'monitoring' | 'students' | 'settings'>('results');
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [testSessions, setTestSessions] = useState<TestSessionState[]>([]);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'SD' | 'SMP' | 'SMA'>('ALL');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<FirebaseSyncStatus>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));

  // Institution Settings state
  const [instName, setInstName] = useState(institution.institutionName);
  const [instAddress, setInstAddress] = useState(institution.address);
  const [instPhone, setInstPhone] = useState(institution.phone);
  const [instEmail, setInstEmail] = useState(institution.email || '');
  const [isTestOpen, setIsTestOpen] = useState(institution.isTestOpen);
  const [testScheduleMode, setTestScheduleMode] = useState(institution.testScheduleMode);
  const [testStartDate, setTestStartDate] = useState(institution.testStartDate || '');
  const [testEndDate, setTestEndDate] = useState(institution.testEndDate || '');
  const [resultReleaseMode, setResultReleaseMode] = useState(institution.resultReleaseMode);
  const [resultReleaseDate, setResultReleaseDate] = useState(institution.resultReleaseDate || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Student state for Admin adding student directly
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newLevel, setNewLevel] = useState<EducationLevel>('SMA');
  const [newFullName, setNewFullName] = useState('');
  const [newBirthPlace, setNewBirthPlace] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newSchoolOrigin, setNewSchoolOrigin] = useState('');
  const [newGrade, setNewGrade] = useState('X (Sepuluh)');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addStudentError, setAddStudentError] = useState<string | null>(null);

  // Sync settings inputs if real-time institution doc updates
  useEffect(() => {
    setInstName(institution.institutionName);
    setInstAddress(institution.address);
    setInstPhone(institution.phone);
    setInstEmail(institution.email || '');
    setIsTestOpen(institution.isTestOpen);
    setTestScheduleMode(institution.testScheduleMode);
    setTestStartDate(institution.testStartDate || '');
    setTestEndDate(institution.testEndDate || '');
    setResultReleaseMode(institution.resultReleaseMode);
    setResultReleaseDate(institution.resultReleaseDate || '');
  }, [institution]);

  const loadData = async () => {
    setLoading(true);
    try {
      const ok = await testConnection();
      const [stdList, resList] = await Promise.all([getAllStudents(), getAllResults()]);
      setStudents(stdList);
      setResults(resList);
      setSyncStatus(ok ? 'live' : 'cache');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error('Error loading admin data:', err);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Real-time Firestore listeners for students & results
  useEffect(() => {
    const unsubStudents = subscribeAllStudents(
      (list) => {
        setStudents(list);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    const unsubResults = subscribeAllResults(
      (list) => {
        setResults(list);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    const unsubSessions = subscribeAllTestSessions(
      (list) => {
        setTestSessions(list);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    return () => {
      unsubStudents();
      unsubResults();
      unsubSessions();
    };
  }, []);

  const handleLevelChangeAdmin = (lvl: EducationLevel) => {
    setNewLevel(lvl);
    if (lvl === 'SD') {
      setNewGrade('Kelas 5 SD (Kelas V)');
    } else if (lvl === 'SMP') {
      setNewGrade('7 SMP (Kelas VII)');
    } else {
      setNewGrade('X (Sepuluh)');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessMsg(null);
    try {
      const updated = await updateInstitutionSettings({
        institutionName: instName,
        address: instAddress,
        phone: instPhone,
        email: instEmail,
        isTestOpen,
        testScheduleMode,
        testStartDate,
        testEndDate,
        resultReleaseMode,
        resultReleaseDate,
      });
      onUpdateInstitution(updated);
      setSaveSuccessMsg('Pengaturan lembaga dan sistem tes berhasil disimpan ke Firebase!');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError(null);

    if (!newFullName.trim() || !newSchoolOrigin.trim() || !newUsername.trim() || !newPassword.trim()) {
      setAddStudentError('Nama, Asal Sekolah, Username, dan Password wajib diisi.');
      return;
    }

    try {
      const student = await registerStudent({
        fullName: newFullName.trim(),
        birthPlace: newBirthPlace.trim() || 'Kota',
        birthDate: newBirthDate || '2008-01-01',
        educationLevel: newLevel,
        schoolOrigin: newSchoolOrigin.trim(),
        grade: newGrade,
        studentPhone: newStudentPhone.trim() || '-',
        parentPhone: newParentPhone.trim() || '-',
        username: newUsername.trim().toLowerCase(),
        password: newPassword.trim(),
      });

      setStudents((prev) => [student, ...prev]);
      setIsAddingStudent(false);
      setNewFullName('');
      setNewBirthPlace('');
      setNewBirthDate('');
      setNewSchoolOrigin('');
      setNewStudentPhone('');
      setNewParentPhone('');
      setNewUsername('');
      setNewPassword('');

      alert(
        `Siswa ${student.fullName} (Jenjang ${student.educationLevel}) berhasil ditambahkan!\nUsername: ${student.username}\nPassword: ${student.password}`
      );
    } catch (err) {
      setAddStudentError(err instanceof Error ? err.message : 'Gagal menambahkan siswa.');
    }
  };

  const handleDeleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`Hapus data siswa ${name}? Tindakan ini akan menghapus akun dan hasil tes terkait.`)) {
      return;
    }
    await deleteStudent(studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setResults((prev) => prev.filter((r) => r.studentId !== studentId));
  };

  const handleToggleRelease = async (result: TestResult) => {
    const nextState = !result.isReleased;
    await toggleResultRelease(result.studentId, nextState);
    setResults((prev) =>
      prev.map((r) => (r.studentId === result.studentId ? { ...r, isReleased: nextState } : r))
    );
  };

  const handleDownloadPdf = (res: TestResult) => {
    const doc = generateDiagnosticPdf(res, institution);
    const safeName = (res.fullName || 'Siswa').replace(/\s+/g, '_');
    doc.save(`Laporan_Diagnostik_${res.educationLevel}_${safeName}_${res.regNumber}.pdf`);
  };

  const handleUnlockSession = async (studentId: string, studentName: string) => {
    setUnlockingId(studentId);
    try {
      await unlockTestSessionByAdmin(studentId);
      setUnlockFeedback(`Kunci tes ${studentName} berhasil dibuka! Siswa dapat langsung melanjutkan pengerjaan tes secara real-time.`);
      setTimeout(() => setUnlockFeedback(null), 5000);
    } catch (err) {
      alert('Gagal membuka kunci tes: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUnlockingId(null);
    }
  };

  // Filtered Results
  const filteredResults = results.filter((r) => {
    const matchQuery =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = levelFilter === 'ALL' || (r.educationLevel || 'SMA') === levelFilter;
    return matchQuery && matchLevel;
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.schoolOrigin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = levelFilter === 'ALL' || (s.educationLevel || 'SMA') === levelFilter;
    return matchQuery && matchLevel;
  });

  const lockedSessions = testSessions.filter((s) => s.isLocked);
  const filteredSessions = testSessions.filter((s) => {
    const matchQuery =
      (s.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.regNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.schoolOrigin || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchLevel = levelFilter === 'ALL' || (s.educationLevel || 'SMA') === levelFilter;
    return matchQuery && matchLevel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold mb-1">
              Admin Portal • Autentikasi bajuri39
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">{institution.institutionName}</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Kelola Pengaturan Lembaga, Batas Waktu Tes, Siswa (SD, SMP & SMA), dan Analisis Hasil
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogoutAdmin}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Admin</span>
          </button>
        </div>
      </div>

      {/* Cloud Firestore Status & Live Sync Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  syncStatus === 'live'
                    ? 'bg-emerald-400 animate-pulse'
                    : syncStatus === 'connecting'
                    ? 'bg-sky-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              ></span>
              <span
                className={`text-xs font-bold tracking-wide uppercase ${
                  syncStatus === 'live'
                    ? 'text-emerald-400'
                    : syncStatus === 'connecting'
                    ? 'text-sky-400'
                    : 'text-amber-400'
                }`}
              >
                {syncStatus === 'live'
                  ? 'Terhubung Real-Time ke Firebase Cloud Firestore'
                  : syncStatus === 'connecting'
                  ? 'Menghubungkan ke Firebase Firestore...'
                  : 'Mode Sinkronisasi Cache Lokal (Offline/Tertunda)'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                analisaku-3cc64
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pembaruan {students.length} siswa, {results.length} hasil evaluasi, dan pengaturan lembaga tersinkronisasi otomatis secara real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-slate-400">
            Sinkron: <span className="text-slate-200 font-semibold">{lastSyncTime}</span>
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Locked Sessions Alert Banner */}
      {unlockFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{unlockFeedback}</span>
        </div>
      )}

      {lockedSessions.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-950">
                  Peringatan Pengawasan Real-Time: {lockedSessions.length} Siswa Terkunci (&gt;3x Keluar Halaman Tes)
                </h3>
                <p className="text-xs text-rose-800">
                  Jawaban sementara sudah diamankan ke Firebase. Buka kunci agar siswa dapat melanjutkan tes, atau biarkan untuk tetap menggunakan laporan hasil yang digenerate.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lockedSessions.map((sess) => (
              <div
                key={sess.studentId}
                className="bg-white border border-rose-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{sess.fullName}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                      {sess.educationLevel} • {sess.violationCount}x Keluar
                    </span>
                    {sess.unlockRequested && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] animate-pulse">
                        Meminta Buka Kunci
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    No Reg: <span className="font-mono font-semibold text-slate-700">{sess.regNumber}</span> • Terjawab: <strong className="text-slate-800">{sess.answeredCount}/120</strong>
                  </p>
                  {sess.unlockRequestNote && (
                    <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 italic">
                      &ldquo;{sess.unlockRequestNote}&rdquo;
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleUnlockSession(sess.studentId, sess.fullName)}
                  disabled={unlockingId === sess.studentId}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{unlockingId === sess.studentId ? 'Membuka...' : 'Buka Kunci & Lanjut Tes'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'results'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Analisis & Hasil Siswa ({results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'monitoring'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Pemantauan Sesi ({testSessions.length})</span>
          {lockedSessions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
              {lockedSessions.length} Terkunci
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan Lembaga & Sistem Tes</span>
        </button>
      </div>

      {/* Level Filter Bar */}
      {(activeTab === 'results' || activeTab === 'students' || activeTab === 'monitoring') && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Jenjang:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setLevelFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  levelFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Jenjang
              </button>
              <button
                onClick={() => setLevelFilter('SD')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  levelFilter === 'SD'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                SD / MI
              </button>
              <button
                onClick={() => setLevelFilter('SMP')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  levelFilter === 'SMP'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                SMP / MTs
              </button>
              <button
                onClick={() => setLevelFilter('SMA')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                  levelFilter === 'SMA'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                SMA / MA / SMK
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, asal sekolah, no reg..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden bg-slate-50/50"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: ANALISIS & HASIL SISWA                              */}
      {/* ========================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {filteredResults.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Belum Ada Hasil Ujian</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Setelah siswa menyelesaikan 5 sesi tes dan konfirmasi data, hasil analisis lengkap akan otomatis masuk ke daftar ini.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Jenjang</th>
                      <th className="py-3.5 px-4">Siswa & No Registrasi</th>
                      <th className="py-3.5 px-4">Asal Sekolah & Kelas</th>
                      <th className="py-3.5 px-4">IQ & Kategori</th>
                      <th className="py-3.5 px-4">Dominasi Belajar</th>
                      <th className="py-3.5 px-4">Status Rilis</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResults.map((res) => (
                      <tr key={res.regNumber} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] tracking-wide ${
                              res.educationLevel === 'SD'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : res.educationLevel === 'SMP'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {res.educationLevel || 'SMA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-sm">{res.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-500">{res.regNumber}</p>
                          {res.completionStatus === 'locked_violation' && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold text-[10px]">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Terkunci (&gt;3x Keluar Halaman)</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-800">{res.schoolOrigin}</p>
                          <p className="text-[11px] text-slate-500">{res.grade}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 font-bold">
                            <span className="text-sm">{res.iqScore}</span>
                            <span className="text-[10px] text-blue-700 font-normal">({res.iqCategory})</span>
                          </div>
                          <div className="text-[11px] text-slate-600 font-semibold mt-1">
                            Skor Mentah: <span className="text-blue-800 font-bold">{res.rawScoreSession1to4 ?? 0}</span>/40
                          </div>
                          {res.sessionScores && (
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5" title="Sesi 1: Numerik | Sesi 2: Verbal | Sesi 3: Silogisme | Sesi 4: Spasial">
                              Num:{res.sessionScores.numerik} | Vrb:{res.sessionScores.verbal} | Sil:{res.sessionScores.silogisme} | Spa:{res.sessionScores.spasial}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800">{res.brainAnalysis.primaryLearnerType}</span>
                          <span className="text-[10px] text-slate-500 block">
                            Otak Kiri: {res.psychologyTrends.leftBrainDominance}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleRelease(res)}
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                              res.isReleased
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                            title="Klik untuk mengubah status rilis hasil ke siswa"
                          >
                            {res.isReleased ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Terbit</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Tertahan</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onPreviewStudentResult(res)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Lihat Laporan Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Lihat</span>
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(res)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Unduh PDF Resmi"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">PDF</span>
                            </button>
                            {res.completionStatus === 'locked_violation' && (
                              <button
                                onClick={() => handleUnlockSession(res.studentId, res.fullName)}
                                disabled={unlockingId === res.studentId}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                                title="Buka kunci agar siswa bisa melanjutkan tes dari soal terakhir"
                              >
                                <Unlock className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Buka Kunci</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1B: PEMANTAUAN SESI TES REAL-TIME & BUKA KUNCI         */}
      {/* ========================================================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <Activity className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">Belum Ada Aktivitas Sesi Tes</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Progres jawaban, peringatan keluar halaman (maks. 3x), dan status kunci siswa akan tampil secara real-time di sini saat siswa mengerjakan asesmen.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Jenjang</th>
                      <th className="py-3.5 px-4">Siswa & No Reg</th>
                      <th className="py-3.5 px-4">Progres Soal</th>
                      <th className="py-3.5 px-4">Pelanggaran Fokus</th>
                      <th className="py-3.5 px-4">Status Sesi</th>
                      <th className="py-3.5 px-4 text-right">Kontrol Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSessions.map((sess) => (
                      <tr
                        key={sess.studentId}
                        className={sess.isLocked ? 'bg-rose-50/60 hover:bg-rose-50 transition' : 'hover:bg-slate-50/80 transition'}
                      >
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] tracking-wide ${
                              sess.educationLevel === 'SD'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : sess.educationLevel === 'SMP'
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {sess.educationLevel || 'SMA'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 text-sm">{sess.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {sess.regNumber} • {sess.schoolOrigin}
                          </p>
                          {sess.unlockRequestNote && sess.isLocked && (
                            <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 mt-1 inline-block">
                              Pesan siswa: &ldquo;{sess.unlockRequestNote}&rdquo;
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{sess.answeredCount} / 120 Soal</div>
                          <div className="text-[10px] text-slate-500">
                            Sesi {(sess.currentSessionIndex ?? 0) + 1} • Soal #{sess.currentQuestionId || 1}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              sess.violationCount > 3 || sess.isLocked
                                ? 'bg-rose-100 text-rose-800'
                                : sess.violationCount > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>{sess.violationCount} / 3 Batas</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {sess.isLocked ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                                <Lock className="w-3 h-3" />
                                <span>TERKUNCI</span>
                              </span>
                              {sess.unlockRequested && (
                                <span className="block text-[10px] font-bold text-amber-700">
                                  Menunggu konfirmasi buka kunci
                                </span>
                              )}
                            </div>
                          ) : sess.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle className="w-3 h-3" />
                              <span>Selesai Tes</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                              <Clock className="w-3 h-3" />
                              <span>Sedang Mengerjakan</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {sess.isLocked ? (
                            <button
                              onClick={() => handleUnlockSession(sess.studentId, sess.fullName)}
                              disabled={unlockingId === sess.studentId}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>{unlockingId === sess.studentId ? 'Membuka...' : 'Buka Kunci & Lanjut Tes'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Update {new Date(sess.updatedAt).toLocaleTimeString('id-ID')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAJEMEN SISWA                                     */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Akun Siswa (SD, SMP & SMA)</h2>
              <p className="text-xs text-slate-500">
                Admin dapat mendaftarkan siswa secara langsung agar dapat segera memulai tes
              </p>
            </div>
            <button
              onClick={() => setIsAddingStudent(!isAddingStudent)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{isAddingStudent ? 'Tutup Formulir' : 'Tambah Siswa Baru'}</span>
            </button>
          </div>

          {/* Form Tambah Siswa Baru oleh Admin */}
          {isAddingStudent && (
            <div className="bg-indigo-50/60 rounded-2xl border border-indigo-200 p-6 space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Form Pendaftaran Siswa Langsung oleh Admin</span>
              </h3>

              {addStudentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{addStudentError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
                {/* Level selector */}
                <div className="p-3 bg-white rounded-xl border border-indigo-200">
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                    Pilih Jenjang Siswa *
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="adminNewLevel"
                        checked={newLevel === 'SD'}
                        onChange={() => handleLevelChangeAdmin('SD')}
                        className="text-amber-600"
                      />
                      <span className="font-semibold text-slate-800">SD / MI</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="adminNewLevel"
                        checked={newLevel === 'SMP'}
                        onChange={() => handleLevelChangeAdmin('SMP')}
                        className="text-indigo-600"
                      />
                      <span className="font-semibold text-slate-800">SMP / MTs</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="adminNewLevel"
                        checked={newLevel === 'SMA'}
                        onChange={() => handleLevelChangeAdmin('SMA')}
                        className="text-indigo-600"
                      />
                      <span className="font-semibold text-slate-800">SMA / MA / SMK</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Asal Sekolah *</label>
                    <input
                      type="text"
                      required
                      placeholder={
                        newLevel === 'SD'
                          ? 'Contoh: SDN Menteng 01'
                          : newLevel === 'SMP'
                          ? 'Contoh: SMP Budi Mulia'
                          : 'Contoh: SMAN 1 Jakarta'
                      }
                      value={newSchoolOrigin}
                      onChange={(e) => setNewSchoolOrigin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      placeholder="Kota lahir"
                      value={newBirthPlace}
                      onChange={(e) => setNewBirthPlace(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={newBirthDate}
                      onChange={(e) => setNewBirthDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    >
                      {newLevel === 'SD' ? (
                        <>
                          <option value="Kelas 4 SD (Kelas IV)">Kelas 4 SD (Kelas IV)</option>
                          <option value="Kelas 5 SD (Kelas V)">Kelas 5 SD (Kelas V)</option>
                          <option value="Kelas 6 SD (Kelas VI)">Kelas 6 SD (Kelas VI)</option>
                          <option value="Kelas 1-3 SD">Kelas 1-3 SD</option>
                        </>
                      ) : newLevel === 'SMP' ? (
                        <>
                          <option value="7 SMP (Kelas VII)">7 SMP (Kelas VII)</option>
                          <option value="8 SMP (Kelas VIII)">8 SMP (Kelas VIII)</option>
                          <option value="9 SMP (Kelas IX)">9 SMP (Kelas IX)</option>
                        </>
                      ) : (
                        <>
                          <option value="X (Sepuluh)">Kelas X (Sepuluh)</option>
                          <option value="XI (Sebelas)">Kelas XI (Sebelas)</option>
                          <option value="XII (Dua Belas)">Kelas XII (Dua Belas)</option>
                          <option value="Alumni / Persiapan PTN">Alumni / GAP Year</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP Siswa</label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">No. HP Orang Tua</label>
                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      value={newParentPhone}
                      onChange={(e) => setNewParentPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-indigo-200">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Username Akses Siswa *</label>
                    <input
                      type="text"
                      required
                      placeholder="username siswa (tanpa spasi)"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="text"
                      required
                      placeholder="password akses"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
                  >
                    Simpan & Daftarkan Siswa
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Jenjang</th>
                    <th className="py-3.5 px-4">Nama & No Reg</th>
                    <th className="py-3.5 px-4">Asal Sekolah</th>
                    <th className="py-3.5 px-4">Username & Password</th>
                    <th className="py-3.5 px-4">Kontak Siswa / Ortu</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((std) => (
                    <tr key={std.id || std.username} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md font-bold text-[10px] tracking-wide ${
                            std.educationLevel === 'SD'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : std.educationLevel === 'SMP'
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {std.educationLevel || 'SMA'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{std.fullName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{std.regNumber}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800">{std.schoolOrigin}</p>
                        <p className="text-[11px] text-slate-500">{std.grade}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-semibold text-indigo-700">{std.username}</p>
                        <p className="font-mono text-[11px] text-slate-500">Pass: {std.password}</p>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <p>Siswa: {std.studentPhone || '-'}</p>
                        <p className="text-slate-500">Ortu: {std.parentPhone || '-'}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            std.status === 'evaluated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : std.status === 'locked'
                              ? 'bg-rose-100 text-rose-800'
                              : std.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {std.status === 'locked' && <Lock className="w-3 h-3" />}
                          <span>
                            {std.status === 'evaluated'
                              ? 'Selesai Tes'
                              : std.status === 'locked'
                              ? 'Terkunci (>3x Keluar)'
                              : std.status === 'in_progress'
                              ? 'Sedang Tes'
                              : 'Belum Selesai'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {std.status === 'locked' && (
                            <button
                              onClick={() => handleUnlockSession(std.id || std.username, std.fullName)}
                              disabled={unlockingId === (std.id || std.username)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Buka kunci sesi tes siswa"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Buka Kunci</span>
                            </button>
                          )}
                          <button
                            onClick={() => onDirectTestStudent(std)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition cursor-pointer"
                            title="Masuk sebagai siswa ini untuk langsung tes"
                          >
                            Mulai Tes
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(std.id || std.username, std.fullName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PENGATURAN LEMBAGA & SISTEM TES                    */}
      {/* ========================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Identitas Lembaga */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Identitas Sekolah / Lembaga Penyelenggara</h3>
              <p className="text-xs text-slate-500">
                Data ini akan tampil pada kop surat laporan hasil PDF dan tampilan aplikasi siswa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembaga / Sekolah <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lembaga</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={instAddress}
                    onChange={(e) => setInstAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / Hotline</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                <input
                  type="email"
                  value={instEmail}
                  onChange={(e) => setInstEmail(e.target.value)}
                  placeholder="info@lembaga.sch.id"
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Akses Pelaksanaan Tes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pengaturan Akses Pelaksanaan Tes</h3>
                <p className="text-xs text-slate-500">
                  Atur apakah aplikasi tes dapat langsung digunakan kapan saja atau berbatas waktu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsTestOpen(!isTestOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isTestOpen
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                }`}
              >
                {isTestOpen ? (
                  <>
                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                    <span>Tes Terbuka</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-4 h-4 text-rose-600" />
                    <span>Tes Ditutup Sementara</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setTestScheduleMode('unlimited')}
                  className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${
                    testScheduleMode === 'unlimited'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleMode"
                    checked={testScheduleMode === 'unlimited'}
                    onChange={() => setTestScheduleMode('unlimited')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm">Dapat Langsung Digunakan (Bebas Jadwal)</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Siswa SD, SMP & SMA dapat langsung mengerjakan tes kapan saja tanpa batasan tanggal buka-tutup.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setTestScheduleMode('scheduled')}
                  className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${
                    testScheduleMode === 'scheduled'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="scheduleMode"
                    checked={testScheduleMode === 'scheduled'}
                    onChange={() => setTestScheduleMode('scheduled')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm">Berbatas Waktu (Sesuai Jadwal)</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Tes hanya dibuka dalam rentang tanggal dan jam tertentu yang ditentukan admin.
                    </span>
                  </div>
                </label>
              </div>

              {testScheduleMode === 'scheduled' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal & Waktu Mulai Tes</label>
                    <input
                      type="datetime-local"
                      value={testStartDate}
                      onChange={(e) => setTestStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal & Waktu Selesai Tes</label>
                    <input
                      type="datetime-local"
                      value={testEndDate}
                      onChange={(e) => setTestEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Pengaturan Rilis Hasil */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Pengaturan Rilis Hasil Diagnostik Siswa</h3>
              <p className="text-xs text-slate-500">
                Atur apakah hasil tes siswa langsung keluar seketika atau ditahan hingga berbatas waktu tertentu
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setResultReleaseMode('instant')}
                  className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${
                    resultReleaseMode === 'instant'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="releaseMode"
                    checked={resultReleaseMode === 'instant'}
                    onChange={() => setResultReleaseMode('instant')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm">Langsung Keluar (Instant)</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Hasil & PDF langsung dapat diakses siswa sesaat setelah kirim jawaban.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setResultReleaseMode('scheduled')}
                  className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${
                    resultReleaseMode === 'scheduled'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="releaseMode"
                    checked={resultReleaseMode === 'scheduled'}
                    onChange={() => setResultReleaseMode('scheduled')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm">Berbatas Waktu (Terjadwal)</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Hasil rilis otomatis serentak pada tanggal & jam rilis yang ditentukan.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setResultReleaseMode('manual')}
                  className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition ${
                    resultReleaseMode === 'manual'
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="releaseMode"
                    checked={resultReleaseMode === 'manual'}
                    onChange={() => setResultReleaseMode('manual')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm">Verifikasi Admin (Manual)</span>
                    <span className="font-normal text-slate-500 text-[11px]">
                      Hasil hanya tampil setelah admin menekan tombol rilis per siswa di dashboard.
                    </span>
                  </div>
                </label>
              </div>

              {resultReleaseMode === 'scheduled' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md">
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal & Waktu Pengumuman Hasil</label>
                  <input
                    type="datetime-local"
                    value={resultReleaseDate}
                    onChange={(e) => setResultReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Settings */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan ke Firebase</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
