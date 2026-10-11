import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ComebackLog } from '../types';
import { getItem, putItem, getAllItems } from '../db/indexedDB';
import {
  RefreshCw,
  Heart,
  CheckCircle2,
  Sparkles,
  Shield,
  ArrowLeft,
  Calendar
} from 'lucide-react';

const REASONS_LIST = [
  'ضيق الوقت وتراكم الواجبات',
  'انخفاض الطاقة والإرهاق البدني',
  'كثرة المهام والشعور بالثقل',
  'التشتت واستخدام الهاتف والشاشات',
  'ظروف أسرية أو طارئة خارج الإرادة',
  'تقلب المشاعر وفقدان الحماس المؤقت',
  'المرض أو حاجة الجسم للراحة'
];

const MICRO_STEPS = [
  'شرب كوب ماء والجلوس بهدوء لـ 5 دقائق',
  'قراءة صفحة واحدة فقط من كتاب',
  'مشي خفيف لمدة 10 دقائق لتنشيط الدورة الدموية',
  'إنجاز خطوة صغيرة مدتها دقيقتان في مهمة واحدة',
  'كتابة ما يدور في ذهني في دفتر اكتشاف الذات',
  'تجهيز قائمة مهام مصغرة ليوم غد والنوم باكرًا'
];

interface ComebackViewProps {
  onBackToDashboard: () => void;
}

export const ComebackView: React.FC<ComebackViewProps> = ({ onBackToDashboard }) => {
  const { addXp } = useApp();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedMicroStep, setSelectedMicroStep] = useState<string>(MICRO_STEPS[0]);
  const [preventionPlan, setPreventionPlan] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [comebackHistory, setComebackHistory] = useState<ComebackLog[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getAllItems<ComebackLog>('comeback_logs');
      setComebackHistory(history.sort((a, b) => b.date.localeCompare(a.date)));
    };
    loadHistory();
  }, []);

  const toggleReason = (r: string) => {
    if (selectedReasons.includes(r)) {
      setSelectedReasons(selectedReasons.filter((item) => item !== r));
    } else {
      setSelectedReasons([...selectedReasons, r]);
    }
  };

  const handleSaveComeback = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const log: ComebackLog = {
      id: `comeback_${Date.now()}`,
      date: today,
      reasons: selectedReasons,
      chosenMicroStep: selectedMicroStep,
      preventionPlan: preventionPlan.trim() || 'الاستمرار بالخطوات الصغيرة الهادئة',
      resumedPlanNotes: 'تمت العودة بنجاح وتقليص الحمل الزائد'
    };

    await putItem('comeback_logs', log);
    setComebackHistory((prev) => [log, ...prev]);
    setIsSaved(true);
    await addXp(35, `comeback_${log.id}`, 'العودة إلى المسار بنجاح وبناء المرونة');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Gentle Non-Judgmental Hero */}
      <div className="rounded-3xl border border-[#30262B] bg-gradient-to-b from-[#151316] to-[#0B0B0D] p-6 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#30262B] bg-[#0B0B0D] px-3 py-1 text-xs text-[#AAA2A7]">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span>نظام الإنقاذ الهادئ</span>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">
          العودة إلى المسار — مرحبًا بك من جديد
        </h2>
        <p className="text-xs text-[#AAA2A7] leading-relaxed max-w-xl">
          التعثر ليس فشلًا، والانقطاع جزء طبيعي من أي رحلة تحول حقيقية. يومك الحالي مستمر، نقاطك محفوظة، ولا يوجد تصفير. الأهم دائمًا هو <strong>تقليص المسافة بين السقوط والنهوض</strong>.
        </p>
      </div>

      {!isSaved ? (
        <form onSubmit={handleSaveComeback} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
          {/* Reason Multi-Select */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#F4F0F1]">
              1. ما الأسباب أو الظروف التي ساهمت في التراجع مؤخرًا؟ (اختر ما ينطبق):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REASONS_LIST.map((reason) => {
                const isSelected = selectedReasons.includes(reason);
                return (
                  <button
                    type="button"
                    key={reason}
                    onClick={() => toggleReason(reason)}
                    className={`p-3 rounded-xl border text-right text-xs transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-[#922D48] bg-[#6D1028]/25 text-[#F4F0F1]'
                        : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
                    }`}
                  >
                    <span>{reason}</span>
                    <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] ${
                      isSelected ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B]'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Micro-Step Choice */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#F4F0F1]">
              2. اختر خطوة واحدة متناهية الصغر لبدء استعادة الزخم اليوم:
            </label>
            <div className="space-y-2">
              {MICRO_STEPS.map((step) => {
                const isSelected = selectedMicroStep === step;
                return (
                  <div
                    key={step}
                    onClick={() => setSelectedMicroStep(step)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-[#922D48] bg-[#6D1028]/25 text-[#F4F0F1]'
                        : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B]'
                    }`}>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prevention Note */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#F4F0F1]">
              3. خطوة وقائية لتجنب الضغط المماثل في الأيام القادمة:
            </label>
            <textarea
              rows={2}
              placeholder="مثال: سأحدد مهمتين فقط يوميًا بدلاً من خمس مهام حتى يعود الاستقرار..."
              value={preventionPlan}
              onChange={(e) => setPreventionPlan(e.target.value)}
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-3 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-[#6D1028]/30 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>توثيق العودة واستئناف المسار (+35 XP)</span>
          </button>
        </form>
      ) : (
        <div className="rounded-3xl border border-emerald-600/60 bg-[#151316] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#F4F0F1]">تم تسجيل عودتك بنجاح</h3>
          <p className="text-xs text-[#AAA2A7] max-w-md mx-auto leading-relaxed">
            لقد أثبتت مرونتك اليوم. ركّز فقط على خطوتك المصغرة: <strong>«{selectedMicroStep}»</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToDashboard}
              className="px-6 py-2.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
            >
              الذهاب إلى لوحة القيادة
            </button>
          </div>
        </div>
      )}

      {/* Comeback History Logs */}
      {comebackHistory.length > 0 && (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
            <Shield className="w-4 h-4 text-[#922D48]" />
            <span>سجل مرات التعافي والعودة السابقة ({comebackHistory.length} مرات):</span>
          </div>
          <div className="space-y-2">
            {comebackHistory.map((item) => (
              <div key={item.id} className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#AAA2A7]">
                  <span className="flex items-center gap-1.5 font-bold text-[#F4F0F1]">
                    <Calendar className="w-3.5 h-3.5 text-[#922D48]" />
                    <span>{item.date}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">تمت العودة بنجاح ✓</span>
                </div>
                <div className="text-[11px] text-[#AAA2A7]">
                  الخطوة التي تم اعتمادها: {item.chosenMicroStep}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
