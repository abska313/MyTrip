import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CharacterPathway, PathwayId } from '../types';
import {
  Activity,
  Shield,
  BookOpen,
  Code,
  Clock,
  Compass,
  Heart,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { putItem } from '../db/indexedDB';

const PATHWAY_ICONS: Record<PathwayId, React.ElementType> = {
  body_fitness: Activity,
  discipline_consistency: Shield,
  knowledge_reading: BookOpen,
  skills_projects: Code,
  time_management: Clock,
  self_discovery: Compass,
  spiritual_habits: Heart
};

export const CharacterTreeView: React.FC = () => {
  const { pathways, addXp } = useApp();
  const [selectedPathwayId, setSelectedPathwayId] = useState<PathwayId>('discipline_consistency');

  const currentPathway = pathways.find((p) => p.id === selectedPathwayId) || pathways[0];
  const IconComponent = PATHWAY_ICONS[currentPathway.id] || Shield;

  const handleCompleteNode = async (nodeId: string) => {
    const nodeIndex = currentPathway.nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1) return;
    const node = currentPathway.nodes[nodeIndex];
    if (node.completed || !node.unlocked) return;

    node.completed = true;
    // Unlock next node in sequence if any
    if (nodeIndex + 1 < currentPathway.nodes.length) {
      currentPathway.nodes[nodeIndex + 1].unlocked = true;
    }

    currentPathway.xp += node.requiredXp;
    currentPathway.progressPercent = Math.min(
      100,
      Math.round((currentPathway.nodes.filter((n) => n.completed).length / currentPathway.nodes.length) * 100)
    );

    await putItem('character_tree', currentPathway);
    await addXp(node.requiredXp, `tree_node_${nodeId}`, `إكمال معلم في شجرة التطوير: ${node.title}`);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-[#F4F0F1]">شجرة تطوير الشخصية</h2>
        <p className="text-xs text-[#AAA2A7] mt-0.5">
          7 مسارات مستقلة تتطور بإنجازاتك اليومية دون أن يلغي تعثر مجال تقدم مجال آخر.
        </p>
      </div>

      {/* 7 Pathway Selection Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {pathways.map((p) => {
          const Icon = PATHWAY_ICONS[p.id] || Shield;
          const isSelected = selectedPathwayId === p.id;

          return (
            <button
              key={p.id}
              onClick={() => setSelectedPathwayId(p.id)}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
                isSelected
                  ? 'border-[#922D48] bg-[#6D1028]/25 text-[#F4F0F1] shadow-lg shadow-[#6D1028]/20'
                  : 'border-[#30262B] bg-[#151316] text-[#AAA2A7] hover:border-[#6D1028]'
              }`}
            >
              <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#6D1028] text-white' : 'bg-[#0B0B0D] text-[#AAA2A7]'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-[11px] font-bold truncate max-w-full">{p.title}</div>
              <div className="text-[10px] text-[#AAA2A7]">{p.progressPercent}%</div>
            </button>
          );
        })}
      </div>

      {/* Pathway Detail Card */}
      <div className="rounded-3xl border border-[#30262B] bg-[#151316] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30262B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-[#6D1028] to-[#922D48] text-white shadow-md">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#F4F0F1]">{currentPathway.title}</h3>
              <div className="text-xs text-[#AAA2A7] mt-0.5 flex items-center gap-2">
                <span>المستوى {currentPathway.level}</span>
                <span>•</span>
                <span>{currentPathway.xp} نقطة خبرة تراكمية</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0B0D] border border-[#30262B] rounded-2xl px-4 py-2 text-center self-start sm:self-auto">
            <div className="text-[10px] text-[#AAA2A7]">نسبة إتقان المسار</div>
            <div className="text-base font-extrabold text-[#922D48]">{currentPathway.progressPercent}%</div>
          </div>
        </div>

        {/* Suggested Next Step */}
        <div className="rounded-2xl border border-[#30262B] bg-[#0B0B0D] p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#AAA2A7]">
            <Sparkles className="w-4 h-4 text-[#922D48] flex-shrink-0" />
            <span>الخطوة المقترحة التالية: <strong className="text-[#F4F0F1]">{currentPathway.suggestedNextStep}</strong></span>
          </div>
        </div>

        {/* Progression Nodes Tree */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-[#F4F0F1]">معالم ومحطات هذا المسار:</h4>
          <div className="space-y-3">
            {currentPathway.nodes.map((node, idx) => {
              const isLocked = !node.unlocked && !node.completed;
              return (
                <div
                  key={node.id}
                  className={`rounded-2xl border p-4 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    node.completed
                      ? 'border-[#30262B] bg-[#0B0B0D]/50 text-[#AAA2A7]'
                      : isLocked
                      ? 'border-[#30262B] bg-[#0B0B0D]/30 opacity-60'
                      : 'border-[#922D48]/80 bg-[#0B0B0D] text-[#F4F0F1]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {node.completed ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-400 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isLocked ? (
                        <div className="w-6 h-6 rounded-lg bg-[#151316] border border-[#30262B] text-[#AAA2A7] flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-[#6D1028] text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#F4F0F1] flex items-center gap-2">
                        <span>{node.title}</span>
                        {node.completed && <span className="text-[10px] text-emerald-400">مكتمل ✓</span>}
                      </div>
                      <p className="text-xs text-[#AAA2A7] mt-1 leading-relaxed">
                        {node.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs font-bold text-[#922D48]">+{node.requiredXp} XP</span>
                    {!node.completed && node.unlocked && (
                      <button
                        onClick={() => handleCompleteNode(node.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#6D1028] text-xs font-bold text-white hover:bg-[#922D48] transition"
                      >
                        توثيق الإنجاز
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
