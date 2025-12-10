
import React, { useMemo, useState } from 'react';
import { TeamMember, HistoricalEvaluation, SkillAssessment } from '../types';
import { Target, History, User, Users, ClipboardList, CheckCircle2, Zap, Sparkles, Loader2, MessageSquare, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, LineChart, CartesianGrid, XAxis, YAxis, Legend, Line } from 'recharts';
import { generateSkillCoachingQuestions } from '../services/geminiService';

interface TeamGrowthCenterProps {
  member: TeamMember;
  members: TeamMember[];
}

// ====================================================================
// Helper Functions
// ====================================================================

// Calculate Peer Group Average dynamically
const calculatePeerAverages = (targetMember: TeamMember, allMembers: TeamMember[]) => {
  // 1. Filter peers with the same jobName, excluding the target member
  const peers = allMembers.filter(m => m.jobName === targetMember.jobName && m.id !== targetMember.id);
  
  // 2. If no peers exist in the same job group, return a default baseline (3.0)
  if (peers.length === 0) {
    return targetMember.skillAssessments.map(s => ({
      skillName: s.skillName,
      avgScore: 3.0
    }));
  }

  // 3. Aggregate scores from peers
  const skillSums: Record<string, { sum: number; count: number }> = {};

  peers.forEach(peer => {
    peer.skillAssessments.forEach(skill => {
      if (!skillSums[skill.skillName]) {
        skillSums[skill.skillName] = { sum: 0, count: 0 };
      }
      skillSums[skill.skillName].sum += skill.leaderReview;
      skillSums[skill.skillName].count += 1;
    });
  });

  // 4. Calculate averages
  return targetMember.skillAssessments.map(s => ({
    skillName: s.skillName,
    avgScore: skillSums[s.skillName] 
      ? skillSums[s.skillName].sum / skillSums[s.skillName].count 
      : 3.0
  }));
};

// Process Data for Radar Chart
const processRadarData = (member: TeamMember, members: TeamMember[]) => {
  const peerAvgs = calculatePeerAverages(member, members);
  
  return member.skillAssessments.map(s => {
    const peer = peerAvgs.find(p => p.skillName === s.skillName);
    return {
      skill: s.skillName,
      Self: s.selfReview,
      Leader: s.leaderReview,
      PeerAvg: peer ? parseFloat(peer.avgScore.toFixed(1)) : 3.0,
      fullMark: 5,
    };
  });
};

// Process Data for Skill Trend Line Chart
const processSkillTrendData = (member: TeamMember) => {
    // 1. 과거 데이터 수집
    const historyData = member.historicalEvaluations
        .filter(h => h.skillSnapshot && h.skillSnapshot.length > 0)
        .map(h => {
            const dataPoint: any = { year: h.year.toString() };
            h.skillSnapshot?.forEach(s => {
                dataPoint[s.skillName] = s.score;
            });
            return dataPoint;
        });
    
    // 2. 현재 데이터 추가 (2025년 또는 Current로 가정)
    // 2025년이 historicalEvaluations에 이미 있다면 중복을 피해야 함.
    // Mock Data에는 2025년이 포함되어 있으므로 historyData에서 처리됨.
    // 만약 별도로 '현재'를 보여주고 싶다면 아래 로직 조정 필요.
    // 여기서는 historyData가 이미 2023, 2024, 2025를 포함하므로 그대로 사용.
    
    return historyData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
};

// Random Color Generator for Lines
const getSkillColor = (index: number) => {
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#0ea5e9'];
    return colors[index % colors.length];
};

// ====================================================================
// Component Definition
// ====================================================================

