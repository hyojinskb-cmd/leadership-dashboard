
import React, { useMemo, useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MessageSquare, Target, Sparkles, Loader2, Users, Briefcase, HeartHandshake, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { analyzeLeaderCoaching } from '../services/geminiService';

interface LeaderAnalyticsProps {
  members: TeamMember[];
}

// Helper to parse Bold text
const parseBold = (text: string) => text.split(/(\*\*.*?\*\*)/g).map((part, i) => 
  part.startsWith('**') && part.endsWith('**') 
    ? <strong key={i} className="font-bold text-indigo-800">{part.slice(2, -2)}</strong> 
    : part
);

// Helper to render markdown structure (Restored to Clean Card Style)
const renderMarkdown = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    
    // Headers (###)
    if (trimmed.startsWith('### ')) {
      return (
        <div key={index} className="mt-5 mb-3">
            <h3 className="text-base font-bold text-indigo-900 border-b border-indigo-100 pb-1 inline-block">
                {trimmed.replace('### ', '')}
            </h3>
        </div>
      );
    }
    
    // Headers (##)
    if (trimmed.startsWith('## ')) {
        return (
          <div key={index} className="mt-6 mb-3">
              <h3 className="text-lg font-bold text-indigo-900 border-b-2 border-indigo-100 pb-1">
                  {trimmed.replace('## ', '')}
              </h3>
          </div>
        );
      }

    // Numbered Lists (1. )
    if (/^\d+\./.test(trimmed)) {
        return (
             <div key={index} className="flex items-start mb-2 pl-1 bg-white p-2 rounded-lg border border-slate-50 shadow-sm">
                <span className="mr-3 text-indigo-600 font-bold text-sm bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                    {trimmed.split('.')[0]}
                </span>
                <span className="text-slate-700 text-sm leading-relaxed mt-0.5">{parseBold(trimmed.replace(/^\d+\.\s*/, ''))}</span>
             </div>
        )
    }
    
    // Bullet Lists (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      return (
        <div key={index} className="flex items-start mb-1.5 pl-3">
           <span className="mr-2 text-indigo-400 mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></span>
           <span className="text-slate-700 text-sm leading-relaxed">{parseBold(content)}</span>
        </div>
      );
    }

    if (trimmed === '') {
      return <div key={index} className="h-1"></div>;
    }

    return <p key={index} className="text-slate-700 mb-1 leading-relaxed text-sm">{parseBold(line)}</p>;
  });
};

