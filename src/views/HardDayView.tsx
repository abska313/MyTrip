import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  HeartPulse,
  CheckCircle2,
  Check,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { putItem } from '../db/indexedDB';

const DEFAULT_MICRO_HABITS = [
  'شرب كوب ماء كبير وأخذ 5 أنفاس عميقة هادئة',
  'قراءة صفحة واحدة فقط من الكتاب المختار',
  'ترتيب مساحة صغيرة (مكتب العمل أو السرير)',
  'المشي أو الإطالة الخفيفة لمدة 5 دقائق إذا سمحت الصحة',
  'تدوين سطر تأمل واحد في دفتر اكتشاف الذات',
  'تحديد أهم مهمة وحيدة ليوم غد والنوم المبكر'
];

export const HardDayView: React.FC<{ onBackToDashboard: () => void }> = ({ onBackToDashboard }) => {
  const { isHardDayMode, toggleHardDayMode, addXp } = useApp();
  const [energyLevel, setEnergyLevel] = useState(2);
  const [reason, setReason] = useState('إرهاق بدني وحاجة للراحة');
  const [completedMicro, setCompletedMicro] = useState<string[]>([]);
  const [customMicroInput, setCustomMicroInput] = useState('');
  const [microHabitsList, setMicroHabitsList] = useState(DEFAULT_MICRO_HABITS);

  const toggleMicro = async (habit: string) => {
    let nextList: string[];
    if (completedMicro.includes(habit)) {
      nextList = completedMicro.filter((h) => h !== habit);
    } else {
      nextList = [...completedMicro, habit];
      await addXp(10, `micro_${Date.now()}`, `إنجاز عادة مصغرة في اليوم الصعب: ${habit}`);
    }
    setCompletedMicro(nextList);

    // Save to hard day log
    await putItem('hard_day_logs', {
      id: `hard_day_${new Date().toISOString().split('T')[0]}`,
      date: new Date().toISOString().split('T')[0],
      energyLevel,
      reason,
      microTasksCompleted: nextList
    });
  };

  const addCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMicroInput.trim()) {
      setMicroHabitsList([...microHabitsList, customMicroInput.trim()]);
      setCustomMicroInput('');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-amber-600/50 bg-gradient-to-b from-[#151316] to-[#0B0B0D] p-6 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-950/40 px-3 py-1 text-xs text-amber-300">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>وضع المرونة واليوم الصعب</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">
          إدارة الأيام ذات الطاقة المنخفضة
        </h2>
        <p className="text-xs text-[#AAA2A7] leading-relaxed max-w-xl">
          في الأيام التي تنخفض فيها طاقتك أو تثقل الظروف كاهلك، لا تضغط على نفسك بقائمة مهام مستحيلة. الهدف هو المحافظة على خيط الحضور ولو عبر عادات مصغرة لا تتجاوز دقائق.
        </p>

        <div className="pt-2">
          <button
            onClick={() => toggleHardDayMode(energyLevel, reason)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              isHardDayMode
                ? 'bg-amber-600 text-white'
                : 'bg-[#6D1028] text-white hover:bg-[#922D48]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isHardDayMode ? 'الوضع مُفعّل حاليًا (إلغاء التفعيل)' : 'تفعيل وضع اليوم الصعب لليوم'}</span>
          </button>
        </div>
      </div>

      {/* Energy Rating & Reason */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <h3 className="text-xs font-bold text-[#F4F0F1]">تقييم طاقة اليوم والسبب:</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setEnergyLevel(lvl)}
              className={`p-2.5 rounded-xl border transition flex flex-col items-center gap-1 ${
                energyLevel === lvl
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                  : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7]'
              }`}
            >
              <span className="font-extrabold">{lvl}</span>
              <span className="text-[10px]">{lvl <= 2 ? 'منخفض' : lvl === 3 ? 'متوسط' : 'عالي'}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
            السبب المباشر لضغط اليوم (اختياري):
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          />
        </div>
      </div>

      {/* Proposed Micro-Habits List */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <div>
            <h3 className="text-sm font-bold text-[#F4F0F1]">قائمة المهام المصغرة الواقعية</h3>
            <p className="text-[11px] text-[#AAA2A7] mt-0.5">
              يكفيك إنجاز واحدة أو اثنتين لتسجيل يوم ناجح ومليء بالحضور.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-400">
            {completedMicro.length} / {microHabitsList.length} مكتمل
          </span>
        </div>

        <div className="space-y-2">
          {microHabitsList.map((habit, idx) => {
            const isDone = completedMicro.includes(habit);
            return (
              <div
                key={idx}
                onClick={() => toggleMicro(habit)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                  isDone
                    ? 'border-emerald-600/60 bg-emerald-950/20 text-[#AAA2A7]'
                    : 'border-[#30262B] bg-[#0B0B0D] text-[#F4F0F1] hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                    isDone ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-[#30262B]'
                  }`}>
                    {isDone && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs font-semibold ${isDone ? 'line-through text-[#AAA2A7]' : 'text-[#F4F0F1]'}`}>
                    {habit}
                  </span>
                </div>
                <span className="text-[10px] text-amber-400 font-bold">+10 XP</span>
              </div>
            );
          })}
        </div>

        {/* Add custom micro-habit */}
        <form onSubmit={addCustomHabit} className="flex gap-2 pt-2 border-t border-[#30262B]">
          <input
            type="text"
            placeholder="أضف مهمة مصغرة خاصة بك..."
            value={customMicroInput}
            onChange={(e) => setCustomMicroInput(e.target.value)}
            className="flex-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onBackToDashboard}
          className="text-xs text-[#AAA2A7] hover:text-[#F4F0F1] underline"
        >
          العودة إلى لوحة القيادة الرئيسية
        </button>
      </div>
    </div>
  );
};
