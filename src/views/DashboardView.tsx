import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Flame,
  Award,
  Calendar,
  Zap,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Compass,
  Sparkles,
  ShieldAlert,
  Plus,
  RefreshCw,
  HeartPulse
} from 'lucide-react';
import { getItem, putItem } from '../db/indexedDB';
import { WeightLossCounter } from '../components/WeightLossCounter';
import { BeforeAfterPhotosWidget } from '../components/BeforeAfterPhotosWidget';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickLog: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenQuickLog }) => {
  const {
    profile,
    journeyStats,
    xp,
    levelInfo,
    streak,
    tasks,
    toggleTaskComplete,
    isHardDayMode,
    toggleHardDayMode,
    activeReminders,
    smartSuggestions,
    applySmartSuggestion,
    rejectSmartSuggestion,
    pathways
  } = useApp();

  const [todayEnergy, setTodayEnergy] = useState<number | null>(null);

  // Load today's energy if already recorded
  useEffect(() => {
    const loadTodayEnergy = async () => {
      const today = new Date().toISOString().split('T')[0];
      const entry = await getItem<{ energyLevel?: number }>('journal', `entry_${today}`);
      if (entry && entry.energyLevel) {
        setTodayEnergy(entry.energyLevel);
      }
    };
    loadTodayEnergy();
  }, []);

  const handleSaveEnergy = async (lvl: number) => {
    setTodayEnergy(lvl);
    const today = new Date().toISOString().split('T')[0];
    const existing = (await getItem<any>('journal', `entry_${today}`)) || {
      id: `entry_${today}`,
      date: today,
      wentWell: '',
      wasHard: '',
      learnedAboutSelf: '',
      habitToUnderstand: '',
      canChangeTomorrow: '',
      gratitude: '',
      coreValues: '',
      freeText: ''
    };
    await putItem('journal', { ...existing, energyLevel: lvl });
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = profile?.name ? `يا ${profile.name}` : '';
    if (hour >= 4 && hour < 12) return `صباح الهمّة والوعي ${name}`;
    if (hour >= 12 && hour < 17) return `طاب يومك بالإنتاج والسكينة ${name}`;
    if (hour >= 17 && hour < 22) return `مساء التقدير والإنجاز ${name}`;
    return `ليلة هادئة ومريحة ${name}`;
  };

  // Today's tasks
  const todayTasks = tasks.slice(0, 5);
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0;

  // Multi-domain progress snapshot
  const activePathwaysWithProgress = pathways.filter((p) => p.xp > 0 || p.level > 1);

  return (
    <div className="space-y-6 pb-24">
      {/* Active Reminders Banner */}
      {activeReminders.length > 0 && (
        <div className="rounded-2xl border border-[#30262B] bg-[#151316] p-3 text-xs flex items-center justify-between gap-3 text-[#AAA2A7]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#922D48] animate-pulse" />
            <span>{activeReminders[0]}</span>
          </div>
          {activeReminders.length > 1 && (
            <span className="text-[10px] text-[#AAA2A7] bg-[#0B0B0D] px-2 py-0.5 rounded-md border border-[#30262B]">
              +{activeReminders.length - 1} تنبيهات
            </span>
          )}
        </div>
      )}

      {/* Smart Rule-Based Adaptation Suggestion Banner */}
      {smartSuggestions.length > 0 && (
        <div className="rounded-2xl border border-[#922D48]/60 bg-[#3B0A18]/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
              <Sparkles className="w-4 h-4 text-[#922D48]" />
              <span>اقتراح تكيّف ذكي بالقواعد المحلية:</span>
            </div>
            <span className="text-[10px] text-[#AAA2A7]">قابل للاختيار والموافقة</span>
          </div>
          <div className="text-xs text-[#F4F0F1] font-semibold">
            {smartSuggestions[0].title}
          </div>
          <p className="text-[11px] text-[#AAA2A7] leading-relaxed">
            {smartSuggestions[0].description}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => applySmartSuggestion(smartSuggestions[0].id)}
              className="px-3.5 py-1.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
            >
              موافق وتطبيق التعديل
            </button>
            <button
              onClick={() => rejectSmartSuggestion(smartSuggestions[0].id)}
              className="px-3.5 py-1.5 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white transition"
            >
              إبقاء الخطة كما هي
            </button>
          </div>
        </div>
      )}

      {/* Cinematic Hero: Journey Day 214 */}
      <div className="relative overflow-hidden rounded-3xl border border-[#30262B] bg-gradient-to-b from-[#151316] to-[#0B0B0D] p-6 shadow-2xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#6D1028]/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#30262B] bg-[#0B0B0D]/80 px-3 py-1 text-xs text-[#AAA2A7]">
              <Calendar className="w-3.5 h-3.5 text-[#922D48]" />
              <span>{journeyStats.currentPhase.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#F4F0F1]">
              {getGreeting()}
            </h1>
            <p className="text-xs text-[#AAA2A7] leading-relaxed max-w-md">
              {journeyStats.currentPhase.subtitle} • {journeyStats.currentPhase.theme}
            </p>
          </div>

          {/* Day Display Badge */}
          <div className="flex items-center gap-4 bg-[#0B0B0D]/80 border border-[#30262B] rounded-2xl p-4 self-start md:self-auto">
            <div className="text-center pl-4 border-l border-[#30262B]">
              <div className="text-[11px] font-semibold text-[#AAA2A7]">اليوم الحالي</div>
              <div className="text-3xl font-black text-[#F4F0F1] flex items-baseline justify-center gap-1">
                <span>{journeyStats.currentDay}</span>
                <span className="text-xs text-[#AAA2A7] font-medium">/ 214</span>
              </div>
            </div>
            <div className="text-center pr-2">
              <div className="text-[11px] font-semibold text-[#AAA2A7]">المتبقي</div>
              <div className="text-2xl font-black text-[#922D48]">
                {journeyStats.daysRemaining} <span className="text-xs text-[#AAA2A7]">يومًا</span>
              </div>
            </div>
          </div>
        </div>

        {/* Temporal Progress Bar */}
        <div className="mt-6 pt-4 border-t border-[#30262B]">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-[#AAA2A7] font-medium">التقدم الزمني للرحلة:</span>
            <span className="font-bold text-[#F4F0F1]">{journeyStats.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#0B0B0D] rounded-full overflow-hidden border border-[#30262B]">
            <div
              className="h-full bg-gradient-to-r from-[#6D1028] via-[#922D48] to-[#6D1028] rounded-full transition-all duration-500"
              style={{ width: `${journeyStats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Level, XP & Streak Pills */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex items-center gap-2.5 bg-[#151316] border border-[#30262B] rounded-xl p-2.5">
            <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="text-xs min-w-0">
              <div className="text-[10px] text-[#AAA2A7] truncate">اللقب الحالي</div>
              <div className="font-bold text-[#F4F0F1] truncate">{levelInfo.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-[#151316] border border-[#30262B] rounded-xl p-2.5">
            <Zap className="w-5 h-5 text-[#922D48] flex-shrink-0" />
            <div className="text-xs min-w-0">
              <div className="text-[10px] text-[#AAA2A7] truncate">نقاط الخبرة (XP)</div>
              <div className="font-bold text-[#F4F0F1]">{xp} نقطة</div>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 flex items-center gap-2.5 bg-[#151316] border border-[#30262B] rounded-xl p-2.5">
            <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="text-xs min-w-0">
              <div className="text-[10px] text-[#AAA2A7]">سلسلة الاستمرارية</div>
              <div className="font-bold text-[#F4F0F1]">{streak} أيام متواصلة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('tasks')}
          className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-95 active:scale-98 transition group"
        >
          <div className="text-right">
            <div className="text-sm font-bold">ابدأ مهام اليوم</div>
            <div className="text-[11px] text-white/80 mt-0.5">{tasks.filter((t) => t.status !== 'completed').length} مهام معلقة</div>
          </div>
          <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition" />
        </button>

        <button
          onClick={() => toggleHardDayMode()}
          className={`flex items-center justify-between p-4 rounded-2xl border transition text-right ${
            isHardDayMode
              ? 'border-amber-500/80 bg-amber-950/30 text-amber-200'
              : 'border-[#30262B] bg-[#151316] text-[#F4F0F1] hover:border-[#6D1028]'
          }`}
        >
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#922D48]" />
              <span>{isHardDayMode ? 'وضع اليوم الصعب (مُفعّل)' : 'وضع اليوم الصعب'}</span>
            </div>
            <div className="text-[11px] text-[#AAA2A7] mt-0.5">
              {isHardDayMode ? 'تقليص الخطة إلى الحد الأدنى' : 'تخفيف المهام عند انخفاض الطاقة'}
            </div>
          </div>
        </button>

        <button
          onClick={onOpenQuickLog}
          className="flex items-center justify-between p-4 rounded-2xl border border-[#30262B] bg-[#151316] text-[#F4F0F1] hover:border-[#6D1028] transition text-right"
        >
          <div>
            <div className="text-sm font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#922D48]" />
              <span>تسجيل سريع</span>
            </div>
            <div className="text-[11px] text-[#AAA2A7] mt-0.5">تدوين إنجاز أو فكرة فورًا</div>
          </div>
        </button>
      </div>

      {/* Weekly Weight Loss Counter & Difference Widget */}
      <WeightLossCounter
        compact
        onOpenFullView={() => onNavigate('physical')}
      />

      {/* Before & After Photos Transformation Widget */}
      <BeforeAfterPhotosWidget
        compact
        onOpenFullView={() => onNavigate('physical')}
      />

      {/* Energy Level Quick Logger */}
      <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#922D48]" />
            <h3 className="text-xs font-bold text-[#F4F0F1]">مستوى الطاقة المسجّل لهذا اليوم:</h3>
          </div>
          <span className="text-[11px] text-[#AAA2A7]">
            {todayEnergy ? `مستوى ${todayEnergy} من 5` : 'لم يُسجل بعد'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { lvl: 1, label: 'منخفض جدًا' },
            { lvl: 2, label: 'منخفض' },
            { lvl: 3, label: 'متوسط' },
            { lvl: 4, label: 'نشط' },
            { lvl: 5, label: 'قمة الطاقة' }
          ].map((item) => (
            <button
              key={item.lvl}
              onClick={() => handleSaveEnergy(item.lvl)}
              className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                todayEnergy === item.lvl
                  ? 'border-[#922D48] bg-[#6D1028]/40 text-[#F4F0F1]'
                  : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
              }`}
            >
              <span className="text-xs font-bold">{item.lvl}</span>
              <span className="text-[10px] truncate max-w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Tasks Snapshot */}
      <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#922D48]" />
            <h3 className="text-xs font-bold text-[#F4F0F1]">مهام اليوم ({completedToday} / {totalTasks})</h3>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-xs font-semibold text-[#922D48] hover:text-[#F4F0F1] transition"
          >
            عرض الكل
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#AAA2A7]">
            لا توجد مهام مضافة بعد. أضف أول مهمة أو استخدم المهام المقترحة.
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((t) => {
              const isDone = t.status === 'completed';
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isDone
                      ? 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7]'
                      : 'border-[#30262B] bg-[#0B0B0D] text-[#F4F0F1] hover:border-[#6D1028]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition flex-shrink-0 ${
                        isDone
                          ? 'border-[#922D48] bg-[#6D1028] text-white'
                          : 'border-[#30262B] hover:border-[#922D48]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className={`text-xs font-bold ${isDone ? 'line-through text-[#AAA2A7]' : 'text-[#F4F0F1]'}`}>
                        {t.title}
                      </div>
                      <div className="text-[10px] text-[#AAA2A7] flex items-center gap-2 mt-0.5">
                        {t.scheduledTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{t.scheduledTime}</span>
                          </span>
                        )}
                        <span>{t.estimatedMinutes} دقيقة</span>
                        <span className="text-[#922D48]">+{t.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Domain Transformation Overview */}
      <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#922D48]" />
            <h3 className="text-xs font-bold text-[#F4F0F1]">مؤشر التغيير الشامل عبر المسارات</h3>
          </div>
          <button
            onClick={() => onNavigate('comprehensive_index')}
            className="text-xs font-semibold text-[#922D48] hover:text-[#F4F0F1] transition"
          >
            التقرير المفصل
          </button>
        </div>

        {activePathwaysWithProgress.length === 0 ? (
          <div className="text-center py-4 text-xs text-[#AAA2A7] leading-relaxed">
            التقييم قيد التكوين بناءً على إنجازاتك الأولى. بمجرد إكمال المهام، سينمو مؤشر كل مسار مستقلًا.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pathways.slice(0, 4).map((p) => (
              <div key={p.id} className="bg-[#0B0B0D] border border-[#30262B] rounded-xl p-3">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-bold text-[#F4F0F1]">{p.title}</span>
                  <span className="text-[#922D48] font-semibold">{p.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#151316] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6D1028] to-[#922D48]"
                    style={{ width: `${p.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recovery / Comeback Banner */}
      <div className="rounded-2xl border border-[#30262B] bg-[#151316] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-[#F4F0F1] flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-[#922D48]" />
            <span>هل واجهت تعثرًا أو انقطعت لأيام؟</span>
          </div>
          <div className="text-[11px] text-[#AAA2A7] mt-0.5">
            العودة أهم من الكمال. نظام الإنقاذ يساعدك على استئناف المسار دون تأنيب أو تصفير للرحلة.
          </div>
        </div>
        <button
          onClick={() => onNavigate('comeback')}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0B0B0D] border border-[#30262B] text-xs font-bold text-[#F4F0F1] hover:border-[#6D1028] transition"
        >
          العودة إلى المسار
        </button>
      </div>
    </div>
  );
};
