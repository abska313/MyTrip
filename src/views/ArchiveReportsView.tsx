import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PhaseReview, PhysicalLog } from '../types';
import { getAllItems } from '../db/indexedDB';
import { PHASES_DATA } from '../constants/phases';
import {
  FileText,
  Calendar,
  Camera,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const ArchiveReportsView: React.FC = () => {
  const [reviews, setReviews] = useState<PhaseReview[]>([]);
  const [photos, setPhotos] = useState<PhysicalLog[]>([]);

  useEffect(() => {
    const loadArchive = async () => {
      const storedReviews = await getAllItems<PhaseReview>('phase_reviews');
      const storedPhotos = await getAllItems<PhysicalLog>('physical_logs');
      setReviews(storedReviews);
      setPhotos(storedPhotos.filter((p) => p.photoBase64));
    };
    loadArchive();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">أرشيف التغيير والتقارير المرحلية</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          سجل توثيقي دائم لكل مرحلة من مراحل الـ 30 يومًا، لا يزول بعد انتهاء الرحلة.
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">لا توجد تقارير مرحلية معتمدة بعد</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            في نهاية كل مرحلة (نحو كل 30 يومًا)، ستتمكن من توثيق تقرير التحول واعتماده ليظهر هنا في الأرشيف الدائم.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const phase = PHASES_DATA.find((p) => p.id === rev.phaseId) || PHASES_DATA[0];
            return (
              <div key={rev.phaseId} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#30262B] pb-3">
                  <div>
                    <span className="text-[10px] text-[#922D48] font-bold">تقرير معتمد</span>
                    <h3 className="text-base font-extrabold text-[#F4F0F1]">{phase.name}</h3>
                  </div>
                  <span className="text-xs text-[#AAA2A7]">{new Date(rev.reviewDate).toLocaleDateString('ar-EG')}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-1">
                    <span className="font-bold text-[#AAA2A7]">أهم درس خرجت به من المرحلة:</span>
                    <p className="text-[#F4F0F1] leading-relaxed">{rev.biggestLesson}</p>
                  </div>

                  {rev.nextPhaseGoals && (
                    <div className="p-3.5 rounded-2xl bg-[#0B0B0D] border border-[#30262B] space-y-1">
                      <span className="font-bold text-[#AAA2A7]">أهداف المرحلة التالية:</span>
                      <p className="text-[#F4F0F1] leading-relaxed">{rev.nextPhaseGoals}</p>
                    </div>
                  )}

                  {rev.habitsImproved && rev.habitsImproved.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-[#AAA2A7] block mb-1.5">العادات المستقرة:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {rev.habitsImproved.map((h, idx) => (
                          <span key={idx} className="bg-[#0B0B0D] border border-[#30262B] px-2.5 py-1 rounded-lg text-emerald-400">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Photos Gallery */}
      {photos.length > 0 && (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F4F0F1]">
            <Camera className="w-4 h-4 text-[#922D48]" />
            <span>معرض الصور المرحلية التوثيقية ({photos.length} صور محليًا):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="space-y-1">
                <img
                  src={p.photoBase64}
                  alt="أرشيف صورة"
                  className="w-full h-44 object-cover rounded-2xl border border-[#30262B]"
                />
                <div className="text-[10px] text-[#AAA2A7] text-center">{p.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
