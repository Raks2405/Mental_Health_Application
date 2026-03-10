export type VideoItem = {
  videoId: string;
  title: string;
  channel: string;
  duration: string;
};

export type BookItem = {
  title: string;
  author: string;
  isbn13: string;
};

export type ArticleItem = {
  title: string;
  source: string;
  url: string;
};

export const VIDEO_LIBRARY: Record<string, VideoItem> = {
  stressFriend: {
    videoId: "RcGyVTAoXEU",
    title: "How to Make Stress Your Friend",
    channel: "TED",
    duration: "14:29",
  },
  sleepSuperpower: {
    videoId: "5MuIMqhT8DM",
    title: "Sleep Is Your Superpower",
    channel: "TED",
    duration: "17:37",
  },
  mindful10: {
    videoId: "aXItOY0sLRY",
    title: "All It Takes Is 10 Mindful Minutes",
    channel: "TED",
    duration: "09:27",
  },
  emotionalFirstAid: {
    videoId: "F2hc2FLOdhI",
    title: "How to Practice Emotional First Aid",
    channel: "TED",
    duration: "11:13",
  },
  vulnerability: {
    videoId: "iCvmsMzlF7o",
    title: "The Power of Vulnerability",
    channel: "TED",
    duration: "20:19",
  },
  happinessScience: {
    videoId: "4q1dgn_C0AU",
    title: "The Surprising Science of Happiness",
    channel: "TED",
    duration: "19:15",
  },
  introverts: {
    videoId: "c0KYU2j0TM4",
    title: "The Power of Introverts",
    channel: "TED",
    duration: "19:04",
  },
  selfConfidence: {
    videoId: "w-HYZv6HzAs",
    title: "The Skill of Self-Confidence",
    channel: "TEDx",
    duration: "15:33",
  },
  grit: {
    videoId: "H14bBuluwB8",
    title: "Grit: The Power of Passion and Perseverance",
    channel: "TED",
    duration: "06:13",
  },
  bodyLanguage: {
    videoId: "Ks-_Mh1QhMc",
    title: "Your Body Language May Shape Who You Are",
    channel: "TED",
    duration: "21:03",
  },
  selfControl: {
    videoId: "tTb3d5cjSFI",
    title: "The Power of Self-Control",
    channel: "TED",
    duration: "15:11",
  },
  whyWeDo: {
    videoId: "u6XAPnuFjJc",
    title: "Why We Do What We Do",
    channel: "TED",
    duration: "21:01",
  },
  anxiety101: {
    videoId: "Nly6GPUwh2w",
    title: "Dealing With It: Anxiety 101",
    channel: "Kati Morton",
    duration: "12:08",
  },
  breathingExercise: {
    videoId: "Apkg1cKDyyA",
    title: "Relax!!!!! Breathing Exercise #1",
    channel: "Kati Morton",
    duration: "10:00+",
  },
  safePlaceVisualization: {
    videoId: "Isw37iCwMCg",
    title: "Safe Place Visualization",
    channel: "Therapy in a Nutshell",
    duration: "10:00+",
  },
  progressiveMuscleRelaxation: {
    videoId: "SNqYG95j_UQ",
    title: "Progressive Muscle Relaxation",
    channel: "Therapy in a Nutshell",
    duration: "10:44",
  },
  quickStartAnxietyTreatment: {
    videoId: "MK0rESk_oW0",
    title: "Quick-Start Guide to Anxiety Treatment",
    channel: "Therapy in a Nutshell",
    duration: "12:36",
  },
  whatsNormalAnxiety: {
    videoId: "xsEJ6GeAGb0",
    title: "What's Normal Anxiety â€” and What's an Anxiety Disorder?",
    channel: "Body Stuff with Dr. Jen Gunter",
    duration: "11:05",
  },
  anxietyDisordersExplained: {
    videoId: "RuPPRLv_YSw",
    title: "Types of Anxiety Disorders",
    channel: "Psych2Go",
    duration: "10:12",
  },
  yogaSocialAnxiety: {
    videoId: "l1097wYhDOY",
    title: "Yoga for Social Anxiety",
    channel: "Yoga With Adriene",
    duration: "12:50",
  },
  yogaForSuffering: {
    videoId: "reASzZP63HQ",
    title: "Yoga for Suffering",
    channel: "Yoga With Adriene",
    duration: "13:22",
  },
  needToBeAlone: {
    videoId: "XENTaHpbb74",
    title: "The Need to Be Alone",
    channel: "The School of Life",
    duration: "10:40",
  },
  lonelinessCommunity: {
    videoId: "zQEC9diyl-Y",
    title: "Loneliness and Our Craving for Community",
    channel: "The School of Life",
    duration: "11:18",
  },
  highPriceLoneliness: {
    videoId: "EYncNbM9HMs",
    title: "The High Price We Pay for Our Fear of Loneliness",
    channel: "The School of Life",
    duration: "10:55",
  },
};

