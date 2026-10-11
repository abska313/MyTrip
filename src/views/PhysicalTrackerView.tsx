import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhysicalLog } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import { WeightLossCounter } from '../components/WeightLossCounter';
import { BeforeAfterPhotosWidget } from '../components/BeforeAfterPhotosWidget';
import {
  Activity,
  Plus,
  Trash2,
  Calendar,
  Camera,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

export const PhysicalTrackerView: React.FC = () => {
  const { profile, addXp } = useApp();
  const [activeTab, setActiveTab] = useState<'counter' | 'before_after' | 'activities'>('counter');
  const [logs, setLogs] = useState<PhysicalLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for general activity log
  const [activityType, setActivityType] = useState('مشي سريع');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [effortLevel, setEffortLevel] = useState<PhysicalLog['effortLevel']>('متوسط');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const list = await getAllItems<PhysicalLog>('physical_logs');
    setLogs(list.sort((a, b) => b.date.localeCompare(a.date)));
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const newLog: PhysicalLog = {
      id: `phys_${Date.now()}`,
      date: today,
      activityType,
      durationMinutes,
      effortLevel,
      notes
    };

    await putItem('physical_logs', newLog);
    await loadLogs();
    await addXp(20, `activity_${newLog.id}`, `تسجيل نشاط حركي (${activityType})`);

    setNotes('');
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deleteItem('physical_logs', id);
    await loadLogs();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">متابعة الوزن والصور والنشاط</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            عداد أسبوعي لنزول الوزن، مقارنة صور قبل وبعد التحدي، وسجل النشاط البدني.
          </p>
        </div>

        {activeTab === 'activities' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل نشاط حركي</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex rounded-2xl bg-[#151316] border border-[#30262B] p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('counter')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'counter'
              ? 'bg-[#6D1028] text-white shadow-md shadow-[#6D1028]/30'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>عداد نزول الوزن الأسبوعي</span>
        </button>

        <button
          onClick={() => setActiveTab('before_after')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'before_after'
              ? 'bg-[#6D1028] text-white shadow-md shadow-[#6D1028]/30'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>صور قبل وبعد التحدي</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'activities'
              ? 'bg-[#6D1028] text-white shadow-md shadow-[#6D1028]/30'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>سجل التمارين ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: WEIGHT LOSS COUNTER */}
      {activeTab === 'counter' && (
        <div className="space-y-6">
          <WeightLossCounter compact={false} />
          {/* Quick preview of before & after */}
          <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F4F0F1]">هل قمت برفع صورتك قبل وبعد التحدي؟</div>
              <div className="text-[11px] text-[#AAA2A7] mt-0.5">
                يمكنك توثيق صورتك قبل بدء التحدي وصورتك بعد تحقيق هدفك في قسم الصور.
              </div>
            </div>
            <button
              onClick={() => setActiveTab('before_after')}
              className="px-3.5 py-2 rounded-xl bg-[#0B0B0D] border border-[#30262B] text-xs font-bold text-[#F4F0F1] hover:border-[#6D1028] transition"
            >
              عرض صور قبل وبعد
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BEFORE & AFTER PHOTOS */}
      {activeTab === 'before_after' && (
        <div className="space-y-6">
          <BeforeAfterPhotosWidget />
        </div>
      )}

      {/* TAB 3: ACTIVITIES / EXERCISE LOG */}
      {activeTab === 'activities' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-sm font-bold text-[#F4F0F1]">سجل جلسات الحركة والنشاط</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-[#922D48] hover:text-[#F4F0F1] transition"
              >
                + إضافة جلسة نشاط
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#AAA2A7] space-y-2">
                <Activity className="w-8 h-8 text-[#922D48] mx-auto opacity-75" />
                <p>لم تسجل أي جلسات نشاط حركي بعد. يمكنك إضافة جلسات المشي، التمارين، أو الإطالة.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F4F0F1]">{log.activityType || 'نشاط بدني'}</span>
                        <span className="text-[10px] text-[#AAA2A7]">{log.durationMinutes} دقيقة</span>
                        <span className="text-[10px] text-[#922D48] font-semibold">جهد {log.effortLevel}</span>
                      </div>
                      <div className="text-[11px] text-[#AAA2A7] flex items-center gap-3">
                        <span>{log.date}</span>
                        {log.notes && <span>• {log.notes}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-sm rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-sm font-bold text-[#F4F0F1]">تسجيل نشاط حركي</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveActivity} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">نوع النشاط</label>
                <input
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  placeholder="مشي، كارديو، تمارين مقاومة، سباحة..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">المدة بالدقائق</label>
                <input
                  type="number"
                  min="1"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">مستوى الجهد</label>
                <select
                  value={effortLevel}
                  onChange={(e) => setEffortLevel(e.target.value as PhysicalLog['effortLevel'])}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                >
                  <option value="خفيف">خفيف (إحماء أو مشي هادئ)</option>
                  <option value="متوسط">متوسط (تنشيط ونبض متسارع)</option>
                  <option value="عالي">عالي (تحدي بدني قوي)</option>
                  <option value="أقصى">أقصى (جهد استثنائي)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="كيف كان شعورك وطاقتك؟..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#30262B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90"
                >
                  حفظ النشاط (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
