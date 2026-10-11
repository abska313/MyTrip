/**
 * ABSKA — 214 | التحوّل الشامل
 * Main Application Component & Navigation Shell
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { OnboardingView } from './views/OnboardingView';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { JourneyMapView } from './views/JourneyMapView';
import { CharacterTreeView } from './views/CharacterTreeView';
import { PhaseChallengesView } from './views/PhaseChallengesView';
import { ComebackView } from './views/ComebackView';
import { HardDayView } from './views/HardDayView';
import { BehaviorAnalyticsView } from './views/BehaviorAnalyticsView';
import { ReadingLibraryView } from './views/ReadingLibraryView';
import { SkillsProjectsView } from './views/SkillsProjectsView';
import { SelfDiscoveryJournalView } from './views/SelfDiscoveryJournalView';
import { TimeManagementView } from './views/TimeManagementView';
import { PhysicalTrackerView } from './views/PhysicalTrackerView';
import { NewExperiencesView } from './views/NewExperiencesView';
import { RewardsBankView } from './views/RewardsBankView';
import { ComprehensiveIndexView } from './views/ComprehensiveIndexView';
import { Day214LetterView } from './views/Day214LetterView';
import { PostJourneyPlanView } from './views/PostJourneyPlanView';
import { ArchiveReportsView } from './views/ArchiveReportsView';
import { AchievementsView } from './views/AchievementsView';
import { SettingsBackupView } from './views/SettingsBackupView';
import { ChallengeGeneratorView } from './views/ChallengeGeneratorView';

import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CelebrationModal } from './components/CelebrationModal';
import { QuickActionModal } from './components/QuickActionModal';

import {
  LayoutDashboard,
  CheckSquare,
  MapPin,
  GitFork,
  Menu,
  X,
  Plus,
  BookOpen,
  Code,
  Clock,
  Compass,
  Activity,
  Scale,
  Gift,
  Award,
  Settings,
  RefreshCw,
  ShieldAlert,
  Mail,
  TrendingUp,
  Sparkles,
  FileText
} from 'lucide-react';

function AppContent() {
  const { profile, loading, journeyStats, levelInfo, xp } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // If app is loading from IndexedDB
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] animate-pulse flex items-center justify-center font-black text-white text-lg">
          214
        </div>
        <p className="text-xs text-[#AAA2A7] mt-3">جاري تحميل تطبيق رحلتي المحلي...</p>
      </div>
    );
  }

  // If user has not completed onboarding or started the journey yet
  if (!profile || !profile.isStarted) {
    return <OnboardingView />;
  }

  const navigateTo = (tab: string) => {
    setCurrentTab(tab);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const MENU_SECTIONS = [
    {
      category: 'الركائز اليومية',
      items: [
        { id: 'dashboard', label: 'الرئيسية (لوحة القيادة)', icon: LayoutDashboard },
        { id: 'tasks', label: 'مهام اليوم المتدرجة', icon: CheckSquare },
        { id: 'time', label: 'تنظيم الوقت والمخطط', icon: Clock },
        { id: 'journal', label: 'دفتر اكتشاف الذات', icon: Compass },
      ]
    },
    {
      category: 'خريطة التحول والمراحل',
      items: [
        { id: 'map', label: 'خريطة رحلة الـ 214 يومًا', icon: MapPin },
        { id: 'tree', label: 'شجرة تطوير الشخصية', icon: GitFork },
        { id: 'challenges', label: 'تحديات وعقود المراحل', icon: FileText },
        { id: 'generator', label: 'مولّد التحديات الشخصي', icon: Sparkles },
        { id: 'archive', label: 'أرشيف التغيير والتقارير', icon: TrendingUp },
      ]
    },
    {
      category: 'النمو والمعرفة والمشاريع',
      items: [
        { id: 'reading', label: 'مكتبة القراءة والتطبيق', icon: BookOpen },
        { id: 'skills', label: 'مشروع مهارة كل مرحلة', icon: Code },
        { id: 'experiences', label: 'تجارب أريد خوضها', icon: Compass },
        { id: 'physical', label: 'عداد نزول الوزن والصور والنشاط', icon: Scale },
      ]
    },
    {
      category: 'المرونة والدعم النفسي',
      items: [
        { id: 'hard_day', label: 'وضع اليوم الصعب', icon: ShieldAlert },
        { id: 'comeback', label: 'العودة إلى المسار (الإنقاذ)', icon: RefreshCw },
        { id: 'analytics', label: 'تحليل أسباب التعثر', icon: TrendingUp },
        { id: 'rewards', label: 'بنك المكافآت الشخصية', icon: Gift },
      ]
    },
    {
      category: 'الحصاد والاستدامة',
      items: [
        { id: 'comprehensive_index', label: 'مقياس التغيير الشامل', icon: Compass },
        { id: 'achievements', label: 'الأوسمة والألقاب ونقاط XP', icon: Award },
        { id: 'day_214_letter', label: 'رسالة اليوم 214 المقفلة', icon: Mail },
        { id: 'post_journey', label: 'خطة ما بعد الـ 214 يومًا', icon: Sparkles },
        { id: 'settings', label: 'الإعدادات والنسخ وتحميل الكود', icon: Settings },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F4F0F1] flex flex-col selection:bg-[#6D1028] selection:text-white">
      {/* Offline Banner */}
      <OfflineIndicator />

      {/* Badges / Title Celebration Popups */}
      <CelebrationModal />

      {/* Quick Log Floating Modal */}
      <QuickActionModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
      />

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-[#30262B] px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Day */}
          <div
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] flex items-center justify-center font-black text-xs text-white shadow-md shadow-[#6D1028]/30">
              214
            </div>
            <div>
              <div className="text-xs font-black tracking-wider text-[#F4F0F1] leading-none">رحلتي</div>
              <div className="text-[10px] text-[#922D48] font-bold mt-0.5">
                اليوم {journeyStats.currentDay} / 214
              </div>
            </div>
          </div>

          {/* Right Header CTAs */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* Quick Action Button */}
            <button
              onClick={() => setIsQuickLogOpen(true)}
              className="p-2 rounded-xl bg-[#151316] border border-[#30262B] text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
              title="تسجيل سريع"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* XP Pill */}
            <div
              onClick={() => navigateTo('achievements')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#151316] border border-[#30262B] text-xs font-bold text-[#F4F0F1] cursor-pointer hover:border-[#6D1028] transition"
            >
              <span className="w-2 h-2 rounded-full bg-[#922D48]" />
              <span>{xp} XP</span>
            </div>

            {/* Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-xl bg-[#151316] border border-[#30262B] text-[#AAA2A7] hover:text-[#F4F0F1] hover:border-[#6D1028] transition"
              title="القائمة الكاملة"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={navigateTo}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}
        {currentTab === 'tasks' && <TasksView />}
        {currentTab === 'map' && <JourneyMapView onNavigate={navigateTo} />}
        {currentTab === 'tree' && <CharacterTreeView />}
        {currentTab === 'challenges' && <PhaseChallengesView />}
        {currentTab === 'comeback' && <ComebackView onBackToDashboard={() => navigateTo('dashboard')} />}
        {currentTab === 'hard_day' && <HardDayView onBackToDashboard={() => navigateTo('dashboard')} />}
        {currentTab === 'analytics' && <BehaviorAnalyticsView />}
        {currentTab === 'reading' && <ReadingLibraryView />}
        {currentTab === 'skills' && <SkillsProjectsView />}
        {currentTab === 'journal' && <SelfDiscoveryJournalView />}
        {currentTab === 'time' && <TimeManagementView />}
        {currentTab === 'physical' && <PhysicalTrackerView />}
        {currentTab === 'experiences' && <NewExperiencesView />}
        {currentTab === 'rewards' && <RewardsBankView />}
        {currentTab === 'comprehensive_index' && <ComprehensiveIndexView />}
        {currentTab === 'day_214_letter' && <Day214LetterView />}
        {currentTab === 'post_journey' && <PostJourneyPlanView />}
        {currentTab === 'archive' && <ArchiveReportsView />}
        {currentTab === 'achievements' && <AchievementsView />}
        {currentTab === 'settings' && <SettingsBackupView />}
        {currentTab === 'generator' && <ChallengeGeneratorView />}
      </main>

      {/* Bottom Sticky Mobile Navigation (Section 31) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0D]/95 backdrop-blur-md border-t border-[#30262B] px-2 py-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1 text-center">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
            { id: 'tasks', label: 'المهام', icon: CheckSquare },
            { id: 'map', label: 'الخريطة', icon: MapPin },
            { id: 'tree', label: 'الشجرة', icon: GitFork },
            { id: 'more', label: 'المزيد', icon: Menu }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'more') {
                    setIsMenuOpen(true);
                  } else {
                    navigateTo(item.id);
                  }
                }}
                className={`py-1.5 px-1 rounded-xl transition flex flex-col items-center gap-1 ${
                  isActive
                    ? 'text-[#922D48] font-bold'
                    : 'text-[#AAA2A7] hover:text-[#F4F0F1]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#922D48]' : ''}`} />
                <span className="text-[10px] leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Full Organized Menu Drawer (Section 31) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#151316] border border-[#30262B] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6D1028] text-white flex items-center justify-center font-black text-xs">
                  214
                </div>
                <h3 className="text-base font-black text-[#F4F0F1]">دليل أقسام تطبيق رحلتي 214</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded-lg text-[#AAA2A7] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Groups */}
            <div className="space-y-5">
              {MENU_SECTIONS.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[11px] font-bold text-[#922D48] uppercase tracking-wider">
                    {section.category}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isSelected = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`p-3 rounded-2xl border text-right transition flex items-center gap-3 ${
                            isSelected
                              ? 'border-[#922D48] bg-[#6D1028]/25 text-[#F4F0F1]'
                              : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028] hover:text-[#F4F0F1]'
                          }`}
                        >
                          <div className={`p-2 rounded-xl flex-shrink-0 ${
                            isSelected ? 'bg-[#6D1028] text-white' : 'bg-[#151316] text-[#AAA2A7]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold leading-snug">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center border-t border-[#30262B]">
              <p className="text-[11px] text-[#AAA2A7]">
                رحلتي — التحوّل الشامل | 214 يومًا • تخزين محلي دائم وخصوصية كاملة
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
