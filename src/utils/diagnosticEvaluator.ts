import { getQuestionsForLevel } from '../data/diagnosticQuestions';
import {
  BrainAnalysis,
  EducationLevel,
  FurtherSchoolMajor,
  FurtherSchoolRecommendation,
  MultipleIntelligenceScores,
  PsychologyTrends,
  PtnRecommendation,
  TestResult,
  TestSubmission,
} from '../types';

type ClusterKey = 'techEng' | 'medBio' | 'soshumBiz' | 'artsComm';

interface ClusterScores {
  techEng: number;
  medBio: number;
  soshumBiz: number;
  artsComm: number;
  vocationalBias: number; // positive leans SMK / D4 Terapan, lower leans SMA / S1 Akademik
  regionPref: 'A' | 'B' | 'C' | 'D';
}

function computeClusterScores(
  level: EducationLevel,
  mi: MultipleIntelligenceScores,
  sessionScores: { numerik: number; verbal: number; silogisme: number; spasial: number },
  answers: Record<number, string>,
  schoolOrigin = '',
  grade = ''
): ClusterScores {
  let countA = 0;
  let countB = 0;
  let countC = 0;
  let countD = 0;

  for (let id = 121; id <= 130; id++) {
    const ans = (answers[id] || '').trim().toUpperCase();
    if (ans === 'A') countA += 1;
    else if (ans === 'B') countB += 1;
    else if (ans === 'C') countC += 1;
    else if (ans === 'D') countD += 1;
  }

  // Combine Sesi 6 analytical picks + Sesi 5 MI + Sesi 1-4 objective cognitive scores
  const techEng =
    countA * 9.5 +
    mi.logikaMatematika * 0.45 +
    mi.visualRuang * 0.25 +
    sessionScores.numerik * 1.6 +
    sessionScores.spasial * 1.1;

  const medBio =
    countB * 9.5 +
    mi.naturalis * 0.45 +
    mi.logikaMatematika * 0.25 +
    mi.intrapersonal * 0.15 +
    sessionScores.silogisme * 1.4;

  const soshumBiz =
    countC * 9.5 +
    mi.bahasa * 0.35 +
    mi.interpersonal * 0.35 +
    mi.intrapersonal * 0.2 +
    sessionScores.verbal * 1.6;

  const artsComm =
    countD * 9.5 +
    mi.visualRuang * 0.32 +
    mi.musikal * 0.22 +
    mi.kinestetis * 0.22 +
    mi.bahasa * 0.18 +
    sessionScores.spasial * 1.1;

  // Determine Vocational / Applied vs Academic bias
  let vocationalBias = (mi.kinestetis - mi.logikaMatematika * 0.65) * 0.4;
  if (level === 'SD') {
    if ((answers[125] || '').toUpperCase() === 'B') vocationalBias += 12;
    if ((answers[130] || '').toUpperCase() === 'D') vocationalBias += 22;
    if ((answers[130] || '').toUpperCase() === 'A') vocationalBias -= 12;
  } else if (level === 'SMP') {
    if ((answers[121] || '').toUpperCase() === 'D') vocationalBias += 22;
    if ((answers[125] || '').toUpperCase() === 'D') vocationalBias += 15;
    if ((answers[126] || '').toUpperCase() === 'D') vocationalBias += 18;
    if ((answers[127] || '').toUpperCase() === 'D') vocationalBias += 18;
    if ((answers[121] || '').toUpperCase() === 'A') vocationalBias -= 14;
    if ((answers[126] || '').toUpperCase() === 'A') vocationalBias -= 12;
  } else {
    if ((answers[123] || '').toUpperCase() === 'D') vocationalBias += 16;
    if ((answers[124] || '').toUpperCase() === 'D') vocationalBias += 20;
    if ((answers[126] || '').toUpperCase() === 'D') vocationalBias += 16;
    if (/smk/i.test(schoolOrigin) || /smk/i.test(grade)) vocationalBias += 14;
  }

  const rawReg = (answers[127] || 'D').trim().toUpperCase();
  const regionPref: 'A' | 'B' | 'C' | 'D' =
    rawReg === 'A' || rawReg === 'B' || rawReg === 'C' ? rawReg : 'D';

  return { techEng, medBio, soshumBiz, artsComm, vocationalBias, regionPref };
}

function rankClusters(scores: ClusterScores): ClusterKey[] {
  const pairs: { key: ClusterKey; val: number }[] = [
    { key: 'techEng', val: scores.techEng },
    { key: 'medBio', val: scores.medBio },
    { key: 'soshumBiz', val: scores.soshumBiz },
    { key: 'artsComm', val: scores.artsComm },
  ];
  pairs.sort((a, b) => b.val - a.val);
  return pairs.map((p) => p.key);
}

