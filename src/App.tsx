import React, { useState, useEffect } from 'react';
import { InstitutionSettings, Student, TestResult, TestSubmission } from './types';
import {
  getInstitutionSettings,
  getStudentResult,
  submitTestAnswers,
} from './services/dbService';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentRegisterModal } from './components/StudentRegisterModal';
import { StudentLoginModal } from './components/StudentLoginModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { TestEngine } from './components/TestEngine';
import { StudentResultView } from './components/StudentResultView';
import { AdminDashboard } from './components/AdminDashboard';
import { testConnection } from './firebase';

export default function App() {
  const [view, setView] = useState<'landing' | 'test' | 'result' | 'admin'>('landing');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [institution, setInstitution] = useState<InstitutionSettings>({
    institutionName: 'Lembaga Asesmen & Diagnostik Potensi Siswa',
    address: 'Jl. Pendidikan Karakter No. 108, Kompleks Akademik',
    phone: '(021) 7890-1234 / 0812-9876-5432',
    email: 'info@asesmendiagnostik.sch.id',
    isTestOpen: true,
    testScheduleMode: 'unlimited',
    resultReleaseMode: 'instant',
    updatedAt: new Date().toISOString(),
  });

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isStudentLoginOpen, setIsStudentLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      await testConnection();
      try {
        const settings = await getInstitutionSettings();
        setInstitution(settings);
      } catch (err) {
        console.warn('Init settings notice:', err);
      }
    }
    init();
  }, []);

  // Check student result when student changes
  useEffect(() => {
    async function fetchResult() {
      if (currentStudent) {
        try {
          const res = await getStudentResult(currentStudent.id || currentStudent.username);
          setCurrentResult(res);
        } catch (err) {
          console.warn('Error fetching student result:', err);
        }
      } else {
        setCurrentResult(null);
      }
    }
    fetchResult();
  }, [currentStudent]);

  // Handlers
  const handleStudentRegistered = (student: Student) => {
    setCurrentStudent(student);
    setIsAdmin(false);

    // Check if test is open
    if (!institution.isTestOpen) {
      alert('Pendaftaran berhasil! Namun sesi tes saat ini sedang ditutup oleh administrator.');
      setView('landing');
      return;
    }

    // Direct to test
    setView('test');
  };

  const handleStudentLoggedIn = async (student: Student) => {
    setCurrentStudent(student);
    setIsAdmin(false);

    // Fetch existing result
    const res = await getStudentResult(student.id || student.username);
    setCurrentResult(res);

    if (res) {
      // Student already evaluated -> show results
      setView('result');
    } else {
      if (!institution.isTestOpen) {
        alert('Sesi tes saat ini sedang ditutup atau dibatasi oleh administrator.');
        setView('landing');
        return;
      }
      setView('test');
    }
  };

  const handleAdminAuthenticated = () => {
    setIsAdmin(true);
    setCurrentStudent(null);
    setView('admin');
  };

  const handleLogoutStudent = () => {
    setCurrentStudent(null);
    setCurrentResult(null);
    setView('landing');
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setView('landing');
  };

  const handleSubmitTest = async (
    submissionData: Omit<TestSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    const { result } = await submitTestAnswers(submissionData);
    setCurrentResult(result);
    setView('result');
  };

  const handleDirectTestStudent = (student: Student) => {
    setCurrentStudent(student);
    setIsAdmin(false);
    setView('test');
  };

  const handlePreviewStudentResult = (res: TestResult) => {
    setCurrentResult(res);
    setView('result');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Navbar (hidden during active test taking to prevent distraction) */}
      {view !== 'test' && (
        <Navbar
          institution={institution}
          currentStudent={currentStudent}
          isAdmin={isAdmin}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onOpenStudentLogin={() => setIsStudentLoginOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          onLogoutStudent={handleLogoutStudent}
          onLogoutAdmin={handleLogoutAdmin}
          onNavigateHome={() => setView(isAdmin ? 'admin' : 'landing')}
          onNavigateResult={currentResult ? () => setView('result') : undefined}
        />
      )}

      {/* Main Views */}
      <main className="flex-1">
        {view === 'landing' && (
          <LandingPage
            institution={institution}
            currentStudent={currentStudent}
            onStartRegistration={() => setIsRegisterOpen(true)}
            onStartTest={() => {
              if (currentStudent) {
                if (currentResult) {
                  setView('result');
                } else {
                  setView('test');
                }
              } else {
                setIsRegisterOpen(true);
              }
            }}
            onCheckResult={() => {
              if (currentStudent && currentResult) {
                setView('result');
              } else {
                setIsStudentLoginOpen(true);
              }
            }}
            onAdminClick={() => setIsAdminLoginOpen(true)}
          />
        )}

        {view === 'test' && currentStudent && (
          <TestEngine
            student={currentStudent}
            institution={institution}
            onSubmit={handleSubmitTest}
            onCancel={() => setView('landing')}
          />
        )}

        {view === 'result' && (
          <StudentResultView
            result={currentResult}
            institution={institution}
            onBackHome={() => setView(isAdmin ? 'admin' : 'landing')}
            isAdminViewing={isAdmin}
          />
        )}

        {view === 'admin' && isAdmin && (
          <AdminDashboard
            institution={institution}
            onUpdateInstitution={(updated) => setInstitution(updated)}
            onLogoutAdmin={handleLogoutAdmin}
            onPreviewStudentResult={handlePreviewStudentResult}
            onDirectTestStudent={handleDirectTestStudent}
          />
        )}
      </main>

      {/* Modals */}
      <StudentRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={handleStudentRegistered}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsStudentLoginOpen(true);
        }}
      />

      <StudentLoginModal
        isOpen={isStudentLoginOpen}
        onClose={() => setIsStudentLoginOpen(false)}
        onLoggedIn={handleStudentLoggedIn}
        onSwitchToRegister={() => {
          setIsStudentLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onAdminAuthenticated={handleAdminAuthenticated}
      />
    </div>
  );
}
