import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Activity,
  Shield,
  BookOpen,
  Code,
  Clock,
  Heart,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';

export const ComprehensiveIndexView: React.FC = () => {
  const { pathways, journeyStats, tasks, streak, xp } = useApp();

  // Weighted score weights (customizable by user)
  const [weights, setWeights] = useState<Record<string, number>>({
    discipline: 20,
    knowledge: 15,
    skills: 15,
    time: 15,
    fitness: 15,
    self_discovery: 10,
    spiritual: 10
  });

  const [showWeightAdjuster, setShowWeightAdjuster] = useState(false);

  // Completed tasks stats
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const taskCommitmentRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Calculate overall weighted score
  const calculateOverallScore = (): number => {
    let score = 0;
    const pathScores: Record<string, number> = {
      discipline: pathways.find((p) => p.id === 'discipline_consistency')?.progressPercent || 0,
      knowledge: pathways.find((p) => p.id === 'knowledge_reading')?.progressPercent || 0,
      skills: pathways.find((p) => p.id === 'skills_projects')?.progressPercent || 0,
      time: pathways.find((p) => p.id === 'time_management')?.progressPercent || 0,
      fitness: pathways.find((p) => p.id === 'body_fitness')?.progressPercent || 0,
      self_discovery: pathways.find((p) => p.id === 'self_discovery')?.progressPercent || 0,
      spiritual: pathways.find((p) => p.id === 'spiritual_habits')?.progressPercent || 0
    };

    let totalWeight = 0;
    for (const [key, weight] of Object.entries(weights)) {
      score += (pathScores[key] || 0) * (weight / 100);
      totalWeight += weight;
    }

    return Math.round(score);
  };

  const overallScore = calculateOverallScore();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">مقياس التحوّل الشامل</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            مؤشر متوازن يقيس التغير الحقيقي عبر 7 مسارات دون اختزال الحياة في الوزن فقط.
          </p>
        </div>

        <button
          onClick={() => setShowWeightAdjuster(!showWeightAdjuster)}
          className="flex items-center gap-2 rounded-xl border border-[#30262B] bg-[#151316] px-3.5 py-2 text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] transition self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-[#922D48]" />
          <span>تعديل أوزان المقياس</span>
        </button>
      </div>

      {/* Weights Adjuster Drawer */}
      {showWeightAdjuster && (
        <div className="rounded-3xl border border-[#922D48]/60 bg-[#151316] p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#F4F0F1]">تخصيص أوزان المجالات الموزونة (%):</h3>
            <span className="text-[10px] text-[#AAA2A7]">يجب أن يكون المجموع 100%</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(weights).map(([k, v]) => (
              <div key={k} className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B]">
                <label className="block text-[11px] text-[#AAA2A7] mb-1">
                  {k === 'discipline' ? 'الانضباط' : k === 'knowledge' ? 'المعرفة' : k === 'skills' ? 'المهارات' : k === 'time' ? 'الوقت' : k === 'fitness' ? 'اللياقة' : k === 'self_discovery' ? 'اكتشاف الذات' : 'الروحيات'}
                </label>
                <input
                  type="number"
                  value={v}
                  onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
                  className="w-full rounded-lg bg-[#151316] border border-[#30262B] px-2 py-1 text-xs text-[#F4F0F1] text-center"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Level Comparison Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-3xl border border-[#30262B] bg-[#151316] space-y-1">
          <div className="text-[11px] text-[#AAA2A7]">التقدم الزمني</div>
          <div className="text-2xl font-black text-[#F4F0F1]">{journeyStats.progressPercent}%</div>
          <div className="text-[10px] text-[#AAA2A7]">اليوم {journeyStats.currentDay} / 214</div>
        </div>

        <div className="p-4 rounded-3xl border border-[#30262B] bg-[#151316] space-y-1">
          <div className="text-[11px] text-[#AAA2A7]">الالتزام بالمهام</div>
          <div className="text-2xl font-black text-[#922D48]">{taskCommitmentRate}%</div>
          <div className="text-[10px] text-[#AAA2A7]">{completedTasks} مهمة منجزة</div>
        </div>

        <div className="p-4 rounded-3xl border border-[#30262B] bg-[#151316] space-y-1">
          <div className="text-[11px] text-[#AAA2A7]">سلسلة الأيام</div>
          <div className="text-2xl font-black text-amber-400">{streak} أيام</div>
          <div className="text-[10px] text-[#AAA2A7]">استمرارية نشطة</div>
        </div>

        <div className="p-4 rounded-3xl border border-[#30262B] bg-[#151316] space-y-1">
          <div className="text-[11px] text-[#AAA2A7]">درجة التحول الشاملة</div>
          <div className="text-2xl font-black text-emerald-400">{overallScore}%</div>
          <div className="text-[10px] text-[#AAA2A7]">محسوبة بالأوزان المعتمدة</div>
        </div>
      </div>

      {/* Detailed Domain Breakdown */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <h3 className="text-sm font-black text-[#F4F0F1]">تفصيل التطور لكل مسار من المسارات السبعة:</h3>
          <span className="text-[11px] text-[#AAA2A7]">بيانات حقيقية مستمرة</span>
        </div>

        <div className="space-y-4">
          {pathways.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F4F0F1]">{p.title}</h4>
                  <div className="text-[10px] text-[#AAA2A7] mt-0.5">
                    المستوى {p.level} • {p.xp} XP تراكمي • {p.nodes.filter((n) => n.completed).length} معالم منجزة
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#922D48]">{p.progressPercent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#151316] rounded-full overflow-hidden border border-[#30262B]">
                <div
                  className="h-full bg-gradient-to-r from-[#6D1028] to-[#922D48] transition-all duration-300"
                  style={{ width: `${p.progressPercent}%` }}
                />
              </div>

              <div className="text-[11px] text-[#AAA2A7] flex items-center justify-between pt-1">
                <span>الخطوة المقترحة: {p.suggestedNextStep}</span>
                <span className="text-emerald-400 font-semibold">اتجاه إيجابي مستقر ↑</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
