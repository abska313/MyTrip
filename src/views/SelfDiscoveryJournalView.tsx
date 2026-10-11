import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { JournalEntry } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Compass,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  Save
} from 'lucide-react';

export const SelfDiscoveryJournalView: React.FC = () => {
  const { addXp } = useApp();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Form states for today's reflection
  const [wentWell, setWentWell] = useState('');
  const [wasHard, setWasHard] = useState('');
  const [learnedAboutSelf, setLearnedAboutSelf] = useState('');
  const [habitToUnderstand, setHabitToUnderstand] = useState('');
  const [canChangeTomorrow, setCanChangeTomorrow] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [coreValues, setCoreValues] = useState('');
  const [freeText, setFreeText] = useState('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const list = await getAllItems<JournalEntry>('journal');
    setEntries(list.sort((a, b) => b.date.localeCompare(a.date)));

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = list.find((e) => e.date === todayStr);
    if (todayEntry) {
      setWentWell(todayEntry.wentWell);
      setWasHard(todayEntry.wasHard);
      setLearnedAboutSelf(todayEntry.learnedAboutSelf);
      setHabitToUnderstand(todayEntry.habitToUnderstand);
      setCanChangeTomorrow(todayEntry.canChangeTomorrow);
      setGratitude(todayEntry.gratitude);
      setCoreValues(todayEntry.coreValues);
      setFreeText(todayEntry.freeText);
      setEnergyLevel(todayEntry.energyLevel || 3);
    }
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const entryId = `entry_${selectedDate}`;
    const newEntry: JournalEntry = {
      id: entryId,
      date: selectedDate,
      wentWell,
      wasHard,
      learnedAboutSelf,
      habitToUnderstand,
      canChangeTomorrow,
      gratitude,
      coreValues,
      freeText,
      energyLevel
    };

    await putItem('journal', newEntry);
    await loadEntries();
    await addXp(25, `journal_${selectedDate}`, 'تدوين تأمل صادق في دفتر اكتشاف الذات');
    alert('تم حفظ التدوينة بنجاح محليًا في جهازك.');
  };

  const handleDelete = async (id: string) => {
    await deleteItem('journal', id);
    await loadEntries();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">دفتر اكتشاف الذات</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          مساحة خاصة وآمنة تمامًا لرصد السلوك، وفهم المحفزات، والامتنان للنعم اليومية.
        </p>
      </div>

      {/* Editor Card */}
      <form onSubmit={handleSaveEntry} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30262B] pb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#922D48]" />
            <h3 className="text-base font-extrabold text-[#F4F0F1]">تأمل اليوم ({selectedDate})</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
          />
        </div>

        {/* Guided Prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              1. ما الذي سار جيدًا اليوم؟
            </label>
            <textarea
              rows={2}
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              placeholder="إنجاز صغير، محادثة مريحة، عادة التزمت بها..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              2. ما الذي كان صعبًا أو استهلك طاقتك؟
            </label>
            <textarea
              rows={2}
              value={wasHard}
              onChange={(e) => setWasHard(e.target.value)}
              placeholder="موقف ضاغط، تشتت، شعور بالإحباط..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              3. ما الذي تعلمته عن نفسي اليوم؟
            </label>
            <textarea
              rows={2}
              value={learnedAboutSelf}
              onChange={(e) => setLearnedAboutSelf(e.target.value)}
              placeholder="ردة فعل لاحظتها، نقطة قوة، أو محفز غير مقصود..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              4. ما العادة أو التصرف الذي أريد فهمه بعمق؟
            </label>
            <textarea
              rows={2}
              value={habitToUnderstand}
              onChange={(e) => setHabitToUnderstand(e.target.value)}
              placeholder="لماذا أسوّف عند هذه المهمة تحديدًا؟..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              5. ما الشيء الواقعي الذي أستطيع تغييره غدًا؟
            </label>
            <textarea
              rows={2}
              value={canChangeTomorrow}
              onChange={(e) => setCanChangeTomorrow(e.target.value)}
              placeholder="تعديل توقيت مهمة، النوم أبكر بنصف ساعة..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#F4F0F1] mb-1">
              6. ما الأمور والنعم التي أقدّرها في حياتي اليوم؟
            </label>
            <textarea
              rows={2}
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder="نعم بسيطة: صحة، أمان، كوب قهوة، فرصة للبدء من جديد..."
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-[#F4F0F1] mb-1 text-xs">
            7. مساحة حرة للكتابة وتفريغ الذهن:
          </label>
          <textarea
            rows={3}
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="اكتب بحرية كاملة دون قيود أو تنقيح..."
            className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-3 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-[#6D1028]/30 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التدوينة في الدفتر المحلي (+25 XP)</span>
        </button>
      </form>

      {/* Past Entries Archive */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#F4F0F1]">التدوينات السابقة ({entries.length} تدوينات):</h3>
          <div className="space-y-2">
            {entries.map((entry) => {
              const isExp = expandedId === entry.id;
              return (
                <div key={entry.id} className="rounded-2xl border border-[#30262B] bg-[#151316] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F4F0F1] flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#922D48]" />
                      <span>{entry.date}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExp ? null : entry.id)}
                        className="text-[#AAA2A7] hover:text-white"
                      >
                        {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-[#AAA2A7] hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {entry.gratitude && (
                    <div className="text-[#AAA2A7] italic">
                      امتنان: «{entry.gratitude}»
                    </div>
                  )}

                  {isExp && (
                    <div className="pt-2 border-t border-[#30262B] space-y-2 text-[#AAA2A7] text-[11px] leading-relaxed">
                      {entry.wentWell && <div><strong>ما سار جيدًا:</strong> {entry.wentWell}</div>}
                      {entry.wasHard && <div><strong>ما كان صعبًا:</strong> {entry.wasHard}</div>}
                      {entry.learnedAboutSelf && <div><strong>ما تعلمته:</strong> {entry.learnedAboutSelf}</div>}
                      {entry.freeText && <div><strong>ملاحظات حرة:</strong> {entry.freeText}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