function buildFurtherSchoolRecommendation(
  level: EducationLevel,
  ranked: ClusterKey[],
  scores: ClusterScores,
  iqScore: number,
  pdsScore: number
): FurtherSchoolRecommendation {
  const primary = ranked[0];
  const secondary = ranked[1];
  const isVocationalStrong = scores.vocationalBias >= 16;
  const isAcademicStrong = scores.vocationalBias <= -6;

  const targetType: FurtherSchoolRecommendation['targetType'] = isVocationalStrong
    ? 'SMK'
    : isAcademicStrong
    ? 'SMA'
    : 'SMA / SMK';

  const baseMatch = Math.min(97.5, Math.max(82.0, Math.round((pdsScore * 0.55 + iqScore * 0.35) * 10) / 10));

  const majorCatalog: Record<ClusterKey, FurtherSchoolMajor[]> = {
    techEng: [
      {
        name: 'SMA Peminatan MIPA Lanjut (Matematika, Fisika & Informatika)',
        schoolType: 'SMA',
        matchScore: isVocationalStrong ? baseMatch - 2.5 : baseMatch,
        reason: 'Kuat pada logika matematika, penalaran spasial, dan minat pemodelan sains/rekayasa sebagai jalur utama menuju FT/STEI PTN.',
      },
      {
        name: 'SMK Jurusan Rekayasa Perangkat Lunak (RPL / PPLG)',
        schoolType: 'SMK',
        matchScore: isVocationalStrong ? baseMatch : baseMatch - 1.8,
        reason: 'Cocok untuk membangun keahlian praktis pemrograman, pengembangan aplikasi/gim, dan portofolio IT siap kuliah maupun kerja.',
      },
      {
        name: 'SMK Jurusan Teknik Jaringan Komputer & Telekomunikasi (TJKT)',
        schoolType: 'SMK',
        matchScore: baseMatch - 3.4,
        reason: 'Memadukan ketelitian logis dan eksplorasi perangkat keras jaringan, server, serta infrastruktur teknologi.',
      },
      {
        name: 'SMK Jurusan Teknik Elektronika / Mekatronika & Robotika',
        schoolType: 'SMK',
        matchScore: baseMatch - 4.8,
        reason: 'Ideal bagi pembelajar kinestetis-logis yang gemar merakit sensor, kendali otomatis, dan sistem rekayasa.',
      },
    ],
    medBio: [
      {
        name: 'SMA Peminatan MIPA (Fokus Biologi, Kimia & Riset Sains Hayati)',
        schoolType: 'SMA',
        matchScore: isVocationalStrong ? baseMatch - 2.1 : baseMatch,
        reason: 'Menyiapkan fondasi akademik terkuat untuk seleksi SNBP/SNBT menuju Kedokteran, Farmasi, Kedokteran Gigi, dan Bioteknologi.',
      },
      {
        name: 'SMK Jurusan Farmasi Klinis & Komunitas',
        schoolType: 'SMK',
        matchScore: isVocationalStrong ? baseMatch : baseMatch - 2.0,
        reason: 'Memberikan praktik langsung formulasi obat, kimia terapan, serta pelayanan kefarmasian sejak bangku sekolah menengah.',
      },
      {
        name: 'SMK Jurusan Layanan Penunjang Keperawatan & Caregiving',
        schoolType: 'SMK',
        matchScore: baseMatch - 3.6,
        reason: 'Selaras dengan kepedulian sosial, kecerdasan naturalis, dan ketekunan dalam bidang pelayanan kesehatan.',
      },
      {
        name: 'MA / SMA Plus Program Riset Sains Alam & Kesehatan Lingkungan',
        schoolType: 'MA',
        matchScore: baseMatch - 4.9,
        reason: 'Mendukung pengembangan karya ilmiah remaja (KIR) di bidang biologi, ekologi, dan ketahanan hayati.',
      },
    ],
    soshumBiz: [
      {
        name: 'SMA Peminatan IPS (Ekonomi, Sosiologi, Geografi & Antropologi)',
        schoolType: 'SMA',
        matchScore: isVocationalStrong ? baseMatch - 2.2 : baseMatch,
        reason: 'Jalur optimal untuk mengasah analisis ekonomi makro, tata hukum, manajemen, dan komunikasi menuju PTN rumpun Soshum.',
      },
      {
        name: 'SMK Jurusan Akuntansi & Keuangan Lembaga (AKL)',
        schoolType: 'SMK',
        matchScore: isVocationalStrong ? baseMatch : baseMatch - 1.9,
        reason: 'Cocok bagi siswa teliti dengan kecenderungan logika-verbal yang siap menguasai pembukuan, perpajakan, dan audit keuangan.',
      },
      {
        name: 'SMK Jurusan Bisnis Digital & Pemasaran (BDP)',
        schoolType: 'SMK',
        matchScore: baseMatch - 3.1,
        reason: 'Memadukan kecerdasan interpersonal, bahasa persuasif, dan strategi kewirausahaan era ekonomi digital.',
      },
      {
        name: 'SMK Jurusan Manajemen Perkantoran & Layanan Bisnis (MPLB)',
        schoolType: 'SMK',
        matchScore: baseMatch - 4.5,
        reason: 'Mengembangkan keterampilan organisasi, administrasi modern, korespondensi bisnis, dan kepemimpinan tim.',
      },
    ],
    artsComm: [
      {
        name: 'SMK Jurusan Desain Komunikasi Visual (DKV) & Multimedia',
        schoolType: 'SMK',
        matchScore: isVocationalStrong ? baseMatch : baseMatch - 1.2,
        reason: 'Menyalurkan kecerdasan visual-ruang, imajinasi desain grafis, ilustrasi digital, dan produksi media kreatif secara langsung.',
      },
      {
        name: 'SMA Peminatan Bahasa, Budaya, Komunikasi & Seni',
        schoolType: 'SMA',
        matchScore: isVocationalStrong ? baseMatch - 2.6 : baseMatch,
        reason: 'Membuka jalan kuat menuju Program Studi Ilmu Komunikasi, Psikologi, Hubungan Internasional, Arsitektur, dan Sastra.',
      },
      {
        name: 'SMK Jurusan Animasi / Broadcasting & Perfilman',
        schoolType: 'SMK',
        matchScore: baseMatch - 3.2,
        reason: 'Mendukung bakat visual, musikal, dan penceritaan (storytelling) menjadi portofolio karya kreatif bernilai tinggi.',
      },
      {
        name: 'SMA Peminatan IPS-Kreatif & Desain Arsitektur Dasar',
        schoolType: 'SMA',
        matchScore: baseMatch - 4.7,
        reason: 'Menyeimbangkan analisis sosial-humaniora dengan kepekaan estetika ruang untuk persiapan fakultas seni/desain atau sosial.',
      },
    ],
  };

  // Pick top 2 from primary cluster and top 2 from secondary cluster (adjusted for schoolType balance)
  const primaryList = majorCatalog[primary];
  const secondaryList = majorCatalog[secondary];

  const selected: FurtherSchoolMajor[] = [
    primaryList[0],
    primaryList[1],
    {
      ...secondaryList[0],
      matchScore: Math.round((secondaryList[0].matchScore - 3.8) * 10) / 10,
    },
    primaryList[2],
  ].sort((a, b) => b.matchScore - a.matchScore);

  const trackLabelMap: Record<ClusterKey, string> = {
    techEng: 'Sains, Teknik & Teknologi Informasi (SMA MIPA Informatika / SMK RPL-TJKT)',
    medBio: 'Ilmu Hayati, Sains Alam & Kesehatan (SMA MIPA Biologi-Kimia / SMK Farmasi-Kesehatan)',
    soshumBiz: 'Ekonomi, Bisnis, Hukum & Humaniora (SMA IPS-Ekonomi / SMK Akuntansi-Bisnis Digital)',
    artsComm: 'Desain Kreatif, Komunikasi & Bahasa (SMA Bahasa-Komunikasi / SMK DKV-Multimedia)',
  };

  const smpBridgeMap: Record<ClusterKey, string> = {
    techEng:
      'Persiapan Jenjang SMP/MTs: Disarankan aktif di kelas Matematika-IPA, Klub Coding/Informatika, atau Ekskul Robotika untuk memperkuat fondasi logika sebelum memilih SMA MIPA atau SMK RPL/TJKT.',
    medBio:
      'Persiapan Jenjang SMP/MTs: Disarankan mengikuti Kelompok Ilmiah Remaja (KIR IPA), Palang Merah Remaja (PMR), dan pembiasaan praktikum Biologi-Kimia sebelum memilih SMA MIPA Kesehatan atau SMK Farmasi.',
    soshumBiz:
      'Persiapan Jenjang SMP/MTs: Disarankan aktif dalam OSIS/Pramuka Kepemimpinan, Klub Debat/Bahasa, dan proyek kewirausahaan koperasi siswa sebelum masuk SMA IPS atau SMK Akuntansi/Bisnis Digital.',
    artsComm:
      'Persiapan Jenjang SMP/MTs: Disarankan mengikuti Ekskul Desain Grafis, Jurnalistik, Seni Rupa, atau Broadcasting untuk membangun portofolio awal sebelum memilih SMK DKV/Multimedia atau SMA Bahasa.',
  };

  return {
    targetType,
    primaryTrack: trackLabelMap[primary],
    specificMajors: selected.map((m) => ({
      ...m,
      matchScore: Math.round(Math.min(98.5, Math.max(74.0, m.matchScore)) * 10) / 10,
    })),
    ...(level === 'SD' ? { smpBridgeNote: smpBridgeMap[primary] } : {}),
  };
}

