import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SkillProject } from '../types';
import { getAllItems, putItem, deleteItem } from '../db/indexedDB';
import {
  Code,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Target,
  ListTodo
} from 'lucide-react';

export const SkillsProjectsView: React.FC = () => {
  const { addXp, journeyStats } = useApp();
  const [projects, setProjects] = useState<SkillProject[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [whyChosen, setWhyChosen] = useState('');
  const [currentLevel, setCurrentLevel] = useState('مبتدئ');
  const [targetOutcome, setTargetOutcome] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(20);
  const [milestonesText, setMilestonesText] = useState('الخطوة 1: دراسة الأساسيات\nالخطوة 2: بناء النموذج الأولي\nالخطوة 3: الاختبار والتطبيق العملي');
  const [proofLink, setProofLink] = useState('');

  useEffect(() => {
    const loadProjects = async () => {
      const items = await getAllItems<SkillProject>('skills_projects');
      setProjects(items);
    };
    loadProjects();
  }, []);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones = milestonesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => ({
        id: `ms_${Date.now()}_${i}`,
        title: line,
        completed: false
      }));

    const newProject: SkillProject = {
      id: `project_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      whyChosen: whyChosen.trim(),
      currentLevel,
      targetOutcome: targetOutcome.trim(),
      estimatedHours,
      progressPercent: 0,
      milestones,
      proofLinkOrNote: proofLink.trim(),
      phaseId: journeyStats.currentPhase.id
    };

    await putItem('skills_projects', newProject);
    setProjects([newProject, ...projects]);
    await addXp(40, `skill_add_${newProject.id}`, `بدء مشروع مهارة عملي: ${newProject.title}`);

    // Reset & close
    setTitle('');
    setDescription('');
    setWhyChosen('');
    setTargetOutcome('');
    setProofLink('');
    setShowAddModal(false);
  };

  const toggleMilestone = async (project: SkillProject, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progressPercent = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedProject: SkillProject = {
      ...project,
      milestones: updatedMilestones,
      progressPercent,
      completedAt: progressPercent === 100 ? new Date().toISOString() : undefined
    };

    await putItem('skills_projects', updatedProject);
    setProjects(projects.map((p) => (p.id === project.id ? updatedProject : p)));

    if (progressPercent === 100 && project.progressPercent < 100) {
      await addXp(100, `project_done_${project.id}`, `إنجاز مشروع مهارة كامل: ${project.title}`);
    } else {
      await addXp(20, `ms_${milestoneId}`, `إنجاز خطوة في مشروع: ${project.title}`);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteItem('skills_projects', id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">مشروع مهارة لكل مرحلة</h2>
          <p className="text-xs text-[#AAA2A7] mt-0.5">
            تعلّم بالممارسة العملية وإنجاز مخرجات ملموسة تثبت تطورك الحقيقي.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6D1028] to-[#922D48] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#6D1028]/25 hover:opacity-90 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مشروع مهارة</span>
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-8 text-center space-y-3">
          <Code className="w-10 h-10 text-[#922D48] mx-auto" />
          <h3 className="text-sm font-bold text-[#F4F0F1]">لا توجد مشاريع مهارة مسجلة بعد</h3>
          <p className="text-xs text-[#AAA2A7] max-w-sm mx-auto">
            اختر مهارة تريد تعلمها في هذه المرحلة (برمجة، لغة، كتابة، تصميم، إدارة مالية...) وقسّمها لخطوات.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj.id} className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30262B] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#F4F0F1]">{proj.title}</h3>
                    {proj.progressPercent === 100 && (
                      <span className="text-[10px] bg-emerald-950/80 border border-emerald-500 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                        مكتمل بنجاح ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#AAA2A7] mt-1">{proj.description}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#922D48]">{proj.progressPercent}%</span>
                  </div>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-1.5 rounded-lg border border-[#30262B] text-[#AAA2A7] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#0B0B0D] rounded-full overflow-hidden border border-[#30262B]">
                <div
                  className="h-full bg-gradient-to-r from-[#6D1028] to-[#922D48] transition-all duration-300"
                  style={{ width: `${proj.progressPercent}%` }}
                />
              </div>

              {/* Target Outcome & Why */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B]">
                  <span className="font-bold text-[#AAA2A7]">النتيجة النهائية المطلوبة: </span>
                  <span className="text-[#F4F0F1]">{proj.targetOutcome}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#30262B]">
                  <span className="font-bold text-[#AAA2A7]">سبب اختيار المهارة: </span>
                  <span className="text-[#F4F0F1]">{proj.whyChosen}</span>
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#F4F0F1] flex items-center gap-1.5">
                  <ListTodo className="w-3.5 h-3.5 text-[#922D48]" />
                  <span>خطوات ومعالم المشروع:</span>
                </div>
                <div className="space-y-1.5">
                  {proj.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => toggleMilestone(proj, m.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer text-xs transition flex items-center gap-2.5 ${
                        m.completed
                          ? 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7]'
                          : 'border-[#30262B] bg-[#0B0B0D] text-[#F4F0F1] hover:border-[#6D1028]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 ${
                        m.completed ? 'border-[#922D48] bg-[#6D1028] text-white' : 'border-[#30262B]'
                      }`}>
                        {m.completed && '✓'}
                      </div>
                      <span className={m.completed ? 'line-through' : ''}>{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-[#151316] border border-[#30262B] p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#30262B]">
              <h3 className="text-base font-bold text-[#F4F0F1]">مشروع مهارة جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#AAA2A7] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">اسم المهارة أو المشروع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بناء موقع شخصي، تعلم المونتاج، الكتابة التقنية..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">المخرج العملي النهائي المطلوب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تطبيق منشور، مقال من 1000 كلمة، نموذج تصميم..."
                  value={targetOutcome}
                  onChange={(e) => setTargetOutcome(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">لماذا اخترت هذه المهارة؟</label>
                <input
                  type="text"
                  value={whyChosen}
                  onChange={(e) => setWhyChosen(e.target.value)}
                  placeholder="الفائدة العملية في مسار حياتك..."
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] px-3.5 py-2 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#AAA2A7] mb-1">خطوات المشروع (سطر لكل خطوة):</label>
                <textarea
                  rows={4}
                  value={milestonesText}
                  onChange={(e) => setMilestonesText(e.target.value)}
                  className="w-full rounded-xl bg-[#0B0B0D] border border-[#30262B] p-2.5 text-xs text-[#F4F0F1] focus:border-[#6D1028] focus:outline-none"
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
                  إنشاء المشروع (+40 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
