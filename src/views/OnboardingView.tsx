import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, PathwayId } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Compass } from 'lucide-react';

const PATHWAYS_OPTIONS: { id: PathwayId; label: string; desc: string }[] = [
  { id: 'body_fitness', label: 'الجسم واللياقة', desc: 'بناء حركة آمنة وصحة مستدامة' },
  { id: 'discipline_consistency', label: 'الانضباط والاستمرارية', desc: 'تقليل التسويف والالتزام اليومي' },
  { id: 'knowledge_reading', label: 'المعرفة والقراءة', desc: 'قراءة الكتب وتطبيق الأفكار' },
  { id: 'skills_projects', label: 'المهارات والمشاريع', desc: 'تعلم مهارة وإنجاز مشاريع عملية' },
  { id: 'time_management', label: 'تنظيم الوقت والحياة', desc: 'إدارة الساعات ومحاربة التشتت' },
  { id: 'self_discovery', label: 'اكتشاف الذات والسلوك', desc: 'فهم النفس والمشاعر والمحفزات' },
  { id: 'spiritual_habits', label: 'العادات الشخصية والروحية', desc: 'السكينة والامتنان والقيم' },
];

export const OnboardingView: React.FC = () => {
  const { startJourney } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form State with conservative realistic defaults
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    birthYear: 1998,
    heightCm: 175,
    initialWeightKg: undefined,
    primaryGoals: ['بناء عادة القراءة اليومية', 'الالتزام بنشاط بدني 3 أيام أسبوعيًا', 'تقليل التشتت الصباحي'],
    focusPathways: ['discipline_consistency', 'knowledge_reading', 'body_fitness'],
    activityLevel: 'متوسط',
    experienceLevel: 'مبتدئ',
    dailyAvailableHours: 1.5,
    wakeTime: '06:30',
    sleepTime: '23:00',
    targetBooksOrSkills: 'العادات الذرية، برمجة الويب، مهارة الكتابة التأملية',
    habitsToBuild: ['القراءة 15 دقيقة', 'المشي الخفيف', 'تدوين الملاحظات'],
    habitsToReduce: ['التصفح العشوائي للهاتف في الصباح', 'تأجيل المهام الكبيرة'],
    mainChallenges: ['التسويف', 'التشتت', 'الانقطاع عند تراكم الضغط'],
    difficultyPreference: 'متوازن',
    restDays: ['الجمعة'],
    isStarted: false,
    smartAdaptationEnabled: true
  });

  const [initialLetter, setInitialLetter] = useState(
    'أبدأ اليوم هذه الرحلة لكي أعيد تشكيل عاداتي بهدوء وتدرج. أعد نفسي بأن أكون رحيمًا بها في الأيام الصعبة، وأن أعود دائمًا للمسار مهما تعثرت.'
  );

  const [goalInput, setGoalInput] = useState('');
  const [habitBuildInput, setHabitBuildInput] = useState('');
  const [habitReduceInput, setHabitReduceInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const togglePathway = (id: PathwayId) => {
    setFormData((prev) => {
      const exists = prev.focusPathways.includes(id);
      if (exists) {
        if (prev.focusPathways.length <= 1) return prev; // keep at least 1
        return { ...prev, focusPathways: prev.focusPathways.filter((p) => p !== id) };
      } else {
        return { ...prev, focusPathways: [...prev.focusPathways, id] };
      }
    });
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startJourney(formData, initialLetter);
    } catch (e) {
      console.error('Failed to start journey:', e);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F4F0F1] flex flex-col justify-between p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="pt-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#30262B] bg-[#151316] px-4 py-1.5 text-xs text-[#AAA2A7] mb-3">
          <Compass className="w-4 h-4 text-[#922D48]" />
          <span>الإعداد الأولي لرحلة الـ 214 يومًا</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-[#F4F0F1] tracking-tight">
          رحلتي — التحوّل الشامل
        </h1>
        <p className="text-xs md:text-sm text-[#AAA2A7] mt-1 max-w-md mx-auto">
          التقدم أهم من الكمال، والاستمرارية أهم من الحماس المؤقت. لنبدأ بخطة واقعية تناسب ظروفك الحالية.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#151316] h-1.5 rounded-full mt-6 overflow-hidden border border-[#30262B]">
          <div
            className="h-full bg-gradient-to-r from-[#6D1028] to-[#922D48] transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#AAA2A7] mt-1.5 font-medium">
          <span>الخطوة {step} من {totalSteps}</span>
          <span>{step === 1 ? 'البيانات الشخصية' : step === 2 ? 'المجالات والأهداف' : step === 3 ? 'نمط الحياة والتحديات' : 'ميثاق الرحلة والبدء'}</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="my-8 flex-1">
        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
              <label className="block text-xs font-bold text-[#F4F0F1] mb-2">
                1. ما الاسم أو اللقب الذي تفضل أن نناديك به؟
              </label>
              <input
                type="text"
                placeholder="مثال: عباس، الباحث، أبو عبدالله..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-4 py-2.5 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  2. سنة الميلاد (أو العمر)
                </label>
                <input
                  type="number"
                  value={formData.birthYear || ''}
                  onChange={(e) => setFormData({ ...formData, birthYear: Number(e.target.value) })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  3. الطول (سم) - اختياري
                </label>
                <input
                  type="number"
                  placeholder="175"
                  value={formData.heightCm || ''}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  4. الوزن الابتدائي (كغ) - اختياري
                </label>
                <input
                  type="number"
                  placeholder="مثلاً 78"
                  value={formData.initialWeightKg || ''}
                  onChange={(e) => setFormData({ ...formData, initialWeightKg: Number(e.target.value) || undefined })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
              <label className="block text-xs font-bold text-[#F4F0F1] mb-2">
                مستوى الصعوبة المفضل للبداية:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['هادئ', 'متوازن', 'مكثف'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficultyPreference: diff })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                      formData.difficultyPreference === diff
                        ? 'border-[#922D48] bg-[#6D1028]/25 text-[#F4F0F1]'
                        : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#AAA2A7] mt-2">
                نوصي بـ «متوازن» لمنح نفسك فرصة التدرج وتجنب الإرهاق في الأسابيع الأولى.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Pathways and Goals */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
              <label className="block text-xs font-bold text-[#F4F0F1] mb-2">
                5. المجالات التي تريد التركيز عليها في شجرة التطوير (اختر ما يناسبك):
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {PATHWAYS_OPTIONS.map((path) => {
                  const isSelected = formData.focusPathways.includes(path.id);
                  return (
                    <div
                      key={path.id}
                      onClick={() => togglePathway(path.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-[#922D48] bg-[#6D1028]/20 text-[#F4F0F1]'
                          : 'border-[#30262B] bg-[#0B0B0D] text-[#AAA2A7] hover:border-[#6D1028]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B]'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#F4F0F1]">{path.label}</div>
                        <div className="text-[11px] text-[#AAA2A7] mt-0.5">{path.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
              <label className="block text-xs font-bold text-[#F4F0F1] mb-2">
                الأهداف الشخصية الرئيسية (يمكنك إضافة أو حذف):
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="أضف هدفًا واضحًا..."
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && goalInput.trim()) {
                      e.preventDefault();
                      setFormData({ ...formData, primaryGoals: [...formData.primaryGoals, goalInput.trim()] });
                      setGoalInput('');
                    }
                  }}
                  className="flex-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (goalInput.trim()) {
                      setFormData({ ...formData, primaryGoals: [...formData.primaryGoals, goalInput.trim()] });
                      setGoalInput('');
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48]"
                >
                  إضافة
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {formData.primaryGoals.map((g, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B0B0D] border border-[#30262B] px-2.5 py-1 text-xs text-[#F4F0F1]"
                  >
                    <span>{g}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryGoals: formData.primaryGoals.filter((_, i) => i !== idx) })}
                      className="text-[#AAA2A7] hover:text-red-400 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Lifestyle & Routines */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  الوقت المتاح يوميًا للتحول (ساعات)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.dailyAvailableHours}
                  onChange={(e) => setFormData({ ...formData, dailyAvailableHours: Number(e.target.value) })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  يوم الراحة الأسبوعي المفضل
                </label>
                <select
                  value={formData.restDays[0] || 'الجمعة'}
                  onChange={(e) => setFormData({ ...formData, restDays: [e.target.value] })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                >
                  <option value="الجمعة">الجمعة</option>
                  <option value="السبت">السبت</option>
                  <option value="الأحد">الأحد</option>
                  <option value="لا يوجد">توزيع مرن</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  موعد الاستيقاظ المعتاد
                </label>
                <input
                  type="time"
                  value={formData.wakeTime}
                  onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
              <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-4">
                <label className="block text-xs font-semibold text-[#AAA2A7] mb-1.5">
                  موعد النوم المعتاد
                </label>
                <input
                  type="time"
                  value={formData.sleepTime}
                  onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-2 text-sm text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>
            </div>

            {/* Habits build / reduce */}
            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5">
              <label className="block text-xs font-bold text-[#F4F0F1] mb-2">
                عادات ترغب في بنائها (+) وعادات ترغب في تقليلها (-):
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="عادة جديدة (+) مثال: المشي، شرب الماء..."
                    value={habitBuildInput}
                    onChange={(e) => setHabitBuildInput(e.target.value)}
                    className="flex-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (habitBuildInput.trim()) {
                        setFormData({ ...formData, habitsToBuild: [...formData.habitsToBuild, habitBuildInput.trim()] });
                        setHabitBuildInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48]"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.habitsToBuild.map((h, i) => (
                    <span key={i} className="text-[11px] bg-[#0B0B0D] text-emerald-300 border border-[#30262B] px-2 py-0.5 rounded-md">
                      + {h}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#30262B]">
                  <input
                    type="text"
                    placeholder="عادة للتخفيف (-) مثال: التسويف، السهر..."
                    value={habitReduceInput}
                    onChange={(e) => setHabitReduceInput(e.target.value)}
                    className="flex-1 rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3 py-1.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (habitReduceInput.trim()) {
                        setFormData({ ...formData, habitsToReduce: [...formData.habitsToReduce, habitReduceInput.trim()] });
                        setHabitReduceInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#3B0A18] text-xs font-bold text-[#AAA2A7] hover:text-white"
                  >
                    -
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.habitsToReduce.map((h, i) => (
                    <span key={i} className="text-[11px] bg-[#0B0B0D] text-rose-300 border border-[#30262B] px-2 py-0.5 rounded-md">
                      - {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Letter to Future Self & Confirmation */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Future Letter (Locked until day 214) */}
            <div className="bg-[#151316] border-2 border-[#6D1028]/60 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-[#922D48]">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  رسالة اليوم الأول إلى نفسك في اليوم 214
                </h3>
              </div>
              <p className="text-[11px] text-[#AAA2A7] mb-3 leading-relaxed">
                ستُحفظ هذه الرسالة محليًا وتُقفل تلقائيًا، ولن تُعرض عليك إلا عند وصولك لليوم الختامي 214. اكتب فيها لماذا بدأت وما وعدك لنفسك:
              </p>
              <textarea
                rows={4}
                value={initialLetter}
                onChange={(e) => setInitialLetter(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-3 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none leading-relaxed"
                placeholder="لماذا بدأت الرحلة؟ ما الذي أعد به نفسي في الأيام الصعبة؟..."
              />
            </div>

            {/* Plan Summary */}
            <div className="bg-[#151316] border border-[#30262B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-[#F4F0F1] border-b border-[#30262B] pb-2">
                ملخص خطة الرحلة:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#AAA2A7]">الاسم: </span>
                  <span className="font-semibold text-[#F4F0F1]">{formData.name || 'المشارك'}</span>
                </div>
                <div>
                  <span className="text-[#AAA2A7]">مدة الرحلة: </span>
                  <span className="font-semibold text-[#922D48]">214 يومًا بالضبط</span>
                </div>
                <div>
                  <span className="text-[#AAA2A7]">المجالات النشطة: </span>
                  <span className="font-semibold text-[#F4F0F1]">{formData.focusPathways.length} مسارات</span>
                </div>
                <div>
                  <span className="text-[#AAA2A7]">الصعوبة: </span>
                  <span className="font-semibold text-[#F4F0F1]">{formData.difficultyPreference}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#AAA2A7]">الهدف الأساسي: </span>
                  <span className="font-semibold text-[#F4F0F1]">{formData.primaryGoals[0] || 'التحول المستدام'}</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-[#AAA2A7] bg-[#0B0B0D] p-3 rounded-xl border border-[#30262B]">
                🔒 <strong>تخزين محلي خالص:</strong> بياناتك محفوظة محليًا على هذا الهاتف ولن تُرسل لأي خادم. يمكنك تعديل الإعدادات لاحقًا في أي وقت.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#30262B]">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#30262B] bg-[#151316] text-xs font-bold text-[#AAA2A7] hover:text-[#F4F0F1]"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السابق</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] text-xs font-bold text-white hover:opacity-95 shadow-md shadow-[#6D1028]/30"
          >
            <span>التالي</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isStarting}
            onClick={handleStart}
            className="flex-1 max-w-xs py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#6D1028] via-[#922D48] to-[#6D1028] text-sm font-extrabold text-white hover:opacity-95 active:scale-98 transition shadow-xl shadow-[#6D1028]/40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{isStarting ? 'جاري بدء الرحلة...' : 'ابدأ رحلتي'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
