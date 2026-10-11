import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  exportFullDatabase,
  validateBackup,
  restoreFullDatabase,
  resetFullDatabase
} from '../db/indexedDB';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  FolderArchive,
  FileCode,
  GitBranch,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const SettingsBackupView: React.FC = () => {
  const { profile, updateProfile, simulateDay, journeyStats, refreshAllData } = useApp();

  // Profile fields editing
  const [name, setName] = useState(profile?.name || '');
  const [wakeTime, setWakeTime] = useState(profile?.wakeTime || '06:30');
  const [sleepTime, setSleepTime] = useState(profile?.sleepTime || '23:00');
  const [difficulty, setDifficulty] = useState(profile?.difficultyPreference || 'متوازن');
  const [smartAdaptation, setSmartAdaptation] = useState(profile?.smartAdaptationEnabled ?? true);

  // Backup states
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupPreview, setBackupPreview] = useState<{ summary: string; parsed: any } | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInput, setResetInput] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name: name.trim(),
      wakeTime,
      sleepTime,
      difficultyPreference: difficulty,
      smartAdaptationEnabled: smartAdaptation
    });
    alert('تم حفظ الإعدادات بنجاح.');
  };

  // Export JSON backup
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const json = await exportFullDatabase();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `abska_214_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('فشل تصدير النسخة الاحتياطية.');
    } finally {
      setIsExporting(false);
    }
  };

  // Select File for Import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackup(content);
      if (!validation.isValid) {
        setImportStatus(`❌ خطأ: ${validation.message}`);
        setBackupPreview(null);
        return;
      }

      const parsed = validation.data;
      const tasksCount = parsed.stores?.tasks?.length || 0;
      const journalCount = parsed.stores?.journal?.length || 0;
      const date = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleDateString('ar-EG') : 'غير محدد';

      setBackupPreview({
        summary: `نسخة من تاريخ ${date} تحتوي على ${tasksCount} مهام، ${journalCount} تدوينات.`,
        parsed
      });
      setImportStatus('✅ الملف صالح للاستعادة. يرجى تأكيد الاستبدال.');
    };
    reader.readAsText(file);
  };

  // Confirm Restore
  const handleConfirmRestore = async () => {
    if (!backupPreview?.parsed) return;
    setIsImporting(true);
    try {
      const result = await restoreFullDatabase(backupPreview.parsed);
      await refreshAllData();
      alert(`تمت استعادة البيانات بنجاح (${result.count} سجل).`);
      setBackupPreview(null);
      setImportStatus(null);
    } catch (e) {
      console.error(e);
      setImportStatus('❌ حدث خطأ أثناء استعادة البيانات.');
    } finally {
      setIsImporting(false);
    }
  };

  // Full Reset
  const handleResetApp = async () => {
    if (resetInput !== 'حذف نهائي') return;
    await resetFullDatabase();
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">الإعدادات والنسخ الاحتياطي</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          إدارة بياناتك محليًا، وتصدير واستيراد النسخ الاحتياطية بصيغة JSON آمنة.
        </p>
      </div>

      {/* Edit Profile */}
      <form onSubmit={handleSaveProfile} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#F4F0F1] border-b border-[#30262B] pb-3">
          تعديل الإعدادات الشخصية:
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#AAA2A7] mb-1">الاسم أو اللقب</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2A7] mb-1">الاستيقاظ</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#AAA2A7] mb-1">النوم</label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#AAA2A7] mb-1">الصعوبة المفضلة</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              >
                <option value="هادئ">هادئ</option>
                <option value="متوازن">متوازن</option>
                <option value="مكثف">مكثف</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="smartAdaptCheck"
                checked={smartAdaptation}
                onChange={(e) => setSmartAdaptation(e.target.checked)}
                className="rounded border-[#30262B] text-[#6D1028]"
              />
              <label htmlFor="smartAdaptCheck" className="text-xs text-[#AAA2A7] cursor-pointer">
                تفعيل التكيّف الذكي بالقواعد المحلية
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
        >
          حفظ التعديلات
        </button>
      </form>

      {/* Backup & Restore (Section 26) */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <h3 className="text-sm font-bold text-[#F4F0F1] border-b border-[#30262B] pb-3">
          النسخ الاحتياطي واستعادة البيانات:
        </h3>

        <p className="text-xs text-[#AAA2A7] leading-relaxed">
          بياناتك لا تُرفع إلى أي سيرفر. لحماية إنجازاتك من فقدان المتصفح، يمكنك تنزيل ملف نسخة احتياطية كامل بصيغة JSON في أي وقت واستعادته على أي جهاز.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export */}
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs font-bold text-[#F4F0F1] hover:border-[#6D1028] transition"
          >
            <Download className="w-4 h-4 text-[#922D48]" />
            <span>{isExporting ? 'جاري تجهيز النسخة...' : 'تصدير نسخة احتياطية (JSON)'}</span>
          </button>

          {/* Import */}
          <label className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs font-bold text-[#F4F0F1] hover:border-[#6D1028] transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>استيراد واستعادة نسخة سابقة</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Status / Preview */}
        {importStatus && (
          <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] text-xs text-[#AAA2A7] space-y-2">
            <div>{importStatus}</div>
            {backupPreview && (
              <div className="space-y-2">
                <div className="font-semibold text-[#F4F0F1]">{backupPreview.summary}</div>
                <button
                  onClick={handleConfirmRestore}
                  disabled={isImporting}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-600"
                >
                  {isImporting ? 'جاري الاستعادة...' : 'تأكيد استبدال البيانات بالنسخة'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Project Source Code Download (ZIP) */}
      <div className="rounded-3xl border border-[#922D48]/40 bg-gradient-to-b from-[#1c1419] to-[#151316] p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#30262B] pb-3">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-[#922D48]" />
            <h3 className="text-sm font-bold text-[#F4F0F1]">
              تحميل ملف المشروع والأكواد كاملة (Source Code ZIP)
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6D1028]/40 border border-[#922D48]/40 text-[#F4F0F1]">
            جاهز ومحدّث
          </span>
        </div>

        <p className="text-xs text-[#AAA2A7] leading-relaxed">
          يمكنك تحميل الحزمة الكاملة لكود المشروع مرتبة ونظيفة (React + TypeScript + Vite + Tailwind CSS + PWA) بملف مضغوط واحد <span className="text-[#F4F0F1] font-mono text-[11px]">.zip</span> جاهز للتشغيل محليًا أو الرفع المباشر إلى مستودعك في GitHub.
        </p>

        {/* Big Download Button */}
        <div className="pt-1">
          <a
            href="/rehlati_project_source.zip"
            download="rehlati_project_source.zip"
            className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-white text-xs font-bold shadow-lg shadow-[#6D1028]/20 hover:opacity-95 active:scale-[0.99] transition"
          >
            <Download className="w-4 h-4" />
            <span>تحميل ملف المشروع كاملًا الآن (rehlati_project_source.zip)</span>
          </a>
        </div>

        {/* Quick Guide & Details */}
        <div className="rounded-2xl bg-[#0B0B0D] border border-[#30262B] p-4 space-y-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-[#F4F0F1]">
            <Terminal className="w-4 h-4 text-[#922D48]" />
            <span>كيف تشغل المشروع على حاسوبك بعد التحميل؟</span>
          </div>

          <ol className="space-y-1.5 text-[#AAA2A7] list-decimal list-inside pr-1">
            <li>قم بفك ضغط الملف <span className="font-mono text-[11px] text-[#F4F0F1]">rehlati_project_source.zip</span>.</li>
            <li>افتح مجلد المشروع في برنامج البرمجة (مثل VS Code) أو في الطرفية (Terminal).</li>
            <li>
              نفّذ أمر تثبيت الحزم:
              <span className="block my-1 font-mono text-[11px] bg-[#151316] text-emerald-400 p-2 rounded-lg border border-[#30262B]">
                npm install
              </span>
            </li>
            <li>
              شغّل بيئة التطوير المحلية:
              <span className="block my-1 font-mono text-[11px] bg-[#151316] text-emerald-400 p-2 rounded-lg border border-[#30262B]">
                npm run dev
              </span>
            </li>
          </ol>

          <div className="pt-2 border-t border-[#30262B]/80 flex items-start gap-2 text-[11px] text-[#AAA2A7]">
            <GitBranch className="w-4 h-4 text-[#922D48] shrink-0 mt-0.5" />
            <span>
              <strong>للرفع على GitHub:</strong> جميع الملفات معدّة بنظام المسارات النسبية <code className="text-[#F4F0F1]">base: './'</code> لتشغيل GitHub Pages بدون شاشة بيضاء. يمكنك عمل <code className="text-[#F4F0F1]">git init</code> و <code className="text-[#F4F0F1]">git push</code> مباشرة!
            </span>
          </div>
        </div>
      </div>

      {/* QA & Testing Day Simulation Controls (Section 34) */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
          <SlidersHorizontal className="w-4 h-4 text-[#922D48]" />
          <span>اختبار ومحاكاة الأيام (للمعاينة والتحقق):</span>
        </div>
        <p className="text-xs text-[#AAA2A7]">
          اختبر انتقال التطبيق بين الأيام المفصلية (اليوم 1، 30، 31، 210، 214) كما ورد في خطة الاختبار:
        </p>
        <div className="flex flex-wrap gap-2 text-xs pt-1">
          {[1, 30, 31, 210, 214].map((d) => (
            <button
              key={d}
              onClick={() => simulateDay(d)}
              className={`px-3 py-1.5 rounded-lg border font-bold transition ${
                journeyStats.currentDay === d
                  ? 'border-[#922D48] bg-[#6D1028] text-white'
                  : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
              }`}
            >
              اليوم {d}
            </button>
          ))}
          <button
            onClick={() => simulateDay(null)}
            className="px-3 py-1.5 rounded-lg border border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:text-white"
          >
            إعادة للواقع
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset App */}
      <div className="rounded-3xl border border-red-950/60 bg-[#151316] p-6 space-y-3">
        <h3 className="text-xs font-bold text-red-400 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          <span>منطقة الحذر: إعادة ضبط التطبيق بالكامل</span>
        </h3>
        <p className="text-xs text-[#AAA2A7] leading-relaxed">
          إعادة ضبط التطبيق تمسح كافة المهام والمذكرات والتاريخ المحلي المخزن على هذا المتصفح. تأكد من أخذ نسخة احتياطية أولاً.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl border border-red-900 bg-red-950/40 text-xs font-bold text-red-300 hover:bg-red-900/50"
          >
            إعادة ضبط التطبيق...
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-red-900 space-y-3">
            <div className="text-xs text-red-300">
              للتأكيد الصريح، اكتب <strong>«حذف نهائي»</strong> في الحقل التالي:
            </div>
            <input
              type="text"
              placeholder="حذف نهائي"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              className="w-full rounded-xl bg-[#151316] border border-red-900 px-3 py-2 text-xs text-[#F4F0F1] focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                disabled={resetInput !== 'حذف نهائي'}
                onClick={handleResetApp}
                className="px-4 py-2 rounded-xl bg-red-700 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-40"
              >
                تأكيد الحذف وإعادة التهيئة
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetInput('');
                }}
                className="px-4 py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
