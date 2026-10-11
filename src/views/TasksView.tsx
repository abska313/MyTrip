import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppTask, PathwayId, TaskDifficulty, TaskFrequency } from '../types';
import {
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Zap,
  MoreVertical,
  Check,
  RotateCcw
} from 'lucide-react';

const PATHWAY_NAMES: Record<PathwayId, string> = {
  body_fitness: 'الجسم واللياقة',
  discipline_consistency: 'الانضباط والاستمرارية',
  knowledge_reading: 'المعرفة والقراءة',
  skills_projects: 'المهارات والمشاريع',
  time_management: 'تنظيم الوقت',
  self_discovery: 'اكتشاف الذات',
  spiritual_habits: 'العادات الروحية'
};

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    deferTask,
    isHardDayMode,
    smartSuggestions,
    applySmartSuggestion,
    rejectSmartSuggestion
  } = useApp();

  const [filterPathway, setFilterPathway] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<AppTask | null>(null);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pathwayId, setPathwayId] = useState<PathwayId>('discipline_consistency');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('سهل');
  const [frequency, setFrequency] = useState<TaskFrequency>('daily');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [scheduledTime, setScheduledTime] = useState('');
  const [isHardDayApproved, setIsHardDayApproved] = useState(true);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPathwayId('discipline_consistency');
    setDifficulty('سهل');
    setFrequency('daily');
    setEstimatedMinutes(15);
    setScheduledTime('');
    setIsHardDayApproved(true);
    setEditingTask(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const xpReward = difficulty === 'سهل' ? 20 : difficulty === 'متوسط' ? 35 : 50;

    if (editingTask) {
      await updateTask({
        ...editingTask,
        title: title.trim(),
        description: description.trim() || undefined,
        pathwayId,
        difficulty,
        frequency,
        estimatedMinutes,
        scheduledTime: scheduledTime || undefined,
        isHardDayApproved,
        xpReward
      });
    } else {
      await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        pathwayId,
        difficulty,
        frequency,
        estimatedMinutes,
        scheduledTime: scheduledTime || undefined,
        status: 'pending',
        isHardDayApproved,
        xpReward
      });
    }

    resetForm();
    setShowAddModal(false);
  };

  const openEdit = (task: AppTask) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPathwayId(task.pathwayId);
    setDifficulty(task.difficulty);
    setFrequency(task.frequency);
    setEstimatedMinutes(task.estimatedMinutes);
    setScheduledTime(task.scheduledTime || '');
    setIsHardDayApproved(task.isHardDayApproved ?? true);
    setShowAddModal(true);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterPathway !== 'all' && t.pathwayId !== filterPathway) return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'deferred' && t.status !== 'deferred') return false;
    if (isHardDayMode && !t.isHardDayApproved && t.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">نظام المهام المتدرّج</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            مهام يومية وأسبوعية تدار بالقواعد المحلية وتتكيف مع طاقتك وظروفك.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Hard Day Mode Notice */}
      {isHardDayMode && (
        <div className="rounded-2xl border border-amber-500/60 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span>«وضع اليوم الصعب» مُفعّل: يتم إظهار المهام المصغرة والأساسية فقط لتجنب الضغط.</span>
          </div>
        </div>
      )}

      {/* Smart Adaptation Suggestion Box */}
      {smartSuggestions.length > 0 && (
        <div className="rounded-2xl border border-[#922D48] bg-[#151316] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
              <Sparkles className="w-4 h-4 text-[#922D48]" />
              <span>اقتراح من التكيّف الذكي: {smartSuggestions[0].title}</span>
            </div>
            <span className="text-[10px] text-[#AAA2A7]">محلي 100%</span>
          </div>
          <p className="text-xs text-[#AAA2A7] leading-relaxed">
            {smartSuggestions[0].description}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => applySmartSuggestion(smartSuggestions[0].id)}
              className="px-3.5 py-1.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
            >
              تطبيق التعديل
            </button>
            <button
              onClick={() => rejectSmartSuggestion(smartSuggestions[0].id)}
              className="px-3.5 py-1.5 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white transition"
            >
              رفض
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="space-y-3 bg-[#151316] border border-[#30262B] rounded-2xl p-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#AAA2A7] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث في المهام..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] pr-9 pl-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'pending', label: 'المتبقية' },
            { id: 'completed', label: 'المكتملة' },
            { id: 'deferred', label: 'المؤجلة' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition ${
                filterStatus === tab.id
                  ? 'border-[#922D48] bg-[#6D1028]/30 text-[#F4F0F1]'
                  : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pathway Dropdown */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#30262B]">
          <span className="text-[11px] text-[#AAA2A7] flex-shrink-0">تصفية حسب المسار:</span>
          <select
            value={filterPathway}
            onChange={(e) => setFilterPathway(e.target.value)}
            className="flex-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          >
            <option value="all">جميع المسارات</option>
            {Object.entries(PATHWAY_NAMES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-[#30262B] bg-[#151316] p-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#0B0B0D] border border-[#30262B] flex items-center justify-center mx-auto text-[#AAA2A7]">
              <Check className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-[#F4F0F1]">لا توجد مهام تطابق هذا التصفية</div>
            <p className="text-[11px] text-[#AAA2A7]">
              يمكنك إضافة مهمة جديدة أو تغيير خيارات البحث والتصفية أعلاه.
            </p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isDone = t.status === 'completed';
            const isDeferred = t.status === 'deferred';
            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-4 transition ${
                  isDone
                    ? 'border-[#30262B] bg-[#151316]/50 opacity-75'
                    : 'border-[#30262B] bg-[#151316] hover:border-[#6D1028]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(t.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                        isDone
                          ? 'border-[#922D48] bg-[#6D1028] text-white'
                          : 'border-[#30262B] hover:border-[#922D48]'
                      }`}
                      title={isDone ? 'إلغاء الإكمال' : 'إكمال المهمة'}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-bold ${isDone ? 'line-through text-[#AAA2A7]' : 'text-[#F4F0F1]'}`}>
                          {t.title}
                        </span>
                        {isDeferred && (
                          <span className="text-[10px] rounded-md bg-amber-950/60 border border-amber-800 text-amber-300 px-1.5 py-0.5">
                            مؤجلة
                          </span>
                        )}
                        {t.isHardDayApproved && (
                          <span className="text-[10px] rounded-md bg-[#3B0A18] text-[#AAA2A7] px-1.5 py-0.5">
                            يوم صعب ✓
                          </span>
                        )}
                      </div>

                      {t.description && (
                        <p className="text-xs text-[#AAA2A7] mt-1 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#AAA2A7]">
                        <span className="bg-[#0B0B0D] border border-[#30262B] px-2 py-0.5 rounded-md text-[#F4F0F1]">
                          {PATHWAY_NAMES[t.pathwayId]}
                        </span>
                        <span>{t.estimatedMinutes} دقيقة</span>
                        {t.scheduledTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{t.scheduledTime}</span>
                          </span>
                        )}
                        <span className="text-[#922D48] font-bold">+{t.xpReward} XP</span>
                        {t.deferredCount && t.deferredCount > 0 ? (
                          <span className="text-amber-400">تأجلت {t.deferredCount} مرات</span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isDone && (
                      <button
                        onClick={() => deferTask(t.id)}
                        title="تأجيل المهمة"
                        className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-white hover:bg-[#0B0B0D]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(t)}
                      title="تعديل"
                      className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-white hover:bg-[#0B0B0D]"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      title="حذف"
                      className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400 hover:bg-[#0B0B0D]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">
                {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#AAA2A7] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                  عنوان المهمة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قراءة 15 صفحة من الكتاب"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                  الوصف أو الملاحظات (اختياري)
                </label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل التنفيذ أو الخطوة الأولى..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                    المسار
                  </label>
                  <select
                    value={pathwayId}
                    onChange={(e) => setPathwayId(e.target.value as PathwayId)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  >
                    {Object.entries(PATHWAY_NAMES).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                    مستوى الصعوبة
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  >
                    <option value="سهل">سهل (+20 XP)</option>
                    <option value="متوسط">متوسط (+35 XP)</option>
                    <option value="تحدي">تحدي (+50 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                    الوقت المقدر (د)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                    الموعد (اختياري)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#AAA2A7] mb-1">
                    التكرار
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as TaskFrequency)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  >
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="phase">تحدي المرحلة</option>
                    <option value="once">مرة واحدة</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hardDayCheck"
                  checked={isHardDayApproved}
                  onChange={(e) => setIsHardDayApproved(e.target.checked)}
                  className="rounded border-[#30262B] text-[#6D1028] focus:ring-0"
                />
                <label htmlFor="hardDayCheck" className="text-xs text-[#AAA2A7] cursor-pointer">
                  تفعيل هذه المهمة في «وضع اليوم الصعب» (مهمة مصغرة أو أساسية)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#30262B]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 transition"
                >
                  {editingTask ? 'حفظ التعديلات' : 'إضافة المهمة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
