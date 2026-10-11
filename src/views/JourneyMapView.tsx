import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PHASES_DATA, PhaseInfo } from '../constants/phases';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  SlidersHorizontal
} from 'lucide-react';

interface JourneyMapViewProps {
  onNavigate: (tab: string) => void;
}

export const JourneyMapView: React.FC<JourneyMapViewProps> = ({ onNavigate }) => {
  const { journeyStats, simulateDay, tasks } = useApp();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(journeyStats.currentPhase.id);
  const [showSimulateDrawer, setShowSimulateDrawer] = useState(false);

  const selectedPhase = PHASES_DATA.find((p) => p.id === selectedPhaseId) || PHASES_DATA[0];

  // Calculate days array for this phase
  const phaseDays = Array.from(
    { length: selectedPhase.durationDays },
    (_, i) => selectedPhase.dayStart + i
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Simulation Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">خريطة رحلة الـ 214 يومًا</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            تدرج زمني مقسّم إلى 8 محطات تحوّل مع توثيق مستمر دون تصفير.
          </p>
        </div>

        {/* Quick Testing & Simulation Toggle */}
        <button
          onClick={() => setShowSimulateDrawer(!showSimulateDrawer)}
          className="flex items-center gap-2 rounded-xl border border-[#30262B] bg-[#151316] px-3.5 py-2 text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#922D48]" />
          <span>{journeyStats.isSimulated ? `محاكاة اليوم ${journeyStats.currentDay}` : 'اختبار ومحاكاة الأيام'}</span>
        </button>
      </div>

      {/* Simulation / QA Toolbar (Test Requirement #34) */}
      {showSimulateDrawer && (
        <div className="rounded-2xl border border-[#922D48]/80 bg-[#151316] p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#F4F0F1] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#922D48]" />
              <span>محاكاة الأيام لاختبار المراحل المتقدمة (QA Tool):</span>
            </span>
            <button
              onClick={() => simulateDay(null)}
              className="text-[11px] text-[#AAA2A7] hover:text-white underline"
            >
              إعادة للتاريخ الحقيقي
            </button>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[1, 15, 30, 31, 60, 90, 120, 150, 180, 210, 214].map((d) => (
              <button
                key={d}
                onClick={() => {
                  simulateDay(d);
                  const p = PHASES_DATA.find((phase) => d >= phase.dayStart && d <= phase.dayEnd);
                  if (p) setSelectedPhaseId(p.id);
                }}
                className={`px-3 py-1.5 rounded-lg border font-bold transition ${
                  journeyStats.currentDay === d
                    ? 'border-[#922D48] bg-[#6D1028] text-white'
                    : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
                }`}
              >
                اليوم {d}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#AAA2A7]">
            تتيح لك هذه الأداة معاينة شاشات المراحل المتقدمة، عقودها، وتقارير اليوم 214 دون التأثير السلبي على سجلاتك.
          </p>
        </div>
      )}

      {/* Global Journey Overview Card */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#AAA2A7] font-semibold">الموقع الحالي في الخريطة</div>
            <div className="text-xl font-extrabold text-[#F4F0F1] mt-0.5">
              اليوم {journeyStats.currentDay} من أصل 214
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-[#AAA2A7]">الأيام المتبقية</div>
              <div className="text-base font-bold text-[#922D48]">{journeyStats.daysRemaining} يومًا</div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-[#6D1028] bg-[#0B0B0D] flex items-center justify-center font-bold text-xs text-[#F4F0F1]">
              {journeyStats.progressPercent}%
            </div>
          </div>
        </div>

        {/* 8-Phase Step Navigation Bar */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-2">
          {PHASES_DATA.map((p) => {
            const isCurrent = journeyStats.currentDay >= p.dayStart && journeyStats.currentDay <= p.dayEnd;
            const isPassed = journeyStats.currentDay > p.dayEnd;
            const isSelected = selectedPhaseId === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPhaseId(p.id)}
                className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                  isSelected
                    ? 'border-[#922D48] bg-[#6D1028]/30 text-white'
                    : isCurrent
                    ? 'border-[#6D1028] bg-[#151316] text-[#F4F0F1]'
                    : isPassed
                    ? 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7]'
                    : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold">م{p.id}</span>
                <span className="text-[9px] truncate max-w-full">
                  {p.dayStart}-{p.dayEnd}
                </span>
                {isPassed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#922D48] animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Phase Detail Showcase */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30262B] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#922D48] mb-1">
              <Calendar className="w-4 h-4" />
              <span>الأيام {selectedPhase.dayStart} – {selectedPhase.dayEnd} ({selectedPhase.durationDays} يومًا)</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#F4F0F1]">
              {selectedPhase.name}
            </h3>
            <p className="text-xs text-[#AAA2A7] mt-1">
              {selectedPhase.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('challenges')}
              className="px-4 py-2 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>عقد وتحديات المرحلة</span>
            </button>
          </div>
        </div>

        {/* Core Objective & Project */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0B0B0D] border border-[#30262B] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-[#AAA2A7] mb-1">الهدف الرئيسي للمرحلة:</div>
            <div className="font-semibold text-[#F4F0F1] leading-relaxed">{selectedPhase.primaryGoal}</div>
          </div>
          <div className="bg-[#0B0B0D] border border-[#30262B] rounded-2xl p-4">
            <div className="text-[11px] font-bold text-[#AAA2A7] mb-1">المشروع العملي المقترح:</div>
            <div className="font-semibold text-[#F4F0F1] leading-relaxed">{selectedPhase.suggestedProject}</div>
          </div>
        </div>

        {/* Days Grid in this Phase */}
        <div>
          <h4 className="text-xs font-bold text-[#F4F0F1] mb-3">
            سجل أيام المرحلة ({selectedPhase.durationDays} يومًا):
          </h4>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
            {phaseDays.map((d) => {
              const isToday = journeyStats.currentDay === d;
              const isPast = journeyStats.currentDay > d;
              const isFuture = journeyStats.currentDay < d;

              return (
                <div
                  key={d}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                    isToday
                      ? 'border-[#922D48] bg-[#6D1028] text-white shadow-lg shadow-[#6D1028]/30'
                      : isPast
                      ? 'border-[#30262B] bg-[#0B0B0D] text-[#F4F0F1]'
                      : 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7]'
                  }`}
                >
                  <span className="text-xs font-extrabold">{d}</span>
                  <span className="text-[9px]">
                    {isToday ? 'اليوم' : isPast ? 'مسجل' : 'قادم'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Habits & Success Metric */}
        <div className="bg-[#0B0B0D] border border-[#30262B] rounded-2xl p-4 space-y-2">
          <div className="text-xs font-bold text-[#F4F0F1]">معيار النجاح المعتمد للمرحلة:</div>
          <p className="text-xs text-[#AAA2A7] leading-relaxed">
            {selectedPhase.successMetric}
          </p>
        </div>
      </div>
    </div>
  );
};
