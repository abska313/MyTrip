import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, Crown, X, Sparkles } from 'lucide-react';

export const CelebrationModal: React.FC = () => {
  const {
    newUnlockedAchievement,
    newUnlockedTitle,
    dismissAchievementModal,
    dismissTitleModal
  } = useApp();

  if (newUnlockedAchievement) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-3xl bg-[#151316] border-2 border-[#6D1028] p-6 text-center shadow-2xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#6D1028]/30 blur-3xl pointer-events-none rounded-full" />

          <button
            onClick={dismissAchievementModal}
            className="absolute top-4 left-4 p-1.5 rounded-full text-[#AAA2A7] hover:text-[#F4F0F1] hover:bg-[#30262B]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#3B0A18] to-[#922D48] flex items-center justify-center mb-4 shadow-lg shadow-[#6D1028]/40 border border-[#922D48]/50">
            <Award className="w-8 h-8 text-[#F4F0F1]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#922D48] tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>وسام جديد مستحق!</span>
          </div>

          <h3 className="text-xl font-extrabold text-[#F4F0F1] mb-2">
            {newUnlockedAchievement.title}
          </h3>

          <p className="text-xs text-[#AAA2A7] leading-relaxed mb-6 px-2">
            {newUnlockedAchievement.description}
          </p>

          <div className="inline-block bg-[#0B0B0D] border border-[#30262B] rounded-xl px-4 py-1.5 text-xs font-bold text-[#F4F0F1] mb-6">
            +50 نقطة خبرة (XP)
          </div>

          <button
            onClick={dismissAchievementModal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-sm font-bold text-white hover:opacity-90 active:scale-95 transition shadow-lg shadow-[#6D1028]/30"
          >
            استمر في التحوّل
          </button>
        </div>
      </div>
    );
  }

  if (newUnlockedTitle) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="w-full max-w-sm rounded-3xl bg-[#151316] border-2 border-[#922D48] p-6 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#922D48]/30 blur-3xl pointer-events-none rounded-full" />

          <button
            onClick={dismissTitleModal}
            className="absolute top-4 left-4 p-1.5 rounded-full text-[#AAA2A7] hover:text-[#F4F0F1] hover:bg-[#30262B]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#3B0A18] flex items-center justify-center mb-4 shadow-lg shadow-[#922D48]/40 border border-[#922D48]">
            <Crown className="w-8 h-8 text-amber-300" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ترقية مستوى ولقب جديد!</span>
          </div>

          <h3 className="text-xl font-extrabold text-[#F4F0F1] mb-2">
            «{newUnlockedTitle.name}»
          </h3>

          <p className="text-xs text-[#AAA2A7] leading-relaxed mb-6 px-2">
            {newUnlockedTitle.description}
          </p>

          <button
            onClick={dismissTitleModal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-sm font-bold text-white hover:opacity-90 active:scale-95 transition"
          >
            فخر واعتزاز
          </button>
        </div>
      </div>
    );
  }

  return null;
};
