import { AppTask, RewardItem, NewExperience } from '../types';

export const STARTER_TASKS: AppTask[] = [
  {
    id: 'starter_task_1',
    title: 'تحديد أهم 3 مهام لليوم',
    description: 'كتابة أولويات اليوم والبدء بالأهم دون تأجيل',
    pathwayId: 'discipline_consistency',
    difficulty: 'سهل',
    estimatedMinutes: 5,
    scheduledTime: '08:00',
    status: 'pending',
    frequency: 'daily',
    xpReward: 20,
    isHardDayApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter_task_2',
    title: '15 دقيقة حركة ونشاط بدني',
    description: 'مشي خفيف أو إطالات وتمرين تنفس لرفع الحيوية',
    pathwayId: 'body_fitness',
    difficulty: 'سهل',
    estimatedMinutes: 15,
    scheduledTime: '17:00',
    status: 'pending',
    frequency: 'daily',
    xpReward: 25,
    isHardDayApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter_task_3',
    title: 'قراءة 5 صفحات وتدوين فكرة',
    description: 'تخصيص وقت هادئ للقراءة دون شاشات',
    pathwayId: 'knowledge_reading',
    difficulty: 'سهل',
    estimatedMinutes: 15,
    scheduledTime: '21:00',
    status: 'pending',
    frequency: 'daily',
    xpReward: 25,
    isHardDayApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'starter_task_4',
    title: 'مراجعة ختام اليوم وتدوين التأمل',
    description: 'تسجيل ما سار جيدًا في دفتر اكتشاف الذات',
    pathwayId: 'self_discovery',
    difficulty: 'سهل',
    estimatedMinutes: 10,
    scheduledTime: '22:30',
    status: 'pending',
    frequency: 'daily',
    xpReward: 20,
    isHardDayApproved: true,
    createdAt: new Date().toISOString()
  }
];

export const STARTER_REWARDS: RewardItem[] = [
  {
    id: 'rew_1',
    title: 'مشاهدة فيلم وثائقي أو سينمائي ممتع في عطلة نهاية الأسبوع',
    condition: 'إتمام 7 أيام من الالتزام بسلسلة المهام',
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 'rew_2',
    title: 'شراء كتاب جديد يثير الفضول الفكري',
    condition: 'إنهاء قراءة الكتاب الحالي وتدوين تطبيقه العملي',
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 'rew_3',
    title: 'جلسة قهوة خاصة في مكان هادئ مفضل بدون هاتف لمدة ساعة',
    condition: 'إتمام المرحلة الأولى واعتماد تقريرها',
    isUnlocked: false,
    isClaimed: false
  },
  {
    id: 'rew_4',
    title: 'شراء أداة أو مورد يطور مهارة المشروع الحالي',
    condition: 'إنجاز 50% من معالم مشروع المهارة',
    isUnlocked: false,
    isClaimed: false
  }
];

export const STARTER_EXPERIENCES: NewExperience[] = [
  {
    id: 'exp_1',
    title: 'المشي في مسار طبيعي جديد لم أزره من قبل',
    reason: 'تجديد الاتصال بالطبيعة وتصفية الذهن',
    excitementLevel: 5,
    expectedDuration: 'ساعتان',
    status: 'planned'
  },
  {
    id: 'exp_2',
    title: 'يوم كامل بدون شبكات تواصل اجتماعي',
    reason: 'اختبار الحضور الذهني وملاحظة أين يذهب التشتت',
    excitementLevel: 4,
    expectedDuration: '24 ساعة',
    status: 'planned'
  },
  {
    id: 'exp_3',
    title: 'تجربة كتابة مقال أو فكرة شخصية ومراجعتها بصوت مسموع',
    reason: 'تحسين التعبير الذاتي وترتيب الأفكار',
    excitementLevel: 4,
    expectedDuration: 'ساعة واحدة',
    status: 'planned'
  }
];
