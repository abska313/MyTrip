import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppTask, JournalEntry, ComebackLog } from '../types';
import { getAllItems } from '../db/indexedDB';
import {
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const BehaviorAnalyticsView: React.FC = () => {
  const { tasks } = useApp();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [comebacks, setComebacks] = useState<ComebackLog[]>([]);

  useEffect(() => {
    const loadLogs = async () => {
      const storedJournals = await getAllItems<JournalEntry>('journal');
      const storedComebacks = await getAllItems<ComebackLog>('comeback_logs');
      setJournals(storedJournals);
      setComebacks(storedComebacks);
    };
    loadLogs();
  }, []);

  // Analysis calculations
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const totalDeferred = tasks.filter((t) => (t.deferredCount || 0) > 0 || t.status === 'deferred').length;
  const deferredTasksList = tasks
    .filter((t) => (t.deferredCount || 0) > 0)
    .sort((a, b) => (b.deferredCount || 0) - (a.deferredCount || 0));

  // Time slots analysis
  const morningTasks = tasks.filter((t) => t.scheduledTime && t.scheduledTime < '12:00');
  const eveningTasks = tasks.filter((t) => t.scheduledTime && t.scheduledTime >= '17:00');

  const morningCompleted = morningTasks.filter((t) => t.status === 'completed').length;
  const eveningCompleted = eveningTasks.filter((t) => t.status === 'completed').length;

  const totalLogsCount = tasks.length + journals.length + comebacks.length;
  const isDataSufficient = totalLogsCount >= 5;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">تحليل السلوك والعادات</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          استنتاجات مبنية على سجلاتك الفعلية فقط لمساعدتك على ضبط التوقيت وتخفيف الاحتكاك.
        </p>
      </div>

      {/* Sample Size Transparency Notice */}
      <div className="rounded-2xl border border-[#30262B] bg-[#151316] p-4 text-xs text-[#AAA2A7] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#922D48]" />
          <span>
            يستند التحليل الحالي إلى <strong>{totalLogsCount} سجلات فعلية</strong> مسجلة في هذا الجهاز.
          </span>
        </div>
        <span className="text-[10px] bg-[#0B0B0D] px-2 py-0.5 rounded border border-[#30262B]">
          {isDataSufficient ? 'عينة جيدة' : 'بيانات قيد التكوين'}
        </span>
      </div>

      {!isDataSufficient ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">البيانات غير كافية لتقديم تحليل إحصائي عميق بعد</h3>
          <p className="text-xs text-[#AAA2A7] max-w-md mx-auto leading-relaxed">
            التحليل لا يختلق نسبًا عشوائية. استمر في تسجيل مهامك وملاحظاتك اليومية لعدة أيام لتبدأ الأنماط الحقيقية بالظهور.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Postponed patterns */}
            <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
                <Clock className="w-4 h-4 text-[#922D48]" />
                <span>المهام الأكثر عرضة للتأجيل:</span>
              </div>
              {deferredTasksList.length > 0 ? (
                <div className="space-y-2">
                  {deferredTasksList.slice(0, 3).map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#30262B] text-xs flex justify-between items-center">
                      <span className="font-semibold text-[#F4F0F1]">{t.title}</span>
                      <span className="text-amber-400 text-[11px]">تأجلت {t.deferredCount} مرات</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#AAA2A7] pt-1">
                    💡 <em>اقتراح:</em> إذا كانت المهمة تتأجل باستمرار، جرّب تقليص مدتها إلى 5 دقائق أو نقلها لوقت الصباح.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#AAA2A7]">
                  سجلاتك تشير إلى التزام ممتاز دون تكرار ملحوظ في تأجيل المهام.
                </p>
              )}
            </div>

            {/* Timing insight */}
            <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>فترات اليوم الأكثر إنتاجية:</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] flex justify-between items-center">
                  <span>المهام الصباحية (قبل 12:00)</span>
                  <span className="font-bold text-[#F4F0F1]">{morningCompleted} مكتملة</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] flex justify-between items-center">
                  <span>المهام المسائية (بعد 17:00)</span>
                  <span className="font-bold text-[#F4F0F1]">{eveningCompleted} مكتملة</span>
                </div>
                <p className="text-[11px] text-[#AAA2A7] pt-1">
                  💡 إنجاز المهام الاستراتيجية الصعبة في الفترة الصباحية يحقق استمرارية أعلى بنسبة ملحوظة.
                </p>
              </div>
            </div>
          </div>

          {/* Comeback Causes Breakdown */}
          {comebacks.length > 0 && (
            <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#F4F0F1]">أبرز مسببات التراجع والتعثر وفق اختياراتك:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(comebacks.flatMap((c) => c.reasons))).map((r, i) => (
                  <span key={i} className="text-xs bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 rounded-xl text-[#F4F0F1]">
                    • {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
