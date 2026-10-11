import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PostJourneyPlan } from '../types';
import { getItem, putItem } from '../db/indexedDB';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';

export const PostJourneyPlanView: React.FC = () => {
  const { addXp, updateProfile } = useApp();
  const [plan, setPlan] = useState<PostJourneyPlan | null>(null);

  // Form states
  const [sustainedHabits, setSustainedHabits] = useState('القراءة اليومية 15 دقيقة، المشي المنتظم، تدوين المهام الصباحية');
  const [adjustedHabits, setAdjustedHabits] = useState('تعديل وقت الرياضة ليكون صباحًا بدلاً من المساء');
  const [longTermGoals, setLongTermGoals] = useState('إتقان المهارة البرمجية، قراءة 12 كتابًا في العام القادم');
  const [weeklyReviewCadence, setWeeklyReviewCadence] = useState('مساء كل يوم جمعة لمدة 20 دقيقة');
  const [hardDayStandard, setHardDayStandard] = useState('شرب الماء، 5 صفحات قراءة، والمحافظة على الهدوء');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const loadPlan = async () => {
      const stored = await getItem<PostJourneyPlan>('post_journey_plan', 'continuity_plan');
      if (stored) {
        setPlan(stored);
        setSustainedHabits(stored.sustainedHabits.join('، '));
        setAdjustedHabits(stored.adjustedHabits.join('، '));
        setLongTermGoals(stored.longTermGoals.join('، '));
        setWeeklyReviewCadence(stored.weeklyReviewCadence);
        setHardDayStandard(stored.hardDayMinimumStandard);
        setIsSaved(true);
      }
    };
    loadPlan();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: PostJourneyPlan = {
      sustainedHabits: sustainedHabits.split('،').map((s) => s.trim()).filter(Boolean),
      adjustedHabits: adjustedHabits.split('،').map((s) => s.trim()).filter(Boolean),
      longTermGoals: longTermGoals.split('،').map((s) => s.trim()).filter(Boolean),
      ongoingProjects: [],
      weeklyReviewCadence,
      hardDayMinimumStandard: hardDayStandard,
      thirtyDayPlanSteps: [
        { title: 'الأسبوع 1: ترسيخ الروتين المستقل دون تنبيهات مكثفة', targetWeek: 1, completed: false },
        { title: 'الأسبوع 2: المراجعة الأسبوعية الذاتية وتعديل الأوزان', targetWeek: 2, completed: false },
        { title: 'الأسبوع 3: مواصلة مشروع المهارة وبناء الأثر', targetWeek: 3, completed: false },
        { title: 'الأسبوع 4: تقييم شهر الاستمرار الأول والتخطيط للعام', targetWeek: 4, completed: false }
      ],
      summaryOfTransformation: 'مرحلة الاستمرار المستدام للحياة بعد الـ 214 يومًا'
    };

    await putItem('post_journey_plan', { ...newPlan, id: 'continuity_plan' } as any);
    setPlan(newPlan);
    setIsSaved(true);
    await updateProfile({ isCompleted: true });
    await addXp(100, 'continuity_plan_saved', 'اعتماد خطة الاستمرار لما بعد الـ 214 يومًا');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">خطة ما بعد اليوم 214</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          التحول لا ينتهي بانتهاء العداد؛ هذا ميثاق الـ 30 يومًا القادمة لتثبيت العادات كأسلوب حياة دائم.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              العادات التي ألتزم بمواصلتها بدون انقطاع:
            </label>
            <textarea
              rows={2}
              value={sustainedHabits}
              onChange={(e) => setSustainedHabits(e.target.value)}
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              العادات التي سأعدل جدولها أو أسلوبها لتصبح أكثر مرونة:
            </label>
            <textarea
              rows={2}
              value={adjustedHabits}
              onChange={(e) => setAdjustedHabits(e.target.value)}
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              الأهداف طويلة المدى للعام القادم:
            </label>
            <textarea
              rows={2}
              value={longTermGoals}
              onChange={(e) => setLongTermGoals(e.target.value)}
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                موعد المراجعة الدورية المستمرة:
              </label>
              <input
                type="text"
                value={weeklyReviewCadence}
                onChange={(e) => setWeeklyReviewCadence(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                الحد الأدنى غير القابل للتنازل في الأيام الصعبة:
              </label>
              <input
                type="text"
                value={hardDayStandard}
                onChange={(e) => setHardDayStandard(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-[#6D1028]/30 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isSaved ? 'تحديث خطة الاستمرار' : 'اعتماد خطة الاستمرار والدخول في وضع الاستدامة (+100 XP)'}</span>
        </button>
      </form>
    </div>
  );
};