function buildSmaUniversityAndPtnRecommendations(
  ranked: ClusterKey[],
  scores: ClusterScores,
  iqScore: number,
  pdsScore: number
): {
  universityPrograms: NonNullable<PsychologyTrends['universityPrograms']>;
  ptnRecommendations: PtnRecommendation[];
} {
  const primary = ranked[0];
  const secondary = ranked[1];
  const isApplied = scores.vocationalBias >= 16;

  const programBank: Record<ClusterKey, string[]> = {
    techEng: [
      'Teknik Informatika & Ilmu Komputer',
      'Sistem Informasi & Rekayasa Perangkat Lunak',
      'Sains Data (Data Science) & Kecerdasan Buatan (AI)',
      'Teknik Elektro & Teknik Biomedis',
      'Teknik Industri & Manajemen Rekayasa',
      'Teknik Sipil & Perencanaan Wilayah Kota (PWK)',
      'Statistika & Sains Aktuaria',
    ],
    medBio: [
      'Pendidikan Dokter (Kedokteran)',
      'Farmasi & Farmasi Klinis',
      'Pendidikan Dokter Gigi',
      'Ilmu Gizi & Kesehatan Masyarakat',
      'Bioteknologi & Biologi Terapan',
      'Ilmu Keperawatan',
      'Teknologi Pangan & Agroindustri',
    ],
    soshumBiz: [
      'Akuntansi & Keuangan',
      'Manajemen & Bisnis Digital',
      'Ilmu Ekonomi & Pembangunan',
      'Ilmu Hukum & Hukum Bisnis',
      'Administrasi Bisnis / Administrasi Publik',
      'Hubungan Internasional',
      'Ekonomi Syariah / Perpajakan',
    ],
    artsComm: [
      'Desain Komunikasi Visual (DKV)',
      'Ilmu Komunikasi & Hubungan Masyarakat',
      'Ilmu Psikologi',
      'Arsitektur & Desain Interior',
      'Desain Produk & Teknologi Kreatif',
      'Sastra Inggris / Linguistik Terapan',
      'Manajemen Industri Media & Perfilman',
    ],
  };

  const appliedInterdisciplinary: string[] = isApplied
    ? [
        'D4 Teknologi Rekayasa Perangkat Lunak / Internet (Vokasi)',
        'D4 Desain Media Digital & Animasi',
        'D4 Akuntansi Sektor Publik & Bisnis Terapan',
        'D4 Teknologi Rekayasa Instrumentasi & Kontrol',
        'Manajemen Logistik & Rantai Pasok Industri',
      ]
    : [
        'Sains Data & Analitika Bisnis (Interdisipliner)',
        'Teknologi Pangan & Bioentrepreneurship',
        'Arsitektur Lanskap & Keberlanjutan Kota',
        'Manajemen Inovasi & Kewirausahaan Teknologi',
      ];

  const universityPrograms = {
    priority1: programBank[primary],
    priority2: programBank[secondary],
    priority3: appliedInterdisciplinary,
  };

  // Curated Indonesian PTNs per cluster + region affinity
  const allPtnPool: (PtnRecommendation & { cluster: ClusterKey; region: 'A' | 'B' | 'C'; isVocational?: boolean })[] = [
    // Tech & Engineering
    {
      cluster: 'techEng',
      region: 'A',
      universityName: 'Institut Teknologi Bandung (ITB)',
      shortName: 'ITB',
      location: 'Bandung, Jawa Barat',
      focusCluster: 'STEI-K, Teknik Elektro, Teknik Industri & Rekayasa',
      matchedPrograms: ['Teknik Informatika (STEI-K)', 'Teknik Elektro', 'Teknik Industri'],
      admissionPathHint: 'SNBP / SNBT UTBK & Seleksi Mandiri ITB — Cocok dengan skor analitik-spasial kuat.',
    },
    {
      cluster: 'techEng',
      region: 'A',
      universityName: 'Universitas Indonesia (UI)',
      shortName: 'UI',
      location: 'Depok / Jakarta',
      focusCluster: 'Ilmu Komputer, Sistem Informasi & Teknik Modern',
      matchedPrograms: ['Ilmu Komputer (Fasilkom)', 'Sistem Informasi', 'Teknik Industri'],
      admissionPathHint: 'SNBP / SNBT & SIMAK UI — Unggul bagi pemikir logis dengan komunikasi verbal baik.',
    },
    {
      cluster: 'techEng',
      region: 'C',
      universityName: 'Institut Teknologi Sepuluh Nopember (ITS)',
      shortName: 'ITS',
      location: 'Surabaya, Jawa Timur',
      focusCluster: 'Teknologi Informasi, Robotika, Teknik Sipil & Kelautan',
      matchedPrograms: ['Teknik Informatika', 'Sistem Informasi', 'Teknik Elektro / Robotika'],
      admissionPathHint: 'SNBP / SNBT & Seleksi Prestasi/Mandiri ITS — Ekosistem inovasi teknologi & hackathon kuat.',
    },
    {
      cluster: 'techEng',
      region: 'B',
      universityName: 'Universitas Gadjah Mada (UGM)',
      shortName: 'UGM',
      location: 'Yogyakarta, DIY',
      focusCluster: 'Ilmu Komputer, Statistika, Teknik & Sekolah Vokasi',
      matchedPrograms: ['Ilmu Komputer (FMIPA)', 'Teknologi Informasi (FT)', 'Statistika / Aktuaria'],
      admissionPathHint: 'SNBP / SNBT & UM UGM (CBT) — Tersedia jalur S1 Akademik dan D4 Sekolah Vokasi.',
    },
    {
      cluster: 'techEng',
      region: 'C',
      universityName: 'Politeknik Elektronika Negeri Surabaya (PENS)',
      shortName: 'PENS',
      location: 'Surabaya, Jawa Timur',
      focusCluster: 'Politeknik Terbaik Bidang IT, Robotika & Rekayasa Terapan',
      matchedPrograms: ['D4 Teknik Informatika', 'D4 Teknik Elektronika / Mekatronika', 'D4 Sains Data Terapan'],
      admissionPathHint: 'SNBP / SNBT Vokasi & Mandiri PENS — Sangat ideal bagi gaya belajar kinestetis-praktik.',
      isVocational: true,
    },

    // Med & Bio
    {
      cluster: 'medBio',
      region: 'A',
      universityName: 'Universitas Indonesia (UI)',
      shortName: 'UI',
      location: 'Depok / Salemba, Jakarta',
      focusCluster: 'Rumpun Ilmu Kesehatan (FK, FKG, Farmasi, FKM)',
      matchedPrograms: ['Pendidikan Dokter (FK UI)', 'Farmasi', 'Kesehatan Masyarakat / Gizi'],
      admissionPathHint: 'SNBP / SNBT & SIMAK UI — Memerlukan ketahanan belajar biologi-kimia & penalaran tinggi.',
    },
    {
      cluster: 'medBio',
      region: 'B',
      universityName: 'Universitas Gadjah Mada (UGM)',
      shortName: 'UGM',
      location: 'Yogyakarta, DIY',
      focusCluster: 'Kedokteran, Farmasi Klinis, Kedokteran Gigi & Biologi',
      matchedPrograms: ['Kedokteran (FKKMK)', 'Farmasi', 'Ilmu Gizi Kesehatan'],
      admissionPathHint: 'SNBP / SNBT & UM UGM — Riset klinis & pengabdian kesehatan masyarakat bertaraf nasional.',
    },
    {
      cluster: 'medBio',
      region: 'C',
      universityName: 'Universitas Airlangga (UNAIR)',
      shortName: 'UNAIR',
      location: 'Surabaya, Jawa Timur',
      focusCluster: 'Pusat Unggulan Kedokteran, Farmasi & Ilmu Hayati Timur Indonesia',
      matchedPrograms: ['Kedokteran', 'Farmasi', 'Kesehatan Masyarakat / Bioteknologi'],
      admissionPathHint: 'SNBP / SNBT & Seleksi Mandiri UNAIR — Jejaring rumah sakit pendidikan utama yang sangat kuat.',
    },
    {
      cluster: 'medBio',
      region: 'A',
      universityName: 'IPB University (Institut Pertanian Bogor)',
      shortName: 'IPB',
      location: 'Bogor, Jawa Barat',
      focusCluster: 'Biosains, Teknologi Pangan, Ilmu Gizi & Kedokteran Hewan/FK',
      matchedPrograms: ['Ilmu Gizi', 'Teknologi Pangan', 'Biokimia / Kedokteran IPB'],
      admissionPathHint: 'SNBP / SNBT & Jalur Ketua OSIS / Talenta IPB — Cocok dengan kecerdasan naturalis tinggi.',
    },
    {
      cluster: 'medBio',
      region: 'A',
      universityName: 'Universitas Padjadjaran (UNPAD)',
      shortName: 'UNPAD',
      location: 'Jatinangor / Bandung, Jawa Barat',
      focusCluster: 'Kedokteran, Farmasi, Keperawatan & Psikologi Klinis',
      matchedPrograms: ['Pendidikan Dokter', 'Farmasi', 'Ilmu Keperawatan'],
      admissionPathHint: 'SNBP / SNBT & SMUP UNPAD — Kurikulum terintegrasi di kawasan kampus terpadu.',
    },

    // Soshum & Biz
    {
      cluster: 'soshumBiz',
      region: 'A',
      universityName: 'Universitas Indonesia (UI)',
      shortName: 'UI',
      location: 'Depok, Jawa Barat',
      focusCluster: 'FEB UI, Fakultas Hukum & FISIP Unggulan Nasional',
      matchedPrograms: ['Akuntansi / Manajemen (FEB)', 'Ilmu Hukum (FH)', 'Hubungan Internasional'],
      admissionPathHint: 'SNBP / SNBT & SIMAK UI — Peluang magang korporasi & lembaga kebijakan nasional luas.',
    },
    {
      cluster: 'soshumBiz',
      region: 'B',
      universityName: 'Universitas Gadjah Mada (UGM)',
      shortName: 'UGM',
      location: 'Yogyakarta, DIY',
      focusCluster: 'Ekonomi & Bisnis, Hukum, Administrasi Publik & Politik',
      matchedPrograms: ['Manajemen / Akuntansi (FEB)', 'Ilmu Hukum', 'Manajemen & Kebijakan Publik'],
      admissionPathHint: 'SNBP / SNBT & UM UGM — Tersedia juga jalur Sarjana Terapan Pengelolaan Bisnis & Perbankan.',
    },
    {
      cluster: 'soshumBiz',
      region: 'B',
      universityName: 'Universitas Diponegoro (UNDIP)',
      shortName: 'UNDIP',
      location: 'Semarang, Jawa Tengah',
      focusCluster: 'Ekonomi, Hukum, Administrasi Bisnis & Sekolah Vokasi',
      matchedPrograms: ['Ilmu Hukum', 'Akuntansi / Ekonomi', 'Administrasi Bisnis'],
      admissionPathHint: 'SNBP / SNBT & UM UNDIP — Pilihan strategis kompetitif dengan daya tampung Soshum luas.',
    },
    {
      cluster: 'soshumBiz',
      region: 'C',
      universityName: 'Universitas Brawijaya (UB)',
      shortName: 'UB',
      location: 'Malang, Jawa Timur',
      focusCluster: 'Ekonomi Bisnis, Administrasi Publik, Hukum & Kewirausahaan',
      matchedPrograms: ['Administrasi Bisnis / Perpajakan', 'Manajemen', 'Ilmu Hukum'],
      admissionPathHint: 'SNBP / SNBT & SELMA UB — Kuat pada pengembangan bisnis digital, UMKM, dan kebijakan publik.',
    },
    {
      cluster: 'soshumBiz',
      region: 'A',
      universityName: 'Universitas Padjadjaran (UNPAD)',
      shortName: 'UNPAD',
      location: 'Bandung / Jatinangor, Jawa Barat',
      focusCluster: 'Hukum, Ekonomi Bisnis, Hubungan Internasional & Administrasi',
      matchedPrograms: ['Ilmu Hukum', 'Bisnis Digital / Akuntansi', 'Hubungan Internasional'],
      admissionPathHint: 'SNBP / SNBT & SMUP UNPAD — Pelopor prodi Bisnis Digital PTN dan unggul di bidang hukum/HI.',
    },

    // Arts, Comm & Design
    {
      cluster: 'artsComm',
      region: 'A',
      universityName: 'Institut Teknologi Bandung (ITB - FSRD & SAPPK)',
      shortName: 'ITB',
      location: 'Bandung, Jawa Barat',
      focusCluster: 'Desain Komunikasi Visual, Desain Produk & Arsitektur',
      matchedPrograms: ['Desain Komunikasi Visual (FSRD)', 'Desain Interior / Produk', 'Arsitektur (SAPPK)'],
      admissionPathHint: 'SNBP / SNBT (Portofolio Gambar) & Mandiri ITB — Terbaik untuk bakat visual-spasial kreatif.',
    },
    {
      cluster: 'artsComm',
      region: 'B',
      universityName: 'Universitas Gadjah Mada (UGM)',
      shortName: 'UGM',
      location: 'Yogyakarta, DIY',
      focusCluster: 'Psikologi, Ilmu Komunikasi, Sastra & Teknik Arsitektur',
      matchedPrograms: ['Psikologi', 'Ilmu Komunikasi', 'Arsitektur'],
      admissionPathHint: 'SNBP / SNBT & UM UGM — Menggabungkan kekuatan riset manusia, media komunikasi, dan tata ruang.',
    },
    {
      cluster: 'artsComm',
      region: 'B',
      universityName: 'Institut Seni Indonesia (ISI) Yogyakarta',
      shortName: 'ISI Jogja',
      location: 'Yogyakarta, DIY',
      focusCluster: 'DKV, Film & Televisi, Animasi, Seni Murni & Musik',
      matchedPrograms: ['Desain Komunikasi Visual', 'Film dan Televisi / Animasi', 'Seni Musik / Desain Interior'],
      admissionPathHint: 'SNBP / SNBT (Portofolio Karya) & PMB Mandiri ISI — Ekosistem industri kreatif & seni paling matang.',
      isVocational: true,
    },
    {
      cluster: 'artsComm',
      region: 'A',
      universityName: 'Universitas Indonesia (UI)',
      shortName: 'UI',
      location: 'Depok, Jawa Barat',
      focusCluster: 'Psikologi, Ilmu Komunikasi, Sastra & Arsitektur',
      matchedPrograms: ['Psikologi', 'Ilmu Komunikasi', 'Arsitektur / Desain'],
      admissionPathHint: 'SNBP / SNBT & SIMAK UI — Cocok untuk kemampuan verbal-interpersonal dan wawasan sosial tinggi.',
    },
    {
      cluster: 'artsComm',
      region: 'A',
      universityName: 'Politeknik Negeri Media Kreatif / POLBAN',
      shortName: 'Polimedia / POLBAN',
      location: 'Jakarta / Bandung',
      focusCluster: 'Desain Grafis Terapan, Animasi, Penyiaran & Teknik Terapan',
      matchedPrograms: ['D4 Animasi / Desain Grafis', 'D4 Penyiaran & Produksi Media', 'D4 Teknologi Multimedia'],
      admissionPathHint: 'SNBP / SNBT Vokasi & Seleksi Mandiri Politeknik — Berbasis portofolio & praktik industri kreatif.',
      isVocational: true,
    },
  ];

  // Score each PTN by cluster alignment + regional preference + vocational alignment
  const scoredPtns = allPtnPool.map((item) => {
    let rankScore = 0;
    if (item.cluster === primary) rankScore += 50;
    else if (item.cluster === secondary) rankScore += 24;
    if (scores.regionPref !== 'D' && item.region === scores.regionPref) rankScore += 18;
    if (isApplied && item.isVocational) rankScore += 14;
    if (!isApplied && !item.isVocational) rankScore += 6;
    // Slight adjustment by IQ/PDS readiness
    if (iqScore >= 115 && (item.shortName === 'UI' || item.shortName === 'ITB' || item.shortName === 'UGM')) {
      rankScore += 5;
    }
    if (pdsScore >= 82) rankScore += 2;

    return { item, rankScore };
  });

  scoredPtns.sort((a, b) => b.rankScore - a.rankScore);

  // Deduplicate by shortName so student gets 5 distinct top PTNs
  const seen = new Set<string>();
  const picked: PtnRecommendation[] = [];
  for (const entry of scoredPtns) {
    if (seen.has(entry.item.shortName)) continue;
    seen.add(entry.item.shortName);
    picked.push({
      universityName: entry.item.universityName,
      shortName: entry.item.shortName,
      location: entry.item.location,
      focusCluster: entry.item.focusCluster,
      matchedPrograms: entry.item.matchedPrograms,
      admissionPathHint: entry.item.admissionPathHint,
    });
    if (picked.length >= 5) break;
  }

  return { universityPrograms, ptnRecommendations: picked };
}

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

  // Standardized IQ Score (Mean 100, SD 15)
  const iqScore = Math.min(
    155,
    Math.max(70, Math.round(75 + (correctCount / 40) * 58 + correctSesi1 * 0.45))
  );

  // IQ Category
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

  // 5. Personality & Development points (SD / SMP / SMA-SMK)
  const personalityTraits =
    level === 'SD'
      ? [
          'sangat mampu menggunakan kata-kata secara efektif dalam membaca, menulis, berbicara, berfikir dan mengemukakan fikirannya.',
          'mampu mengenali, melihat pola, mengkategorikan dan membuat ikatan emosi dengan alam, mengapresiasi dan memelihara alam.',
          'cukup mampu mengartikulasikan cara kerja obyek dan ruang, menyukai representasi grafis, dan mampu membedakan bentuk secara rinci.',
          'sangat butuh perangkat keras seperti buku, alat tulis, buku catatan, laptop atau tablet dan juga lingkungan yang memberi peluang dirinya untuk dialog, diskusi atau bercerita.',
          'butuh hal-hal yang memberikannya kesempatan untuk berinteraksi dengan alam terbuka, merawat flora atau fauna, menjelajah, dsb.',
          'cukup butuh hal-hal seperti seni, lego, video, film, slide, ilustrasi, gambar, grafik, informasi visual, dan bermain teka-teki visual.',
          'sangat dipenuhi oleh keinginan untuk mengekspresikan sesuatu dalam bentuk tulisan, suka bercerita, membaca, dan bermain teka-teki silang.',
          'dipenuhi oleh kecintaan pada keindahan alam, rasa ingin tahu tentang lingkungan, antusiasme merawat tanaman/hewan, dan kegiatan luar ruang.',
          'cukup dipenuhi oleh imajinasi visual, suka menggambar, membayangkan bentuk, merancang karya kreatif, dan menyusun balok.',
        ]
      : level === 'SMP'
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
    level === 'SD'
      ? {
          priority1:
            'Sangat disarankan, karena ini prioritas utama, membimbing anak untuk gemar membaca berbagai buku cerita/pengetahuan dan membiasakan mereka menulis buku harian atau pengalaman sehari-hari.',
          priority2:
            'Prioritas berikutnya, disarankan mendorong anak melakukan kegiatan luar ruang bersama keluarga, mengamati alam, memelihara tanaman/hewan peliharaan, serta membiasakan peduli lingkungan.',
          priority3:
            'Prioritas terakhir, disarankan membimbing anak untuk mengekspresikan gagasan lewat menggambar atau mewarnai, membuat bagan sederhana untuk mengingat materi, dan bermain teka-teki visual.',
        }
      : level === 'SMP'
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

  const recommendedSeating = level === 'SD' ? 'di belakang' : 'di tengah';

  // 6. Analytical Sesi 6 Scoring & Specific Recommendations
  const sessionScores = {
    numerik: correctSesi1,
    verbal: correctSesi2,
    silogisme: correctSesi3,
    spasial: correctSesi4,
  };

  const clusterScores = computeClusterScores(
    level,
    multipleIntelligences,
    sessionScores,
    answers,
    submission.schoolOrigin,
    submission.grade
  );
  const rankedClusters = rankClusters(clusterScores);
  const topCluster = rankedClusters[0];

  const competitionRecommendation =
    level === 'SD'
      ? topCluster === 'techEng'
        ? 'Olimpiade Matematika, Sains (IPA) & Logika/Coding Dasar SD'
        : topCluster === 'medBio'
        ? 'Olimpiade IPA, Karya Ilmiah Alam & Kesehatan Lingkungan SD'
        : topCluster === 'soshumBiz'
        ? 'Lomba Bercerita, Debat Bahasa, Cerdas Cermat IPS & Wirausaha Cilik'
        : 'Lomba Menggambar, Poster Digital, Seni Kreatif & Prakarya Visual'
      : topCluster === 'techEng'
      ? 'Olimpiade Sains (Matematika/Fisika/Informatika), Robotika & Inovasi Teknologi'
      : topCluster === 'medBio'
      ? 'Olimpiade Biologi/Kimia, Karya Ilmiah Remaja (KIR) & Sains Kesehatan'
      : topCluster === 'soshumBiz'
      ? 'Olimpiade Ekonomi/IPS, Debat Ilmiah, Karya Tulis Hukum & Kewirausahaan'
      : 'Kompetisi Desain Komunikasi Visual (DKV), Film Pendek, Arsitektur & Bahasa';

  const pdsScore =
    Math.round(
      (Math.max(multipleIntelligences.logikaMatematika, multipleIntelligences.kinestetis, 75) + 4.2) * 10
    ) / 10;
  const clampedPds = Math.min(98.5, Math.max(72.0, pdsScore));

  const majorStreamByCluster: Record<ClusterKey, string> = {
    techEng:
      clusterScores.vocationalBias >= 16
        ? 'Teknologi Informasi & Rekayasa (SMK RPL/TJKT atau SMA MIPA Informatika)'
        : 'Sains, Matematika & Rekayasa Teknologi (SMA MIPA Lanjut / Saintek)',
    medBio:
      clusterScores.vocationalBias >= 16
        ? 'Kesehatan & Farmasi Terapan (SMK Farmasi/Keperawatan atau SMA MIPA Bio-Kimia)'
        : 'Sains Hayati & Kesehatan (SMA MIPA Biologi-Kimia / Saintek Medis)',
    soshumBiz:
      clusterScores.vocationalBias >= 16
        ? 'Bisnis, Akuntansi & Manajemen (SMK AKL/Bisnis Digital atau SMA IPS)'
        : 'Sosial Humaniora, Ekonomi & Hukum (SMA IPS / Soshum)',
    artsComm:
      clusterScores.vocationalBias >= 16
        ? 'Desain Kreatif & Multimedia (SMK DKV/Animasi atau SMA Bahasa & Seni)'
        : 'Komunikasi, Psikologi, Bahasa & Desain (SMA Bahasa/IPS atau SMK DKV)',
  };

  const highSchoolMajor = {
    stream: majorStreamByCluster[topCluster],
    pdsScore: clampedPds,
  };

  const clusterNameReadable: Record<ClusterKey, string> = {
    techEng: 'Rekayasa, Matematika, Logika Sistem & Teknologi Informasi',
    medBio: 'Ilmu Hayati, Biologi, Kesehatan & Farmasi',
    soshumBiz: 'Sosial-Humaniora, Ekonomi, Keuangan, Manajemen & Hukum',
    artsComm: 'Desain Visual, Komunikasi, Psikologi & Industri Kreatif',
  };

  const analyticalInterestSummary =
    level === 'SD'
      ? `Berdasarkan kombinasi skor kognitif (IQ ${iqScore}), profil 8 Kecerdasan Majemuk, serta analisa minat Sesi 6, kecenderungan utama ${submission.fullName} berada pada klaster ${clusterNameReadable[topCluster]} dengan gaya belajar dominan ${primaryLearnerType}. Pola ini menjadi dasar proyeksi kesiapan SMP serta rekomendasi spesifik SMA/SMK dan jurusannya.`
      : level === 'SMP'
      ? `Berdasarkan integrasi kemampuan penalaran (IQ ${iqScore}), kecerdasan majemuk, dominasi belahan otak, dan respons analisa jalur studi Sesi 6, ${submission.fullName} menunjukkan kesiapan terkuat pada bidang ${clusterNameReadable[topCluster]} (kecenderungan ${clusterScores.vocationalBias >= 16 ? 'Praktik Kejuruan / Vokasi SMK' : clusterScores.vocationalBias <= -6 ? 'Akademik Konseptual SMA' : 'Seimbang SMA & SMK Terapan'}).`
      : `Hasil integrasi tes bakat kognitif (IQ ${iqScore}), PDS (${clampedPds.toFixed(1)}%), 4 Lobus Otak, serta analisa pilihan studi Sesi 6 memetakan ${submission.fullName} paling optimal pada rumpun ${clusterNameReadable[topCluster]} (diikuti klaster ${clusterNameReadable[rankedClusters[1]]}) dengan profil kampus PTN yang sesuai.`;

  let furtherSchoolRecommendations: FurtherSchoolRecommendation | undefined = undefined;
  let universityPrograms: PsychologyTrends['universityPrograms'] = undefined;
  let ptnRecommendations: PtnRecommendation[] | undefined = undefined;

  if (level === 'SD' || level === 'SMP') {
    furtherSchoolRecommendations = buildFurtherSchoolRecommendation(
      level,
      rankedClusters,
      clusterScores,
      iqScore,
      clampedPds
    );
  } else {
    const smaRecs = buildSmaUniversityAndPtnRecommendations(
      rankedClusters,
      clusterScores,
      iqScore,
      clampedPds
    );
    universityPrograms = smaRecs.universityPrograms;
    ptnRecommendations = smaRecs.ptnRecommendations;
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
    furtherSchoolRecommendations,
    ptnRecommendations,
    analyticalInterestSummary,
  };

  return {
    studentId: submission.studentId,
    regNumber: submission.regNumber,
    fullName: submission.fullName,
    educationLevel: level,
    schoolOrigin: submission.schoolOrigin,
    grade: submission.grade,
    rawScoreSession1to4: correctCount,
    sessionScores,
    iqScore,
    iqCategory,
    iqCategoryRange,
    multipleIntelligences,
    brainAnalysis,
    psychologyTrends,
    isReleased: false,
    evaluatedAt: new Date().toISOString(),
    completionStatus: submission.completionStatus || 'completed',
    violationCount: submission.violationCount || 0,
    ...(submission.terminationReason ? { terminationReason: submission.terminationReason } : {}),
  };
}

