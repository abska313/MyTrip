import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { putItem } from '../db/indexedDB';
import { X, CheckCircle2, Feather, Clock, Activity, Plus } from 'lucide-react';

export const QuickActionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { addTask, addXp } = useApp();
  const [activeType, setActiveType] = useState<'task' | 'reflection' | 'movement'>('task');

  // Quick Task
  const [taskTitle, setTaskTitle] = useState('');

  // Quick Reflection
  const [reflectionText, setReflectionText] = useState('');

  // Quick Movement
  const [activityType, setActivityType] = useState('مشي خفيف');
  const [durationMins, setDurationMins] = useState(15);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (activeType === 'task') {
      if (!taskTitle.trim()) return;
      await addTask({
        title: taskTitle.trim(),
        pathwayId: 'discipline_consistency',
        difficulty: 'سهل',
        estimatedMinutes: 10,
        status: 'pending',
        frequency: 'daily',
        xpReward: 20,
        isHardDayApproved: true
      });
      setTaskTitle('');
    } else if (activeType === 'reflection') {
      if (!reflectionText.trim()) return;
      await putItem('journal', {
        id: `entry_${today}`,
        date: today,
        wentWell: '',
        wasHard: '',
        learnedAboutSelf: '',
        habitToUnderstand: '',
        canChangeTomorrow: '',
        gratitude: reflectionText.trim(),
        coreValues: '',
        freeText: reflectionText.trim()
      });
      await addXp(20, `quick_reflection_${Date.now()}`, 'تسجيل تأمل سريع');
      setReflectionText('');
    } else if (activeType === 'movement') {
      await putItem('physical_logs', {
        id: `phys_${Date.now()}`,
        date: today,
        activityType,
        durationMinutes: durationMins,
        effortLevel: 'خفيف',
        notes: 'تسجيل سريع'
      });
      await addXp(20, `quick_move_${Date.now()}`, `تسجيل نشاط حركي سريع: ${activityType}`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#151316] border border-[#30262B] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
          <h3 className="text-sm font-bold text-[#F4F0F1]">تسجيل سريع فوري</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#AAA2A7] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Type Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] text-xs">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-2 rounded-lg font-bold transition ${
              activeType === 'task' ? 'bg-[#6D1028] text-white' : 'text-[#AAA2A7]'
            }`}
          >
            مهمة
          </button>
          <button
            type="button"
            onClick={() => setActiveType('reflection')}
            className={`py-2 rounded-lg font-bold transition ${
              activeType === 'reflection' ? 'bg-[#6D1028] text-white' : 'text-[#AAA2A7]'
            }`}
          >
            تأمل
          </button>
          <button
            type="button"
            onClick={() => setActiveType('movement')}
            className={`py-2 rounded-lg font-bold transition ${
              activeType === 'movement' ? 'bg-[#6D1028] text-white' : 'text-[#AAA2A7]'
            }`}
          >
            نشاط
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {activeType === 'task' && (
            <div>
              <label className="block text-[#AAA2A7] mb-1 font-semibold">عنوان المهمة:</label>
              <input
                type="text"
                required
                placeholder="مثال: الاتصال بـ...، مراجعة فقرة..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          )}

          {activeType === 'reflection' && (
            <div>
              <label className="block text-[#AAA2A7] mb-1 font-semibold">خاطرة أو تأمل سريع:</label>
              <textarea
                rows={3}
                required
                placeholder="ما الذي يدور في ذهنك الآن؟..."
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          )}

          {activeType === 'movement' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[#AAA2A7] mb-1 font-semibold">نوع النشاط:</label>
                <input
                  type="text"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#AAA2A7] mb-1 font-semibold">المدة (دقيقة):</label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 transition shadow-lg shadow-[#6D1028]/25"
          >
            تسجيل فوري
          </button>
        </form>
      </div>
    </div>
  );
};