export const LeaderAnalytics: React.FC<LeaderAnalyticsProps> = ({ members }) => {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Default collapsed

  const allFeedbacks = useMemo(() => {
    if (!members) return [];
    return members.flatMap(m => m.leaderFeedbacks || []);
  }, [members]);

  const { radarData, strategicScore, relationshipScore } = useMemo(() => {
    if (allFeedbacks.length === 0) return { radarData: [], strategicScore: 0, relationshipScore: 0 };

    const sums = { 
      vision: 0, decision: 0, execution: 0, 
      coaching: 0, communication: 0, innovation: 0
    };
    
    allFeedbacks.forEach(f => {
      if (f.scores) {
        sums.vision += f.scores.vision || 0;
        sums.decision += f.scores.decision || 0;
        sums.execution += f.scores.execution || 0;
        sums.coaching += f.scores.coaching || 0;
        sums.communication += f.scores.communication || 0;
        sums.innovation += f.scores.innovation || 0;
      }
    });

    const count = allFeedbacks.length;
    const avgVision = parseFloat((sums.vision / count).toFixed(1));
    const avgDecision = parseFloat((sums.decision / count).toFixed(1));
    const avgExecution = parseFloat((sums.execution / count).toFixed(1));
    const avgCoaching = parseFloat((sums.coaching / count).toFixed(1));
    const avgCommunication = parseFloat((sums.communication / count).toFixed(1));
    const avgInnovation = parseFloat((sums.innovation / count).toFixed(1));

    const strategicAvg = parseFloat(((avgVision + avgDecision + avgExecution) / 3).toFixed(1));
    const relationshipAvg = parseFloat(((avgCoaching + avgCommunication + avgInnovation) / 3).toFixed(1));

    const data = [
      { subject: '비전 제시', Strategic: avgVision, Relationship: 0, fullMark: 5 },
      { subject: '의사결정', Strategic: avgDecision, Relationship: 0, fullMark: 5 },
      { subject: '성과 견인', Strategic: avgExecution, Relationship: 0, fullMark: 5 },
      { subject: '피드백 전달', Strategic: 0, Relationship: avgCoaching, fullMark: 5 },
      { subject: '적극적 경청', Strategic: 0, Relationship: avgCommunication, fullMark: 5 },
      { subject: '성장/변화 지원', Strategic: 0, Relationship: avgInnovation, fullMark: 5 },
    ];

    return { radarData: data, strategicScore: strategicAvg, relationshipScore: relationshipAvg };
  }, [allFeedbacks]);

  // Auto-run Analysis on Mount (if data exists)
  useEffect(() => {
    if (allFeedbacks.length > 0 && !aiAnalysis && !isAnalyzing) {
        handleAnalyze();
    }
  }, [allFeedbacks]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
        const result = await analyzeLeaderCoaching(allFeedbacks);
        setAiAnalysis(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const balanceGap = strategicScore - relationshipScore;
  let balanceType = "균형 잡힌 리더";
  let balanceColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
  
  if (balanceGap > 0.5) {
    balanceType = "성과 중심형 리더 (Task-Oriented)";
    balanceColor = "text-blue-600 bg-blue-50 border-blue-100";
  } else if (balanceGap < -0.5) {
    balanceType = "관계 중심형 리더 (People-Oriented)";
    balanceColor = "text-rose-600 bg-rose-50 border-rose-100";
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-8 custom-scrollbar">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <Users className="w-6 h-6 mr-2 text-indigo-600" />
            리더십 피드백 통합 분석 (Leadership Analytics)
        </h2>
        <p className="text-slate-500 text-sm">
            총 {members.length}명의 팀원 중 {allFeedbacks.length}건의 익명 피드백을 통합 분석하여 리더십의 현주소를 진단합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Charts & Scores */}
        <div className="xl:col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center tracking-wider">
                            <Briefcase className="w-4 h-4 mr-1.5 text-blue-500" /> 전략/성과 지수
                        </span>
                        <span className="text-3xl font-black text-slate-800">{strategicScore}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${(strategicScore/5)*100}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">비전, 의사결정, 실행력 (Hard Skill)</p>
                </div>

                <div className="bg-white p-5 rounded-xl border-l-4 border-rose-400 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center tracking-wider">
                            <HeartHandshake className="w-4 h-4 mr-1.5 text-rose-400" /> 관계/코칭 지수
                        </span>
                        <span className="text-3xl font-black text-slate-800">{relationshipScore}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div className="bg-rose-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${(relationshipScore/5)*100}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">적극적 경청, 피드백 전달, 성장 지원 (1on1 Skill)</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative h-[420px]">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-indigo-500" />
                        6대 리더십 역량 프로파일
                    </h3>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${balanceColor} shadow-sm`}>
                        {balanceType}
                    </span>
                </div>
                
                {allFeedbacks.length > 0 ? (
                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} 
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} axisLine={false} tick={false} />
                                <Radar
                                    name="전략 영역 (Strategic)"
                                    dataKey="Strategic"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.5}
                                />
                                <Radar
                                    name="관계/코칭 영역 (1on1 Skill)"
                                    dataKey="Relationship"
                                    stroke="#fb7185"
                                    fill="#fb7185"
                                    fillOpacity={0.5}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    formatter={(value: any) => value || "-"}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[320px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                        데이터가 충분하지 않습니다.
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Comments List */}
        <div className="xl:col-span-4 space-y-6 h-full">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-full max-h-[620px] overflow-y-auto custom-scrollbar flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center sticky top-0 bg-white pb-2 border-b border-slate-50 z-10">
                    <MessageSquare className="w-5 h-5 mr-2 text-amber-500" />
                    익명 피드백 코멘트
                    <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Total {allFeedbacks.length}</span>
                </h3>
                <div className="space-y-3 flex-1">
                    {allFeedbacks.length > 0 ? (
                        allFeedbacks.map((f, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors relative group">
                                <div className="absolute top-4 left-3 text-indigo-200 group-hover:text-indigo-300">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166C6.46432 18 6.0166 18.4477 6.0166 19V21H5.0166Z" /></svg>
                                </div>
                                <p className="text-slate-700 text-sm pl-8 leading-relaxed font-medium">
                                    {f.comment}
                                </p>
                                <p className="text-xs text-slate-400 mt-2 text-right flex justify-end items-center">
                                    {f.date}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm">등록된 코멘트가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Row: AI Analysis (Full Width) */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-5 border-b border-indigo-100 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-indigo-900 flex items-center text-lg">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                    AI 리더십 코칭 분석 (Coaching Insights)
                </h3>
                <p className="text-xs text-slate-500 mt-1">위의 통합 데이터를 바탕으로 강점 강화 및 보완을 위한 구체적인 액션 플랜을 제시합니다.</p>
            </div>
            {/* Status Badge */}
            {isAnalyzing ? (
                <div className="flex items-center text-xs text-indigo-500 font-medium px-3 py-1 bg-white rounded-full border border-indigo-100">
                    <Loader2 className="w-3 h-3 animate-spin mr-2" /> 분석 중...
                </div>
            ) : (
                <div className="flex items-center text-xs text-emerald-600 font-medium px-3 py-1 bg-white rounded-full border border-emerald-100">
                    <Sparkles className="w-3 h-3 mr-1" /> 분석 완료
                </div>
            )}
        </div>
        
        {/* Analysis Content */}
        <div className="relative">
             <div className={`p-8 bg-slate-50/50 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-none' : 'max-h-60'}`}>
                {aiAnalysis ? (
                    <div className="prose prose-sm prose-indigo max-w-none">
                        {renderMarkdown(aiAnalysis)}
                    </div>
                ) : (
                    <div className="space-y-4 animate-pulse p-4">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                    </div>
                )}
            </div>

            {/* Gradient Mask & Toggle Button */}
            {!isExpanded && aiAnalysis && (
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            )}
            
            {aiAnalysis && (
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-3 bg-white border-t border-indigo-100 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center justify-center z-10 relative"
                >
                    {isExpanded ? (
                        <>상세 분석 접기 <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                        <>전체 분석 내용 확인하기 <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