export const VIDEO_CATEGORIES: Record<string, { label: string; videos: VideoItem[] }> = {
  sad: {
    label: "I feel sad or low",
    videos: [
      VIDEO_LIBRARY.emotionalFirstAid,
      VIDEO_LIBRARY.vulnerability,
      VIDEO_LIBRARY.happinessScience,
      VIDEO_LIBRARY.anxiety101,
      VIDEO_LIBRARY.safePlaceVisualization,
      VIDEO_LIBRARY.yogaForSuffering,
    ],
  },
  stress: {
    label: "I feel stressed or overwhelmed",
    videos: [
      VIDEO_LIBRARY.stressFriend,
      VIDEO_LIBRARY.selfControl,
      VIDEO_LIBRARY.progressiveMuscleRelaxation,
      VIDEO_LIBRARY.breathingExercise,
      VIDEO_LIBRARY.yogaSocialAnxiety,
      VIDEO_LIBRARY.quickStartAnxietyTreatment,
    ],
  },
  anxiety: {
    label: "I feel anxious or worried",
    videos: [
      VIDEO_LIBRARY.whatsNormalAnxiety,
      VIDEO_LIBRARY.anxietyDisordersExplained,
      VIDEO_LIBRARY.anxiety101,
      VIDEO_LIBRARY.breathingExercise,
      VIDEO_LIBRARY.safePlaceVisualization,
      VIDEO_LIBRARY.yogaSocialAnxiety,
    ],
  },
  sleep: {
    label: "I'm having trouble sleeping",
    videos: [
      VIDEO_LIBRARY.sleepSuperpower,
      VIDEO_LIBRARY.progressiveMuscleRelaxation,
      VIDEO_LIBRARY.safePlaceVisualization,
      VIDEO_LIBRARY.mindful10,
      VIDEO_LIBRARY.yogaForSuffering,
      VIDEO_LIBRARY.stressFriend,
    ],
  },
  reflect: {
    label: "I just want to talk or reflect",
    videos: [
      VIDEO_LIBRARY.needToBeAlone,
      VIDEO_LIBRARY.vulnerability,
      VIDEO_LIBRARY.introverts,
      VIDEO_LIBRARY.bodyLanguage,
      VIDEO_LIBRARY.whyWeDo,
      VIDEO_LIBRARY.selfConfidence,
    ],
  },
  grief: {
    label: "I'm dealing with grief or loss",
    videos: [
      VIDEO_LIBRARY.emotionalFirstAid,
      VIDEO_LIBRARY.vulnerability,
      VIDEO_LIBRARY.safePlaceVisualization,
      VIDEO_LIBRARY.yogaForSuffering,
      VIDEO_LIBRARY.happinessScience,
      VIDEO_LIBRARY.needToBeAlone,
    ],
  },
  loneliness: {
    label: "I feel lonely or disconnected",
    videos: [
      VIDEO_LIBRARY.lonelinessCommunity,
      VIDEO_LIBRARY.highPriceLoneliness,
      VIDEO_LIBRARY.needToBeAlone,
      VIDEO_LIBRARY.introverts,
      VIDEO_LIBRARY.bodyLanguage,
      VIDEO_LIBRARY.selfConfidence,
    ],
  },
  anger: {
    label: "I'm feeling angry or irritable",
    videos: [
      VIDEO_LIBRARY.selfControl,
      VIDEO_LIBRARY.stressFriend,
      VIDEO_LIBRARY.breathingExercise,
      VIDEO_LIBRARY.progressiveMuscleRelaxation,
      VIDEO_LIBRARY.yogaForSuffering,
      VIDEO_LIBRARY.anxietyDisordersExplained,
    ],
  },
  burnout: {
    label: "I'm burned out or unmotivated",
    videos: [
      VIDEO_LIBRARY.stressFriend,
      VIDEO_LIBRARY.sleepSuperpower,
      VIDEO_LIBRARY.quickStartAnxietyTreatment,
      VIDEO_LIBRARY.mindful10,
      VIDEO_LIBRARY.yogaForSuffering,
      VIDEO_LIBRARY.grit,
    ],
  },
};

