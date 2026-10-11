import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TimeBlock } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  PieChart
} from 'lucide-react';

const CATEGORY_NAMES: Record<TimeBlock['category'], string> = {
  work: 'الدراسة والعمل',
  sport: 'الحركة والرياضة',
  reading: 'القراءة والمعرفة',
  skills: 'تعلم المهارات',
  sleep: 'النوم والراحة',
  personal: 'الوقت الشخصي والعائلي',
  screen: 'استخدام الهاتف والشاشات',
  habits: 'العادات اليومية',
  other: 'أنشطة أخرى'
};

export const TimeManagementView: React.FC = () => {
  const { addXp } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [blocks, setBlocks] = useState<TimeBlock[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TimeBlock['category']>('work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [actualMinutes, setActualMinutes] = useState<number>(90);

  useEffect(() => {
    loadBlocks();
  }, [selectedDate]);

  const loadBlocks = async () => {
    const list = await getAllItems<TimeBlock>('time_blocks');
    setBlocks(list.filter((b) => b.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const calculateDuration = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    return diff || 30;
  };

  const handleSaveBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const durationMinutes = calculateDuration(startTime, endTime);
    const newBlock: TimeBlock = {
      id: `block_${Date.now()}`,
      date: selectedDate,
      title: title.trim(),
      category,
      startTime,
      endTime,
      durationMinutes,
      actualMinutes: actualMinutes || durationMinutes
    };

    await putItem('time_blocks', newBlock);
    await loadBlocks();
    await addXp(15, `block_${newBlock.id}`, `تنظيم فترة زمنية: ${newBlock.title}`);
    setTitle('');
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteItem('time_blocks', id);
    await loadBlocks();
  };

  // Check for time overlaps
  const hasOverlap = (idx: number): boolean => {
    if (idx === 0) return false;
    const current = blocks[idx];
    const prev = blocks[idx - 1];
    return current.startTime < prev.endTime;
  };

  const totalPlannedMinutes = blocks.reduce((acc, b) => acc + b.durationMinutes, 0);
  const totalActualMinutes = blocks.reduce((acc, b) => acc + (b.actualMinutes || b.durationMinutes), 0);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">تنظيم وإدارة الوقت</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            مخطط زمني واعٍ يقارن بين الساعات المخططة والواقع المعاش لتجنب التسريب.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فترة زمنية</span>
        </button>
      </div>

      {/* Date Picker & Overview */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#922D48]" />
          <span className="text-xs font-bold text-[#F4F0F1]">تاريخ المخطط:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[#AAA2A7]">المخطط: </span>
            <span className="font-bold text-[#F4F0F1]">{(totalPlannedMinutes / 60).toFixed(1)} ساعة</span>
          </div>
          <div>
            <span className="text-[#AAA2A7]">الفعلي: </span>
            <span className="font-bold text-[#922D48]">{(totalActualMinutes / 60).toFixed(1)} ساعة</span>
          </div>
        </div>
      </div>

      {/* Time Blocks List */}
      {blocks.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <Clock className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">لا توجد فترات مجدولة لهذا اليوم</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            حدد 3 فترات رئيسية (مثلاً: عمل عميق، رياضة، قراءة مسائية) لتأمين مسار يومك.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((b, idx) => {
            const overlap = hasOverlap(idx);
            return (
              <div
                key={b.id}
                className={`rounded-2xl border p-4 transition ${
                  overlap ? 'border-amber-600/70 bg-amber-950/20' : 'border-[#30262B] bg-[#151316]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F4F0F1]">{b.title}</span>
                      <span className="text-[10px] bg-[#0B0B0D] border border-[#30262B] px-2 py-0.5 rounded-md text-[#AAA2A7]">
                        {CATEGORY_NAMES[b.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#AAA2A7]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#922D48]" />
                        <span>{b.startTime} إلى {b.endTime}</span>
                      </span>
                      <span>({b.durationMinutes} دقيقة)</span>
                      {b.actualMinutes && (
                        <span className="text-emerald-400">فعلًا: {b.actualMinutes} دقيقة</span>
                      )}
                    </div>

                    {overlap && (
                      <div className="text-[11px] text-amber-400 flex items-center gap-1.5 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>تنبيه: يتداخل هذا الوقت مع الفترة السابقة!</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">فترة زمنية جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveBlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">اسم النشاط *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جلسة عمل عميق بدون هاتف"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">المجال / التصنيف</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TimeBlock['category'])}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                >
                  {Object.entries(CATEGORY_NAMES).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">وقت البدء</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">وقت النهاية</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#30262B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90"
                >
                  حفظ الفترة (+15 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
