import { Achievement, UserTitle } from '../types';

export const USER_TITLES: UserTitle[] = [
  { id: 't_1', name: 'المستكشف الواعي', description: 'المستوى 1: بداية إدراك العادات وتوثيق المسار', requiredLevel: 1, unlocked: true },
  { id: 't_2', name: 'الباني المنضبط', description: 'المستوى 2: ترسيخ الروتين اليومي وبناء الاستمرارية', requiredLevel: 2, unlocked: false },
  { id: 't_3', name: 'الصامد المتزن', description: 'المستوى 3: تجاوز العقبات وإتقان إدارة الأيام الصعبة', requiredLevel: 3, unlocked: false },
  { id: 't_4', name: 'القارئ المفكّر', description: 'المستوى 4: تحويل المعرفة والكتب إلى قرارات عملية', requiredLevel: 4, unlocked: false },
  { id: 't_5', name: 'صانع المهارة', description: 'المستوى 5: إنجاز مشاريع ملموسة وتطوير كفاءة جديدة', requiredLevel: 5, unlocked: false },
  { id: 't_6', name: 'سيّد وقته', description: 'المستوى 6: التناغم العالي والسيطرة الهادئة على الساعات', requiredLevel: 6, unlocked: false },
  { id: 't_7', name: 'المتحوّل الشامل', description: 'المستوى 7: اكتمال رحلة الـ214 يومًا بوعي وتمكن', requiredLevel: 7, unlocked: false },
  { id: 't_8', name: 'المستدام الراسخ', description: 'المستوى 8: نقل التحول إلى أسلوب حياة دائم', requiredLevel: 8, unlocked: false }
];

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'الخطوة الأولى',
    description: 'بدء رحلة الـ214 يومًا رسميًا واعتماد خط الأساس',
    icon: 'Sparkles',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_future_letter',
    title: 'كاتب الوعد',
    description: 'كتابة وإيداع رسالة لنفسك المستقبلية في اليوم الأول',
    icon: 'Mail',
    category: 'self_discovery',
    isWeightNeutral: true
  },
  {
    id: 'ach_contract_signed',
    title: 'ملتزم بالعهد',
    description: 'توقيع واعتماد أول عقد لمرحلة الـ 30 يومًا',
    icon: 'Scroll',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_first_book',
    title: 'أول كتاب مكتمل',
    description: 'إنهاء قراءة أول كتاب واستخراج تطبيق عملي منه',
    icon: 'BookOpen',
    category: 'knowledge_reading',
    isWeightNeutral: true
  },
  {
    id: 'ach_first_project',
    title: 'صانع المشاريع',
    description: 'إنجاز أول مشروع مهارة عملي بالكامل وتوثيق مخرجه',
    icon: 'Briefcase',
    category: 'skills_projects',
    isWeightNeutral: true
  },
  {
    id: 'ach_comeback_hero',
    title: 'عائد بقوة',
    description: 'العودة للمسار عبر نظام الإنقاذ بعد تعثر أو انقطاع دون استسلام',
    icon: 'RefreshCw',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_hard_day_survivor',
    title: 'الصامد في العاصفة',
    description: 'تفعيل وضع اليوم الصعب وإنجاز المهام المصغرة بدلاً من الانقطاع',
    icon: 'Shield',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_streak_7',
    title: 'أسبوع من الرسوخ',
    description: 'المحافظة على سلسلة استمرارية لـ 7 أيام متتالية',
    icon: 'Flame',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_streak_30',
    title: 'شهر من الإنجاز',
    description: 'إكمال 30 يومًا من الالتزام اليومي الفعلي',
    icon: 'Award',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_deep_reflection',
    title: 'صادق مع نفسه',
    description: 'تسجيل 10 تدوينات تأملية في دفتر اكتشاف الذات',
    icon: 'Feather',
    category: 'self_discovery',
    isWeightNeutral: true
  },
  {
    id: 'ach_time_master',
    title: 'منظم الأسبوع',
    description: 'تنظيم 5 أيام متتالية في المخطط الزمني ومقارنة التوزيع',
    icon: 'Clock',
    category: 'time_management',
    isWeightNeutral: true
  },
  {
    id: 'ach_first_experience',
    title: 'مستكشف التجارب',
    description: 'خوض أول تجربة جديدة من قائمة التجارب وتوثيق انطباعاتها',
    icon: 'Compass',
    category: 'general',
    isWeightNeutral: true
  },
  {
    id: 'ach_reward_claimed',
    title: 'مكافئ النفس المستحق',
    description: 'فتح واستحقاق أول مكافأة آمنة من بنك المكافآت',
    icon: 'Gift',
    category: 'general',
    isWeightNeutral: true
  },
  {
    id: 'ach_body_vitality',
    title: 'نشاط وحيوية',
    description: 'تسجيل 20 جلسة حركة أو نشاط بدني منتظم',
    icon: 'Activity',
    category: 'body_fitness',
    isWeightNeutral: true
  },
  {
    id: 'ach_phase_1_done',
    title: 'مجتاز التأسيس',
    description: 'إتمام المرحلة الأولى (30 يومًا) وتوثيق التقرير المرحلي',
    icon: 'CheckCircle',
    category: 'discipline_consistency',
    isWeightNeutral: true
  },
  {
    id: 'ach_day_214_grand',
    title: 'أسطورة الـ 214 يومًا',
    description: 'الوصول إلى نهاية رحلة الـ214 يومًا وفتح رسالة البداية',
    icon: 'Crown',
    category: 'general',
    isWeightNeutral: true
  }
];

export function calculateLevelFromXp(xp: number): { level: number; title: string; nextLevelXp: number; currentLevelFloorXp: number } {
  // Levels:
  // Level 1: 0 - 200 XP
  // Level 2: 200 - 550 XP
  // Level 3: 550 - 1100 XP
  // Level 4: 1100 - 1900 XP
  // Level 5: 1900 - 3000 XP
  // Level 6: 3000 - 4500 XP
  // Level 7: 4500 - 6500 XP
  // Level 8+: 6500+ XP
  const thresholds = [0, 200, 550, 1100, 1900, 3000, 4500, 6500];
  let level = 1;
  for (let i = 1; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const titleObj = USER_TITLES.find((t) => t.requiredLevel === level) || USER_TITLES[USER_TITLES.length - 1];
  const currentFloor = thresholds[level - 1] || 0;
  const nextXp = thresholds[level] || currentFloor + 2500;

  return {
    level,
    title: titleObj.name,
    nextLevelXp: nextXp,
    currentLevelFloorXp: currentFloor
  };
}
