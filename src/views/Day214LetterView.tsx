import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FutureLetter, BookItem, SkillProject } from '../types';
import { getItem, putItem, getAllItems } from '../db/indexedDB';
import {
  Mail,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  CheckCircle2,
  Crown,
  BookOpen,
  Code
} from 'lucide-react';

export const Day214LetterView: React.FC = () => {
  const { journeyStats, xp, levelInfo, tasks, pathways } = useApp();
  const [letter, setLetter] = useState<FutureLetter | null>(null);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [projects, setProjects] = useState<SkillProject[]>([]);
  const [manualUnlocked, setManualUnlocked] = useState(false);

  useEffect(() => {
    const loadLetterAndStats = async () => {
      const storedLetter = await getItem<FutureLetter>('future_letter', 'day_214_letter');
      if (storedLetter) {
        setLetter(storedLetter);
        if (storedLetter.isManuallyUnlocked) {
          setManualUnlocked(true);
        }
      }
      const b = await getAllItems<BookItem>('books');
      const p = await getAllItems<SkillProject>('skills_projects');
      setBooks(b);
      setProjects(p);
    };
    loadLetterAndStats();
  }, []);

  const isDay214Reached = journeyStats.currentDay >= 214 || manualUnlocked;

  const handleManualUnlock = async () => {
    if (!letter) return;
    const updated: FutureLetter = { ...letter, id: letter.id || 'day_214_letter', isManuallyUnlocked: true };
    await putItem('future_letter', updated);
    setManualUnlocked(true);
  };

  const completedBooks = books.filter((b) => b.status === 'completed');
  const completedProjects = projects.filter((p) => p.progressPercent === 100);
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">
          رسالة اليوم 214 — رسالة من نفسي القديمة
        </h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          الرسالة التي كتبتها لنفسك في اليوم الأول، محفورة ومقفلة لتُفتح في محطة الحصاد الكبرى.
        </p>
      </div>

      {!isDay214Reached ? (
        /* LOCKED STATE */
        <div className="rounded-3xl border-2 border-[#30262B] bg-[#151316] p-8 text-center space-y-4 relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-[#0B0B0D] border border-[#30262B] flex items-center justify-center mx-auto text-[#922D48] shadow-lg">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#F4F0F1]">الرسالة مختومة ومقفلة حاليًا</h3>
            <p className="text-xs text-[#AAA2A7] max-w-md mx-auto leading-relaxed">
              كتبت هذه الرسالة في اليوم الأول ({letter?.sealedDate || 'بداية الرحلة'}). ستُفتح تلقائيًا عندما تصل إلى <strong>اليوم 214</strong> (متبقي {journeyStats.daysRemaining} يومًا).
            </p>
          </div>

          <div className="pt-4 border-t border-[#30262B]">
            <button
              onClick={handleManualUnlock}
              className="text-[11px] text-[#AAA2A7] hover:text-white underline"
            >
              فتح الرسالة استثنائيًا الآن (للمعاينة أو الاختبار)
            </button>
          </div>
        </div>
      ) : (
        /* UNLOCKED GRAND FINALE STATE */
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="rounded-3xl border-2 border-[#922D48] bg-gradient-to-b from-[#151316] to-[#0B0B0D] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#30262B] pb-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Crown className="w-4 h-4" />
                <span>رسالتك الأصلية من اليوم الأول:</span>
              </div>
              <span className="text-[10px] text-[#AAA2A7]">كتبت بتاريخ {letter?.sealedDate}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs text-[#F4F0F1] leading-relaxed whitespace-pre-wrap font-serif italic">
              {letter?.content || 'لا توجد رسالة محفوظة للبداية.'}
            </div>
          </div>

          {/* Real Transformation Highlights */}
          <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#F4F0F1]">حصاد الرحلة الفعلي المسجل:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B]">
                <div className="text-[11px] text-[#AAA2A7]">المهام المنجزة</div>
                <div className="text-lg font-black text-[#F4F0F1] mt-1">{completedTasks.length} مهمة</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B]">
                <div className="text-[11px] text-[#AAA2A7]">الكتب المكتملة</div>
                <div className="text-lg font-black text-[#F4F0F1] mt-1">{completedBooks.length} كتب</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B]">
                <div className="text-[11px] text-[#AAA2A7]">المشاريع المنجزة</div>
                <div className="text-lg font-black text-[#F4F0F1] mt-1">{completedProjects.length} مشروع</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#0B0B0D] border border-[#30262B]">
                <div className="text-[11px] text-[#AAA2A7]">اللقب النهائي</div>
                <div className="text-lg font-black text-[#922D48] mt-1">{levelInfo.title}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
