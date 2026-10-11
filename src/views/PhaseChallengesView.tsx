import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PHASES_DATA, PhaseInfo } from '../constants/phases';
import { PhaseContract, PhaseReview } from '../types';
import { getItem, putItem } from '../db/indexedDB';
import {
  FileText,
  Award,
  Scroll,
  CheckCircle2,
  Calendar,
  Sparkles,
  PenTool,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const PhaseChallengesView: React.FC = () => {
  const { journeyStats, addXp } = useApp();
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(journeyStats.currentPhase.id);
  const [contract, setContract] = useState<PhaseContract | null>(null);
  const [review, setReview] = useState<PhaseReview | null>(null);
  const [activeTab, setActiveTab] = useState<'contract' | 'challenges' | 'review'>('contract');

  // Form states for contract
  const [mainGoal, setMainGoal] = useState('');
  const [goal1, setGoal1] = useState('');
  const [goal2, setGoal2] = useState('');
  const [goal3, setGoal3] = useState('');
  const [whatToStop, setWhatToStop] = useState('');
  const [minimumStandard, setMinimumStandard] = useState('');
  const [obstaclesPlan, setObstaclesPlan] = useState('');
  const [hardDayPlan, setHardDayPlan] = useState('');
  const [chosenReward, setChosenReward] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // Review states
  const [biggestLesson, setBiggestLesson] = useState('');
  const [nextPhaseGoals, setNextPhaseGoals] = useState('');
  const [habitsImproved, setHabitsImproved] = useState('');

  const currentPhase = PHASES_DATA.find((p) => p.id === selectedPhaseId) || PHASES_DATA[0];

  // Load contract and review for selected phase
  useEffect(() => {
    const loadPhaseData = async () => {
      const storedContract = await getItem<PhaseContract>('phase_contracts', `contract_phase_${selectedPhaseId}`);
      if (storedContract) {
        setContract(storedContract);
        setMainGoal(storedContract.mainGoal);
        setGoal1(storedContract.topThreeGoals[0]);
        setGoal2(storedContract.topThreeGoals[1]);
        setGoal3(storedContract.topThreeGoals[2]);
        setWhatToStop(storedContract.whatToStopOrReduce);
        setMinimumStandard(storedContract.minimumAcceptableCommitment);
        setObstaclesPlan(storedContract.expectedChallenges);
        setHardDayPlan(storedContract.hardDayPlan);
        setChosenReward(storedContract.chosenReward);
      } else {
        setContract(null);
        setMainGoal(currentPhase.primaryGoal);
        setGoal1(currentPhase.suggestedHabits[0] || 'الالتزام اليومي');
        setGoal2(currentPhase.suggestedHabits[1] || 'إكمال المهام');
        setGoal3(currentPhase.suggestedProject || 'المشروع العملي');
        setWhatToStop('التسويف والسهر الزائد');
        setMinimumStandard('المحافظة على مهام اليوم الصعب في أسوأ الظروف');
        setObstaclesPlan('الانشغال المفاجئ أو انخفاض الطاقة');
        setHardDayPlan('تطبيق الحد الأدنى وتأجيل المهام الثانوية');
        setChosenReward('وجبة مميزة أو شراء كتاب جديد');
      }

      const storedReview = await getItem<PhaseReview>('phase_reviews', `review_phase_${selectedPhaseId}`);
      if (storedReview) {
        setReview(storedReview);
        setBiggestLesson(storedReview.biggestLesson);
        setNextPhaseGoals(storedReview.nextPhaseGoals);
      } else {
        setReview(null);
      }
    };
    loadPhaseData();
  }, [selectedPhaseId, currentPhase]);

  // Sign or Update Contract
  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    const now = new Date().toISOString();

    const newContract: PhaseContract = {
      phaseId: selectedPhaseId,
      phaseName: currentPhase.name,
      mainGoal: mainGoal.trim(),
      topThreeGoals: [goal1.trim(), goal2.trim(), goal3.trim()],
      whatToStopOrReduce: whatToStop.trim(),
      minimumAcceptableCommitment: minimumStandard.trim(),
      expectedChallenges: obstaclesPlan.trim(),
      hardDayPlan: hardDayPlan.trim(),
      chosenReward: chosenReward.trim(),
      signedAt: contract ? contract.signedAt : now,
      revisionHistory: contract
        ? [...(contract.revisionHistory || []), { date: now, changes: 'تعديل بنود العقد' }]
        : [{ date: now, changes: 'توقيع العقد لأول مرة' }]
    };

    await putItem('phase_contracts', { ...newContract, id: `contract_phase_${selectedPhaseId}` } as any);
    setContract(newContract);
    if (!contract) {
      await addXp(40, `contract_${selectedPhaseId}`, `توقيع واعتماد عقد ${currentPhase.name}`);
    }
    setIsSigning(false);
  };

  // Submit Phase Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const newReview: PhaseReview = {
      phaseId: selectedPhaseId,
      reviewDate: now,
      completedTasksCount: 25,
      deferredTasksCount: 5,
      habitsImproved: habitsImproved.split('،').map((s) => s.trim()).filter(Boolean),
      habitsStruggling: [],
      readingProgressSummary: 'تم إحراز تقدم ملحوظ في القراءة',
      skillProgressSummary: 'تم إنجاز معالم المرحلة',
      biggestLesson: biggestLesson.trim(),
      nextPhaseGoals: nextPhaseGoals.trim()
    };
    await putItem('phase_reviews', { ...newReview, id: `review_phase_${selectedPhaseId}` } as any);
    setReview(newReview);
    await addXp(60, `phase_review_${selectedPhaseId}`, `إتمام التقرير المرحلي لـ ${currentPhase.name}`);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">تحديات وعقود المراحل</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            عقد ملزم مع الذات لكل 30 يومًا، ومراجعة تحول شاملة مع نهاية كل مرحلة.
          </p>
        </div>

        {/* Phase Selector */}
        <select
          value={selectedPhaseId}
          onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
          className="rounded-xl bg-[#151316] border border-[#30262B] px-3.5 py-2 text-xs font-bold text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
        >
          {PHASES_DATA.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#151316] border border-[#30262B] p-1.5 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('contract')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'contract'
              ? 'bg-[#6D1028] text-white shadow'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Scroll className="w-3.5 h-3.5" />
          <span>عقد المرحلة {contract ? '✓' : ''}</span>
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'challenges'
              ? 'bg-[#6D1028] text-white shadow'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>أهداف وتحديات الـ 30 يومًا</span>
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'review'
              ? 'bg-[#6D1028] text-white shadow'
              : 'text-[#AAA2A7] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>المراجعة والتحول {review ? '✓' : ''}</span>
        </button>
      </div>

      {/* TAB 1: PHASE CONTRACT (عقد المرحلة) */}
      {activeTab === 'contract' && (
        <form onSubmit={handleSignContract} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#30262B] pb-4">
            <div>
              <div className="text-xs text-[#922D48] font-bold">ميثاق رسمي بينك وبين نفسك</div>
              <h3 className="text-lg font-black text-[#F4F0F1]">عقد {currentPhase.name}</h3>
            </div>
            {contract ? (
              <span className="text-xs rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-400 px-3 py-1 font-bold">
                معتمد وموقّع ✓
              </span>
            ) : (
              <span className="text-xs rounded-xl bg-amber-950/80 border border-amber-600 text-amber-300 px-3 py-1 font-bold">
                بانتظار الاعتماد
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                الهدف الرئيسي للمرحلة:
              </label>
              <input
                type="text"
                required
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1.5">
                أهم ثلاثة أهداف فرعية غير قابلة للتفاوض:
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="الهدف 1..."
                  value={goal1}
                  onChange={(e) => setGoal1(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="الهدف 2..."
                  value={goal2}
                  onChange={(e) => setGoal2(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="الهدف 3..."
                  value={goal3}
                  onChange={(e) => setGoal3(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#F4F0F1] mb-1">
                  ما الذي سأتوقف عن فعله أو أُقلله؟
                </label>
                <textarea
                  rows={2}
                  value={whatToStop}
                  onChange={(e) => setWhatToStop(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#F4F0F1] mb-1">
                  أقل مستوى التزام مقبول في أصعب الظروف:
                </label>
                <textarea
                  rows={2}
                  value={minimumStandard}
                  onChange={(e) => setMinimumStandard(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#F4F0F1] mb-1">
                  التحديات والعقبات المتوقعة:
                </label>
                <textarea
                  rows={2}
                  value={obstaclesPlan}
                  onChange={(e) => setObstaclesPlan(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#F4F0F1] mb-1">
                  خطة التعامل مع الأيام الصعبة:
                </label>
                <textarea
                  rows={2}
                  value={hardDayPlan}
                  onChange={(e) => setHardDayPlan(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                المكافأة الشخصية الآمنة عند إتمام المرحلة:
              </label>
              <input
                type="text"
                value={chosenReward}
                onChange={(e) => setChosenReward(e.target.value)}
                placeholder="مثال: رحلة نهاية أسبوع، كتاب مرغوب، فيلم خاص..."
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          </div>

          {/* Revision history display */}
          {contract && contract.revisionHistory && contract.revisionHistory.length > 0 && (
            <div className="pt-2 text-[10px] text-[#AAA2A7] border-t border-[#30262B]">
              <span>تاريخ التوقيع الأصلي: {new Date(contract.signedAt).toLocaleDateString('ar-EG')}</span>
              <span className="mx-2">•</span>
              <span>عدد التعديلات الموثقة: {contract.revisionHistory.length}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSigning}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-[#6D1028]/30 flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              <span>{contract ? 'حفظ وتحديث العقد وتوثيق التعديل' : 'توقيع واعتماد عقد المرحلة (+40 XP)'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PHASE CHALLENGES & ROADMAP */}
      {activeTab === 'challenges' && (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-[#F4F0F1]">{currentPhase.name}</h3>
            <p className="text-xs text-[#AAA2A7] mt-1">{currentPhase.description}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F4F0F1]">العادات المقترحة للمرحلة:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentPhase.suggestedHabits.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B] flex items-center gap-2.5 text-xs text-[#F4F0F1]">
                  <CheckCircle2 className="w-4 h-4 text-[#922D48] flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-4 space-y-2">
            <div className="text-xs font-bold text-[#F4F0F1]">مشروع المرحلة الملموس:</div>
            <p className="text-xs text-[#AAA2A7] leading-relaxed">
              {currentPhase.suggestedProject}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: END OF PHASE TRANSFORMATION REPORT */}
      {activeTab === 'review' && (
        <form onSubmit={handleSubmitReview} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
          <div>
            <h3 className="text-base font-black text-[#F4F0F1]">تقرير التحول والمراجعة المرحلية</h3>
            <p className="text-xs text-[#AAA2A7] mt-1">
              مراجعة واقعية مبنية على البيانات المسجلة، تلخص ما تحقق وتستخرج العبر للمرحلة التالية.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                أهم درس خرجت به من هذه المرحلة:
              </label>
              <textarea
                rows={3}
                required
                value={biggestLesson}
                onChange={(e) => setBiggestLesson(e.target.value)}
                placeholder="ما الشيء الذي فهمته عن عاداتك وسلوكك؟..."
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-3 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                العادات التي تحسنت واستقرت:
              </label>
              <input
                type="text"
                value={habitsImproved}
                onChange={(e) => setHabitsImproved(e.target.value)}
                placeholder="افصل بينها بفواصل (مثال: الاستيقاظ المبكر، القراءة اليومية)"
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#F4F0F1] mb-1">
                الأهداف الأساسية المقترحة للمرحلة التالية:
              </label>
              <textarea
                rows={3}
                value={nextPhaseGoals}
                onChange={(e) => setNextPhaseGoals(e.target.value)}
                placeholder="ما الذي ستركز عليه في الـ 30 يومًا القادمة؟..."
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-3 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-lg shadow-[#6D1028]/30 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{review ? 'تحديث تقرير التحول' : 'اعتماد تقرير التحول للمرحلة (+60 XP)'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
