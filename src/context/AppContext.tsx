import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserProfile,
  AppTask,
  CharacterPathway,
  XpTransaction,
  Achievement,
  UserTitle,
  SmartAdaptationSuggestion
} from '../types';
import {
  getItem,
  putItem,
  getAllItems,
  deleteItem
} from '../db/indexedDB';
import { INITIAL_PATHWAYS } from '../constants/pathways';
import { PHASES_DATA, getPhaseByDay, PhaseInfo } from '../constants/phases';
import { ALL_ACHIEVEMENTS, USER_TITLES, calculateLevelFromXp } from '../constants/achievements';
import { STARTER_TASKS, STARTER_REWARDS, STARTER_EXPERIENCES } from '../constants/starterData';

interface JourneyStats {
  currentDay: number;
  daysRemaining: number;
  progressPercent: number;
  currentPhase: PhaseInfo;
  isSimulated: boolean;
  totalDays: number;
}

interface AppContextType {
  profile: UserProfile | null;
  loading: boolean;
  journeyStats: JourneyStats;
  xp: number;
  levelInfo: { level: number; title: string; nextLevelXp: number; currentLevelFloorXp: number };
  streak: number;
  tasks: AppTask[];
  pathways: CharacterPathway[];
  achievements: Achievement[];
  titles: UserTitle[];
  isHardDayMode: boolean;
  activeReminders: string[];
  smartSuggestions: SmartAdaptationSuggestion[];
  newUnlockedAchievement: Achievement | null;
  newUnlockedTitle: UserTitle | null;
  
  // Actions
  startJourney: (newProfile: UserProfile, initialLetter?: string) => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  simulateDay: (day: number | null) => void;
  addTask: (task: Omit<AppTask, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (task: AppTask) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  deferTask: (taskId: string) => Promise<void>;
  toggleHardDayMode: (energyLevel?: number, reason?: string) => Promise<void>;
  addXp: (amount: number, source: string, reason: string) => Promise<void>;
  dismissAchievementModal: () => void;
  dismissTitleModal: () => void;
  applySmartSuggestion: (suggestionId: string) => Promise<void>;
  rejectSmartSuggestion: (suggestionId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [pathways, setPathways] = useState<CharacterPathway[]>(INITIAL_PATHWAYS);
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(ALL_ACHIEVEMENTS);
  const [titles, setTitles] = useState<UserTitle[]>(USER_TITLES);
  const [isHardDayMode, setIsHardDayMode] = useState(false);
  const [simulatedDayOverride, setSimulatedDayOverride] = useState<number | null>(null);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartAdaptationSuggestion[]>([]);
  const [newUnlockedAchievement, setNewUnlockedAchievement] = useState<Achievement | null>(null);
  const [newUnlockedTitle, setNewUnlockedTitle] = useState<UserTitle | null>(null);

  // Load state from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      // Profile
      const storedProfile = await getItem<UserProfile>('user_profile', 'main_profile');
      if (storedProfile) {
        setProfile(storedProfile);
      }

      // Tasks
      const storedTasks = await getAllItems<AppTask>('tasks');
      setTasks(storedTasks);

      // Pathways
      const storedPathways = await getAllItems<CharacterPathway>('character_tree');
      if (storedPathways.length > 0) {
        setPathways(storedPathways);
      } else {
        // seed initial pathways
        for (const p of INITIAL_PATHWAYS) {
          await putItem('character_tree', p);
        }
        setPathways(INITIAL_PATHWAYS);
      }

      // XP Transactions
      const txs = await getAllItems<XpTransaction>('xp_transactions');
      setXpTransactions(txs);

      // Achievements
      const storedAchs = await getAllItems<Achievement>('achievements');
      if (storedAchs.length > 0) {
        setAchievements(storedAchs);
      } else {
        for (const a of ALL_ACHIEVEMENTS) {
          await putItem('achievements', a);
        }
        setAchievements(ALL_ACHIEVEMENTS);
      }

      // Suggestions
      const storedSugg = await getAllItems<SmartAdaptationSuggestion>('smart_suggestions');
      setSmartSuggestions(storedSugg.filter((s) => !s.applied && !s.rejected));
    } catch (e) {
      console.error('Error loading data from IndexedDB:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Calculate Journey Day
  const calculateCurrentDay = (): { currentDay: number; daysRemaining: number; progressPercent: number; currentPhase: PhaseInfo; isSimulated: boolean } => {
    const totalDays = 214;
    if (simulatedDayOverride !== null) {
      const day = Math.max(1, Math.min(totalDays, simulatedDayOverride));
      return {
        currentDay: day,
        daysRemaining: Math.max(0, totalDays - day),
        progressPercent: Math.round((day / totalDays) * 100),
        currentPhase: getPhaseByDay(day),
        isSimulated: true
      };
    }

    if (!profile || !profile.isStarted || !profile.startDate) {
      return {
        currentDay: 1,
        daysRemaining: 213,
        progressPercent: 1,
        currentPhase: PHASES_DATA[0],
        isSimulated: false
      };
    }

    // Fixed timezone-safe start date parsing
    const start = new Date(profile.startDate);
    const now = new Date();
    // Normalize both to UTC midnight
    const startMidnight = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const nowMidnight = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowMidnight - startMidnight) / (1000 * 60 * 60 * 24));
    
    // Day 1 is the start day itself
    const day = Math.max(1, Math.min(totalDays, diffDays + 1));
    return {
      currentDay: day,
      daysRemaining: Math.max(0, totalDays - day),
      progressPercent: Math.round((day / totalDays) * 100),
      currentPhase: getPhaseByDay(day),
      isSimulated: false
    };
  };

  const dayStats = calculateCurrentDay();
  const journeyStats: JourneyStats = {
    ...dayStats,
    totalDays: 214
  };

  // Calculate XP & Level
  const totalXp = xpTransactions.reduce((acc, t) => acc + t.amount, 0);
  const levelInfo = calculateLevelFromXp(totalXp);

  // Calculate Streak
  const calculateStreak = (): number => {
    const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);
    if (completedTasks.length === 0) return 0;
    
    const dates = Array.from(
      new Set(
        completedTasks.map((t) => t.completedAt!.split('T')[0])
      )
    ).sort().reverse();

    let streakCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Must have activity today or yesterday to continue streak
    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }

