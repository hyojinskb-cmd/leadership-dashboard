
import React, { useState, useEffect, useRef } from 'react';
import { TeamMember, OneOnOneSession, SimulationMessage } from '../types';
import { Calendar, FileText, Plus, Sparkles, ChevronRight, Send, Loader2, Target, HelpCircle, Brain, MessageSquarePlus, CheckSquare, Square, Star, PenTool, AlertTriangle, X, PlayCircle, Mic, RefreshCw, CheckCircle2, MailCheck } from 'lucide-react';
import { generateOneOnOneQuestions, simulateMemberResponse } from '../services/geminiService';

interface OneOnOneManagerProps {
  member: TeamMember;
  onUpdateMember: (member: TeamMember) => void;
}

// Coaching Stages Definition
const COACHING_STAGES = [
    { 
        id: 1, 
        name: '1단계: Check-in (라포 형성)', 
        desc: '심리적 문 열기 & 정서적 안정',
        tips: [
            '✋ "요즘 컨디션은 어때요?" (감정 터치)',
            '👀 "지난번 고민하던 건은 어떻게 됐나요?" (이행 점검)',
            '🚫 업무 이야기로 바로 들어가지 마세요.'
        ]
    },
    { 
        id: 2, 
        name: '2단계: GROW (본론)', 
        desc: '구성원 주도 문제 해결 (Goal-Reality-Options-Will)',
        tips: [
            '🎯 Goal: "오늘 대화에서 무엇을 얻고 싶나요?"',
            '🧐 Reality: "현재 상황은 구체적으로 어떤가요?"',
            '💡 Options: "어떤 해결책들이 있을까요?"',
            '🔥 Will: "언제부터 시작해 볼까요?"',
            '📢 7:3 법칙: 구성원이 70% 말하게 하세요.'
        ]
    },
    { 
        id: 3, 
        name: '3단계: Sharing (마무리)', 
        desc: '리더의 정리, 격려, 방향 제시',
        tips: [
            '🎁 "제가 지원해 줄 부분은 무엇인가요?"',
            '📝 "오늘 이야기를 요약해 주시겠어요?"',
            '👏 구체적인 행동에 대해 격려해 주세요.',
            '🤝 다음 미팅 일정 잡기'
        ]
    }
];

