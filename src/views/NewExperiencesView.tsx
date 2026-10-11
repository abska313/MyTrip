import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { NewExperience } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Compass,
  Plus,
  Trash2,
  CheckCircle2,
  Flame,
  Star,
  Sparkles
} from 'lucide-react';

export const NewExperiencesView: React.FC = () => {
  const { addXp } = useApp();
  const [experiences, setExperiences] = useState<NewExperience[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [excitementLevel, setExcitementLevel] = useState<number>(5);
  const [expectedDuration, setExpectedDuration] = useState('ساعتان');

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    const list = await getAllItems<NewExperience>('new_experiences');
    setExperiences(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newExp: NewExperience = {
      id: `exp_${Date.now()}`,
      title: title.trim(),
      reason: reason.trim(),
      excitementLevel,
      expectedDuration,
      status: 'planned'
    };

    await putItem('new_experiences', newExp);
    await loadList();
    await addXp(20, `exp_add_${newExp.id}`, `إضافة تجربة جديدة للقائمة: ${newExp.title}`);
    setTitle('');
    setReason('');
    setShowAddModal(false);
  };

  const handleToggleComplete = async (exp: NewExperience) => {
    const isNowDone = exp.status !== 'completed';
    const updated: NewExperience = {
      ...exp,
      status: isNowDone ? 'completed' : 'planned',
      completedAt: isNowDone ? new Date().toISOString() : undefined
    };
    await putItem('new_experiences', updated);
    await loadList();
    if (isNowDone) {
      await addXp(50, `exp_complete_${exp.id}`, `خوض تجربة جديدة بنجاح: ${exp.title}`);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteItem('new_experiences', id);
    await loadList();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">قائمة التجارب الجديدة</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            توسيع نطاق الراحة عبر خوض أنشطة وأماكن وهوايات لم يسبق لك تجربتها.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة تجربة جديدة</span>
        </button>
      </div>

      {/* Experiences Grid */}
      {experiences.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <Compass className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">لا توجد تجارب مضافة بعد</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            أضف تجارب مثل: تجربة رياضة جديدة، زيارة مسار طبيعي، صيام رقمي ليوم كامل، طبخ وصفة صعبة...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {experiences.map((exp) => {
            const isDone = exp.status === 'completed';
            return (
              <div
                key={exp.id}
                className={`rounded-3xl border p-5 transition space-y-3 ${
                  isDone
                    ? 'border-[#30262B] bg-[#151316]/50 opacity-80'
                    : 'border-[#30262B] bg-[#151316] hover:border-[#6D1028]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleComplete(exp)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                        isDone ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div>
                      <h3 className={`text-sm font-bold ${isDone ? 'line-through text-[#AAA2A7]' : 'text-[#F4F0F1]'}`}>
                        {exp.title}
                      </h3>
                      {exp.reason && (
                        <p className="text-xs text-[#AAA2A7] mt-1">{exp.reason}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#AAA2A7] pt-2 border-t border-[#30262B]">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>الحماس: {exp.excitementLevel}/5</span>
                  </div>
                  {exp.expectedDuration && <span>المدة: {exp.expectedDuration}</span>}
                  <span className="text-[#922D48] font-bold">+50 XP عند الإنجاز</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">تجربة جديدة أريد خوضها</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">وصف التجربة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تسلق جبل، تجربة رياضة التجديف، يوم كامل بدون شاشات..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">سبب الرغبة في خوضها</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="ما الأثر الذي تتوقعه على نظرتك للحياة؟..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">مستوى الحماس (1-5)</label>
                  <select
                    value={excitementLevel}
                    onChange={(e) => setExcitementLevel(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl} / 5</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">المدة المتوقعة</label>
                  <input
                    type="text"
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    placeholder="ساعة، نصف يوم..."
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
                  حفظ التجربة (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
