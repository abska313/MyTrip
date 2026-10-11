import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WeeklyWeightEntry } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  History,
  Target,
  Edit2,
  CheckCircle2,
  ArrowRightLeft
} from 'lucide-react';

interface WeightLossCounterProps {
  compact?: boolean;
  onOpenFullView?: () => void;
}

export const WeightLossCounter: React.FC<WeightLossCounterProps> = ({
  compact = false,
  onOpenFullView
}) => {
  const { profile, updateProfile, addXp } = useApp();
  const [weeklyLogs, setWeeklyLogs] = useState<WeeklyWeightEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WeeklyWeightEntry | null>(null);

  // Form states for entry
  const [newWeight, setNewWeight] = useState<string>('');
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [waistMeasurement, setWaistMeasurement] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Target & Initial weight state
  const [targetWeight, setTargetWeight] = useState<string>(
    profile?.targetWeightKg ? String(profile.targetWeightKg) : ''
  );
  const [initialWeightEdit, setInitialWeightEdit] = useState<string>(
    profile?.initialWeightKg ? String(profile.initialWeightKg) : ''
  );

  useEffect(() => {
    loadWeeklyLogs();
  }, []);

  const loadWeeklyLogs = async () => {
    const list = await getAllItems<WeeklyWeightEntry>('weekly_weight_logs');
    const sorted = list.sort((a, b) => a.date.localeCompare(b.date));
    setWeeklyLogs(sorted);
  };

  // Helper to sync and recalculate all weekly differences in order
  const syncAndRecalculate = async (list: WeeklyWeightEntry[], baseWeight?: number) => {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const start = baseWeight !== undefined ? baseWeight : (sorted.length > 0 ? sorted[0].weightKg : undefined);

    for (let i = 0; i < sorted.length; i++) {
      const prevWeight = i > 0 ? sorted[i - 1].weightKg : start;
      sorted[i].weekNumber = i + 1;
      sorted[i].changeFromPreviousKg =
        prevWeight !== undefined ? Number((sorted[i].weightKg - prevWeight).toFixed(1)) : 0;
      sorted[i].changeFromStartKg =
        start !== undefined ? Number((sorted[i].weightKg - start).toFixed(1)) : 0;
      await putItem('weekly_weight_logs', sorted[i]);
    }
    setWeeklyLogs(sorted);
  };

  // Calculations
  const startWeight = profile?.initialWeightKg || (weeklyLogs.length > 0 ? weeklyLogs[0].weightKg : undefined);
  const latestEntry = weeklyLogs.length > 0 ? weeklyLogs[weeklyLogs.length - 1] : undefined;
  const currentWeight = latestEntry ? latestEntry.weightKg : startWeight;

  // Previous entry to compare weekly change
  const previousEntry = weeklyLogs.length > 1 ? weeklyLogs[weeklyLogs.length - 2] : undefined;

  // Total change from start (negative means lost weight)
  const totalChangeKg =
    startWeight !== undefined && currentWeight !== undefined
      ? Number((currentWeight - startWeight).toFixed(1))
      : undefined;

  // Weekly change from previous check-in
  const weeklyChangeKg =
    latestEntry && previousEntry
      ? Number((latestEntry.weightKg - previousEntry.weightKg).toFixed(1))
      : latestEntry && startWeight && weeklyLogs.length === 1
      ? Number((latestEntry.weightKg - startWeight).toFixed(1))
      : undefined;

  // Percentage loss
  const totalLossPercent =
    startWeight && totalChangeKg !== undefined
      ? Number(((Math.abs(totalChangeKg) / startWeight) * 100).toFixed(1))
      : 0;

  // Progress towards target
  const targetWeightNum = profile?.targetWeightKg;
  let progressToTargetPercent = 0;
  if (startWeight && targetWeightNum && currentWeight !== undefined) {
    const totalToLose = startWeight - targetWeightNum;
    const currentLost = startWeight - currentWeight;
    if (totalToLose > 0) {
      progressToTargetPercent = Math.max(0, Math.min(100, Math.round((currentLost / totalToLose) * 100)));
    }
  }

  // Open modal for new entry
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setNewWeight('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setWaistMeasurement('');
    setNotes('');
    setShowModal(true);
  };

  // Open modal to edit existing entry
  const handleOpenEdit = (entry: WeeklyWeightEntry) => {
    setEditingEntry(entry);
    setNewWeight(String(entry.weightKg));
    setEntryDate(entry.date);
    setWaistMeasurement(entry.waistCm ? String(entry.waistCm) : '');
    setNotes(entry.notes || '');
    setShowModal(true);
  };

  // Handle saving weekly weight (either new or edited)
  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;

    const weightNum = Number(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    let updatedList: WeeklyWeightEntry[] = [];

    if (editingEntry) {
      // Update existing entry
      const updated: WeeklyWeightEntry = {
        ...editingEntry,
        date: entryDate,
        weightKg: weightNum,
        waistCm: waistMeasurement ? Number(waistMeasurement) : undefined,
        notes: notes.trim() || undefined
      };
      await putItem('weekly_weight_logs', updated);
      updatedList = weeklyLogs.map((item) => (item.id === updated.id ? updated : item));
      await syncAndRecalculate(updatedList, startWeight);
    } else {
      // Add new entry
      const newEntry: WeeklyWeightEntry = {
        id: `weight_week_${Date.now()}`,
        date: entryDate,
        weekNumber: weeklyLogs.length + 1,
        weightKg: weightNum,
        waistCm: waistMeasurement ? Number(waistMeasurement) : undefined,
        notes: notes.trim() || undefined
      };
      await putItem('weekly_weight_logs', newEntry);
      updatedList = [...weeklyLogs, newEntry];
      await syncAndRecalculate(updatedList, startWeight);

      // If starting weight wasn't set, set it
      if (!profile?.initialWeightKg) {
        await updateProfile({ initialWeightKg: weightNum });
      }

      await addXp(30, `weekly_weight_${newEntry.id}`, `تسجيل وزن الأسبوع (${weightNum} كغ)`);
    }

    // Reset & close
    setEditingEntry(null);
    setNewWeight('');
    setWaistMeasurement('');
    setNotes('');
    setShowModal(false);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('هل تريد حذف قياس هذا الأسبوع؟ سيُعاد حساب الفوارق تلقائيًا.')) {
      return;
    }
    await deleteItem('weekly_weight_logs', id);
    const remaining = weeklyLogs.filter((item) => item.id !== id);
    await syncAndRecalculate(remaining, startWeight);
  };

  const handleSaveTargets = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedInitial = initialWeightEdit ? Number(initialWeightEdit) : profile?.initialWeightKg;
    const updatedTarget = targetWeight ? Number(targetWeight) : undefined;

    await updateProfile({
      initialWeightKg: updatedInitial,
      targetWeightKg: updatedTarget
    });

    if (updatedInitial !== undefined) {
      await syncAndRecalculate(weeklyLogs, updatedInitial);
    }
    setShowTargetModal(false);
  };

  // Compact Widget for Dashboard
  if (compact) {
    return (
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#6D1028]/40 border border-[#922D48]/40 text-[#F4F0F1]">
              <Scale className="w-4 h-4 text-[#922D48]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F4F0F1]">عداد نزول الوزن والمتابعة الأسبوعية</h3>
              <p className="text-[10px] text-[#AAA2A7]">
                قياس أسبوعي مستمر وحساب دقيق لفارق التغير
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {latestEntry && (
              <button
                onClick={() => handleOpenEdit(latestEntry)}
                className="p-1.5 rounded-xl border border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
                title="تعديل آخر قياس"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 transition shadow-md shadow-[#6D1028]/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>وزن الأسبوع</span>
            </button>
          </div>
        </div>

        {/* Counter Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Start Weight */}
          <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center">
            <span className="text-[10px] text-[#AAA2A7] block font-medium">الوزن الابتدائي</span>
            <div className="text-base font-black text-[#F4F0F1] mt-0.5">
              {startWeight !== undefined ? `${startWeight} كغ` : 'لم يُسجل'}
            </div>
          </div>

          {/* Current Weight */}
          <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center">
            <span className="text-[10px] text-[#AAA2A7] block font-medium">الوزن الحالي</span>
            <div className="text-base font-black text-[#922D48] mt-0.5">
              {currentWeight !== undefined ? `${currentWeight} كغ` : 'لم يُسجل'}
            </div>
          </div>

          {/* Total Loss */}
          <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center">
            <span className="text-[10px] text-[#AAA2A7] block font-medium">إجمالي النزول</span>
            <div className="text-base font-black mt-0.5 flex items-center justify-center gap-1">
              {totalChangeKg !== undefined ? (
                <>
                  {totalChangeKg < 0 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5 font-black">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{Math.abs(totalChangeKg)} كغ</span>
                    </span>
                  ) : totalChangeKg > 0 ? (
                    <span className="text-amber-400 flex items-center gap-0.5 font-black">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{totalChangeKg} كغ</span>
                    </span>
                  ) : (
                    <span className="text-[#AAA2A7] flex items-center gap-0.5 font-bold">
                      <Minus className="w-3.5 h-3.5" />
                      <span>ثبات (0 كغ)</span>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[#AAA2A7] text-xs">قيد التكوين</span>
              )}
            </div>
          </div>

          {/* Weekly Change */}
          <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center">
            <span className="text-[10px] text-[#AAA2A7] block font-medium">فارق الأسبوع الأخير</span>
            <div className="text-base font-black mt-0.5 flex items-center justify-center gap-1">
              {weeklyChangeKg !== undefined ? (
                <>
                  {weeklyChangeKg < 0 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5 font-black">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{Math.abs(weeklyChangeKg)} كغ ↓</span>
                    </span>
                  ) : weeklyChangeKg > 0 ? (
                    <span className="text-amber-400 flex items-center gap-0.5 font-black">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{weeklyChangeKg} كغ ↑</span>
                    </span>
                  ) : (
                    <span className="text-[#AAA2A7] flex items-center gap-0.5 font-bold">
                      <Minus className="w-3.5 h-3.5" />
                      <span>ثبات</span>
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[#AAA2A7] text-xs">الأسبوع 1</span>
              )}
            </div>
          </div>
        </div>

        {/* Target Progress Bar if target exists */}
        {targetWeightNum && startWeight && currentWeight !== undefined && (
          <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#AAA2A7] flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-[#922D48]" />
                <span>الهدف: {targetWeightNum} كغ (متبقي {Math.max(0, Number((currentWeight - targetWeightNum).toFixed(1)))} كغ)</span>
              </span>
              <span className="font-bold text-emerald-400">{progressToTargetPercent}%</span>
            </div>
            <div className="w-full h-2 bg-[#151316] rounded-full overflow-hidden border border-[#30262B]">
              <div
                className="h-full bg-gradient-to-r from-[#6D1028] via-[#922D48] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressToTargetPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Link to Details */}
        <div className="flex items-center justify-between pt-1 border-t border-[#30262B] text-xs">
          <button
            onClick={() => setShowTargetModal(true)}
            className="text-[11px] text-[#AAA2A7] hover:text-[#F4F0F1] underline"
          >
            تعديل الوزن الابتدائي أو الهدف
          </button>

          {onOpenFullView && (
            <button
              onClick={onOpenFullView}
              className="text-[11px] font-bold text-[#922D48] hover:text-[#F4F0F1] transition"
            >
              عرض السجل الأسبوعي الكامل والصور ⬅
            </button>
          )}
        </div>

        {/* Render Modals */}
        {renderModals()}
      </div>
    );
  }

  // Full Expanded View
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl border border-[#30262B] bg-gradient-to-b from-[#151316] to-[#0B0B0D] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30262B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] text-white shadow-lg shadow-[#6D1028]/25">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#F4F0F1]">عداد نزول الوزن والمتابعة الأسبوعية</h2>
              <p className="text-xs text-[#AAA2A7] mt-0.5">
                سجل قياسك كل أسبوع وراقب كمية النزول وفارق التغير بدقة تامة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTargetModal(true)}
              className="px-3.5 py-2 rounded-xl border border-[#30262B] bg-[#0B0B0D] text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
            >
              ضبط الهدف والبداية
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white shadow-lg shadow-[#6D1028]/30 hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل وزن هذا الأسبوع</span>
            </button>
          </div>
        </div>

        {/* Big Counter Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center space-y-1">
            <span className="text-xs text-[#AAA2A7] font-medium">الوزن الابتدائي</span>
            <div className="text-2xl font-black text-[#F4F0F1]">
              {startWeight !== undefined ? `${startWeight} كغ` : '—'}
            </div>
            <span className="text-[10px] text-[#AAA2A7] block">نقطة انطلاق الرحلة</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center space-y-1">
            <span className="text-xs text-[#AAA2A7] font-medium">الوزن الحالي</span>
            <div className="text-2xl font-black text-[#922D48]">
              {currentWeight !== undefined ? `${currentWeight} كغ` : '—'}
            </div>
            <span className="text-[10px] text-[#AAA2A7] block">آخر قياس مسجل</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center space-y-1">
            <span className="text-xs text-[#AAA2A7] font-medium">إجمالي النزول</span>
            <div className="text-2xl font-black flex items-center justify-center gap-1">
              {totalChangeKg !== undefined ? (
                totalChangeKg < 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-black">
                    <TrendingDown className="w-5 h-5" />
                    <span>{Math.abs(totalChangeKg)} كغ</span>
                  </span>
                ) : totalChangeKg > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1 font-black">
                    <TrendingUp className="w-5 h-5" />
                    <span>+{totalChangeKg} كغ</span>
                  </span>
                ) : (
                  <span className="text-[#AAA2A7]">0.0 كغ</span>
                )
              ) : (
                <span className="text-xs text-[#AAA2A7]">قيد الحساب</span>
              )}
            </div>
            <span className="text-[10px] text-[#AAA2A7] block">
              {totalLossPercent > 0 ? `نسبة النزول: ${totalLossPercent}%` : 'مقارنة بنقطة البداية'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-center space-y-1">
            <span className="text-xs text-[#AAA2A7] font-medium">فارق الأسبوع الأخير</span>
            <div className="text-2xl font-black flex items-center justify-center gap-1">
              {weeklyChangeKg !== undefined ? (
                weeklyChangeKg < 0 ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-black">
                    <TrendingDown className="w-5 h-5" />
                    <span>{Math.abs(weeklyChangeKg)} كغ ↓</span>
                  </span>
                ) : weeklyChangeKg > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1 font-black">
                    <TrendingUp className="w-5 h-5" />
                    <span>+{weeklyChangeKg} كغ ↑</span>
                  </span>
                ) : (
                  <span className="text-[#AAA2A7]">ثبات =</span>
                )
              ) : (
                <span className="text-xs text-[#AAA2A7]">أول تسجيل</span>
              )}
            </div>
            <span className="text-[10px] text-[#AAA2A7] block">مقارنة بالأسبوع السابق</span>
          </div>
        </div>

        {/* Target Progress Bar */}
        {targetWeightNum && startWeight && currentWeight !== undefined && (
          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#AAA2A7] flex items-center gap-1.5 font-bold">
                <Target className="w-4 h-4 text-[#922D48]" />
                <span>الهدف المنشود: {targetWeightNum} كغ</span>
                <span className="text-[11px] font-normal">
                  (المتبقي للهدف: {Math.max(0, Number((currentWeight - targetWeightNum).toFixed(1)))} كغ)
                </span>
              </span>
              <span className="font-extrabold text-emerald-400 text-sm">{progressToTargetPercent}%</span>
            </div>
            <div className="w-full h-3 bg-[#151316] rounded-full overflow-hidden border border-[#30262B]">
              <div
                className="h-full bg-gradient-to-r from-[#6D1028] via-[#922D48] to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressToTargetPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Weekly Weight Entries Table / Timeline */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#922D48]" />
            <h3 className="text-sm font-bold text-[#F4F0F1]">سجل قياسات الأسابيع وتاريخ التغير ({weeklyLogs.length} قياسًا)</h3>
          </div>
          <span className="text-[10px] text-[#AAA2A7]">يمكنك تعديل أي قياس في أي وقت</span>
        </div>

        {weeklyLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#AAA2A7] space-y-2">
            <Scale className="w-8 h-8 text-[#922D48] mx-auto opacity-75" />
            <p>لم تسجل أي وزن أسبوعي بعد. اضغط على «تسجيل وزن هذا الأسبوع» لتدوين أول قياس.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weeklyLogs
              .slice()
              .reverse()
              .map((entry, idx) => {
                const weekNum = entry.weekNumber || weeklyLogs.length - idx;
                const changeFromPrev = entry.changeFromPreviousKg;
                const changeFromInit = entry.changeFromStartKg;

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] hover:border-[#6D1028] transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#151316] border border-[#30262B] flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[9px] text-[#AAA2A7]">أسبوع</span>
                        <span className="text-xs font-black text-[#F4F0F1] leading-none">{weekNum}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#F4F0F1]">{entry.weightKg} كغ</span>
                          {entry.waistCm && (
                            <span className="text-[10px] text-[#AAA2A7] border border-[#30262B] px-1.5 py-0.5 rounded-md">
                              خصر: {entry.waistCm} سم
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#AAA2A7] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#922D48]" />
                            <span>{entry.date}</span>
                          </span>
                          {entry.notes && <span>• {entry.notes}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Weekly change badge */}
                      <div className="text-right">
                        {changeFromPrev !== undefined ? (
                          changeFromPrev < 0 ? (
                            <span className="text-xs font-bold text-emerald-400 block">
                              {Math.abs(changeFromPrev)} كغ ↓
                            </span>
                          ) : changeFromPrev > 0 ? (
                            <span className="text-xs font-bold text-amber-400 block">
                              +{changeFromPrev} كغ ↑
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#AAA2A7] block">
                              ثبات =
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-[#AAA2A7] block">نقطة البداية</span>
                        )}
                        <span className="text-[9px] text-[#AAA2A7] block">عن السابق</span>
                      </div>

                      {/* Total Change badge */}
                      <div className="text-right pl-2 border-r border-[#30262B]">
                        {changeFromInit !== undefined ? (
                          changeFromInit < 0 ? (
                            <span className="text-xs font-bold text-emerald-400 block">
                              -{Math.abs(changeFromInit)} كغ
                            </span>
                          ) : changeFromInit > 0 ? (
                            <span className="text-xs font-bold text-amber-400 block">
                              +{changeFromInit} كغ
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-[#AAA2A7] block">
                              0.0 كغ
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-[#AAA2A7] block">—</span>
                        )}
                        <span className="text-[9px] text-[#AAA2A7] block">عن البداية</span>
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(entry)}
                        className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
                        title="تعديل هذا القياس"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400 transition"
                        title="حذف هذا القياس"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {renderModals()}
    </div>
  );

  // Helper to render modals
  function renderModals() {
    return (
      <>
        {/* Log / Edit Weekly Weight Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#922D48]" />
                  <h3 className="text-sm font-bold text-[#F4F0F1]">
                    {editingEntry ? `تعديل قياس الأسبوع ${editingEntry.weekNumber}` : 'تسجيل قياس وزن جديد'}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveWeight} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">الوزن المسجل بالكيلوغرام *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="مثال: 78.4"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2.5 text-sm text-[#F4F0F1] font-bold focus:border-[#6D1028] focus:outline-none"
                    autoFocus
                  />
                  {currentWeight !== undefined && newWeight && !isNaN(Number(newWeight)) && (
                    <div className="mt-1 text-[11px] text-[#AAA2A7]">
                      الفارق عن آخر وزن: {' '}
                      {Number(newWeight) < currentWeight ? (
                        <span className="text-emerald-400 font-bold">
                          نزول -{Number((currentWeight - Number(newWeight)).toFixed(1))} كغ 👏
                        </span>
                      ) : Number(newWeight) > currentWeight ? (
                        <span className="text-amber-400 font-bold">
                          زيادة +{Number((Number(newWeight) - currentWeight).toFixed(1))} كغ
                        </span>
                      ) : (
                        <span className="text-[#AAA2A7] font-medium">ثبات نفس الوزن</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">تاريخ القياس</label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">محيط الخصر (سم) - اختياري</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="مثال: 84"
                    value={waistMeasurement}
                    onChange={(e) => setWaistMeasurement(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">ملاحظات الأسبوع (طبيعة الأكل، التمارين، الطاقة) - اختياري</label>
                  <textarea
                    rows={2}
                    placeholder="مثال: التزمت بالمشي 5 أيام وشرب الماء..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white shadow-md shadow-[#6D1028]/25 hover:opacity-90 transition"
                  >
                    {editingEntry ? 'حفظ التعديل' : 'حفظ القياس الأسبوعي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Set Target / Initial Weight Modal */}
        {showTargetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#922D48]" />
                  <h3 className="text-sm font-bold text-[#F4F0F1]">ضبط الوزن الابتدائي والهدف</h3>
                </div>
                <button onClick={() => setShowTargetModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
              </div>

              <form onSubmit={handleSaveTargets} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">الوزن الابتدائي (نقطة البداية) بالكيلوغرام</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 85"
                    value={initialWeightEdit}
                    onChange={(e) => setInitialWeightEdit(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2.5 text-sm text-[#F4F0F1] font-bold focus:border-[#6D1028] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#AAA2A7] mt-1">يُستخدم هذا الرقم لحساب إجمالي النزول ونسبة التقدم من البداية.</p>
                </div>

                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">الوزن المستهدف (الهدف المنشود) بالكيلوغرام</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 72"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2.5 text-sm text-[#F4F0F1] font-bold focus:border-[#6D1028] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
                  >
                    حفظ التغييرات
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTargetModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }
};
