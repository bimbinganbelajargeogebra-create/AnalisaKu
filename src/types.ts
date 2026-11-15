export type EducationLevel = 'SD' | 'SMP' | 'SMA';

export interface Student {
  id?: string;
  regNumber: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  educationLevel: EducationLevel; // 'SD' | 'SMP' | 'SMA'
  schoolOrigin: string;
  grade: string;
  studentPhone: string;
  parentPhone: string;
  username: string;
  password: string;
  status: 'registered' | 'in_progress' | 'locked' | 'submitted' | 'evaluated';
  createdAt: string;
}

export interface TestSessionState {
  studentId: string;
  regNumber: string;
  username: string;
  fullName: string;
  educationLevel: EducationLevel;
  schoolOrigin: string;
  grade: string;
  answers: Record<number, string>;
  answeredCount: number;
  currentQuestionId: number;
  currentSessionIndex: number;
  violationCount: number;
  isLocked: boolean;
  lockedAt?: string;
  lockReason?: string;
  unlockRequested?: boolean;
  unlockRequestNote?: string;
  unlockRequestedAt?: string;
  unlockedByAdmin?: boolean;
  unlockedAt?: string;
  status: 'in_progress' | 'locked' | 'completed';
  updatedAt: string;
}

export interface Question {
  id: number;
  session: number; // 1 to 6
  text: string;
  options: { label: string; text: string }[];
  correctAnswer?: string; // For Sesi 1 - 4
  type?: 'text' | 'image' | 'likert';
  category?: string;
  svgDiagramId?: string;
}

export interface SessionInfo {
  session: number;
  name: string;
  timeLimitMinutes: number;
  description: string;
  startQuestion: number;
  endQuestion: number;
}

export interface TestSubmission {
  id?: string;
  studentId: string;
  regNumber: string;
  username: string;
  fullName: string;
  educationLevel: EducationLevel;
  schoolOrigin: string;
  grade: string;
  answers: Record<number, string>;
  dataConfirmed: boolean;
  submittedAt: string;
  status: 'pending' | 'analyzed';
  completionStatus?: 'completed' | 'locked_violation';
  violationCount?: number;
  terminationReason?: string;
}

export interface MultipleIntelligenceScores {
  logikaMatematika: number;
  bahasa: number;
  intrapersonal: number;
  interpersonal: number;
  kinestetis: number;
  visualRuang: number;
  musikal: number;
  naturalis: number;
}

export interface BrainAnalysis {
  frontalLobe: number;
  parietalLobe: number;
  occipitalLobe: number;
  temporalLobe: number;
  objectiveDriven: number;
  conceptDriven: number;
  primaryLearnerType: 'Tactile' | 'Visual' | 'Auditory';
  decisionOrientation: string;
  determinationTrait: string;
}

export interface FurtherSchoolMajor {
  name: string;
  schoolType: 'SMA' | 'SMK' | 'MA';
  matchScore: number;
  reason: string;
}

export interface FurtherSchoolRecommendation {
  targetType: 'SMA' | 'SMK' | 'SMA / SMK';
  primaryTrack: string;
  specificMajors: FurtherSchoolMajor[];
  smpBridgeNote?: string;
}

export interface PtnRecommendation {
  universityName: string;
  shortName: string;
  location: string;
  focusCluster: string;
  matchedPrograms: string[];
  admissionPathHint: string;
}

export interface PsychologyTrends {
  leftBrainDominance: number;
  rightBrainDominance: number;
  personalityTraits: string[];
  developmentRecommendations: {
    priority1: string;
    priority2: string;
    priority3: string;
  };
  learningModalityDetails: {
    tactileScore: number;
    visualScore: number;
    auditoryScore: number;
    advice: string;
  };
  recommendedSeating: string;
  competitionRecommendation: string;
  highSchoolMajor: {
    stream: string;
    pdsScore: number;
  };
  universityPrograms?: {
    priority1: string[];
    priority2: string[];
    priority3: string[];
  };
  furtherSchoolRecommendations?: FurtherSchoolRecommendation;
  ptnRecommendations?: PtnRecommendation[];
  analyticalInterestSummary?: string;
}

export interface TestResult {
  id?: string;
  studentId: string;
  regNumber: string;
  fullName: string;
  educationLevel: EducationLevel;
  schoolOrigin: string;
  grade: string;
  rawScoreSession1to4: number; // Max 40
  sessionScores?: {
    numerik: number;
    verbal: number;
    silogisme: number;
    spasial: number;
  };
  iqScore: number;
  iqCategory: 'Di bawah rata-rata' | 'Normal Bawah' | 'Normal' | 'Normal Atas' | 'Superior' | 'Di Atas Superior' | 'Jenius';
  iqCategoryRange: string;
  multipleIntelligences: MultipleIntelligenceScores;
  brainAnalysis: BrainAnalysis;
  psychologyTrends: PsychologyTrends;
  isReleased: boolean;
  evaluatedAt: string;
  completionStatus?: 'completed' | 'locked_violation';
  violationCount?: number;
  terminationReason?: string;
}

export interface InstitutionSettings {
  institutionName: string;
  address: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  isTestOpen: boolean;
  testScheduleMode: 'unlimited' | 'scheduled';
  testStartDate?: string;
  testEndDate?: string;
  resultReleaseMode: 'instant' | 'manual' | 'scheduled';
  resultReleaseDate?: string;
  sessionTimeLimits?: Record<number, number>;
  updatedAt: string;
}
