import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BeforeAfterPhotos, WeeklyWeightEntry } from '../types';
import { getItem, putItem, getAllItems } from '../db/indexedDB';
import {
  Camera,
  Trash2,
  Calendar,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  ShieldCheck,
  Upload,
  ArrowRightLeft,
  CheckCircle2,
  Scale,
  Maximize2,
  X,
  Edit2
} from 'lucide-react';

interface BeforeAfterPhotosWidgetProps {
  compact?: boolean;
  onOpenFullView?: () => void;
}

export const BeforeAfterPhotosWidget: React.FC<BeforeAfterPhotosWidgetProps> = ({
  compact = false,
  onOpenFullView
}) => {
  const { profile, addXp } = useApp();
  const [data, setData] = useState<BeforeAfterPhotos>({
    id: 'transformation_photos'
  });
  const [latestWeightFromLogs, setLatestWeightFromLogs] = useState<number | undefined>(undefined);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<'before' | 'after' | 'compare' | null>(null);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);

  // Edit details states
  const [editBeforeDate, setEditBeforeDate] = useState('');
  const [editBeforeWeight, setEditBeforeWeight] = useState('');
  const [editAfterDate, setEditAfterDate] = useState('');
  const [editAfterWeight, setEditAfterWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    // Also fetch latest weekly weight if available
    const weeklyLogs = await getAllItems<WeeklyWeightEntry>('weekly_weight_logs');
    if (weeklyLogs.length > 0) {
      const sorted = weeklyLogs.sort((a, b) => a.date.localeCompare(b.date));
      setLatestWeightFromLogs(sorted[sorted.length - 1].weightKg);
    }

    const item = await getItem<BeforeAfterPhotos>('before_after_photos', 'transformation_photos');
    if (item) {
      setData(item);
      setEditBeforeDate(item.beforeDate || profile?.startDate || new Date().toISOString().split('T')[0]);
      setEditBeforeWeight(item.beforeWeightKg !== undefined ? String(item.beforeWeightKg) : profile?.initialWeightKg ? String(profile.initialWeightKg) : '');
      setEditAfterDate(item.afterDate || new Date().toISOString().split('T')[0]);
      setEditAfterWeight(item.afterWeightKg !== undefined ? String(item.afterWeightKg) : '');
      setEditNotes(item.notes || '');
    } else {
      const defaultState: BeforeAfterPhotos = {
        id: 'transformation_photos',
        beforeDate: profile?.startDate || new Date().toISOString().split('T')[0],
        beforeWeightKg: profile?.initialWeightKg,
        afterDate: new Date().toISOString().split('T')[0]
      };
      setData(defaultState);
      setEditBeforeDate(defaultState.beforeDate || '');
      setEditBeforeWeight(defaultState.beforeWeightKg !== undefined ? String(defaultState.beforeWeightKg) : '');
      setEditAfterDate(defaultState.afterDate || '');
      setEditAfterWeight('');
    }
  };

  const handlePhotoUpload = (type: 'before' | 'after') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        // Compress to max 850px to ensure fast IndexedDB loading and good quality
        const canvas = document.createElement('canvas');
        const maxDim = 850;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        const today = new Date().toISOString().split('T')[0];
        const updated: BeforeAfterPhotos = {
          ...data,
          id: 'transformation_photos',
          ...(type === 'before'
            ? {
                beforePhoto: compressedBase64,
                beforeDate: data.beforeDate || profile?.startDate || today,
                beforeWeightKg: data.beforeWeightKg || profile?.initialWeightKg
              }
            : {
                afterPhoto: compressedBase64,
                afterDate: today,
                afterWeightKg: data.afterWeightKg || latestWeightFromLogs
              })
        };

        await putItem('before_after_photos', updated);
        setData(updated);
        await addXp(40, `photo_${type}_uploaded`, `إضافة صورة ${type === 'before' ? 'قبل التحدي' : 'بعد النزول'}`);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = async (type: 'before' | 'after') => {
    if (!window.confirm(`هل أنت متأكد من حذف صورة ${type === 'before' ? 'قبل التحدي' : 'بعد النزول'}؟`)) {
      return;
    }
    const updated: BeforeAfterPhotos = {
      ...data,
      id: 'transformation_photos',
      ...(type === 'before'
        ? { beforePhoto: undefined }
        : { afterPhoto: undefined })
    };
    await putItem('before_after_photos', updated);
    setData(updated);
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BeforeAfterPhotos = {
      ...data,
      id: 'transformation_photos',
      beforeDate: editBeforeDate || undefined,
      beforeWeightKg: editBeforeWeight ? Number(editBeforeWeight) : undefined,
      afterDate: editAfterDate || undefined,
      afterWeightKg: editAfterWeight ? Number(editAfterWeight) : undefined,
      notes: editNotes.trim() || undefined
    };
    await putItem('before_after_photos', updated);
    setData(updated);
    setShowEditDetailsModal(false);
  };

  // Difference between photos weight
  const beforeWeight = data.beforeWeightKg !== undefined ? data.beforeWeightKg : profile?.initialWeightKg;
  const afterWeight = data.afterWeightKg !== undefined ? data.afterWeightKg : latestWeightFromLogs;
  const weightDiff =
    beforeWeight !== undefined && afterWeight !== undefined
      ? Number((afterWeight - beforeWeight).toFixed(1))
      : undefined;

  // COMPACT VIEW (Dashboard Mode)
  if (compact) {
    return (
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#6D1028]/40 border border-[#922D48]/40 text-[#F4F0F1]">
              <Camera className="w-4 h-4 text-[#922D48]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F4F0F1]">مقارنة صورتي (قبل التحدي وبعد النزول)</h3>
              <p className="text-[10px] text-[#AAA2A7]">
                توثيق مرئي لثمار الانضباط والتحوّل الجسدي
              </p>
            </div>
          </div>

          {onOpenFullView && (
            <button
              onClick={onOpenFullView}
              className="text-[11px] font-bold text-[#922D48] hover:text-[#F4F0F1] transition"
            >
              عرض المقارنة الكاملة ⬅
            </button>
          )}
        </div>

        {/* Difference badge if both weights are available */}
        {weightDiff !== undefined && (
          <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#30262B] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              {weightDiff < 0 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>فارق النزول: {Math.abs(weightDiff)} كغ</span>
                </span>
              ) : weightDiff > 0 ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>تغير الوزن: +{weightDiff} كغ</span>
                </span>
              ) : (
                <span className="text-[#AAA2A7] flex items-center gap-1">
                  <Minus className="w-3.5 h-3.5" />
                  <span>نفس الوزن بين الصورتين</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#AAA2A7]">
              {beforeWeight} كغ ← {afterWeight} كغ
            </span>
          </div>
        )}

        {/* Side by side mini previews */}
        <div className="grid grid-cols-2 gap-3">
          {/* Before Preview */}
          <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-3 text-center space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#F4F0F1]">قبل التحدي</span>
              {beforeWeight && <span className="text-[#AAA2A7]">{beforeWeight} كغ</span>}
            </div>

            {data.beforePhoto ? (
              <div
                onClick={() => setFullScreenPhoto('before')}
                className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#151316] cursor-pointer group border border-[#30262B]"
              >
                <img
                  src={data.beforePhoto}
                  alt="قبل التحدي"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-[#30262B] bg-[#151316] cursor-pointer hover:border-[#6D1028] transition p-3 space-y-2">
                <Upload className="w-5 h-5 text-[#922D48]" />
                <span className="text-[10px] font-bold text-[#AAA2A7]">إضافة صورة البداية</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('before')}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* After Preview */}
          <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-3 text-center space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-emerald-400">بعد النزول</span>
              {afterWeight && <span className="text-emerald-400 font-bold">{afterWeight} كغ</span>}
            </div>

            {data.afterPhoto ? (
              <div
                onClick={() => setFullScreenPhoto('after')}
                className="relative rounded-xl overflow-hidden aspect-[3/4] bg-[#151316] cursor-pointer group border border-emerald-500/30"
              >
                <img
                  src={data.afterPhoto}
                  alt="بعد النزول"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-emerald-500/30 bg-[#151316] cursor-pointer hover:border-emerald-500 transition p-3 space-y-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">إضافة صورة بعد</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('after')}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Fullscreen Photo Modal */}
        {renderFullScreenModal()}
      </div>
    );
  }

  // FULL VIEW (PhysicalTrackerView Mode)
  return (
    <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30262B] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] text-white shadow-md">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#F4F0F1]">مقارنة التحوّل (قبل التحدي وبعد الوزن / نهاية رحلتي)</h3>
            <p className="text-xs text-[#AAA2A7] mt-0.5">
              وثّق صورتك قبل بدء التحدي وصورتك بعد تحقيق نزول الوزن لرؤية الفارق المرئي العظيم.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditDetailsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#30262B] bg-[#0B0B0D] text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>تعديل التواريخ والأوزان</span>
          </button>
          {data.beforePhoto && data.afterPhoto && (
            <button
              onClick={() => setFullScreenPhoto('compare')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition shadow-md shadow-[#6D1028]/25"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>مقارنة كاملة للشاشة</span>
            </button>
          )}
        </div>
      </div>

      {/* Difference Banner if both weights known */}
      {weightDiff !== undefined && (
        <div className="p-4 rounded-2xl bg-[#0B0B0D] border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
            <TrendingDown className="w-5 h-5" />
            <span>
              {weightDiff < 0
                ? `فارق النزول بين الصورتين: ${Math.abs(weightDiff)} كغ (نزول رائع وملموس!)`
                : weightDiff > 0
                ? `تغير الوزن: +${weightDiff} كغ`
                : 'نفس الوزن في الصورتين'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#AAA2A7] text-[11px]">
            <span>الوزن قبل: <strong className="text-[#F4F0F1]">{beforeWeight} كغ</strong></span>
            <span>←</span>
            <span>الوزن بعد: <strong className="text-emerald-400">{afterWeight} كغ</strong></span>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 bg-[#0B0B0D] px-3.5 py-2 rounded-xl border border-[#30262B]">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>الصور محفوظة ومشفرة محليًا على جهازك فقط (IndexedDB) ولن تُرفع لأي خادم أو جهة خارجية حفاظًا على خصوصيتك.</span>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* BEFORE PHOTO (قبل التحدي) */}
        <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#6D1028]" />
              <h4 className="text-sm font-bold text-[#F4F0F1]">صورة قبل التحدي (البداية)</h4>
            </div>
            {data.beforePhoto && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFullScreenPhoto('before')}
                  className="text-[#AAA2A7] hover:text-[#F4F0F1] p-1.5 rounded-lg border border-[#30262B]"
                  title="تكبير"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePhoto('before')}
                  className="text-[#AAA2A7] hover:text-red-400 p-1.5 rounded-lg border border-[#30262B]"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {data.beforePhoto ? (
            <div className="space-y-3">
              <div
                onClick={() => setFullScreenPhoto('before')}
                className="relative rounded-2xl overflow-hidden border border-[#30262B] bg-[#151316] cursor-pointer group"
              >
                <img
                  src={data.beforePhoto}
                  alt="قبل التحدي"
                  className="w-full h-80 object-cover group-hover:scale-102 transition duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white border border-white/20 font-bold">
                  قبل التحدي
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-[#AAA2A7] px-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#922D48]" />
                  <span>تاريخ الصورة: {data.beforeDate || 'بداية الرحلة'}</span>
                </span>
                {beforeWeight && (
                  <span className="font-extrabold text-[#F4F0F1] flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#922D48]" />
                    <span>{beforeWeight} كغ</span>
                  </span>
                )}
              </div>

              <label className="cursor-pointer block text-center py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition">
                <span>تغيير صورة قبل</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('before')}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="h-80 rounded-2xl border-2 border-dashed border-[#30262B] flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#151316] border border-[#30262B] flex items-center justify-center text-[#AAA2A7]">
                <Camera className="w-7 h-7 text-[#922D48]" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#F4F0F1]">أضف صورتك في بداية التحدي</div>
                <p className="text-xs text-[#AAA2A7] max-w-xs">
                  التقط صورة واضحة لتوثيق نقطة البداية للمقارنة لاحقًا مع نهاية الرحلة.
                </p>
              </div>

              <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition flex items-center gap-2 shadow-md shadow-[#6D1028]/25">
                <Upload className="w-4 h-4" />
                <span>اختيار صورة قبل</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('before')}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* AFTER PHOTO (بعد التحدي / نهاية الرحلة) */}
        <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h4 className="text-sm font-bold text-[#F4F0F1]">صورة بعد النزول / نهاية رحلتي</h4>
            </div>
            {data.afterPhoto && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFullScreenPhoto('after')}
                  className="text-[#AAA2A7] hover:text-[#F4F0F1] p-1.5 rounded-lg border border-[#30262B]"
                  title="تكبير"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeletePhoto('after')}
                  className="text-[#AAA2A7] hover:text-red-400 p-1.5 rounded-lg border border-[#30262B]"
                  title="حذف الصورة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {data.afterPhoto ? (
            <div className="space-y-3">
              <div
                onClick={() => setFullScreenPhoto('after')}
                className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#151316] cursor-pointer group"
              >
                <img
                  src={data.afterPhoto}
                  alt="بعد النزول"
                  className="w-full h-80 object-cover group-hover:scale-102 transition duration-300"
                />
                <div className="absolute bottom-2 right-2 bg-emerald-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-emerald-300 border border-emerald-500/40 font-bold">
                  بعد النزول والتحوّل ✓
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-[#AAA2A7] px-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تاريخ الصورة: {data.afterDate || 'اليوم'}</span>
                </span>
                {afterWeight && (
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>{afterWeight} كغ</span>
                  </span>
                )}
              </div>

              <label className="cursor-pointer block text-center py-2 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition">
                <span>تغيير صورة بعد</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('after')}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="h-80 rounded-2xl border-2 border-dashed border-emerald-500/30 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#151316] border border-[#30262B] flex items-center justify-center text-[#AAA2A7]">
                <Sparkles className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#F4F0F1]">أضف صورتك بعد النزول أو نهاية رحلتك</div>
                <p className="text-xs text-[#AAA2A7] max-w-xs">
                  أضف صورتك عند ملاحظة التغير أو بعد كل مرحلة أو في ختام الـ 214 يومًا لترى الفارق الحقيقي.
                </p>
              </div>

              <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 transition flex items-center gap-2 shadow-md shadow-[#6D1028]/25">
                <Upload className="w-4 h-4" />
                <span>اختيار صورة بعد</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload('after')}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Render Modals */}
      {renderFullScreenModal()}
      {renderEditDetailsModal()}
    </div>
  );

  // Full Screen Photo & Comparison Modal
  function renderFullScreenModal() {
    if (!fullScreenPhoto) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-4xl max-h-[92vh] flex flex-col space-y-4">
          <div className="flex items-center justify-between text-white pb-2 border-b border-[#30262B]">
            <h3 className="text-base font-black">
              {fullScreenPhoto === 'compare'
                ? 'مقارنة التحوّل: قبل التحدي vs بعد النزول'
                : fullScreenPhoto === 'before'
                ? `صورة قبل التحدي (${beforeWeight ? `${beforeWeight} كغ` : ''})`
                : `صورة بعد النزول (${afterWeight ? `${afterWeight} كغ` : ''})`}
            </h3>
            <button
              onClick={() => setFullScreenPhoto(null)}
              className="p-2 rounded-xl bg-[#151316] text-[#AAA2A7] hover:text-white border border-[#30262B]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-2">
            {fullScreenPhoto === 'compare' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-2 text-center">
                  <div className="relative rounded-2xl overflow-hidden border border-[#30262B] bg-[#0B0B0D]">
                    <img
                      src={data.beforePhoto}
                      alt="قبل"
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="text-xs text-[#AAA2A7]">
                    قبل التحدي: {data.beforeDate} {beforeWeight ? `(${beforeWeight} كغ)` : ''}
                  </div>
                </div>

                <div className="space-y-2 text-center">
                  <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#0B0B0D]">
                    <img
                      src={data.afterPhoto}
                      alt="بعد"
                      className="w-full max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="text-xs text-emerald-400 font-bold">
                    بعد النزول: {data.afterDate} {afterWeight ? `(${afterWeight} كغ)` : ''}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl max-h-[75vh] flex items-center justify-center">
                <img
                  src={fullScreenPhoto === 'before' ? data.beforePhoto : data.afterPhoto}
                  alt={fullScreenPhoto}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-[#30262B]"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit Details Modal (Dates and Weights attached to photos)
  function renderEditDetailsModal() {
    if (!showEditDetailsModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
          <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#922D48]" />
              <h3 className="text-sm font-bold text-[#F4F0F1]">تعديل بيانات وتواريخ الصور</h3>
            </div>
            <button onClick={() => setShowEditDetailsModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
          </div>

          <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-3">
              <div className="font-bold text-[#F4F0F1] flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6D1028]" />
                <span>بيانات صورة قبل التحدي</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#AAA2A7] mb-1">الوزن قبل (كغ)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 85"
                    value={editBeforeWeight}
                    onChange={(e) => setEditBeforeWeight(e.target.value)}
                    className="w-full rounded-xl bg-[#151316] border border-[#30262B] px-3 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#AAA2A7] mb-1">تاريخ الصورة قبل</label>
                  <input
                    type="date"
                    value={editBeforeDate}
                    onChange={(e) => setEditBeforeDate(e.target.value)}
                    className="w-full rounded-xl bg-[#151316] border border-[#30262B] px-3 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-emerald-500/30 space-y-3">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>بيانات صورة بعد النزول / نهاية الرحلة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#AAA2A7] mb-1">الوزن بعد (كغ)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="مثال: 74"
                    value={editAfterWeight}
                    onChange={(e) => setEditAfterWeight(e.target.value)}
                    className="w-full rounded-xl bg-[#151316] border border-[#30262B] px-3 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#AAA2A7] mb-1">تاريخ الصورة بعد</label>
                  <input
                    type="date"
                    value={editAfterDate}
                    onChange={(e) => setEditAfterDate(e.target.value)}
                    className="w-full rounded-xl bg-[#151316] border border-[#30262B] px-3 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#AAA2A7] mb-1">ملاحظات التحوّل والانطباع - اختياري</label>
              <textarea
                rows={2}
                placeholder="مثال: تحسن كبير في المقاسات ومستوى الطاقة والخفة..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white shadow-md shadow-[#6D1028]/25 hover:opacity-90 transition"
              >
                حفظ البيانات
              </button>
              <button
                type="button"
                onClick={() => setShowEditDetailsModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#30262B] text-xs font-semibold text-[#AAA2A7] hover:text-white transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};