/**
 * Fallback helper so legacy TestResult records created before Sesi 6 still display
 * rich SMA/SMK jurusan recommendations (for SD/SMP) or PTN recommendations (for SMA/SMK)
 * computed cleanly from their existing Multiple Intelligences, IQ, and sessionScores.
 */
export function resolveRecommendationsWithFallback(result: TestResult): {
  analyticalInterestSummary: string;
  furtherSchoolRecommendations?: FurtherSchoolRecommendation;
  universityPrograms?: PsychologyTrends['universityPrograms'];
  ptnRecommendations?: PtnRecommendation[];
} {
  const existing = result.psychologyTrends;
  const level = result.educationLevel || 'SMA';
  const sessionScores = result.sessionScores || {
    numerik: Math.round((result.rawScoreSession1to4 || 20) * 0.25),
    verbal: Math.round((result.rawScoreSession1to4 || 20) * 0.25),
    silogisme: Math.round((result.rawScoreSession1to4 || 20) * 0.25),
    spasial: Math.round((result.rawScoreSession1to4 || 20) * 0.25),
  };

  const fallbackScores = computeClusterScores(
    level,
    result.multipleIntelligences,
    sessionScores,
    {},
    result.schoolOrigin,
    result.grade
  );
  const ranked = rankClusters(fallbackScores);
  const pds = existing.highSchoolMajor?.pdsScore || 80;

  if (level === 'SD' || level === 'SMP') {
    const furtherSchoolRecommendations =
      existing.furtherSchoolRecommendations ||
      buildFurtherSchoolRecommendation(level, ranked, fallbackScores, result.iqScore, pds);

    const analyticalInterestSummary =
      existing.analyticalInterestSummary ||
      `Pemetaan potensi ${result.fullName} (IQ ${result.iqScore}, PDS ${pds.toFixed(1)}%) merekomendasikan jalur ${furtherSchoolRecommendations.targetType} dengan fokus ${furtherSchoolRecommendations.primaryTrack}.`;

    return {
      analyticalInterestSummary,
      furtherSchoolRecommendations,
    };
  }

  const smaFallback = buildSmaUniversityAndPtnRecommendations(
    ranked,
    fallbackScores,
    result.iqScore,
    pds
  );

  return {
    analyticalInterestSummary:
      existing.analyticalInterestSummary ||
      `Pemetaan potensi ${result.fullName} (IQ ${result.iqScore}, PDS ${pds.toFixed(1)}%) mengarahkan klaster Program Studi dan Perguruan Tinggi Negeri (PTN) yang selaras dengan dominasi kognitif dan kecerdasan majemuk siswa.`,
    universityPrograms: existing.universityPrograms || smaFallback.universityPrograms,
    ptnRecommendations:
      existing.ptnRecommendations && existing.ptnRecommendations.length > 0
        ? existing.ptnRecommendations
        : smaFallback.ptnRecommendations,
  };
}
