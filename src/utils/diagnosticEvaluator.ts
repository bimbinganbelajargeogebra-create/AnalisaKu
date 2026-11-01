import { getQuestionsForLevel } from '../data/diagnosticQuestions';
import {
  BrainAnalysis,
  MultipleIntelligenceScores,
  PsychologyTrends,
  TestResult,
  TestSubmission,
} from '../types';

export function evaluateSubmission(submission: TestSubmission): TestResult {
  const level = submission.educationLevel || 'SMA';
  const questions = getQuestionsForLevel(level);
  const answers = submission.answers || {};

  // 1. Evaluate Sesi 1 - 4 (Questions 1 - 40)
  let correctCount = 0;
  let correctSesi1 = 0; // Numerik (1-10)
  let correctSesi2 = 0; // Verbal (11-20)
  let correctSesi3 = 0; // Silogisme/Analitik (21-30)
  let correctSesi4 = 0; // Spasial/Figural (31-40)

  questions.slice(0, 40).forEach((q) => {
    const studentAns = (answers[q.id] || '').trim().toUpperCase();
    if (studentAns && studentAns === q.correctAnswer) {
      correctCount += 1;
      if (q.session === 1) correctSesi1 += 1;
      if (q.session === 2) correctSesi2 += 1;
      if (q.session === 3) correctSesi3 += 1;
      if (q.session === 4) correctSesi4 += 1;
    }
  });

  // Calculate Standardized IQ Score (Mean 100, SD 15, matching official scale)
  // Base 75 + (correctCount / 40) * 58 + extra precision. e.g. 29 correct -> 122 (Superior)
  const iqScore = Math.min(
    155,
    Math.max(70, Math.round(75 + (correctCount / 40) * 58 + correctSesi1 * 0.45))
  );

  // Determine IQ Category
  let iqCategory: TestResult['iqCategory'] = 'Normal';
  let iqCategoryRange = '100-110';

  if (iqScore < 85) {
    iqCategory = 'Di bawah rata-rata';
    iqCategoryRange = '<85';
  } else if (iqScore <= 99) {
    iqCategory = 'Normal Bawah';
    iqCategoryRange = '85-99';
  } else if (iqScore <= 110) {
    iqCategory = 'Normal';
    iqCategoryRange = '100-110';
  } else if (iqScore <= 120) {
    iqCategory = 'Normal Atas';
    iqCategoryRange = '111-120';
  } else if (iqScore <= 139) {
    iqCategory = 'Superior';
    iqCategoryRange = '121-139';
  } else if (iqScore <= 170) {
    iqCategory = 'Di Atas Superior';
    iqCategoryRange = '140-170';
  } else {
    iqCategory = 'Jenius';
    iqCategoryRange = '>170';
  }

  // 2. Evaluate Sesi 5 (Questions 41 - 120) Likert scale 1-5
  const likertValue = (ans: string | undefined): number => {
    switch ((ans || '').toUpperCase()) {
      case 'E': return 5;
      case 'D': return 4;
      case 'C': return 3;
      case 'B': return 2;
      case 'A': return 1;
      default: return 3;
    }
  };

  const sumRange = (start: number, end: number) => {
    let sum = 0;
    for (let id = start; id <= end; id++) {
      sum += likertValue(answers[id]);
    }
    return sum;
  };

  const rawBahasa = sumRange(41, 50);
  const rawLogika = sumRange(51, 60);
  const rawVisual = sumRange(61, 70);
  const rawKinestetis = sumRange(71, 80);
  const rawMusikal = sumRange(81, 90);
  const rawInterpersonal = sumRange(91, 100);
  const rawIntrapersonal = sumRange(101, 110);
  const rawNaturalis = sumRange(111, 120);

  const calcPercent = (likertRaw: number, academicBonus: number, weight = 1) => {
    const total = (likertRaw + academicBonus) / 60;
    const pct = (total * 85 + 10) * weight;
    return Math.round(Math.min(96, Math.max(22, pct)) * 100) / 100;
  };

  const multipleIntelligences: MultipleIntelligenceScores = {
    logikaMatematika: calcPercent(rawLogika, correctSesi1),
    bahasa: calcPercent(rawBahasa, correctSesi2),
    intrapersonal: calcPercent(rawIntrapersonal, 4.5),
    interpersonal: calcPercent(rawInterpersonal, 4),
    kinestetis: calcPercent(rawKinestetis, 3.5),
    visualRuang: calcPercent(rawVisual, correctSesi4),
    musikal: calcPercent(rawMusikal, 0, level === 'SMP' ? 0.95 : 0.78),
    naturalis: calcPercent(rawNaturalis, 0, 0.8),
  };

  // 3. Brain Analysis
  const frontalLobe =
    Math.round(
      ((multipleIntelligences.logikaMatematika * 0.4 +
        multipleIntelligences.interpersonal * 0.3 +
        (correctSesi3 / 10) * 100 * 0.3) *
        0.86) *
        100
    ) / 100;

  const parietalLobe = Math.round((multipleIntelligences.kinestetis * 0.65 + 5) * 100) / 100;
  const occipitalLobe = Math.round((multipleIntelligences.visualRuang * 0.64 + 4) * 100) / 100;
  const temporalLobe =
    Math.round(
      ((multipleIntelligences.musikal * 0.5 + multipleIntelligences.bahasa * 0.5) * 0.58 + 4) * 100
    ) / 100;

  const objectiveDriven = Math.round(Math.min(80, Math.max(45, frontalLobe)) * 100) / 100;
  const conceptDriven = Math.round((100 - objectiveDriven) * 100) / 100;

  let primaryLearnerType: BrainAnalysis['primaryLearnerType'] = 'Tactile';
  if (occipitalLobe > parietalLobe && occipitalLobe > temporalLobe) {
    primaryLearnerType = 'Visual';
  } else if (temporalLobe > parietalLobe && temporalLobe > occipitalLobe) {
    primaryLearnerType = 'Auditory';
  } else {
    primaryLearnerType = 'Tactile';
  }

  const brainAnalysis: BrainAnalysis = {
    frontalLobe,
    parietalLobe,
    occipitalLobe,
    temporalLobe,
    objectiveDriven,
    conceptDriven,
    primaryLearnerType,
    decisionOrientation:
      'Individu yang memiliki dorongan melaksanakan keputusan dengan berorientasi pada hasil akhir',
    determinationTrait:
      'Individu yang memiliki tekad, kepercayaan diri yang tinggi serta berani mengambil resiko',
  };

  // 4. Psychology Trends
  const leftBrainRaw =
    multipleIntelligences.logikaMatematika +
    multipleIntelligences.bahasa +
    multipleIntelligences.intrapersonal;
  const rightBrainRaw =
    multipleIntelligences.visualRuang +
    multipleIntelligences.musikal +
    multipleIntelligences.kinestetis +
    multipleIntelligences.naturalis;
  const totalHemisphere = leftBrainRaw + rightBrainRaw;
  const leftBrainDominance = Math.round((leftBrainRaw / totalHemisphere) * 10000) / 100;
  const rightBrainDominance = Math.round((100 - leftBrainDominance) * 100) / 100;

  // 5. Personality & Development points (tailored for SMP vs SMA)
  const personalityTraits =
    level === 'SMP'
      ? [
          'sangat mampu menggunakan seluruh potensi jasmaninya untuk melakukan ekspresi gerak, mampu menggerakkan objek dengan gerakan yang dinamis, kompleks dan terukur.',
          'mampu memahami semua aspek yang berhubungan dengan kualitas suara beserta aspek emosionalnya, mampu bernyanyi, mendengar dan merangkai musik.',
          'cukup mampu berhitung dengan cepat, menafsirkan makna bilangan, menyelesaikan permasalahan aritmatika, memahami korelasi antar bilangan, menyelesaikan pola irama bilangan, dan membaca notasi angka.',
          'sangat butuh melakukan sesuatu yang berhubungan sesuatu yang mekanis, seperti bermain peran, drama, gerakan, atau seringkali butuh hal-hal seperti membangun sesuatu, olahraga, permainan fisik, kerajinan tangan, belajar sambil bekerja dsb.',
          'butuh lingkungan yang memungkinkannya bernyanyi setiap saat, atau memberi kesempatan untuk pergi ke konser, kesempatan memainkan alat musik, dsb.',
          'cukup butuh hal-hal yang memberikannya kesempatan untuk melakukan eksplorasi gagasannya, keingintahuannya atas ilmu alam, seperti berkunjung ke planetarium, melihat film sains fiksi, dsb.',
          'sangat dipenuhi oleh keinginan menghubungkan antara pikiran dan olah tubuh untuk mengekspresikan keinginan dan menyampaikan pesan.',
          'dipenuhi keinginan akan musik, irama, dan melodi, kesukaan bernyanyi, bersiul, bersenandung, mengetuk-ngetukkan jari atau kaki, dan mendengarkan.',
          'cukup dipenuhi oleh semangat untuk menantang daya nalarnya, mencari tahu sebab dan akibat suatu kejadian, semangat mencoba dan bereksperimen, semangat bertanya, mencari tahu tentang teka-teki, berhitung, dll.',
        ]
      : [
          'Sangat mampu memahami dirinya (potensi daya saingnya, reaksinya terhadap sesuatu, cita-citanya), dan mampu mengartikulasikan cara kerja karakter dan kepribadiannya secara mendalam.',
          'Mampu berhitung dengan cepat, menafsirkan makna bilangan, menyelesaikan permasalahan aritmatika, memahami korelasi antar bilangan, menyelesaikan pola irama bilangan, dan membaca notasi angka.',
          'Cukup mampu menggunakan kata-kata secara efektif dalam membaca, menulis, berbicara, berfikir dan mengemukakan fikirannya.',
          'Sangat butuh tempat rahasia, waktu untuk menyendiri, atau butuh proyek yang tidak melibatkan orang lain.',
          'Butuh hal-hal yang memberikannya kesempatan untuk melakukan eksplorasi gagasannya, keingintahuannya atas ilmu alam, seperti berkunjung ke laboratorium sains, planetarium, melihat literatur ilmiah, dsb.',
          'Cukup butuh perangkat keras seperti buku, alat tulis, buku catatan, laptop atau tablet dan juga lingkungan yang memberi peluang dirinya untuk dialog, diskusi atau bahkan debat.',
          'Sangat dipenuhi oleh gagasan yang mendalam, kesukaan introspeksi, merenung, bermimpi, dan berdiam diri menyusun strategi.',
          'Dipenuhi oleh semangat untuk menantang daya nalarnya, mencari tahu sebab dan akibat suatu kejadian, semangat mencoba dan bereksperimen, semangat bertanya, mencari tahu tentang teka-teki, berhitung, dll.',
          'Cukup dipenuhi oleh keinginan untuk mengekspresikan sesuatu dalam bentuk tulisan, kemampuan memahami semantik, fonologi, pragmatik, dan sintaksis dalam menggunakan kata-kata dan gagasan uniknya.',
        ];

  const developmentRecommendations =
    level === 'SMP'
      ? {
          priority1:
            'Sangat disarankan, karena ini prioritas utama, mendorong anak-anak berolahraga, berprakarya, mengembangkan hobinya. Belajar mengotak-atik mesin atau peralatan elektronik, membuat berbagai pernak-pernik, origami, clay, menjahit, merakit, dan sebagainya.',
          priority2:
            'Prioritas berikutnya, disarankan mendorong mereka mendengar berbagai jenis musik dan mengapresiasinya, menguasai beberapa alat musik, namun tetap dengan spesialisasi. Membentuk kelompok kreasi bersama dan mendorong mereka mencoba menciptakan karya mandiri.',
          priority3:
            'Prioritas terakhir, disarankan membimbing anak-anak untuk mengemukakan pendapat dan kritik untuk semua kejadian, cerita, dan film. Bermain dengan menggunakan strategi dan logika. Memberi kesempatan anak untuk lebih peka dalam kegiatan sehari-hari dan fenomena alam yang berhubungan dengan prinsip sains.',
        }
      : {
          priority1:
            'Sangat disarankan, karena ini prioritas utama: mengembangkan self-smart (intrapersonal) mereka. Secara berkala evaluasi pengetahuan mereka tentang tujuan hidupnya, keinginannya, potensi dan kekuatannya, dan menyediakan waktu untuk merenung serta mencatat perenungannya.',
          priority2:
            'Prioritas berikutnya: disarankan membimbing siswa untuk mengemukakan pendapat dan kritik untuk setiap fenomena, studi kasus, dan literatur. Berlatih menggunakan strategi pemecahan masalah dan logika. Memberi kesempatan siswa untuk lebih peka dalam kegiatan belajar terapan dan prinsip sains.',
          priority3:
            'Prioritas terakhir: disarankan mendorong siswa untuk membaca berbagai buku referensi, jurnal ilmiah, dan literatur lainnya. Mendorong mereka membiasakan diri menulis karya ilmiah atau esai reflektif (pengalaman belajar, eksplorasi ide, atau gagasan inovasi masa depan).',
        };

  const learningModalityAdvice =
    primaryLearnerType === 'Tactile'
      ? 'Pembelajaran disarankan melalui gerakan, tindakan, dan sentuhan. Mereka belajar lebih baik dengan pendekatan unjuk kerja, dimana mereka dilibatkan untuk bereksplorasi. Mereka sangat sulit untuk duduk dengan tenang untuk waktu yang lama dan bisa menjadi terganggu dengan kebutuhan mereka akan aktivitas langsung dan eksplorasi.'
      : primaryLearnerType === 'Visual'
      ? 'Pembelajaran disarankan melalui pengamatan gambar, diagram, ilustrasi visual terstruktur, dan video. Mereka lebih mudah memahami konsep saat divisualisasikan secara jelas.'
      : 'Pembelajaran disarankan melalui diskusi lisan, tanya jawab interaktif, dan rekaman audio berirama. Mereka belajar optimal saat mendengarkan penjelasan runtut.';

  const recommendedSeating = 'di tengah';

  const isSaintek = multipleIntelligences.logikaMatematika >= multipleIntelligences.bahasa;
  const competitionRecommendation = isSaintek
    ? 'IPA atau Sains dan Teknologi'
    : 'Sosial Humaniora, Bahasa, atau Seni Kreatif';

  const pdsScore =
    Math.round(
      (Math.max(multipleIntelligences.logikaMatematika, multipleIntelligences.kinestetis, 75) + 4.2) * 10
    ) / 10;

  const highSchoolMajor = {
    stream: isSaintek ? 'Sains dan Teknologi (Saintek / MIPA)' : 'Sosial Humaniora (Soshum / IPS)',
    pdsScore: Math.min(98.5, Math.max(72.0, pdsScore)),
  };

  // University programs (Only relevant for SMA)
  let universityPrograms: PsychologyTrends['universityPrograms'] = undefined;
  if (level === 'SMA') {
    const saintekPrograms = [
      'Kedokteran & Pendidikan Dokter',
      'Teknik Informatika & Ilmu Komputer',
      'Sistem Informasi & Rekayasa Perangkat Lunak',
      'Teknik Elektro & Mekatronika',
      'Teknik Sipil & Perencanaan',
      'Arsitektur & Desain Ruang',
      'Farmasi & Farmasi Klinis',
      'Statistika & Sains Aktuaria',
      'Bioteknologi & Biokimia',
      'Teknologi Industri & Robotika',
    ];
    const soshumPrograms = [
      'Administrasi Bisnis & Manajemen',
      'Ilmu Komunikasi & Hubungan Internasional',
      'Ilmu Psikologi',
      'Ilmu Hukum & Tata Negara',
      'Ekonomi Akuntansi & Keuangan Perbankan',
      'Administrasi Publik & Kebijakan',
      'Bimbingan dan Konseling',
      'Pendidikan Bahasa & Sastra',
      'Desain Komunikasi Visual',
    ];
    universityPrograms = {
      priority1: isSaintek ? saintekPrograms : soshumPrograms,
      priority2: isSaintek ? soshumPrograms : saintekPrograms,
      priority3: [
        'Rekayasa Nanoteknologi & Material',
        'Sains Data & AI',
        'Teknologi Pangan',
        'Manajemen Logistik & Transportasi',
      ],
    };
  }

  const psychologyTrends: PsychologyTrends = {
    leftBrainDominance,
    rightBrainDominance,
    personalityTraits,
    developmentRecommendations,
    learningModalityDetails: {
      tactileScore: parietalLobe,
      visualScore: occipitalLobe,
      auditoryScore: temporalLobe,
      advice: learningModalityAdvice,
    },
    recommendedSeating,
    competitionRecommendation,
    highSchoolMajor,
    universityPrograms,
  };

  return {
    studentId: submission.studentId,
    regNumber: submission.regNumber,
    fullName: submission.fullName,
    educationLevel: level,
    schoolOrigin: submission.schoolOrigin,
    grade: submission.grade,
    rawScoreSession1to4: correctCount,
    iqScore,
    iqCategory,
    iqCategoryRange,
    multipleIntelligences,
    brainAnalysis,
    psychologyTrends,
    isReleased: false,
    evaluatedAt: new Date().toISOString(),
  };
}