export const BOOK_LIBRARY: Record<string, BookItem> = {
  feelingGood: {
    title: "Feeling Good: The New Mood Therapy",
    author: "David D. Burns",
    isbn13: "9780380731763",
  },
  mindOverMood: {
    title: "Mind Over Mood",
    author: "Dennis Greenberger & Christine Padesky",
    isbn13: "9781462520428",
  },
  lostConnections: {
    title: "Lost Connections",
    author: "Johann Hari",
    isbn13: "9781632868305",
  },
  giftsOfImperfection: {
    title: "The Gifts of Imperfection",
    author: "Brene Brown",
    isbn13: "9781616499600",
  },
  anxietyPhobiaWorkbook: {
    title: "The Anxiety and Phobia Workbook",
    author: "Edmund J. Bourne",
    isbn13: "9781648485572",
  },
  bodyKeepsScore: {
    title: "The Body Keeps the Score",
    author: "Bessel van der Kolk",
    isbn13: "9780670785933",
  },
  burnout: {
    title: "Burnout: The Secret to Unlocking the Stress Cycle",
    author: "Emily Nagoski & Amelia Nagoski",
    isbn13: "9781984818324",
  },
  whyWeSleep: {
    title: "Why We Sleep",
    author: "Matthew Walker",
    isbn13: "9780241269060",
  },
  sayGoodNight: {
    title: "Say Good Night to Insomnia",
    author: "Gregg D. Jacobs",
    isbn13: "9780805089585",
  },
  selfCompassion: {
    title: "Self-Compassion",
    author: "Kristin Neff",
    isbn13: "9780061733512",
  },
  daringGreatly: {
    title: "Daring Greatly",
    author: "Brene Brown",
    isbn13: "9781592408412",
  },
  mansSearch: {
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    isbn13: "9780807014295",
  },
  onGrief: {
    title: "On Grief and Grieving",
    author: "Elisabeth Kubler-Ross & David Kessler",
    isbn13: "9781476775555",
  },
  together: {
    title: "Together",
    author: "Vivek H. Murthy",
    isbn13: "9780062913296",
  },
  angerTrap: {
    title: "The Anger Trap",
    author: "Les Carter",
    isbn13: "9780787968809",
  },
};

export const BOOK_CATEGORIES: Record<string, { label: string; books: BookItem[] }> = {
  sad: {
    label: "I feel sad or low",
    books: [
      BOOK_LIBRARY.feelingGood,
      BOOK_LIBRARY.mindOverMood,
      BOOK_LIBRARY.lostConnections,
      BOOK_LIBRARY.giftsOfImperfection,
    ],
  },
  stress: {
    label: "I feel stressed or overwhelmed",
    books: [
      BOOK_LIBRARY.burnout,
      BOOK_LIBRARY.selfCompassion,
      BOOK_LIBRARY.mindOverMood,
      BOOK_LIBRARY.mansSearch,
    ],
  },
  anxiety: {
    label: "I feel anxious or worried",
    books: [
      BOOK_LIBRARY.anxietyPhobiaWorkbook,
      BOOK_LIBRARY.mindOverMood,
      BOOK_LIBRARY.selfCompassion,
      BOOK_LIBRARY.bodyKeepsScore,
    ],
  },
  sleep: {
    label: "I'm having trouble sleeping",
    books: [
      BOOK_LIBRARY.whyWeSleep,
      BOOK_LIBRARY.sayGoodNight,
      BOOK_LIBRARY.selfCompassion,
    ],
  },
  reflect: {
    label: "I just want to talk or reflect",
    books: [
      BOOK_LIBRARY.daringGreatly,
      BOOK_LIBRARY.giftsOfImperfection,
      BOOK_LIBRARY.mansSearch,
      BOOK_LIBRARY.selfCompassion,
    ],
  },
  grief: {
    label: "I'm dealing with grief or loss",
    books: [
      BOOK_LIBRARY.onGrief,
      BOOK_LIBRARY.mansSearch,
      BOOK_LIBRARY.giftsOfImperfection,
    ],
  },
  loneliness: {
    label: "I feel lonely or disconnected",
    books: [
      BOOK_LIBRARY.together,
      BOOK_LIBRARY.lostConnections,
      BOOK_LIBRARY.daringGreatly,
    ],
  },
  anger: {
    label: "I'm feeling angry or irritable",
    books: [
      BOOK_LIBRARY.angerTrap,
      BOOK_LIBRARY.mindOverMood,
      BOOK_LIBRARY.selfCompassion,
    ],
  },
  burnout: {
    label: "I'm burned out or unmotivated",
    books: [
      BOOK_LIBRARY.burnout,
      BOOK_LIBRARY.mansSearch,
      BOOK_LIBRARY.selfCompassion,
    ],
  },
};

