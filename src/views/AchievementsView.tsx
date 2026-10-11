import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { XpTransaction } from '../types';
import { getAllItems } from '../db/indexedDB';
import {
  Award,
  Crown,
  Zap,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, titles, xp, levelInfo } = useApp();
  const [transactions, setTransactions] = useState<XpTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'badges' | 'titles' | 'ledger'>('badges');

  useEffect(() => {
    const loadTx = async () => {
      const list = await getAllItems<XpTransaction>('xp_transactions');
      setTransactions(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
    };
    loadTx();
  }, [xp]);

  const unlockedBadgesCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Level Hero */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] flex items-center justify-center text-white shadow-lg">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] text-[#AAA2A7] font-semibold">المستوى الحالي {levelInfo.level}</div>
              <h2 className="text-xl font-black text-[#F4F0F1]">{levelInfo.title}</h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl font-black text-[#922D48]">{xp} <span className="text-xs text-[#AAA2A7]">XP</span></div>
            <div className="text-[10px] text-[#AAA2A7]">إجمالي نقاط الخبرة المكتسبة</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-1.5 pt-2 border-t border-[#30262B]">
          <div className="flex justify-between text-xs text-[#AAA2A7]">
            <span>التقدم إلى المستوى القادم ({levelInfo.level + 1}):</span>
            <span className="font-bold text-[#F4F0F1]">{xp} / {levelInfo.nextLevelXp} XP</span>
          </div>
          <div className="w-full h-2.5 bg-[#0B0B0D] rounded-full overflow-hidden border border-[#30262B]">
            <div
              className="h-full bg-gradient-to-r from-[#6D1028] via-[#922D48] to-[#6D1028]"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    ((xp - levelInfo.currentLevelFloorXp) /
                      (levelInfo.nextLevelXp - levelInfo.currentLevelFloorXp)) *
                      100
                  )
                )}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#151316] border border-[#30262B] p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('badges')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'badges' ? 'bg-[#6D1028] text-white shadow' : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>الأوسمة ({unlockedBadgesCount} / {achievements.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('titles')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'titles' ? 'bg-[#6D1028] text-white shadow' : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>الألقاب والمستويات</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'ledger' ? 'bg-[#6D1028] text-white shadow' : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>سجل نقاط الخبرة (Ledger)</span>
        </button>
      </div>

      {/* BADGES TAB */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-3xl border transition flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'border-[#922D48]/70 bg-[#151316] text-[#F4F0F1]'
                    : 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7] opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                  isUnlocked ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B] bg-[#0B0B0D]'
                }`}>
                  {isUnlocked ? <Award className="w-5 h-5 text-amber-300" /> : <Lock className="w-4 h-4 text-[#AAA2A7]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#F4F0F1]">{ach.title}</h3>
                    {ach.isWeightNeutral && (
                      <span className="text-[9px] text-[#AAA2A7] border border-[#30262B] px-1.5 rounded">
                        غير مرتبط بالوزن
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#AAA2A7] mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                  {isUnlocked && (
                    <div className="text-[10px] text-emerald-400 mt-2">
                      تم الفتح: {new Date(ach.unlockedAt!).toLocaleDateString('ar-EG')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TITLES TAB */}
      {activeTab === 'titles' && (
        <div className="space-y-3">
          {titles.map((t) => {
            const isAchieved = levelInfo.level >= t.requiredLevel;
            return (
              <div
                key={t.id}
                className={`p-4 rounded-3xl border transition flex items-center justify-between gap-3 ${
                  isAchieved
                    ? 'border-[#922D48] bg-[#151316] text-[#F4F0F1]'
                    : 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7] opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center flex-shrink-0 ${
                    isAchieved ? 'border-amber-500 bg-[#6D1028] text-amber-300' : 'border-[#30262B] bg-[#0B0B0D]'
                  }`}>
                    {isAchieved ? <Crown className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#F4F0F1]">«{t.name}»</h3>
                    <p className="text-[11px] text-[#AAA2A7] mt-0.5">{t.description}</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-1 rounded-lg border border-[#30262B] bg-[#0B0B0D]">
                  {isAchieved ? 'مفتوح ✓' : `يتطلب مستوى ${t.requiredLevel}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* LEDGER TAB */}
      {activeTab === 'ledger' && (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
            <h3 className="text-xs font-bold text-[#F4F0F1]">سجل إضافات نقاط الخبرة الفعلي ({transactions.length} معاملة):</h3>
            <span className="text-[10px] text-emerald-400 font-semibold">حماية كاملة من التكرار ✓</span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {transactions.slice(0, 30).map((tx) => (
              <div key={tx.id} className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#30262B] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#F4F0F1]">{tx.reason}</div>
                  <div className="text-[10px] text-[#AAA2A7] mt-0.5">
                    {new Date(tx.timestamp).toLocaleString('ar-EG')}
                  </div>
                </div>
                <span className="text-xs font-bold text-[#922D48] flex-shrink-0">
                  +{tx.amount} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
