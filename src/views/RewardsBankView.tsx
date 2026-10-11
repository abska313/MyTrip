import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RewardItem } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Gift,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';

export const RewardsBankView: React.FC = () => {
  const { addXp } = useApp();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [condition, setCondition] = useState('');

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const list = await getAllItems<RewardItem>('rewards');
    setRewards(list);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRew: RewardItem = {
      id: `rew_${Date.now()}`,
      title: title.trim(),
      condition: condition.trim() || 'إكمال مرحلة أو سلسلة مهام محددة',
      isUnlocked: true,
      isClaimed: false
    };

    await putItem('rewards', newRew);
    await loadRewards();
    setTitle('');
    setCondition('');
    setShowAddModal(false);
  };

  const handleClaim = async (reward: RewardItem) => {
    if (reward.isClaimed) return;
    const updated: RewardItem = {
      ...reward,
      isClaimed: true,
      claimedAt: new Date().toISOString()
    };
    await putItem('rewards', updated);
    await loadRewards();
    await addXp(25, `reward_${reward.id}`, `استحقاق مكافأة شخصية: ${reward.title}`);
  };

  const handleDelete = async (id: string) => {
    await deleteItem('rewards', id);
    await loadRewards();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">بنك المكافآت الشخصية</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            مكافآت آمنة وإيجابية تمنحها لنفسك عند إنجاز الأهداف والمراحل المستحقة.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مكافأة جديدة</span>
        </button>
      </div>

      {/* Rewards Grid */}
      {rewards.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <Gift className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">بنك المكافآت فارغ</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            أضف مكافآت تبهجك مثل: شراء كتاب مفضل، مشاهدة فيلم في عطلة نهاية الأسبوع، أو جلسة استرخاء خاصة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((rew) => (
            <div
              key={rew.id}
              className={`rounded-3xl border p-5 transition space-y-4 ${
                rew.isClaimed
                  ? 'border-[#30262B] bg-[#151316]/50 opacity-75'
                  : 'border-[#30262B] bg-[#151316] hover:border-[#6D1028]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
                    rew.isClaimed ? 'bg-[#0B0B0D] text-[#AAA2A7]' : 'bg-[#6D1028] text-white shadow'
                  }`}>
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${rew.isClaimed ? 'line-through text-[#AAA2A7]' : 'text-[#F4F0F1]'}`}>
                      {rew.title}
                    </h3>
                    <p className="text-xs text-[#AAA2A7] mt-1">
                      شرط الاستحقاق: {rew.condition}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(rew.id)}
                  className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#30262B]">
                {rew.isClaimed ? (
                  <span className="text-xs font-bold text-emerald-400">
                    تم استحقاقها والاستمتاع بها ✓
                  </span>
                ) : (
                  <button
                    onClick={() => handleClaim(rew)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-90 transition"
                  >
                    استحقاق المكافأة الآن
                  </button>
                )}
                <span className="text-[10px] text-[#AAA2A7]">مكافأة ذاتية</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">إضافة مكافأة جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">وصف المكافأة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شراء دورة تدريبية، عشاء في مطعم مفضل، رحلة قصيرة..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">شرط الفتح أو الاستحقاق</label>
                <input
                  type="text"
                  placeholder="مثال: إكمال المرحلة الثانية، سلسلة 14 يومًا متتالية..."
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
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
                  حفظ المكافأة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