export const TeamGrowthCenter: React.FC<TeamGrowthCenterProps> = ({ member, members }) => {
    const radarData = useMemo(() => processRadarData(member, members), [member, members]);
    const trendData = useMemo(() => processSkillTrendData(member), [member]);
    
    const [coachingQuestions, setCoachingQuestions] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate Summary Insights
    const strongAreas = radarData.filter(d => d.Leader > d.PeerAvg);
    const weakAreas = radarData.filter(d => d.Leader < d.PeerAvg);
    const topSkill = [...radarData].sort((a, b) => (b.Leader - b.PeerAvg) - (a.Leader - a.PeerAvg))[0];

    const handleGenerateCoaching = async () => {
      setIsGenerating(true);
      // Prepare weak areas data: { skill: string, gap: number }
      const weakSkillsData = weakAreas.map(d => ({
        skill: d.skill,
        gap: parseFloat((d.PeerAvg - d.Leader).toFixed(1))
      }));

      try {
        const questions = await generateSkillCoachingQuestions(member, weakSkillsData);
        setCoachingQuestions(questions);
      } catch (e) {
        console.error("Error generating questions", e);
      } finally {
        setIsGenerating(false);
      }
    };

    return (
        <div className="space-y-8">
            {/* Header / Summary */}
            <header className="flex items-center border-b border-slate-200 pb-4">
                <img 
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-indigo-200 shadow-md" 
                    src={member.avatar} 
                    alt={member.name} 
                />
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-800">{member.name} 팀원 성장 센터</h2>
                    <p className="text-lg text-slate-500">{member.role} ({member.jobLevel} / {member.jobName})</p>
                </div>
            </header>

            {/* 1. Skill Gap Analysis (Radar Chart) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-indigo-600" /> 핵심 역량 및 Gap 분석
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Radar Chart */}
                    <div className="lg:col-span-2 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 12 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} stroke="#e2e8f0" axisLine={false} tick={false} />
                                
                                {/* 리더 평가 (실제 역량) */}
                                <Radar name="리더 평가 (역량)" dataKey="Leader" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                {/* 본인 평가 (자기 인식) */}
                                <Radar name="본인 평가 (인식)" dataKey="Self" stroke="#34d399" fill="#34d399" fillOpacity={0.4} />
                                {/* 동종군 평균 (벤치마크) */}
                                <Radar name={`동종군 평균 (${member.jobName})`} dataKey="PeerAvg" stroke="#f43f5e" fill="none" strokeDasharray="5 5" strokeWidth={2} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gap Summary & Analysis Report */}
                    <div className="lg:col-span-1 space-y-4 pt-2 flex flex-col">
                        {/* Analysis Report Box */}
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-2">
                          <h4 className="font-bold text-indigo-900 text-sm mb-2 flex items-center">
                             <Zap className="w-4 h-4 mr-1 text-indigo-600" /> 종합 분석 리포트
                          </h4>
                          <p className="text-sm text-indigo-800 leading-relaxed">
                            {member.name}님은 동료({member.jobName}) 대비 <span className="font-bold">{strongAreas.length}개 영역</span>에서 강점을 보이고 있으며, 
                            <span className="font-bold"> {weakAreas.length}개 영역</span>에서 보완이 필요합니다. 
                            {topSkill && (
                                <>
                                  <br/><br/>
                                  특히 <span className="font-bold underline decoration-indigo-400">{topSkill.skill}</span> 역량이 평균 대비 가장 돋보입니다 (+{(topSkill.Leader - topSkill.PeerAvg).toFixed(1)}).
                                </>
                            )}
                          </p>
                        </div>

                        {/* AI Coaching Button & Result */}
                        <div className="border-t border-slate-100 pt-4 mt-2">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-slate-700 flex items-center">
                                    <MessageSquare className="w-4 h-4 mr-1.5 text-slate-500" />
                                    Gap 기반 코칭 질문
                                </span>
                                <button 
                                    onClick={handleGenerateCoaching}
                                    disabled={isGenerating}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center font-medium shadow-sm"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                                    AI 생성
                                </button>
                            </div>

                            {coachingQuestions.length > 0 ? (
                                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm space-y-2">
                                    {coachingQuestions.map((q, idx) => (
                                        <div key={idx} className="flex items-start">
                                            <span className="text-indigo-500 font-bold text-xs mr-2 mt-0.5">Q{idx + 1}.</span>
                                            <p className="text-sm text-slate-700 leading-snug">{q}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    버튼을 눌러 맞춤형 코칭 질문을 받아보세요.
                                </div>
                            )}
                        </div>

                        <div className="font-semibold text-slate-700 mb-2 flex items-center mt-4">
                            <ClipboardList className="w-4 h-4 mr-2 text-slate-500" />
                            세부 Gap 분석
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-[200px]">
                            {radarData.map(d => {
                                const selfGap = d.Leader - d.Self; // 리더가 본 것 - 본인이 본 것
                                const peerGap = d.Leader - d.PeerAvg; // 리더가 본 것 - 동종군 평균

                                return (
                                    <div key={d.skill} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                                        <h4 className="font-bold text-slate-800 text-sm mb-2 pb-1 border-b border-slate-100 flex justify-between">
                                            {d.skill}
                                            <span className="text-xs font-normal text-slate-500">Score: {d.Leader}</span>
                                        </h4>
                                        
                                        {/* 1. Self vs Leader Gap */}
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="flex items-center text-xs text-slate-500">
                                                <User className="w-3 h-3 mr-1" /> 자기 인식
                                            </span>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                Math.abs(selfGap) < 0.5 ? 'bg-slate-100 text-slate-600' :
                                                selfGap < 0 ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {Math.abs(selfGap) < 0.5 ? '일치' : selfGap > 0 ? '겸손함' : '과대평가'}
                                                <span className="ml-1 opacity-75">({selfGap > 0 ? '+' : ''}{selfGap.toFixed(1)})</span>
                                            </span>
                                        </div>
                                        
                                        {/* 2. Peer Group Gap */}
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center text-xs text-slate-500">
                                                <Users className="w-3 h-3 mr-1" /> 동종군 비교
                                            </span>
                                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                                                Math.abs(peerGap) < 0.5 ? 'bg-slate-100 text-slate-600' :
                                                peerGap > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {peerGap > 0 ? '강점' : peerGap < 0 ? '보완 필요' : '평균'}
                                                <span className="ml-1 opacity-75">({peerGap > 0 ? '+' : ''}{peerGap.toFixed(1)})</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 2. Skill Growth Trend (New Line Chart) */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> 역량 레벨 변화 추이 (Skill Trend - 3개년)
                </h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={trendData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            {member.skillAssessments.map((skill, index) => (
                                <Line 
                                    key={skill.skillName}
                                    type="monotone" 
                                    dataKey={skill.skillName} 
                                    stroke={getSkillColor(index)} 
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Historical Evaluation Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <History className="w-5 h-5 mr-2 text-amber-600" /> 3개년 평가 및 주요 업무 이력
                </h3>
                
                <div className="space-y-6">
                    {member.historicalEvaluations.map((evalData: HistoricalEvaluation, index: number) => (
                        <div key={evalData.year} className="relative pl-8">
                            {/* Timeline Dot */}
                            <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-amber-500 border-4 border-white shadow-md"></div>
                            {/* Connector Line */}
                            {index < member.historicalEvaluations.length - 1 && (
                                <div className="absolute left-1.5 top-5 bottom-[-10px] w-0.5 bg-amber-200"></div>
                            )}

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="text-lg font-bold text-amber-700 mb-2 flex items-center">
                                    {evalData.year}년 평가 ({evalData.performanceScore}점)
                                </h4>
                                
                                <div className="text-sm text-slate-600 mb-3">
                                    <span className="font-semibold text-slate-700">리더 코멘트:</span> "{evalData.leaderComment}"
                                </div>

                                {/* Strengths */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">강점 키워드:</span>
                                    {evalData.strengthsKeywords.map(keyword => (
                                        <span key={keyword} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">#{keyword}</span>
                                    ))}
                                </div>

                                {/* ⚠️ Major Tasks Summary (Updated to use majorTasks field) */}
                                {evalData.majorTasks && evalData.majorTasks.length > 0 && (
                                    <div className="mt-4 border-t pt-3 border-slate-100">
                                        <h5 className="font-semibold text-sm text-slate-700 mb-2 flex items-center">
                                            <ClipboardList className="w-4 h-4 mr-1 text-slate-500" /> 주요 업무 성과 ({evalData.year})
                                        </h5>
                                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                                            {evalData.majorTasks.map((task, i) => (
                                                <li key={i} className="truncate">{task}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
        </div>
    );
};
