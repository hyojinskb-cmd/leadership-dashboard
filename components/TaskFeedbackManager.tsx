
import React, { useState, useEffect } from 'react';
import { TeamMember, TaskStatus, FeedbackLog, TaskDetail } from '../types';
import { CheckCircle2, MessageSquare, Plus, Send, ThumbsUp, AlertTriangle, X, UserCheck, ListChecks, BarChart, Sparkles, Loader2, MessageCircle, Smile, Flame, CheckSquare, HelpCircle } from 'lucide-react';
import { TaskAssignmentHelper } from './TaskAssignmentHelper';
import { OneOnOneManager } from './OneOnOneManager';
import { LeaderAnalytics } from './LeaderAnalytics';
import { generateFeedbackSuggestion } from '../services/geminiService';

interface TaskFeedbackManagerProps {
  members: TeamMember[];
  onUpdateMember: (member: TeamMember) => void;
  initialMemberId?: string | null;
  initialViewMode?: 'Tasks' | 'OneOnOne' | 'Analytics';
}

export const TaskFeedbackManager: React.FC<TaskFeedbackManagerProps> = ({ 
    members, 
    onUpdateMember, 
    initialMemberId, 
    initialViewMode 
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  
  // Main View Mode: Tasks, 1on1, or Analytics
  const [viewMode, setViewMode] = useState<'Tasks' | 'OneOnOne' | 'Analytics'>('Tasks');

  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'Positive' | 'Constructive'>('Positive');
  const [isAssigningTask, setIsAssigningTask] = useState(false); 
  
  // AI Suggestion State
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Member Response Simulation State
  const [replyingFeedbackId, setReplyingFeedbackId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyReaction, setReplyReaction] = useState<'Thanks' | 'Fire' | 'Check' | 'Question'>('Thanks');

  // Handle Deep Linking / Props Change
  useEffect(() => {
    if (initialMemberId) {
        setSelectedMemberId(initialMemberId);
    }
    if (initialViewMode) {
        setViewMode(initialViewMode);
    }
  }, [initialMemberId, initialViewMode]);

  const selectedMember = members.find(m => m.id === selectedMemberId) || members[0];

  const handleAddFeedback = () => {
    if (!selectedMember || !newFeedback.trim()) return;

    const feedback: FeedbackLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: feedbackType,
      content: newFeedback
    };

    const updatedMember = {
      ...selectedMember,
      feedbackHistory: [feedback, ...selectedMember.feedbackHistory]
    };

    onUpdateMember(updatedMember);
    setNewFeedback('');
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    if (!selectedMember) return;
    const updatedTasks = selectedMember.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'Done' ? 100 : t.progress } : t
    );
    onUpdateMember({ ...selectedMember, tasks: updatedTasks });
  };

  const handleAITaskAssigned = (memberId: string, taskTitle: string, dueDate: string) => {
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember) {
        const newTask: TaskDetail = {
            id: Date.now().toString(),
            title: taskTitle,
            dueDate: dueDate,
            status: 'Todo',
            progress: 0
        };
        
        const updatedMember = {
            ...targetMember,
            tasks: [...targetMember.tasks, newTask]
        };
        onUpdateMember(updatedMember);
        setIsAssigningTask(false);
    }
  };
  
  const handleGenerateAIFeedback = async () => {
    if (!selectedMember) return;
    setIsGeneratingFeedback(true);
    try {
        const suggestion = await generateFeedbackSuggestion(selectedMember, feedbackType);
        setNewFeedback(suggestion);
    } catch (error) {
        console.error("AI Feedback Error:", error);
        alert("피드백 제안을 생성하는 중 오류가 발생했습니다.");
    } finally {
        setIsGeneratingFeedback(false);
    }
  };

  // ------------------------------------------------------------------
  // Member Response Simulation Logic
  // ------------------------------------------------------------------
  const handleSaveMemberResponse = () => {
    if (!selectedMember || !replyingFeedbackId) return;

    const updatedFeedbackHistory = selectedMember.feedbackHistory.map(fb => {
        if (fb.id === replyingFeedbackId) {
            return {
                ...fb,
                memberResponse: {
                    date: new Date().toISOString().split('T')[0],
                    content: replyContent,
                    reaction: replyReaction
                }
            };
        }
        return fb;
    });

    const updatedMember = {
        ...selectedMember,
        feedbackHistory: updatedFeedbackHistory
    };

    onUpdateMember(updatedMember);
    setReplyingFeedbackId(null);
    setReplyContent('');
  };
  
  const getReactionIcon = (reaction?: string) => {
    switch(reaction) {
        case 'Thanks': return <Smile className="w-4 h-4 text-emerald-500" />;
        case 'Fire': return <Flame className="w-4 h-4 text-rose-500" />;
        case 'Check': return <CheckSquare className="w-4 h-4 text-blue-500" />;
        case 'Question': return <HelpCircle className="w-4 h-4 text-amber-500" />;
        default: return <MessageCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  // Allow rendering Analytics view even if selectedMember might be undefined (though members shouldn't be empty)
  if (!selectedMember && viewMode !== 'Analytics') return <div className="p-6 text-center text-slate-500">팀원 데이터를 불러오는 중입니다...</div>;

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 min-h-[850px] h-[calc(100vh-100px)]">
      
      {isAssigningTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">AI 기반 업무 할당</h3>
                    <button onClick={() => setIsAssigningTask(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4">
                    <TaskAssignmentHelper 
                        members={members} 
                        onTaskAssigned={handleAITaskAssigned} 
                    />
                </div>
            </div>
        </div>
      )}

      {/* Sidebar: Only show when NOT in Analytics mode */}
      {viewMode !== 'Analytics' && (
        <div className="w-full lg:w-64 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-700">팀원 선택</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className={`w-full flex items-center p-3 hover:bg-slate-50 transition-colors border-l-4 ${
                  selectedMember?.id === member.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent'
                }`}
              >
                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                <div className="text-left">
                  <div className="font-medium text-slate-800 text-sm">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* View Mode Tabs */}
        <div className="flex space-x-4 mb-4 flex-shrink-0">
          <button 
            onClick={() => setViewMode('Tasks')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
              viewMode === 'Tasks' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ListChecks className="w-4 h-4 mr-2" /> 업무 & 피드백 로그
          </button>
          <button 
            onClick={() => setViewMode('OneOnOne')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
              viewMode === 'OneOnOne' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-4 h-4 mr-2" /> 1on1 & 코칭
          </button>
          <button 
            onClick={() => setViewMode('Analytics')}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
              viewMode === 'Analytics' ? 'bg-indigo-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart className="w-4 h-4 mr-2" /> 리더십 코칭 분석 (통합)
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-hidden">
          
          {/* VIEW 1: Task & Feedback Log */}
          {viewMode === 'Tasks' && selectedMember && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-20 pr-2">
                {/* Task List */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-fit">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 mr-2" />
                      업무 현황
                    </h3>
                    <button 
                        onClick={() => setIsAssigningTask(true)}
                        className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" /> AI 업무 할당
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedMember.tasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">할당된 업무가 없습니다.</div>
                    ) : (
                      selectedMember.tasks.map(task => (
                        <div key={task.id} className="border border-slate-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-medium text-slate-800">{task.title}</div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.status === 'Done' ? 'bg-emerald-100 text-emerald-700' :
                              task.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.status === 'Done' ? '완료' : task.status === 'InProgress' ? '진행중' : '대기'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span>마감: {task.dueDate}</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            {task.status !== 'Done' && (
                              <button 
                                onClick={() => updateTaskStatus(task.id, 'Done')}
                                className="text-xs text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded"
                              >
                                완료 처리
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Feedback & History */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-fit">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                      <MessageSquare className="w-5 h-5 text-indigo-600 mr-2" />
                      피드백 로그 & 반응
                    </h3>
                    <span className="text-xs text-slate-400">최근 업데이트: {selectedMember.lastFeedbackDate}</span>
                  </div>

                  {/* Add New Feedback */}
                  <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-4 mb-3">
                      <button
                        onClick={() => setFeedbackType('Positive')}
                        className={`flex-1 py-2 text-sm rounded-lg flex items-center justify-center gap-2 transition-all ${
                          feedbackType === 'Positive' 
                            ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100' 
                            : 'text-slate-500 hover:bg-white'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" /> 칭찬하기
                      </button>
                      <button
                        onClick={() => setFeedbackType('Constructive')}
                        className={`flex-1 py-2 text-sm rounded-lg flex items-center justify-center gap-2 transition-all ${
                          feedbackType === 'Constructive' 
                            ? 'bg-white text-amber-600 shadow-sm ring-1 ring-amber-100' 
                            : 'text-slate-500 hover:bg-white'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" /> 개선 요청
                      </button>
                    </div>
                    
                    {/* AI Suggestion Button */}
                    <div className="flex justify-end mb-2">
                         <button 
                           onClick={handleGenerateAIFeedback}
                           disabled={isGeneratingFeedback}
                           className="text-xs bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-full flex items-center font-medium transition-colors disabled:opacity-50"
                         >
                            {isGeneratingFeedback ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                            AI 피드백 제안 (데이터 기반)
                         </button>
                    </div>

                    <textarea
                      value={newFeedback}
                      onChange={(e) => setNewFeedback(e.target.value)}
                      placeholder={feedbackType === 'Positive' ? "구체적인 행동과 성과를 칭찬해주세요..." : "관찰된 사실과 기대하는 변화를 작성해주세요..."}
                      className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32 mb-2"
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleAddFeedback}
                        disabled={!newFeedback.trim()}
                        className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-900 disabled:opacity-50 flex items-center"
                      >
                        <Send className="w-3 h-3 mr-2" /> 기록하기
                      </button>
                    </div>
                  </div>

                  {/* Feedback History & Member Replies */}
                  <div className="flex-1 space-y-4 pr-2">
                    {selectedMember.feedbackHistory.map(fb => (
                      <div key={fb.id} className="relative">
                          {/* Leader Feedback Card */}
                          <div className="flex gap-3 group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              fb.type === 'Positive' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {fb.type === 'Positive' ? <ThumbsUp className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative">
                              <div className="flex justify-between mb-1">
                                <span className={`text-xs font-bold ${
                                   fb.type === 'Positive' ? 'text-emerald-600' : 'text-amber-600'
                                }`}>{fb.type === 'Positive' ? '칭찬 (Leader)' : '개선 (Leader)'}</span>
                                <span className="text-xs text-slate-400">{fb.date}</span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{fb.content}</p>
                              
                              {/* Member Reaction Badge */}
                              {fb.memberResponse && (
                                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full shadow border border-slate-100 p-1 flex items-center" title="팀원 반응">
                                      {getReactionIcon(fb.memberResponse.reaction)}
                                  </div>
                              )}
                              
                              {/* Reply Button (Simulation) */}
                              {!fb.memberResponse && replyingFeedbackId !== fb.id && (
                                <button 
                                    onClick={() => setReplyingFeedbackId(fb.id)}
                                    className="absolute top-2 right-2 text-xs text-slate-400 hover:text-indigo-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MessageSquare className="w-3 h-3 mr-1" /> 팀원 반응 입력(Simulate)
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Member Reply Thread */}
                          {fb.memberResponse && (
                             <div className="flex gap-3 mt-2 pl-6">
                                <div className="flex-1 bg-indigo-50/50 p-3 rounded-lg rounded-tr-none border border-indigo-100 ml-5 relative">
                                    <div className="absolute -top-1 right-0 w-3 h-3 bg-indigo-50/50 transform rotate-45 border-l border-t border-indigo-100"></div>
                                    <div className="flex justify-between mb-1">
                                        <div className="flex items-center">
                                            <img src={selectedMember.avatar} alt="member" className="w-4 h-4 rounded-full mr-2" />
                                            <span className="text-xs font-bold text-indigo-700">{selectedMember.name} (Member)</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{fb.memberResponse.date}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed">{fb.memberResponse.content}</p>
                                </div>
                             </div>
                          )}

                          {/* Reply Input Form (Simulation) */}
                          {replyingFeedbackId === fb.id && (
                              <div className="mt-3 ml-11 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-fade-in-down">
                                  <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs font-bold text-slate-500">팀원 반응 입력 (시뮬레이션)</span>
                                      <button onClick={() => setReplyingFeedbackId(null)}><X className="w-4 h-4 text-slate-400" /></button>
                                  </div>
                                  
                                  {/* Reaction Selector */}
                                  <div className="flex gap-2 mb-2">
                                      {(['Thanks', 'Fire', 'Check', 'Question'] as const).map(reaction => (
                                          <button
                                            key={reaction}
                                            onClick={() => setReplyReaction(reaction)}
                                            className={`p-1.5 rounded-lg border transition-all ${
                                                replyReaction === reaction ? 'bg-white border-indigo-400 shadow-sm scale-110' : 'bg-slate-100 border-transparent hover:bg-white'
                                            }`}
                                            title={reaction}
                                          >
                                              {getReactionIcon(reaction)}
                                          </button>
                                      ))}
                                  </div>

                                  <textarea 
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder={`${selectedMember.name}님의 입장에서 답변을 입력하세요.`}
                                      className="w-full text-sm border border-slate-200 rounded p-2 focus:ring-1 focus:ring-indigo-500 mb-2 h-16 resize-none"
                                  />
                                  <div className="flex justify-end">
                                      <button 
                                        onClick={handleSaveMemberResponse}
                                        disabled={!replyContent.trim()}
                                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium"
                                      >
                                          답변 저장
                                      </button>
                                  </div>
                              </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          )}

          {/* VIEW 2: 1on1 Coaching */}
          {viewMode === 'OneOnOne' && selectedMember && (
             <OneOnOneManager member={selectedMember} onUpdateMember={onUpdateMember} />
          )}
          
          {/* VIEW 3: Aggregated Leader Analytics */}
          {viewMode === 'Analytics' && (
             <LeaderAnalytics members={members} />
          )}

        </div>
      </div>
    </div>
  );
};
