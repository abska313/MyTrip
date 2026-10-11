import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PathwayId, TaskDifficulty } from '../types';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  Shield
} from 'lucide-react';

interface GeneratedChallenge {
  id: string;
  title: string;
  description: string;
  pathwayId: PathwayId;
  difficulty: TaskDifficulty;
  durationDays: number;
  expectedDailyMinutes: number;
  successCriterion: string;
  suggestedReward: string;
  xpReward: number;
}

const CHALLENGE_TEMPLATES: GeneratedChallenge[] = [
  {
    id: 'ch_temp_1',
    title: 'تحدي الصيام الرقمي الصباحي (7 أيام)',
    description: 'الامتناع التام عن تصفح الأخبار والشبكات الاجتماعية لأول 60 دقيقة بعد الاستيقاظ.',
    pathwayId: 'time_management',
    difficulty: 'متوسط',
    durationDays: 7,
    expectedDailyMinutes: 0,
    successCriterion: 'المحافظة على صفاء الصباح لـ 7 أيام متتالية',
    suggestedReward: 'جلسة قراءة هادئة في مقهى مفضل',
    xpReward: 60
  },
  {
    id: 'ch_temp_2',
    title: 'تحدي المشي الواعي اليومي (10 أيام)',
    description: 'المشي الخفيف لمدة 20 دقيقة يوميًا بدون سماعات أو هاتف لتصفية الذهن.',
    pathwayId: 'body_fitness',
    difficulty: 'سهل',
    durationDays: 10,
    expectedDailyMinutes: 20,
    successCriterion: 'إتمام 10 أيام من المشي المنتظم',
    suggestedReward: 'حمام استرخاء دافئ أو مشروب مفضل',
    xpReward: 70
  },
  {
    id: 'ch_temp_3',
    title: 'تحدي القراءة العميقة وتلخيص 3 أفكار',
    description: 'قراءة 50 صفحة تراكمية واستخراج 3 أفكار تطبيقية مكتوبة في الدفتر.',
    pathwayId: 'knowledge_reading',
    difficulty: 'متوسط',
    durationDays: 5,
    expectedDailyMinutes: 25,
    successCriterion: 'كتابة الأفكار الثلاث في دفتر اكتشاف الذات',
    suggestedReward: 'شراء كتاب جديد يثير الفضول',
    xpReward: 80
  },
  {
    id: 'ch_temp_4',
    title: 'تحدي العمل العميق غير المشتت (5 أيام)',
    description: 'جلسة تركيز واحدة يوميًا مدتها 45 دقيقة بدون أي مقاطعات على مشروعك.',
    pathwayId: 'discipline_consistency',
    difficulty: 'تحدي',
    durationDays: 5,
    expectedDailyMinutes: 45,
    successCriterion: 'إكمال 5 جلسات عمل عميق موثقة',
    suggestedReward: 'مشاهدة فيلم وثائقي استثنائي',
    xpReward: 90
  },
  {
    id: 'ch_temp_5',
    title: 'تحدي الامتنان الصادق الصباحي (14 يومًا)',
    description: 'تدوين 3 نعم دقيقة ومحددة يوميًا في دفتر اكتشاف الذات.',
    pathwayId: 'spiritual_habits',
    difficulty: 'سهل',
    durationDays: 14,
    expectedDailyMinutes: 5,
    successCriterion: '14 تدوينة امتنان مسجلة في الدفتر',
    suggestedReward: 'هدية رمزية للنفس أو التصدق',
    xpReward: 85
  }
];

export const ChallengeGeneratorView: React.FC = () => {
  const { addTask, addXp } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [acceptedChallenges, setAcceptedChallenges] = useState<string[]>([]);

  const challenge = CHALLENGE_TEMPLATES[currentIdx % CHALLENGE_TEMPLATES.length];

  const handleNextChallenge = () => {
    setCurrentIdx((prev) => (prev + 1) % CHALLENGE_TEMPLATES.length);
  };

  const handleAcceptChallenge = async () => {
    await addTask({
      title: `تحدي شخصي: ${challenge.title}`,
      description: `${challenge.description} • معيار النجاح: ${challenge.successCriterion}`,
      pathwayId: challenge.pathwayId,
      difficulty: challenge.difficulty,
      estimatedMinutes: challenge.expectedDailyMinutes || 15,
      status: 'pending',
      frequency: 'weekly',
      xpReward: challenge.xpReward,
      isHardDayApproved: false
    });

    setAcceptedChallenges([...acceptedChallenges, challenge.id]);
    await addXp(20, `accept_ch_${challenge.id}`, `قبول تحدي شخصي جديد: ${challenge.title}`);
    alert('تمت إضافة التحدي إلى جدول مهامك بنجاح!');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">مولّد التحديات الشخصي</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          اقتراحات تحديات ذكية بالقواعد المحلية لكسر الركود ورفع مستوى الالتزام.
        </p>
      </div>

      {/* Challenge Card */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#30262B] pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#922D48]">
            <Sparkles className="w-4 h-4" />
            <span>تحدي مقترح بواسطة القواعد المحلية</span>
          </div>
          <span className="text-[10px] bg-[#0B0B0D] border border-[#30262B] px-2.5 py-1 rounded-lg text-[#AAA2A7]">
            الصعوبة: {challenge.difficulty}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-[#F4F0F1]">{challenge.title}</h3>
          <p className="text-xs text-[#AAA2A7] leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B]">
            <span className="text-[10px] text-[#AAA2A7] block">المدة المقترحة:</span>
            <span className="font-bold text-[#F4F0F1]">{challenge.durationDays} أيام</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B]">
            <span className="text-[10px] text-[#AAA2A7] block">المكافأة الشخصية:</span>
            <span className="font-bold text-[#F4F0F1] truncate block">{challenge.suggestedReward}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#AAA2A7] block">نقاط الخبرة:</span>
            <span className="font-bold text-[#922D48]">+{challenge.xpReward} XP</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs">
          <span className="font-bold text-[#AAA2A7]">معيار النجاح: </span>
          <span className="text-[#F4F0F1]">{challenge.successCriterion}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleAcceptChallenge}
            disabled={acceptedChallenges.includes(challenge.id)}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-[#6D1028]/25 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{acceptedChallenges.includes(challenge.id) ? 'تم قبول التحدي ✓' : 'قبول التحدي وإضافته للمهام'}</span>
          </button>

          <button
            onClick={handleNextChallenge}
            className="p-3.5 rounded-xl border border-[#30262B] bg-[#0B0B0D] text-xs font-bold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition flex items-center gap-1.5"
            title="اقتراح تحدٍ آخر"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">تحدٍ آخر</span>
          </button>
        </div>
      </div>
    </div>
  );
};
