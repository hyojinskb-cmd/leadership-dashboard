
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, UserCircle, Target } from 'lucide-react'; 
import { ChatMessage, TeamMember } from '../types'; 
import { generateLeadershipAdvice, generateSkillGapAdvice } from '../services/geminiService'; 

// AICoach Props를 확장하여 팀원 데이터를 받습니다.
interface AICoachProps {
  members: TeamMember[];
}

// ====================================================================
// Mock Peer Group Data (SRE Team 6 Core Skills)
// ====================================================================
const mockPeerGroupAvg = [
  { skillName: 'DevOps & 자동화', avgScore: 3.8 },
  { skillName: '모니터링 & 데이터', avgScore: 4.2 },
  { skillName: '네트워크 & 보안', avgScore: 3.5 },
  { skillName: '서버 & 인프라', avgScore: 4.0 },
  { skillName: '미디어 & 스트리밍', avgScore: 3.2 },
  { skillName: 'AI & 신기술', avgScore: 2.8 },
];


export const AICoach: React.FC<AICoachProps> = ({ members }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '안녕하세요, 팀장님. 리더십 코치 AI입니다. 팀 관리, 피드백 작성, 또는 어려운 의사결정에 대해 무엇이든 물어보세요.',
      timestamp: Date.now()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ----------------------------------------------------
  // 신규: Skill Gap 분석 요청 버튼 핸들러
  // ----------------------------------------------------
  const handleRequestSkillGapAdvice = async (member: TeamMember) => {
    const question = `${member.name} 팀원의 Skill Gap 분석 및 육성 전략을 요청합니다.`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: question,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // 해당 팀원의 스킬에 맞는 평균 데이터만 필터링
      const relevantPeerAvgs = mockPeerGroupAvg.filter(avg => 
        member.skillAssessments.some(s => s.skillName === avg.skillName)
      );

      const advice = await generateSkillGapAdvice(member, relevantPeerAvgs); // 신규 함수 호출

      const modelMsg: ChatMessage = {
        id: Date.now().toString() + '_response',
        role: 'model',
        text: advice,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Failed to generate skill gap advice:", error);
      setMessages(prev => [...prev, { id: Date.now().toString() + '_error', role: 'model', text: '죄송합니다. Skill Gap 분석 조언 생성 중 오류가 발생했습니다.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 일반 질문을 위한 컨텍스트 구성
      const context = `팀 규모: ${members.length}명. 팀 평균 Skill 점수: ${members.reduce((sum, m) => sum + m.avgLeaderSkillScore, 0) / members.length}점. 주요 이슈: 최근 프로젝트 마감일 준수에 대한 압박이 있음.`;
      
      const advice = await generateLeadershipAdvice(context, userMsg.text); // 기존 함수 호출

      const modelMsg: ChatMessage = {
        id: Date.now().toString() + '_response',
        role: 'model',
        text: advice,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString() + '_error', role: 'model', text: '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-full max-h-[700px]">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-lg flex items-center">
          <Bot className="w-5 h-5 text-indigo-600 mr-2" />
          AI 리더십 코치 (Gemini)
        </h3>
        {/* 새로운 기능: Skill Gap 분석 요청 버튼 */}
        <div className="flex space-x-2">
           <div className="relative group">
              <button 
                className="p-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors flex items-center"
                onClick={() => document.getElementById('skill-gap-list')?.classList.toggle('hidden')}
              >
                <Target className="w-4 h-4 mr-1" /> 팀원 Skill Gap 분석
              </button>
              <div id="skill-gap-list" className="hidden absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-10">
                <div className="p-2 text-xs font-semibold text-slate-500 border-b">분석 요청 팀원 선택:</div>
                {members.map(member => (
                  <button 
                    key={member.id}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 flex items-center transition-colors"
                    onClick={() => {
                      handleRequestSkillGapAdvice(member);
                      document.getElementById('skill-gap-list')?.classList.add('hidden');
                    }}
                    disabled={isLoading}
                  >
                    <UserCircle className="w-4 h-4 mr-2 text-slate-400" />
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar/Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'ml-2 bg-indigo-600 text-white' : 'mr-2 bg-slate-100 text-indigo-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              {/* Message Bubble */}
              <div className={`flex-1 px-4 py-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}`}>
                {/* ⚠️ Note: For production use, consider a proper Markdown parser instead of dangerouslySetInnerHTML */}
                <pre className="text-sm whitespace-pre-wrap font-sans p-0 m-0 bg-transparent border-none">
                    {msg.text}
                </pre>
                <span className={`block text-xs mt-1 ${msg.role === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-2" />
              <span className="text-xs text-slate-500">답변 생성 중...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="리더십 고민을 입력하세요... (예: 팀원 동기부여 방법)"
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[50px]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
