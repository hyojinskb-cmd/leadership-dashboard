
import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ComposedChart
} from 'recharts';
import { Info, TrendingUp, Target, Activity, CheckCircle2, Users, AlertTriangle, ArrowRight, Flag, Sparkles, Loader2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { TeamMember } from '../types';
import { analyzeKPIPerformance } from '../services/geminiService';

// ⚠️ SRE Team Core Skills for Demo
const skillRadarData = [
  { subject: 'DevOps & 자동화', A: 4.2, B: 4.0, fullMark: 5 },
  { subject: '모니터링 & 데이터', A: 4.5, B: 4.5, fullMark: 5 },
  { subject: '네트워크 & 보안', A: 3.0, B: 4.0, fullMark: 5 },
  { subject: '서버 & 인프라', A: 4.0, B: 4.2, fullMark: 5 },
  { subject: '미디어 & 스트리밍', A: 3.5, B: 3.8, fullMark: 5 },
  { subject: 'AI & 신기술', A: 2.8, B: 3.5, fullMark: 5 },
];

// ⚠️ SRE Team Roles for Demo
const workloadData = [
  { name: 'SRE (DevOps)', Done: 45, InProgress: 25, Todo: 10 },
  { name: 'Network Eng', Done: 50, InProgress: 20, Todo: 15 },
  { name: 'Media SRE', Done: 40, InProgress: 15, Todo: 25 },
  { name: 'SecOps', Done: 35, InProgress: 30, Todo: 5 },
  { name: 'AI Ops', Done: 30, InProgress: 10, Todo: 20 },
];

// Updated to 2025 Context
const retentionData = [
  { month: '6월', rate: 98 },
  { month: '7월', rate: 97 },
  { month: '8월', rate: 98 },
  { month: '9월', rate: 95 },
  { month: '10월', rate: 96 },
  { month: '11월', rate: 96 },
];

// ⚠️ New Data: Quarterly KPI Achievement Trend
const kpiQuarterlyData = [
  { name: '1분기', target: 100, achievement: 92, label: '92%' },
  { name: '2분기', target: 100, achievement: 95, label: '95%' },
  { name: '3분기', target: 100, achievement: 88, label: '88%' },
  { name: '4분기(E)', target: 100, achievement: 97, label: '97%' },
];

// ⚠️ New Data: Key Results (KR) Progress
const keyResultsData = [
  { id: 1, title: '시스템 가용성(Uptime) 99.99% 달성', status: 'OnTrack', progress: 99.9, target: 100, unit: '%' },
  { id: 2, title: 'CDN 비용 15% 절감 (인프라 최적화)', status: 'AtRisk', progress: 8, target: 15, unit: '%' },
  { id: 3, title: '글로벌 Latency 20ms 미만 유지', status: 'OnTrack', progress: 18, target: 20, unit: 'ms', inverse: true }, // 낮은게 좋은 것
  { id: 4, title: '장애 평균 복구 시간(MTTR) 10분 단축', status: 'Done', progress: 12, target: 10, unit: '분' },
];

interface KPIDashboardProps {
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
    if (trimmed.startsWith('- ')) {
      return (
        <div key={index} className="flex items-start mb-1.5 pl-3">
           <span className="mr-2 text-indigo-400 mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0"></span>
           <span className="text-slate-700 text-sm leading-relaxed">{parseBold(trimmed.replace('- ', ''))}</span>
        </div>
      );
    }

    if (trimmed === '') {
      return <div key={index} className="h-2"></div>;
    }

    return <p key={index} className="text-slate-700 mb-1 leading-relaxed text-sm">{parseBold(line)}</p>;
  });
};

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ members }) => {
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(false); // Default collapsed

  // Auto-run Analysis on Mount
  useEffect(() => {
    if (!aiAnalysis && !isAnalyzing) {
        handleAnalyzeKPI();
    }
  }, []);

  const handleAnalyzeKPI = async () => {
    setIsAnalyzing(true);
    try {
        const result = await analyzeKPIPerformance(kpiQuarterlyData, keyResultsData, workloadData);
        setAiAnalysis(result);
    } catch (e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">팀 업무 속도 (Velocity)</p>
             <Activity className="w-5 h-5 text-indigo-500" />
           </div>
           <div>
             <h4 className="text-2xl font-bold text-slate-800">124 <span className="text-sm font-normal text-slate-400">pts</span></h4>
             <span className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" /> 전월 대비 +12% 
             </span>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">품질 결함률</p>
             <AlertTriangle className="w-5 h-5 text-rose-500" />
           </div>
           <div>
             <h4 className="text-2xl font-bold text-slate-800">2.4%</h4>
             <span className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1 rotate-180" /> 0.5% 개선됨
             </span>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">팀 몰입도</p>
             <Users className="w-5 h-5 text-amber-500" />
           </div>
           <div>
             <h4 className="text-2xl font-bold text-slate-800">4.2 <span className="text-sm font-normal text-slate-400">/ 5.0</span></h4>
             <span className="text-xs text-slate-400 font-medium flex items-center mt-1">
                안정적인 수준 유지
             </span>
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-32">
           <div className="flex justify-between items-start">
             <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">분기 목표 달성률</p>
             <Target className="w-5 h-5 text-emerald-500" />
           </div>
           <div>
             <h4 className="text-2xl font-bold text-slate-800">85%</h4>
             <span className="text-xs text-emerald-500 font-medium flex items-center mt-1">
                목표 순항 중
             </span>
           </div>
        </div>
      </div>

      {/* AI Strategic Analyst Section */}
      <div className="bg-white rounded-xl border border-indigo-100 shadow-md overflow-hidden transition-all duration-300">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-5 border-b border-indigo-100 flex justify-between items-center">
            <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg shadow-sm mr-3">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-indigo-900 text-lg flex items-center">
                        AI 성과 전략가 (Strategic Analyst)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">현재 KPI 데이터를 심층 분석하여 목표 달성을 위한 전략을 제안합니다.</p>
                </div>
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
        
        {/* Content Area */}
        <div className="relative">
             <div className={`p-8 bg-slate-50/50 transition-all duration-500 ease-in-out overflow-hidden ${isAiExpanded ? 'max-h-none' : 'max-h-48'}`}>
                {aiAnalysis ? (
                    <div className="prose prose-sm prose-indigo max-w-none">
                        {renderMarkdown(aiAnalysis)}
                    </div>
                ) : (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                )}
            </div>
            
            {/* Gradient Mask & Toggle */}
            {!isAiExpanded && aiAnalysis && (
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
            )}
            
            {aiAnalysis && (
                <button 
                    onClick={() => setIsAiExpanded(!isAiExpanded)}
                    className="w-full py-3 bg-white border-t border-indigo-100 text-xs font-bold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex items-center justify-center z-10 relative"
                >
                    {isAiExpanded ? (
                        <>전체 전략 접기 <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                        <>전체 전략 펼쳐보기 <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                </button>
            )}
        </div>
      </div>

      {/* ⚠️ NEW SECTION: 2025 KPI Trends & Key Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quarterly Achievement Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                        <Flag className="w-5 h-5 mr-2 text-indigo-600" />
                        2025년 팀 KPI 달성 추이
                    </h3>
                    <p className="text-sm text-slate-500">분기별 목표(100%) 대비 달성 성과 분석</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                    <div className="flex items-center"><span className="w-3 h-3 bg-indigo-500 rounded mr-1"></span>달성률</div>
                    <div className="flex items-center"><span className="w-3 h-3 bg-slate-300 rounded-full mr-1"></span>목표(100%)</div>
                </div>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={kpiQuarterlyData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis hide domain={[0, 120]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="achievement" name="달성률" barSize={40} fill="#6366f1" radius={[4, 4, 0, 0]} >
                            {/* <LabelList dataKey="label" position="top" fill="#64748b" fontSize={12} /> */}
                        </Bar>
                        <Line type="monotone" dataKey="target" name="목표" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#fff', stroke: '#cbd5e1', strokeWidth: 2}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right: Key Results List */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                핵심 목표(KR) 현황
            </h3>
            <p className="text-sm text-slate-500 mb-6">2025 주요 과제 진행률</p>
            
            <div className="flex-1 space-y-6">
                {keyResultsData.map((kr) => {
                    const percent = kr.inverse 
                        ? Math.min(100, (kr.target / kr.progress) * 100) // 역방향: 낮을수록 좋음 (예: Latency)
                        : Math.min(100, (kr.progress / kr.target) * 100); // 정방향: 높을수록 좋음
                    
                    const color = kr.status === 'Done' || kr.status === 'OnTrack' ? 'bg-emerald-500' 
                        : kr.status === 'AtRisk' ? 'bg-rose-500' : 'bg-amber-500';
                    
                    const textColor = kr.status === 'Done' || kr.status === 'OnTrack' ? 'text-emerald-600' 
                        : kr.status === 'AtRisk' ? 'text-rose-600' : 'text-amber-600';

                    return (
                        <div key={kr.id}>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">{kr.title}</span>
                                <span className={`text-xs font-bold ${textColor}`}>
                                    {kr.progress} / {kr.target}{kr.unit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${color} transition-all duration-1000`} 
                                    style={{ width: `${percent}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-slate-400">{kr.status === 'OnTrack' ? '순항 중' : kr.status === 'AtRisk' ? '위험' : '완료'}</span>
                                <span className="text-[10px] text-slate-400">{Math.round(percent)}% 달성</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <button className="w-full mt-4 text-xs text-slate-500 hover:text-indigo-600 flex items-center justify-center py-2 border-t border-slate-50">
                전체 목표 보기 <ArrowRight className="w-3 h-3 ml-1" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Team Skill Balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center">
            <Target className="w-5 h-5 text-indigo-500 mr-2" />
            SRE팀 핵심 역량 밸런스
          </h3>
          <p className="text-sm text-slate-500 mb-6">팀 평균 역량(A) vs 목표 기준(B)</p>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar
                  name="팀 평균"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <Radar
                  name="목표 기준"
                  dataKey="B"
                  stroke="#cbd5e1"
                  fill="#cbd5e1"
                  fillOpacity={0.2}
                />
                <Legend />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Velocity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-lg text-slate-800 mb-1 flex items-center">
            <Activity className="w-5 h-5 text-indigo-500 mr-2" />
            직무별 업무 리소스 현황
          </h3>
          <p className="text-sm text-slate-500 mb-6">각 직무별 업무 처리량 및 잔여 업무</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workloadData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar name="완료" dataKey="Done" stackId="a" fill="#10b981" barSize={20} radius={[0,0,0,0]} />
                <Bar name="진행 중" dataKey="InProgress" stackId="a" fill="#3b82f6" barSize={20} radius={[0,0,0,0]} />
                <Bar name="대기" dataKey="Todo" stackId="a" fill="#cbd5e1" barSize={20} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Retention Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="font-bold text-lg text-slate-800">핵심 인재 유지율 추이 (2025)</h3>
                <p className="text-sm text-slate-500">월별 활성 팀원 유지 비율 (Retention Rate)</p>
             </div>
             <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                매우 양호
             </span>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[90, 100]} hide />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                <Line name="유지율" type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