export const ARTICLE_LIBRARY: Record<string, ArticleItem> = {
  anxietyDisorders: {
    title: "Anxiety Disorders",
    source: "NIMH",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders/index.shtml",
  },
  depressionNimh: {
    title: "Depression",
    source: "NIMH",
    url: "https://www.nimh.nih.gov/health/topics/depression/index.shtml",
  },
  depressionWho: {
    title: "Depressive disorder (depression)",
    source: "WHO",
    url: "https://www.who.int/en/news-room/fact-sheets/detail/depression",
  },
  managingStress: {
    title: "Managing Stress",
    source: "CDC",
    url: "https://www.cdc.gov/mental-health/living-with/index.html",
  },
  managingDifficultEmotions: {
    title: "Managing Difficult Emotions",
    source: "CDC",
    url: "https://www.cdc.gov/emotional-well-being/managing-difficult-emotions/index.html",
  },
  sadnessDepression: {
    title: "Sadness & Depression",
    source: "CDC",
    url: "https://www.cdc.gov/emotional-well-being/managing-difficult-emotions/sadness-depression.html",
  },
  insomniaNhs: {
    title: "Insomnia",
    source: "NHS",
    url: "https://www.nhs.uk/conditions/insomnia/",
  },
  griefCdc: {
    title: "Grief",
    source: "CDC",
    url: "https://www.cdc.gov/howrightnow/emotion/grief/index.html",
  },
  lonelinessCdc: {
    title: "Loneliness",
    source: "CDC",
    url: "https://www.cdc.gov/howrightnow/emotion/loneliness/index.html",
  },
  angerCdc: {
    title: "Anger",
    source: "CDC",
    url: "https://www.cdc.gov/howrightnow/emotion/anger/index.html",
  },
  socialIsolation: {
    title: "Health Effects of Social Isolation and Loneliness",
    source: "CDC",
    url: "https://www.cdc.gov/social-connectedness/risk-factors/index.html",
  },
  burnoutWho: {
    title: "Burn-out an \"occupational phenomenon\"",
    source: "WHO",
    url: "https://www.who.int/standards/classifications/frequently-asked-questions/burn-out-an-occupational-phenomenon",
  },
  burnoutMayo: {
    title: "5 tips to keep burnout at bay",
    source: "Mayo Clinic Health System",
    url: "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-tips-to-keep-burnout-at-bay",
  },
  angerMayo: {
    title: "Anger management: 10 tips to tame your temper",
    source: "Mayo Clinic",
    url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/anger-management/art-20045434",
  },
  caringMentalHealth: {
    title: "Caring for Your Mental Health",
    source: "NIMH",
    url: "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health",
  },
};

export const ARTICLE_CATEGORIES: Record<string, { label: string; articles: ArticleItem[] }> = {
  sad: {
    label: "I feel sad or low",
    articles: [
      ARTICLE_LIBRARY.sadnessDepression,
      ARTICLE_LIBRARY.depressionNimh,
      ARTICLE_LIBRARY.depressionWho,
      ARTICLE_LIBRARY.managingDifficultEmotions,
    ],
  },
  stress: {
    label: "I feel stressed or overwhelmed",
    articles: [
      ARTICLE_LIBRARY.managingStress,
      ARTICLE_LIBRARY.caringMentalHealth,
      ARTICLE_LIBRARY.managingDifficultEmotions,
      ARTICLE_LIBRARY.burnoutMayo,
    ],
  },
  anxiety: {
    label: "I feel anxious or worried",
    articles: [
      ARTICLE_LIBRARY.anxietyDisorders,
      ARTICLE_LIBRARY.managingDifficultEmotions,
      ARTICLE_LIBRARY.caringMentalHealth,
      ARTICLE_LIBRARY.managingStress,
    ],
  },
  sleep: {
    label: "I'm having trouble sleeping",
    articles: [
      ARTICLE_LIBRARY.insomniaNhs,
      ARTICLE_LIBRARY.caringMentalHealth,
      ARTICLE_LIBRARY.managingStress,
    ],
  },
  reflect: {
    label: "I just want to talk or reflect",
    articles: [
      ARTICLE_LIBRARY.caringMentalHealth,
      ARTICLE_LIBRARY.managingDifficultEmotions,
      ARTICLE_LIBRARY.socialIsolation,
    ],
  },
  grief: {
    label: "I'm dealing with grief or loss",
    articles: [
      ARTICLE_LIBRARY.griefCdc,
      ARTICLE_LIBRARY.managingDifficultEmotions,
      ARTICLE_LIBRARY.caringMentalHealth,
    ],
  },
  loneliness: {
    label: "I feel lonely or disconnected",
    articles: [
      ARTICLE_LIBRARY.lonelinessCdc,
      ARTICLE_LIBRARY.socialIsolation,
      ARTICLE_LIBRARY.caringMentalHealth,
    ],
  },
  anger: {
    label: "I'm feeling angry or irritable",
    articles: [
      ARTICLE_LIBRARY.angerCdc,
      ARTICLE_LIBRARY.angerMayo,
      ARTICLE_LIBRARY.managingDifficultEmotions,
    ],
  },
  burnout: {
    label: "I'm burned out or unmotivated",
    articles: [
      ARTICLE_LIBRARY.burnoutMayo,
      ARTICLE_LIBRARY.burnoutWho,
      ARTICLE_LIBRARY.managingStress,
    ],
  },
};