    let checkDate = dates.includes(todayStr) ? new Date() : yesterdayDate;
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dStr)) {
        streakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streakCount;
  };

  const streak = calculateStreak();

  // In-app Reminders
  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;
  const activeReminders: string[] = [];
  if (profile?.isStarted) {
    if (pendingTasksCount > 0) {
      activeReminders.push(`لديك ${pendingTasksCount} مهام متبقية اليوم في انتظار إنجازك.`);
    }
    if (journeyStats.currentDay % 7 === 0) {
      activeReminders.push('حان موعد المراجعة الأسبوعية لتقييم الالتزام.');
    }
    if (journeyStats.currentDay === journeyStats.currentPhase.dayEnd - 2) {
      activeReminders.push(`تقترب من ختام ${journeyStats.currentPhase.name}، استعد للمراجعة المرحلية.`);
    }
  }

  // Add XP safely with deduplication
  const addXp = async (amount: number, source: string, reason: string) => {
    const txId = `xp_${source}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const tx: XpTransaction = {
      id: txId,
      amount,
      source,
      reason,
      timestamp: new Date().toISOString()
    };
    await putItem('xp_transactions', tx);
    setXpTransactions((prev) => [...prev, tx]);

    // Check level progression for title unlocks
    const newTotal = totalXp + amount;
    const newLvl = calculateLevelFromXp(newTotal);
    if (newLvl.level > levelInfo.level) {
      const unlockedTitle = titles.find((t) => t.requiredLevel === newLvl.level);
      if (unlockedTitle && !unlockedTitle.unlocked) {
        unlockedTitle.unlocked = true;
        setNewUnlockedTitle(unlockedTitle);
      }
    }
  };

  // Check and unlock achievement
  const triggerUnlockAchievement = async (achId: string) => {
    const ach = achievements.find((a) => a.id === achId);
    if (ach && !ach.unlockedAt) {
      const updated = { ...ach, unlockedAt: new Date().toISOString() };
      await putItem('achievements', updated);
      setAchievements((prev) => prev.map((a) => (a.id === achId ? updated : a)));
      setNewUnlockedAchievement(updated);
      await addXp(50, `ach_${achId}`, `إنجاز وسام: ${ach.title}`);
    }
  };

  // Start Journey
  const startJourney = async (newProfile: UserProfile, initialLetter?: string) => {
    const now = new Date();
    const startDateStr = now.toISOString().split('T')[0];
    const targetEnd = new Date(now);
    targetEnd.setDate(targetEnd.getDate() + 213);
    const targetEndStr = targetEnd.toISOString().split('T')[0];

    const finalizedProfile: UserProfile = {
      ...newProfile,
      isStarted: true,
      startDate: startDateStr,
      targetEndDate: targetEndStr,
      smartAdaptationEnabled: true
    };

    // Save profile with id 'main_profile'
    await putItem('user_profile', { ...finalizedProfile, id: 'main_profile' } as any);
    setProfile(finalizedProfile);

    // Seed starter tasks
    for (const t of STARTER_TASKS) {
      await putItem('tasks', t);
    }
    setTasks(STARTER_TASKS);

    // Seed starter rewards
    for (const r of STARTER_REWARDS) {
      await putItem('rewards', r);
    }

    // Seed starter experiences
    for (const exp of STARTER_EXPERIENCES) {
      await putItem('new_experiences', exp);
    }

    // Save initial letter if provided
    if (initialLetter && initialLetter.trim().length > 0) {
      await putItem('future_letter', {
        id: 'day_214_letter',
        content: initialLetter.trim(),
        sealedDate: startDateStr,
        unlockDay: 214
      });
      await triggerUnlockAchievement('ach_future_letter');
    }

    // First achievement
    await triggerUnlockAchievement('ach_first_step');
    await addXp(100, 'journey_start', 'انطلاق رحلة الـ214 يومًا رسميًا');
  };

  // Update Profile
  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const merged = { ...profile, ...updated };
    await putItem('user_profile', { ...merged, id: 'main_profile' } as any);
    setProfile(merged);
  };

  // Simulate Day
  const simulateDay = (day: number | null) => {
    setSimulatedDayOverride(day);
  };

  // Task Handlers
  const addTask = async (taskData: Omit<AppTask, 'id' | 'createdAt'>) => {
    const newTask: AppTask = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    await putItem('tasks', newTask);
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = async (task: AppTask) => {
    await putItem('tasks', task);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
  };

  const deleteTask = async (taskId: string) => {
    await deleteItem('tasks', taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.status === 'completed') {
      // Revert completion
      const updated: AppTask = {
        ...task,
        status: 'pending',
        completedAt: undefined
      };
      await putItem('tasks', updated);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } else {
      // Mark completed & award XP once
      const updated: AppTask = {
        ...task,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
      await putItem('tasks', updated);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      await addXp(task.xpReward || 20, `task_${taskId}`, `إنجاز مهمة: ${task.title}`);

      // Update corresponding character pathway XP
      const pIndex = pathways.findIndex((p) => p.id === task.pathwayId);
      if (pIndex !== -1) {
        const p = pathways[pIndex];
        const newPathXp = p.xp + (task.xpReward || 20);
        const newPercent = Math.min(100, Math.round((newPathXp / 1000) * 100));
        const updatedPathways = [...pathways];
        updatedPathways[pIndex] = { ...p, xp: newPathXp, progressPercent: newPercent };
        setPathways(updatedPathways);
        await putItem('character_tree', updatedPathways[pIndex]);
      }

      // Check streaks for achievements
      if (streak + 1 >= 7) {
        await triggerUnlockAchievement('ach_streak_7');
      }
      if (streak + 1 >= 30) {
        await triggerUnlockAchievement('ach_streak_30');
      }
    }
  };

  const deferTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newDeferredCount = (task.deferredCount || 0) + 1;
    const updated: AppTask = {
      ...task,
      status: 'deferred',
      deferredCount: newDeferredCount
    };
    await putItem('tasks', updated);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

    // Smart Local Rule: If deferred >= 2 times, generate adaptation suggestion
    if (profile?.smartAdaptationEnabled && newDeferredCount >= 2) {
      const suggestion: SmartAdaptationSuggestion = {
        id: `sugg_defer_${taskId}_${Date.now()}`,
        type: 'split_task',
        title: `تخفيف وتجزئة: "${task.title}"`,
        description: `تأجلت هذه المهمة ${newDeferredCount} مرات. نقترح تقسيمها إلى خطوة مدتها 5 دقائق فقط أو نقل موعدها.`,
        reason: 'تكرار تأجيل المهمة لأكثر من مرتين',
        applied: false,
        rejected: false
      };
      await putItem('smart_suggestions', suggestion);
      setSmartSuggestions((prev) => [...prev, suggestion]);
    }
  };

  const toggleHardDayMode = async (energyLevel: number = 2, reason?: string) => {
    const nextState = !isHardDayMode;
    setIsHardDayMode(nextState);
    if (nextState) {
      await putItem('hard_day_logs', {
        id: `hard_day_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        energyLevel,
        reason,
        microTasksCompleted: []
      });
      await triggerUnlockAchievement('ach_hard_day_survivor');
    }
  };

  const applySmartSuggestion = async (suggestionId: string) => {
    const sugg = smartSuggestions.find((s) => s.id === suggestionId);
    if (!sugg) return;
    const updated = { ...sugg, applied: true };
    await putItem('smart_suggestions', updated);
    setSmartSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
    await addXp(15, `sugg_apply_${suggestionId}`, 'الموافقة على تكيف ذكي بالقواعد المحلية');
  };

  const rejectSmartSuggestion = async (suggestionId: string) => {
    const sugg = smartSuggestions.find((s) => s.id === suggestionId);
    if (!sugg) return;
    const updated = { ...sugg, rejected: true };
    await putItem('smart_suggestions', updated);
    setSmartSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  const dismissAchievementModal = () => setNewUnlockedAchievement(null);
  const dismissTitleModal = () => setNewUnlockedTitle(null);

  return (
    <AppContext.Provider
      value={{
        profile,
        loading,
        journeyStats,
        xp: totalXp,
        levelInfo,
        streak,
        tasks,
        pathways,
        achievements,
        titles,
        isHardDayMode,
        activeReminders,
        smartSuggestions,
        newUnlockedAchievement,
        newUnlockedTitle,
        startJourney,
        updateProfile,
        simulateDay,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        deferTask,
        toggleHardDayMode,
        addXp,
        dismissAchievementModal,
        dismissTitleModal,
        applySmartSuggestion,
        rejectSmartSuggestion,
        refreshAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