export const OneOnOneManager: React.FC<OneOnOneManagerProps> = ({ member, onUpdateMember }) => {
  const [activeTab, setActiveTab] = useState<'Schedule' | 'Log'>('Schedule');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Schedule Form State
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTitle, setScheduleTitle] = useState('');

  // Log Form State
  const [logSummary, setLogSummary] = useState('');
  const [logStrengths, setLogStrengths] = useState('');
  const [logDevTasks, setLogDevTasks] = useState('');
  const [logNextStep, setLogNextStep] = useState('');

  // Leader Self Review State
  const [selfListening, setSelfListening] = useState(0);
  const [selfQuestioning, setSelfQuestioning] = useState(0);
  const [selfAction, setSelfAction] = useState(0);
  const [selfFeedback, setSelfFeedback] = useState('');
  const [dreamPersonalityCheck, setDreamPersonalityCheck] = useState(false); 

  // AI Prep State
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Custom Question State
  const [customQuestion, setCustomQuestion] = useState('');
  
  // Bulk Selection State
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ----------------------------------------------------
  // Simulation State
  // ----------------------------------------------------
  const [showSimModal, setShowSimModal] = useState(false);
  const [simMessages, setSimMessages] = useState<SimulationMessage[]>([]);
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [currentStageId, setCurrentStageId] = useState(1);
  const simEndRef = useRef<HTMLDivElement>(null);

  // ⚠️ Defensive Coding
  const history = member?.oneOnOneHistory || [];
  const activeSession = history.find(s => s.id === selectedSessionId);

  // Update local state when active session changes
  useEffect(() => {
    if (activeSession) {
        setLogSummary(activeSession.summary || '');
        setLogStrengths(activeSession.strengthsMemo || '');
        setLogDevTasks(activeSession.developmentTasks || '');
        setLogNextStep(activeSession.nextStepCheckpoint || '');
        
        // Load Self Review if exists
        if (activeSession.selfReview) {
            setSelfListening(activeSession.selfReview.listeningScore);
            setSelfQuestioning(activeSession.selfReview.questioningScore);
            setSelfAction(activeSession.selfReview.actionScore);
            setSelfFeedback(activeSession.selfReview.feedback);
            setDreamPersonalityCheck(false); 
        } else {
            setSelfListening(0);
            setSelfQuestioning(0);
            setSelfAction(0);
            setSelfFeedback('');
            setDreamPersonalityCheck(false);
        }
    }
  }, [activeSession]);

  // Scroll to bottom of simulation chat
  useEffect(() => {
    if (showSimModal) {
        simEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simMessages, showSimModal]);

  // 1. Schedule Logic
  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTitle) {
      alert("날짜와 제목을 입력해주세요.");
      return;
    }

    const newSession: OneOnOneSession = {
      id: Date.now().toString(),
      date: scheduleDate,
      time: scheduleTime || '14:00',
      title: scheduleTitle,
      summary: '',
      strengthsMemo: '',
      developmentTasks: '',
      nextStepCheckpoint: '',
      isCompleted: false
    };

    const updatedHistory = [...history, newSession].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    onUpdateMember({ ...member, oneOnOneHistory: updatedHistory });
    setScheduleDate('');
    setScheduleTime('');
    setScheduleTitle('');
    alert(`${member.name}님과의 1on1 일정이 예약되었습니다.`);
  };

  // 2. Log Save Logic
  const handleSaveLog = () => {
    if (!selectedSessionId) return;

    const updatedHistory = history.map(s => 
      s.id === selectedSessionId 
        ? { 
            ...s, 
            summary: logSummary, 
            strengthsMemo: logStrengths, 
            developmentTasks: logDevTasks, 
            nextStepCheckpoint: logNextStep, 
            isCompleted: true,
            // Save Self Review
            selfReview: {
                listeningScore: selfListening,
                questioningScore: selfQuestioning,
                actionScore: selfAction,
                feedback: selfFeedback
            }
          } 
        : s
    );

    onUpdateMember({ ...member, oneOnOneHistory: updatedHistory });
    alert('미팅 기록 및 리더 셀프 체크가 저장되었습니다.');
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    const questions = await generateOneOnOneQuestions(member);
    setAiQuestions(questions);
    setSelectedQuestions([]); 
    setIsGeneratingQuestions(false);
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    const newQ = customQuestion.trim();
    setAiQuestions(prev => [newQ, ...prev]);
    setSelectedQuestions(prev => [newQ, ...prev]); 
    setCustomQuestion('');
  };

  const toggleQuestionSelection = (q: string) => {
    if (selectedQuestions.includes(q)) {
        setSelectedQuestions(prev => prev.filter(item => item !== q));
    } else {
        setSelectedQuestions(prev => [...prev, q]);
    }
  };

  const handleClickSendButton = () => {
    if (selectedQuestions.length === 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    // 실제 전송 로직: 현재 세션에 sentQuestions 저장
    if (activeSession) {
        const updatedHistory = history.map(s => 
            s.id === activeSession.id 
            ? { ...s, sentQuestions: selectedQuestions } 
            : s
        );
        onUpdateMember({ ...member, oneOnOneHistory: updatedHistory });
    }

    setSelectedQuestions([]);
    setShowConfirmModal(false);
    alert(`${member.name}님에게 성공적으로 전송되었습니다.`);
  };

  // ----------------------------------------------------
  // Simulation Handlers
  // ----------------------------------------------------
  const startSimulation = () => {
      setSimMessages([
          { 
              id: 'init', 
              role: 'member', 
              text: `(똑똑) 팀장님, ${activeSession?.title || '1on1'} 시간 되어서 왔습니다. 들어가도 될까요?` 
          }
      ]);
      setCurrentStageId(1);
      setShowSimModal(true);
  };

  const handleSimSend = async () => {
      if (!simInput.trim() || simLoading) return;

      const userText = simInput;
      const newMessages: SimulationMessage[] = [...simMessages, { id: Date.now().toString(), role: 'leader', text: userText }];
      
      setSimMessages(newMessages);
      setSimInput('');
      setSimLoading(true);

      const currentStageName = COACHING_STAGES.find(s => s.id === currentStageId)?.name || 'Check-in';

      const response = await simulateMemberResponse(
          member, 
          activeSession?.title || '정기 1on1', 
          newMessages, 
          currentStageName
      );

      setSimMessages(prev => [...prev, { id: Date.now().toString() + '_ai', role: 'member', text: response }]);
      setSimLoading(false);
  };

  // Helper for Star Rating
  const renderStars = (value: number, onChange: (val: number) => void) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                onClick={() => onChange(star)}
                className="focus:outline-none transition-transform hover:scale-110"
            >
                <Star 
                    className={`w-5 h-5 ${star <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                />
            </button>
        ))}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full flex flex-col overflow-hidden relative">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-100 flex-shrink-0">
        <button 
          onClick={() => setActiveTab('Schedule')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center ${activeTab === 'Schedule' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Calendar className="w-4 h-4 mr-2" /> 일정 및 기록
        </button>
        <button 
          onClick={() => setActiveTab('Log')}
          className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center ${activeTab === 'Log' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <FileText className="w-4 h-4 mr-2" /> 미팅 로그 작성
        </button>
      </div>

      {/* Content Area - Fixed: Removed global overflow-y-auto to allow column-specific scrolling */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* 1. Schedule Tab */}
        {activeTab === 'Schedule' && (
          <div className="h-full overflow-y-auto p-6 custom-scrollbar space-y-6">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-3 flex items-center"><Plus className="w-4 h-4 mr-2" />새로운 1on1 일정 예약</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="p-2 rounded border border-indigo-200 text-sm" />
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="p-2 rounded border border-indigo-200 text-sm" />
                <input type="text" value={scheduleTitle} onChange={e => setScheduleTitle(e.target.value)} placeholder="미팅 제목 (예: 월간 커리어 톡)" className="p-2 rounded border border-indigo-200 text-sm" />
              </div>
              <button onClick={handleSchedule} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">일정 예약하기</button>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-3">미팅 히스토리</h4>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed rounded-xl">예약된 일정이 없습니다.</div>
                ) : (
                  history.map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => { setSelectedSessionId(session.id); setActiveTab('Log'); }}
                      className="bg-white border border-slate-200 p-4 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
                    >
                      <div>
                         <div className="flex items-center mb-1">
                           <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${session.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                             {session.isCompleted ? '완료' : '예정'}
                           </span>
                           <span className="font-bold text-slate-800">{session.title}</span>
                         </div>
                         <div className="text-xs text-slate-500 flex items-center">
                           <Calendar className="w-3 h-3 mr-1" /> {session.date} {session.time}
                           {session.selfReview && <span className="ml-2 text-indigo-500 flex items-center"><CheckSquare className="w-3 h-3 mr-1" />셀프체크 완료</span>}
                         </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Log & AI Prep Tab */}
        {activeTab === 'Log' && (
          <div className="h-full p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Left: Log Form - Scrollable */}
                <div className="space-y-6 flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <h4 className="font-bold text-slate-800 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-600" />
                        {activeSession ? `${activeSession.date} 미팅 기록` : '미팅을 선택해주세요'}
                    </h4>
                    {activeSession && (
                        <button onClick={handleSaveLog} className="text-xs bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 font-bold shadow-sm flex items-center">
                            <CheckSquare className="w-3 h-3 mr-1.5" />저장 및 셀프 체크
                        </button>
                    )}
                </div>
                
                {activeSession ? (
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-10 custom-scrollbar">
                    {/* Standard Log Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">미팅 요약</label>
                            <textarea value={logSummary} onChange={e => setLogSummary(e.target.value)} className="w-full h-48 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-indigo-500" placeholder="주요 논의 내용을 요약하세요." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">강점 메모 (Strengths)</label>
                            <textarea value={logStrengths} onChange={e => setLogStrengths(e.target.value)} className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-emerald-500" placeholder="발견된 강점을 기록하세요." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">개발 과제 (Development)</label>
                            <textarea value={logDevTasks} onChange={e => setLogDevTasks(e.target.value)} className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500" placeholder="성장을 위한 과제를 기록하세요." />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Next Step / Checkpoint</label>
                            <input type="text" value={logNextStep} onChange={e => setLogNextStep(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" placeholder="다음 미팅 전까지 확인할 사항" />
                        </div>
                    </div>

                    {/* ⚠️ New Section: Leader Self-Check */}
                    <div className="bg-gradient-to-r from-indigo-50 to-white p-5 rounded-xl border border-indigo-100 mt-6">
                            <h5 className="font-bold text-indigo-900 mb-4 flex items-center border-b border-indigo-100 pb-2">
                                <PenTool className="w-4 h-4 mr-2" />
                                리더 셀프 코칭 체크 (Private)
                                <span className="ml-2 text-[10px] text-indigo-400 bg-white px-2 py-0.5 rounded-full border border-indigo-100 font-normal">팀장님만 볼 수 있습니다</span>
                            </h5>
                            
                            <div className="space-y-4">
                                {/* ⚠️ New: Dream Personality Check (Choi In-cheol) */}
                                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
                                            <div>
                                                <span className="text-sm font-bold text-amber-800 block">Dream Personality Check</span>
                                                <span className="text-xs text-amber-700 leading-tight">
                                                    "어둠의 성격(자기중심, 공감결여, 이용)이 나타나지 않았나요?"
                                                </span>
                                            </div>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={dreamPersonalityCheck} 
                                            onChange={(e) => setDreamPersonalityCheck(e.target.checked)}
                                            className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Question 1 */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block">1. 적극적 경청 (Listening)</span>
                                        <span className="text-xs text-slate-500">내가 말하기보다 팀원의 말을 더 많이 들었나요?</span>
                                    </div>
                                    {renderStars(selfListening, setSelfListening)}
                                </div>

                                {/* Question 2 */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block">2. 열린 질문 (Questioning)</span>
                                        <span className="text-xs text-slate-500">지시하기보다 스스로 답을 찾도록 질문했나요?</span>
                                    </div>
                                    {renderStars(selfQuestioning, setSelfQuestioning)}
                                </div>

                                {/* Question 3 */}
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-bold text-slate-700 block">3. 실행 유도 (Action)</span>
                                        <span className="text-xs text-slate-500">구체적인 다음 실행 계획을 도출했나요?</span>
                                    </div>
                                    {renderStars(selfAction, setSelfAction)}
                                </div>
                                
                                {/* Self Feedback Text */}
                                <div className="mt-2">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">셀프 코칭 회고 (Short Review)</label>
                                    <input 
                                        type="text" 
                                        value={selfFeedback} 
                                        onChange={e => setSelfFeedback(e.target.value)}
                                        placeholder="오늘 코칭에서 잘한 점이나 아쉬운 점을 짧게 남겨보세요."
                                        className="w-full p-2.5 bg-white border border-indigo-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                                    />
                                </div>
                            </div>
                    </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                    왼쪽 탭에서 일정을 선택하세요.
                    </div>
                )}
                </div>

                {/* Right: AI Prep & Practice (Refactored Layout) */}
                <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 flex flex-col h-full relative overflow-hidden">
                
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar pb-24">
                    <div className="flex justify-between items-start mb-4 flex-shrink-0">
                        <div>
                            <h4 className="font-bold text-indigo-900 flex items-center"><Sparkles className="w-4 h-4 mr-2" />AI 1on1 실전 연습</h4>
                            <p className="text-xs text-slate-500 mt-1">질문을 선택하고 팀원에게 일괄 공유하세요.</p>
                        </div>
                        {/* Simulation Button */}
                        <div className="flex flex-col gap-2 items-end">
                            {activeSession && (
                                <button 
                                    onClick={startSimulation}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-sm font-bold animate-pulse-slight"
                                >
                                    <PlayCircle className="w-3 h-3 mr-1.5" />
                                    Role-Play 시작
                                </button>
                            )}
                            <button 
                                onClick={handleGenerateQuestions} 
                                disabled={isGeneratingQuestions}
                                className="text-xs bg-white border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center shadow-sm"
                            >
                                {isGeneratingQuestions ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Target className="w-3 h-3 mr-1" />}
                                예상 질문 생성
                            </button>
                        </div>
                    </div>

                    {/* ⚠️ NEW: Sent Questions Display Section (Top of Right Panel) */}
                    {activeSession?.sentQuestions && activeSession.sentQuestions.length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 shadow-sm">
                            <h5 className="text-sm font-bold text-emerald-800 mb-3 flex items-center border-b border-emerald-100 pb-2">
                                <MailCheck className="w-4 h-4 mr-2" />
                                📢 [공유 완료] 사전 전달된 질문
                            </h5>
                            <ul className="space-y-2">
                                {activeSession.sentQuestions.map((q, idx) => (
                                    <li key={idx} className="flex items-start text-sm text-emerald-900 bg-white/60 p-2 rounded-lg">
                                        <span className="font-bold mr-2 text-emerald-600">{idx + 1}.</span>
                                        {q}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Custom Question Input */}
                    <div className="bg-white p-3 rounded-lg border border-indigo-100 shadow-sm mb-4 flex-shrink-0">
                        <label className="block text-xs font-bold text-indigo-900 mb-2 flex items-center">
                            <MessageSquarePlus className="w-3 h-3 mr-1" />직접 질문 추가
                        </label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={customQuestion}
                                onChange={(e) => setCustomQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomQuestion()}
                                placeholder="보내고 싶은 질문을 직접 입력하세요..."
                                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button 
                                onClick={handleAddCustomQuestion}
                                disabled={!customQuestion.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                title="리스트에 추가"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {aiQuestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs border border-dashed border-slate-200 rounded-lg bg-white/50 min-h-[200px]">
                            <Brain className="w-8 h-8 mb-2 text-indigo-200" />
                            <p>버튼을 눌러 {member.name}님을 위한</p>
                            <p>맞춤형 코칭 질문을 생성해보세요.</p>
                            </div>
                        ) : (
                            aiQuestions.map((q, idx) => {
                                const isSelected = selectedQuestions.includes(q);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`p-4 rounded-lg border shadow-sm transition-all cursor-pointer flex items-start ${
                                            isSelected 
                                                ? 'bg-indigo-50 border-indigo-300 shadow-md ring-1 ring-indigo-200' 
                                                : 'bg-white border-indigo-100 hover:shadow-md hover:border-indigo-200'
                                        }`}
                                        onClick={() => toggleQuestionSelection(q)}
                                    >
                                        <div className="mr-3 mt-1">
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-start mb-1">
                                                <span className={`font-black text-lg mr-2 -mt-1 ${isSelected ? 'text-indigo-500' : 'text-indigo-200'}`}>Q</span>
                                                <p className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{q}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Floating Bottom Action Bar (Fixed at bottom of container with High Z-Index) */}
                {selectedQuestions.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-200 z-20 animate-fade-in-up">
                        <button
                            onClick={handleClickSendButton}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center justify-center"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            선택한 {selectedQuestions.length}개의 질문 한 번에 보내기
                        </button>
                    </div>
                )}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* ⚠️ CUSTOM CONFIRMATION MODAL (Send Questions) */}
      {/* ---------------------------------------------------------------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
                 <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Send className="w-5 h-5 mr-2 text-indigo-600" />
                    질문 리스트 전송 확인
                 </h3>
                 <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    {member.name}님에게 아래 <span className="font-bold text-indigo-600">{selectedQuestions.length}개의 질문</span>을<br/>사전 공유하시겠습니까?
                 </p>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 max-h-48 overflow-y-auto mb-6 custom-scrollbar">
                     <ol className="list-decimal pl-4 space-y-2">
                        {selectedQuestions.map((q, i) => (
                            <li key={i} className="text-xs text-slate-700 leading-snug">{q}</li>
                        ))}
                     </ol>
                 </div>
                 <div className="flex justify-end gap-3">
                     <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                     >
                        취소
                     </button>
                     <button 
                        onClick={handleConfirmSend}
                        className="px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-colors flex items-center"
                     >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> 전송하기
                     </button>
                 </div>
             </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ⚠️ SIMULATION MODAL (ROLE-PLAY) */}
      {/* ---------------------------------------------------------------------- */}
      {showSimModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex overflow-hidden border border-slate-700">
                  
                  {/* Left: Chat Interface */}
                  <div className="flex-1 flex flex-col bg-slate-50">
                      {/* Sim Header */}
                      <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                          <div className="flex items-center">
                              <div className="relative">
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full border-2 border-indigo-500 mr-3" />
                                <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] px-1.5 rounded-full font-bold">AI</div>
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800 text-lg flex items-center">
                                      {member.name} 팀원과의 1on1 연습
                                  </h3>
                                  <p className="text-xs text-slate-500">주제: {activeSession?.title}</p>
                              </div>
                          </div>
                          <button onClick={() => setShowSimModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                              <X className="w-6 h-6 text-slate-400" />
                          </button>
                      </div>

                      {/* Stage Progress Bar (Top) */}
                      <div className="bg-white px-6 py-3 border-b border-slate-100">
                          <div className="flex items-center justify-between relative">
                              {/* Background Line */}
                              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-100 -z-10"></div>
                              
                              {COACHING_STAGES.map((stage) => {
                                  const isActive = currentStageId === stage.id;
                                  const isPast = currentStageId > stage.id;
                                  return (
                                      <div 
                                        key={stage.id} 
                                        onClick={() => setCurrentStageId(stage.id)}
                                        className={`flex flex-col items-center cursor-pointer transition-all ${isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
                                      >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 border-2 ${
                                              isActive ? 'bg-indigo-600 text-white border-indigo-600' : 
                                              isPast ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'bg-white text-slate-400 border-slate-200'
                                          }`}>
                                              {stage.id}
                                          </div>
                                          <span className={`text-xs font-bold ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{stage.name.split(':')[1]}</span>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Messages Area */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                          {simMessages.map((msg) => (
                              <div key={msg.id} className={`flex ${msg.role === 'leader' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm leading-relaxed text-sm ${
                                      msg.role === 'leader' 
                                          ? 'bg-indigo-600 text-white rounded-br-none' 
                                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                  }`}>
                                      {msg.role === 'member' && <span className="block text-xs font-bold text-slate-400 mb-1">{member.name}</span>}
                                      {msg.text}
                                  </div>
                              </div>
                          ))}
                          {simLoading && (
                              <div className="flex justify-start">
                                  <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center shadow-sm">
                                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500 mr-2" />
                                      <span className="text-xs text-slate-500">답변 생성 중...</span>
                                  </div>
                              </div>
                          )}
                          <div ref={simEndRef} />
                      </div>

                      {/* Input Area */}
                      <div className="p-4 bg-white border-t border-slate-200">
                          <div className="flex items-center gap-2">
                              <textarea 
                                  value={simInput}
                                  onChange={(e) => setSimInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSimSend())}
                                  placeholder={`${COACHING_STAGES.find(s => s.id === currentStageId)?.desc} (Enter로 전송)`}
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-14"
                              />
                              <button 
                                  onClick={handleSimSend}
                                  disabled={!simInput.trim() || simLoading}
                                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              >
                                  <Send className="w-5 h-5" />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Right: AI Coaching Navigator (Tips) */}
                  <div className="w-80 bg-indigo-50 border-l border-indigo-100 flex flex-col">
                      <div className="p-5 border-b border-indigo-100 bg-indigo-100/50">
                          <h4 className="font-bold text-indigo-900 flex items-center">
                              <Brain className="w-5 h-5 mr-2 text-indigo-600" />
                              AI 코칭 네비게이터
                          </h4>
                          <p className="text-xs text-indigo-700 mt-1">현재 단계에 맞는 코칭 가이드입니다.</p>
                      </div>

                      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                          {/* Current Stage Highlight */}
                          <div className="mb-6">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Current Stage</span>
                                  <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-200">Step {currentStageId}</span>
                              </div>
                              <h5 className="font-bold text-lg text-slate-800 mb-1">{COACHING_STAGES[currentStageId-1].name}</h5>
                              <p className="text-xs text-slate-500 mb-3">{COACHING_STAGES[currentStageId-1].desc}</p>
                              
                              <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                                  {COACHING_STAGES[currentStageId-1].tips.map((tip, idx) => (
                                      <div key={idx} className="flex items-start">
                                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 mr-2 flex-shrink-0"></div>
                                          <p className="text-sm text-slate-700 leading-snug">{tip}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Quick Actions / Helpers */}
                          <div className="bg-white/50 rounded-xl p-4 border border-indigo-100/50">
                              <h5 className="font-bold text-sm text-indigo-800 mb-3 flex items-center">
                                  <Mic className="w-4 h-4 mr-1.5" /> 리더 발화 팁
                              </h5>
                              <ul className="text-xs text-slate-600 space-y-2">
                                  <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> 닫힌 질문(Yes/No)보다는 열린 질문(How/What)을 사용하세요.</li>
                                  <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> 침묵을 두려워하지 마세요. 생각할 시간을 주세요.</li>
                                  <li className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> "왜(Why)"보다는 "어떻게(How)"로 물어보세요. (방어기제 감소)</li>
                              </ul>
                          </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="p-4 border-t border-indigo-100 bg-indigo-100/30">
                          <div className="flex justify-between items-center">
                              <button 
                                onClick={() => setCurrentStageId(prev => Math.max(1, prev - 1))}
                                disabled={currentStageId === 1}
                                className="text-xs font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                              >
                                  Prev Step
                              </button>
                              <div className="flex gap-1">
                                  <div className={`w-2 h-2 rounded-full ${currentStageId === 1 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                  <div className={`w-2 h-2 rounded-full ${currentStageId === 2 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                                  <div className={`w-2 h-2 rounded-full ${currentStageId === 3 ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                              </div>
                              <button 
                                onClick={() => setCurrentStageId(prev => Math.min(3, prev + 1))}
                                disabled={currentStageId === 3}
                                className="text-xs font-bold text-slate-500 hover:text-indigo-600 disabled:opacity-30"
                              >
                                  Next Step
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
