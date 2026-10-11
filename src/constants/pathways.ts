import { CharacterPathway } from '../types';

export const INITIAL_PATHWAYS: CharacterPathway[] = [
  {
    id: 'body_fitness',
    title: 'الجسم واللياقة',
    icon: 'Activity',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'تسجيل النشاط البدني أو المشي اليومي',
    nodes: [
      { id: 'bf_1', title: 'خطوة البداية', description: 'الالتزام بـ 15 دقيقة حركة خفيفة يوميًا لمدة أسبوع', requiredXp: 50, unlocked: true, completed: false },
      { id: 'bf_2', title: 'التناغم البدني', description: 'تسجيل قياسات البداية ومعدل شرب الماء والنوم', requiredXp: 150, unlocked: false, completed: false },
      { id: 'bf_3', title: 'ثبات الأداء', description: 'ممارسة نشاط بدني منتظم 3 مرات أسبوعيًا لـ 30 يومًا', requiredXp: 400, unlocked: false, completed: false },
      { id: 'bf_4', title: 'اللياقة المستدامة', description: 'الوصول إلى مستوى نشاط يحافظ على طاقة اليوم دون إجهاد', requiredXp: 800, unlocked: false, completed: false }
    ]
  },
  {
    id: 'discipline_consistency',
    title: 'الانضباط والاستمرارية',
    icon: 'Shield',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'إكمال مهمة واحدة يومية في موعدها',
    nodes: [
      { id: 'dc_1', title: 'سلسلة البداية', description: 'المحافظة على تسجيل الدخول والمهام لـ 3 أيام متتالية', requiredXp: 45, unlocked: true, completed: false },
      { id: 'dc_2', title: 'العودة السريعة', description: 'تجاوز أول تعثر بالعودة فورًا عبر نظام الإنقاذ', requiredXp: 120, unlocked: false, completed: false },
      { id: 'dc_3', title: 'الانضباط الفولاذي', description: 'إتمام 21 يومًا دون انقطاع يتجاوز يومًا واحدًا', requiredXp: 350, unlocked: false, completed: false },
      { id: 'dc_4', title: 'العادة الراسخة', description: 'تحويل المهام الأساسية إلى سلوك تلقائي غير مشروط بالحماس', requiredXp: 750, unlocked: false, completed: false }
    ]
  },
  {
    id: 'knowledge_reading',
    title: 'المعرفة والقراءة',
    icon: 'BookOpen',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'إضافة أول كتاب وتحديد هدف 5 صفحات يوميًا',
    nodes: [
      { id: 'kr_1', title: 'صفحة الحكمة', description: 'قراءة 10 صفحات وتدوين فكرة جوهرية واحدة', requiredXp: 40, unlocked: true, completed: false },
      { id: 'kr_2', title: 'تطبيق المعرفة', description: 'تحويل فكرة من كتاب إلى مهمة عملية منفذة فعليًا', requiredXp: 130, unlocked: false, completed: false },
      { id: 'kr_3', title: 'القارئ الواعي', description: 'إتمام قراءة كتابين كاملين مع تدوين الملخصات', requiredXp: 320, unlocked: false, completed: false },
      { id: 'kr_4', title: 'بناء النموذج الذهني', description: 'تكوين مكتبة فكرية وتطبيق أفكارها في الحياة اليومية', requiredXp: 700, unlocked: false, completed: false }
    ]
  },
  {
    id: 'skills_projects',
    title: 'المهارات والمشاريع',
    icon: 'Code',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'تحديد مهارة المرحلة الأولى وبدء الخطوة التجريبية',
    nodes: [
      { id: 'sp_1', title: 'نواة المهارة', description: 'اختيار مهارة محددة وتقسيمها إلى 4 خطوات صغيرة', requiredXp: 50, unlocked: true, completed: false },
      { id: 'sp_2', title: 'المشروع الأولي', description: 'إنجاز النموذج المصغر الأول للمشروع وتوثيقه', requiredXp: 160, unlocked: false, completed: false },
      { id: 'sp_3', title: 'إتقان الأدوات', description: 'الممارسة العملية لـ 20 ساعة تراكمية في مهارة محددة', requiredXp: 380, unlocked: false, completed: false },
      { id: 'sp_4', title: 'الأثر الملموس', description: 'إكمال مشروع متكامل يمكن مشاركته أو استخدامه واقعيًا', requiredXp: 850, unlocked: false, completed: false }
    ]
  },
  {
    id: 'time_management',
    title: 'تنظيم الوقت والحياة',
    icon: 'Clock',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'تحديد 3 فترات زمنية رئيسية في المخطط اليومي',
    nodes: [
      { id: 'tm_1', title: 'وعي الساعات', description: 'تسجيل توزيع الوقت الحقيقي ليوم كامل ومعرفة مواضع الهدر', requiredXp: 40, unlocked: true, completed: false },
      { id: 'tm_2', title: 'حماية التركيز', description: 'تخصيص فترات عمل عميق دون تشتت أو شاشات غير ضرورية', requiredXp: 140, unlocked: false, completed: false },
      { id: 'tm_3', title: 'التوازن الأسبوعي', description: 'التوافق بين ساعات النوم والعمل والرياضة والراحة', requiredXp: 340, unlocked: false, completed: false },
      { id: 'tm_4', title: 'سيادة الوقت', description: 'التحكم الهادئ في اليوم وتجنب التدافع وضغط اللحظة الأخيرة', requiredXp: 750, unlocked: false, completed: false }
    ]
  },
  {
    id: 'self_discovery',
    title: 'اكتشاف الذات والسلوك',
    icon: 'Compass',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'كتابة تدوينة تأملية في دفتر اكتشاف الذات اليوم',
    nodes: [
      { id: 'sd_1', title: 'مرآة اليوم', description: 'الإجابة عن أسئلة التأمل اليومية لـ 3 أيام', requiredXp: 45, unlocked: true, completed: false },
      { id: 'sd_2', title: 'فهم المحفزات', description: 'رصد أسباب التسويف أو التراجع وتحليلها بموضوعية', requiredXp: 130, unlocked: false, completed: false },
      { id: 'sd_3', title: 'بوصلة القيم', description: 'تحديد القيم الأساسية الخمس التي تقود قراراتك', requiredXp: 310, unlocked: false, completed: false },
      { id: 'sd_4', title: 'التصالح والوضوح', description: 'امتلاك وعي عميق بنقاط القوة والضعف وكيفية إدارتها', requiredXp: 680, unlocked: false, completed: false }
    ]
  },
  {
    id: 'spiritual_habits',
    title: 'العادات الشخصية والروحية',
    icon: 'Heart',
    level: 1,
    xp: 0,
    progressPercent: 0,
    suggestedNextStep: 'تثبيت عادة الامتنان أو الهدوء الصباحي',
    nodes: [
      { id: 'sh_1', title: 'السكينة الأولى', description: 'المحافظة على روتين شخصي أو روحي هادئ في بداية اليوم', requiredXp: 45, unlocked: true, completed: false },
      { id: 'sh_2', title: 'الامتنان الصادق', description: 'تدوين 3 نعم حقيقية يوميًا لمدة 10 أيام', requiredXp: 130, unlocked: false, completed: false },
      { id: 'sh_3', title: 'النقاء الداخلي', description: 'تقليل الاستهلاك العبثي وتعزيز الحضور الذهني', requiredXp: 330, unlocked: false, completed: false },
      { id: 'sh_4', title: 'الرسوخ', description: 'بناء ركيزة روحية وشخصية تمنح الطمأنينة في أصعب الأيام', requiredXp: 720, unlocked: false, completed: false }
    ]
  }
];
