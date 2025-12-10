import React, { useState } from 'react';
import { TeamMember } from '../types';
import { suggestTaskAssignment, TaskAssignmentAdvice } from '../services/geminiService';
import { Send, Sparkles, Loader2, Calendar, AlertTriangle, Lightbulb } from 'lucide-react';

interface TaskAssignmentHelperProps {
  members: TeamMember[];
  onTaskAssigned: (memberId: string, taskTitle: string, dueDate: string) => void;
}

export const TaskAssignmentHelper: React.FC<TaskAssignmentHelperProps> = ({ members, onTaskAssigned }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [advice, setAdvice] = useState<TaskAssignmentAdvice | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const handleSuggest = async () => {
    if (!selectedMember || !taskTitle.trim() || !taskDescription.trim()) return;

    setIsLoading(true);
    setAdvice(null);

    try {
      const result = await suggestTaskAssignment(selectedMember, taskTitle, taskDescription);
      setAdvice(result);
    } catch (error) {
      console.error("AI Task Suggestion Error:", error);
      setAdvice({
        summary: "AI 조언 생성 중 오류 발생.",
        suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        riskAnalysis: "시스템 오류로 인해 조언을 가져올 수 없습니다. 수동으로 검토하세요.",
        brainScienceStrategy: {
            dlpfc_goal: "목표 설정 오류",
            ofc_value: "가치 제안 오류",
            nacc_reward: "보상 제안 오류"
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedMember && taskTitle.trim() && advice?.suggestedDueDate) {
      onTaskAssigned(selectedMember.id, taskTitle.trim(), advice.suggestedDueDate);
      
      // 할당 후 상태 초기화 (옵션)
      setTaskTitle('');
      setTaskDescription('');
      setAdvice(null);
      
      alert(`${selectedMember.name}님에게 '${taskTitle}' 태스크가 ${advice.suggestedDueDate} 마감일로 할당되었습니다.`);
    } else {
      alert("태스크를 할당하기 전에 조언을 먼저 받아야 합니다.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <Sparkles className="w-5 h-5 text-slate-400 mr-2" />
          AI 태스크 할당 도우미
        </h3>
        <span className="text-xs text-slate-400">새로운 업무 할당이 필요하신가요? AI가 도와드립니다.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input & Member Selection Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">팀원 선택</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
            >
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">태스크 제목</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="예: Q3 핵심 성과 지표 보고서 작성"
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">태스크 상세 내용</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={3}
              placeholder="목표, 기대 결과 등을 입력하세요."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
          
          <button
            onClick={handleSuggest}
            disabled={isLoading || !selectedMemberId || !taskTitle.trim() || !taskDescription.trim()}
            className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
            )}
            AI 분석 및 조언 받기
          </button>
        </div>

        {/* AI Advice Section */}
        <div className={`rounded-xl p-4 border flex flex-col h-full ${advice ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
          {advice ? (
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="text-xs font-bold text-indigo-600 flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> AI 분석 결과
                </span>
                <div className="flex items-center text-xs font-medium text-slate-600">
                  <Calendar className="w-3 h-3 mr-1 text-emerald-500" />
                  추천 마감일: {advice.suggestedDueDate}
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {/* Risk */}
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1">⚠️ 리스크 분석</p>
                  <p className="text-sm text-slate-700 bg-white p-2 rounded border border-indigo-100">{advice.riskAnalysis}</p>
                </div>

                {/* Brain Science Strategy (Goal, Value, Reward) */}
                <div className="space-y-2 pt-1">
                     <p className="text-xs font-bold text-slate-500 flex items-center">
                        🧠 뇌과학 기반 동기부여 전략
                        <span className="ml-1 text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-normal">정재승 교수 이론</span>
                     </p>
                     
                     {/* 1. Goal (DLPFC) */}
                     <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                        <div className="flex items-center mb-1">
                            <span className="text-xs font-bold text-indigo-700 mr-2 flex items-center">
                                <span className="text-sm mr-1">🎯</span> 목표 (DLPFC)
                            </span>
                            <span className="text-[10px] text-indigo-400">전두엽 자극</span>
                        </div>
                        <p className="text-xs text-indigo-900 leading-relaxed font-medium bg-white/50 p-2 rounded">{advice.brainScienceStrategy.dlpfc_goal}</p>
                     </div>

                     {/* 2. Value (OFC) */}
                     <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                        <div className="flex items-center mb-1">
                            <span className="text-xs font-bold text-emerald-700 mr-2 flex items-center">
                                <span className="text-sm mr-1">💎</span> 가치 (OFC)
                            </span>
                            <span className="text-[10px] text-emerald-400">안와전두피질 자극</span>
                        </div>
                        <p className="text-xs text-emerald-900 leading-relaxed font-medium bg-white/50 p-2 rounded">{advice.brainScienceStrategy.ofc_value}</p>
                     </div>

                     {/* 3. Reward (NAcc) */}
                     <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                        <div className="flex items-center mb-1">
                            <span className="text-xs font-bold text-amber-700 mr-2 flex items-center">
                                <span className="text-sm mr-1">🎁</span> 보상 (NAcc)
                            </span>
                            <span className="text-[10px] text-amber-400">측좌핵 자극</span>
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed font-medium bg-white/50 p-2 rounded">{advice.brainScienceStrategy.nacc_reward}</p>
                     </div>
                </div>
              </div>

              <button
                onClick={handleAssign}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm mt-auto"
              >
                조언에 따라 태스크 할당하기
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-10">
              <Sparkles className="w-8 h-8 mb-3 text-slate-300" />
              <p>왼쪽 정보를 입력하면</p>
              <p className="text-center mt-1">
                <span className="font-bold text-indigo-400">뇌과학 기반(목표/가치/보상)</span><br/>
                최적의 할당 전략을 제안합니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
