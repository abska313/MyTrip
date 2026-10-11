// ABSKA 214 — Type Definitions

export type PathwayId =
  | 'body_fitness'
  | 'discipline_consistency'
  | 'knowledge_reading'
  | 'skills_projects'
  | 'time_management'
  | 'self_discovery'
  | 'spiritual_habits';

export type TaskDifficulty = 'سهل' | 'متوسط' | 'تحدي';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'deferred';
export type TaskFrequency = 'once' | 'daily' | 'weekly' | 'phase';

export interface AppTask {
  id: string;
  title: string;
  description?: string;
  pathwayId: PathwayId;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  scheduledTime?: string; // e.g. "08:00"
  status: TaskStatus;
  frequency: TaskFrequency;
  xpReward: number;
  notes?: string;
  isHardDayApproved?: boolean; // Can be done in hard day mode
  createdAt: string;
  completedAt?: string;
  deferredCount?: number;
}

export interface UserProfile {
  name: string;
  birthYear?: number;
  heightCm?: number;
  initialWeightKg?: number;
  targetWeightKg?: number;
  primaryGoals: string[];
  focusPathways: PathwayId[];
  activityLevel: 'منخفض' | 'متوسط' | 'نشط' | 'رياضي';
  experienceLevel: 'مبتدئ' | 'متوسط' | 'متقدم';
  dailyAvailableHours: number;
  wakeTime: string;
  sleepTime: string;
  targetBooksOrSkills: string;
  habitsToBuild: string[];
  habitsToReduce: string[];
  mainChallenges: string[];
  difficultyPreference: 'هادئ' | 'متوازن' | 'مكثف';
  restDays: string[];
  isStarted: boolean;
  startDate?: string; // ISO date string: YYYY-MM-DD
  targetEndDate?: string;
  isCompleted?: boolean;
  smartAdaptationEnabled: boolean;
  pinLockEnabled?: boolean;
  pinCode?: string;
}

export interface WeeklyWeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weekNumber: number; // e.g. week 1, 2, 3...
  weightKg: number;
  waistCm?: number;
  changeFromPreviousKg?: number; // difference from previous check-in (negative means loss)
  changeFromStartKg?: number; // difference from initial weight
  notes?: string;
}

export interface BeforeAfterPhotos {
  id: 'transformation_photos';
  beforePhoto?: string; // base64
  beforeDate?: string;
  beforeWeightKg?: number;
  afterPhoto?: string; // base64
  afterDate?: string;
  afterWeightKg?: number;
  notes?: string;
}

export interface CharacterPathwayNode {
  id: string;
  title: string;
  description: string;
  requiredXp: number;
  unlocked: boolean;
  completed: boolean;
}

export interface CharacterPathway {
  id: PathwayId;
  title: string;
  icon: string;
  level: number;
  xp: number;
  progressPercent: number;
  nodes: CharacterPathwayNode[];
  suggestedNextStep: string;
}

export interface XpTransaction {
  id: string;
  amount: number;
  source: string; // e.g. "task_complete", "book_read", "contract_signed"
  reason: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: PathwayId | 'general';
  unlockedAt?: string;
  isWeightNeutral: boolean;
}

export interface UserTitle {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  unlocked: boolean;
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  totalPages?: number;
  pagesRead: number;
  status: 'not_started' | 'reading' | 'completed' | 'paused';
  startDate?: string;
  endDate?: string;
  notes?: string;
  quotes: string[];
  keyIdeas: string[];
  practicalApplication?: string;
  rating?: number; // 1-5
}

export interface SkillProject {
  id: string;
  title: string;
  description: string;
  whyChosen: string;
  currentLevel: string;
  targetOutcome: string;
  estimatedHours: number;
  progressPercent: number;
  milestones: { id: string; title: string; completed: boolean }[];
  obstacles?: string;
  notes?: string;
  proofLinkOrNote?: string;
  completedAt?: string;
  phaseId?: number;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  wentWell: string;
  wasHard: string;
  learnedAboutSelf: string;
  habitToUnderstand: string;
  canChangeTomorrow: string;
  gratitude: string;
  coreValues: string;
  freeText: string;
  pathwayId?: PathwayId;
  energyLevel?: number; // 1-5
}

export interface TimeBlock {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  category: 'work' | 'sport' | 'reading' | 'skills' | 'sleep' | 'personal' | 'screen' | 'habits' | 'other';
  startTime: string; // "14:00"
  endTime: string; // "15:30"
  durationMinutes: number;
  actualMinutes?: number;
  notes?: string;
}

export interface PhysicalLog {
  id: string;
  date: string;
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  activityType?: string;
  durationMinutes?: number;
  effortLevel?: 'خفيف' | 'متوسط' | 'عالي' | 'أقصى';
  notes?: string;
  photoBase64?: string; // stored locally in IndexedDB only
}

export interface NewExperience {
  id: string;
  title: string;
  reason: string;
  excitementLevel: number; // 1-5
  expectedDuration?: string;
  cost?: string;
  status: 'planned' | 'completed' | 'dropped';
  reflection?: string;
  completedAt?: string;
}

export interface RewardItem {
  id: string;
  title: string;
  condition: string;
  isUnlocked: boolean;
  isClaimed: boolean;
  claimedAt?: string;
}

export interface PhaseContract {
  phaseId: number; // 1 to 8
  phaseName: string;
  mainGoal: string;
  topThreeGoals: [string, string, string];
  whatToStopOrReduce: string;
  minimumAcceptableCommitment: string;
  expectedChallenges: string;
  hardDayPlan: string;
  chosenReward: string;
  signedAt: string;
  revisionHistory: { date: string; changes: string }[];
}

export interface PhaseReview {
  phaseId: number;
  reviewDate: string;
  completedTasksCount: number;
  deferredTasksCount: number;
  habitsImproved: string[];
  habitsStruggling: string[];
  readingProgressSummary: string;
  skillProgressSummary: string;
  biggestLesson: string;
  nextPhaseGoals: string;
  physicalSummary?: string;
  reflectionNotes?: string;
}

export interface ComebackLog {
  id: string;
  date: string;
  reasons: string[];
  chosenMicroStep: string;
  preventionPlan: string;
  resumedPlanNotes: string;
}

export interface HardDayLog {
  id: string;
  date: string;
  energyLevel: number;
  reason?: string;
  microTasksCompleted: string[];
}

export interface FutureLetter {
  id: string;
  content: string;
  sealedDate: string;
  unlockDay: number; // 214
  isManuallyUnlocked?: boolean;
}

export interface PostJourneyPlan {
  sustainedHabits: string[];
  adjustedHabits: string[];
  longTermGoals: string[];
  ongoingProjects: string[];
  weeklyReviewCadence: string;
  hardDayMinimumStandard: string;
  thirtyDayPlanSteps: { title: string; targetWeek: number; completed: boolean }[];
  summaryOfTransformation: string;
}

export interface SmartAdaptationSuggestion {
  id: string;
  type: 'reduce_load' | 'split_task' | 'add_rest' | 'increase_challenge' | 'reschedule';
  title: string;
  description: string;
  reason: string;
  applied: boolean;
  rejected: boolean;
}
