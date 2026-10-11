import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BookItem } from '../types';
import { getItem, putItem, getAllItems, deleteItem } from '../db/indexedDB';
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Star,
  Quote,
  ArrowRight
} from 'lucide-react';

export const ReadingLibraryView: React.FC = () => {
  const { addTask, addXp } = useApp();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState<number>(250);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [status, setStatus] = useState<BookItem['status']>('reading');
  const [notes, setNotes] = useState('');
  const [quoteInput, setQuoteInput] = useState('');
  const [quotes, setQuotes] = useState<string[]>([]);
  const [practicalIdea, setPracticalIdea] = useState('');
  const [rating, setRating] = useState<number>(5);

  useEffect(() => {
    const loadBooks = async () => {
      const items = await getAllItems<BookItem>('books');
      setBooks(items);
    };
    loadBooks();
  }, []);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook: BookItem = {
      id: selectedBook ? selectedBook.id : `book_${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'غير محدد',
      totalPages: totalPages || 200,
      pagesRead: Number(pagesRead) || 0,
      status,
      startDate: selectedBook?.startDate || new Date().toISOString().split('T')[0],
      endDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
      notes,
      quotes,
      keyIdeas: [],
      practicalApplication: practicalIdea,
      rating
    };

    await putItem('books', newBook);
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === newBook.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = newBook;
        return copy;
      }
      return [newBook, ...prev];
    });

    if (!selectedBook) {
      await addXp(30, `book_add_${newBook.id}`, `إضافة كتاب جديد للمكتبة: ${newBook.title}`);
    } else if (status === 'completed' && selectedBook.status !== 'completed') {
      await addXp(75, `book_complete_${newBook.id}`, `إتمام قراءة كتاب: ${newBook.title}`);
    }

    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setTotalPages(250);
    setPagesRead(0);
    setStatus('reading');
    setNotes('');
    setQuoteInput('');
    setQuotes([]);
    setPracticalIdea('');
    setRating(5);
    setSelectedBook(null);
  };

  const handleDeleteBook = async (id: string) => {
    await deleteItem('books', id);
    setBooks(books.filter((b) => b.id !== id));
  };

  // Convert practical idea into a real task
  const handleConvertIdeaToTask = async (book: BookItem) => {
    if (!book.practicalApplication) return;
    await addTask({
      title: `تطبيق من كتاب "${book.title}": ${book.practicalApplication.substring(0, 40)}`,
      description: book.practicalApplication,
      pathwayId: 'knowledge_reading',
      difficulty: 'متوسط',
      estimatedMinutes: 20,
      status: 'pending',
      frequency: 'once',
      xpReward: 35,
      isHardDayApproved: false
    });
    alert('تمت إضافة الفكرة كمهمة عملية في جدول مهامك بنجاح!');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">مكتبة القراءة والتطبيق العملي</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            لا نكتفي بعدّ الصفحات؛ نحول الأفكار الملهمة إلى سلوك ومهام قابلة للتنفيذ.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كتاب جديد</span>
        </button>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">مكتبتك ما زالت بانتظار أول كتاب</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            أضف الكتاب الذي تنوي قراءته في هذه المرحلة وسجل تقدمك واقتباساتك أولًا بأول.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {books.map((b) => {
            const percent = b.totalPages ? Math.min(100, Math.round((b.pagesRead / b.totalPages) * 100)) : 0;
            return (
              <div key={b.id} className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#F4F0F1]">{b.title}</h3>
                    <div className="text-xs text-[#AAA2A7] mt-0.5">المؤلف: {b.author}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteBook(b.id)}
                    className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#AAA2A7]">
                    <span>الصفحات المقروءة: {b.pagesRead} من {b.totalPages || '؟'}</span>
                    <span className="font-bold text-[#F4F0F1]">{percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0B0D] rounded-full overflow-hidden border border-[#30262B]">
                    <div
                      className="h-full bg-gradient-to-r from-[#6D1028] to-[#922D48]"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Practical Idea */}
                {b.practicalApplication && (
                  <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] space-y-2">
                    <div className="text-[11px] font-bold text-[#922D48] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>تطبيق عملي من الكتاب:</span>
                    </div>
                    <p className="text-xs text-[#F4F0F1] leading-relaxed">
                      {b.practicalApplication}
                    </p>
                    <button
                      onClick={() => handleConvertIdeaToTask(b)}
                      className="text-[11px] text-[#AAA2A7] hover:text-white underline font-semibold flex items-center gap-1"
                    >
                      <span>حوّل إلى مهمة عملية في جدولك</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Quotes */}
                {b.quotes && b.quotes.length > 0 && (
                  <div className="text-xs text-[#AAA2A7] italic border-r-2 border-[#6D1028] pr-2.5">
                    «{b.quotes[0]}»
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">إضافة كتاب للمكتبة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">اسم الكتاب *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">المؤلف</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">إجمالي الصفحات</label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">المقروء حاليًا</label>
                  <input
                    type="number"
                    value={pagesRead}
                    onChange={(e) => setPagesRead(Number(e.target.value))}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#AAA2A7] mb-1">الحالة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookItem['status'])}
                    className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  >
                    <option value="reading">قيد القراءة</option>
                    <option value="completed">مكتمل</option>
                    <option value="paused">متوقف مؤقتًا</option>
                    <option value="not_started">لم أبدأ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">
                  تطبيق عملي استخرجته من هذا الكتاب:
                </label>
                <textarea
                  rows={2}
                  value={practicalIdea}
                  onChange={(e) => setPracticalIdea(e.target.value)}
                  placeholder="كيف ستترجم هذه الفكرة إلى سلوك يومي؟..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">اقتباس ملهم:</label>
                <input
                  type="text"
                  value={quoteInput}
                  onChange={(e) => {
                    setQuoteInput(e.target.value);
                    setQuotes(e.target.value ? [e.target.value] : []);
                  }}
                  placeholder="اقتباس يلامس فكرتك..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
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
                  حفظ الكتاب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
