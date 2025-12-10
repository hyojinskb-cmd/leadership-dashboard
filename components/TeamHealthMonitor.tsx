
import React, { useMemo, useState } from 'react';
import { TeamMember } from '../types';
import { Activity, TrendingUp, Heart, Zap, AlertTriangle, Calculator, X, ShieldCheck, ChevronDown, ChevronUp, Info, User } from 'lucide-react';

interface TeamHealthMonitorProps {
  members: TeamMember[];
}

export const TeamHealthMonitor: React.FC<TeamHealthMonitorProps> = ({ members }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'Performance' | 'People' | 'Skill' | null>(null);

  const stats = useMemo(() => {
    if (members.length === 0) return null;

    // 1. Performance Score (35%)
    const avgPerformance = members.reduce((sum, m) => sum + m.performanceScore, 0) / members.length;

    // 2. People Score (35%)
    const avgHappiness = members.reduce((sum, m) => sum + m.happinessScore, 0) / members.length;

    // 3. Skill Score (30%)
    let totalAssessments = 0;
    let passedAssessments = 0;
    let totalLeaderScore = 0;
    let totalGap = 0;

    members.forEach(m => {
      m.skillAssessments.forEach(s => {
        totalAssessments++;
        if (s.leaderReview >= 3) passedAssessments++;
        totalLeaderScore += s.leaderReview;
        totalGap += Math.abs(s.leaderReview - s.selfReview);
      });
    });

    const avgLeaderScore = totalAssessments > 0 ? totalLeaderScore / totalAssessments : 0;
    const avgSkillNormalized = (avgLeaderScore / 5) * 100;
    
    const coverage = totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0;
    const avgGap = totalAssessments > 0 ? totalGap / totalAssessments : 0;
    const riskScoreRaw = 100 - (avgGap * 20) - ((5 - avgLeaderScore) * 10);
    const riskScore = Math.max(0, Math.min(100, Math.round(riskScoreRaw)));

    const healthIndex = Math.round(
      (avgPerformance * 0.35) + 
      (avgHappiness * 0.35) + 
      (avgSkillNormalized * 0.30)
    );

    const criticalCount = members.filter(m => m.status === 'Critical').length;
    const penalty = criticalCount * 2;
    const finalScore = Math.max(0, healthIndex - penalty);

    return {
      performance: Math.round(avgPerformance),
      people: Math.round(avgHappiness),
      skill: Math.round(avgSkillNormalized),
      total: finalScore,
      criticalCount,
      penalty,
      coverage: Math.round(coverage),
      riskScore,
      avgGap: avgGap.toFixed(2)
    };
  }, [members]);

  if (!stats) return <div>Loading...</div>;

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'text-indigo-600', bg: 'bg-indigo-100', text: '최상의 상태' };
    if (score >= 80) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100', text: '안정적 성장' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100', text: '양호함' };
    if (score >= 60) return { grade: 'C', color: 'text-amber-600', bg: 'bg-amber-100', text: '주의 필요' };
    return { grade: 'D', color: 'text-rose-600', bg: 'bg-rose-100', text: '위험 상태' };
  };

  const gradeInfo = getGrade(stats.total);

  const toggleSection = (section: 'Performance' | 'People' | 'Skill') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6 transition-all relative">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
        
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded-full hover:bg-slate-50"
          title="산출 근거 보기"
        >
           {showInfo ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </button>

        {/* Total Badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-full lg:w-auto lg:pr-8 lg:border-r border-slate-100">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
             <Activity className="w-4 h-4 mr-1 text-indigo-500" /> 팀 종합 건강지수 (THI)
          </div>
          <div className={`relative w-32 h-32 rounded-full border-8 ${gradeInfo.bg.replace('bg-', 'border-')} flex items-center justify-center`}>
             <div className="text-center">
                <span className={`text-4xl font-black ${gradeInfo.color}`}>{stats.total}</span>
                <span className="block text-xs text-slate-400 font-medium">/ 100</span>
             </div>
             <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full ${gradeInfo.color.replace('text-', 'bg-')} text-white flex items-center justify-center font-bold border-4 border-white shadow-sm`}>
                {gradeInfo.grade}
             </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${gradeInfo.bg} ${gradeInfo.color}`}>
            {gradeInfo.text}
          </div>
        </div>

        {/* Breakdown Stats (Clickable) */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Performance */}
          <div 
            className={`space-y-2 p-3 rounded-lg transition-all cursor-pointer relative group ${expandedSection === 'Performance' ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-blue-50/50'}`}
            onClick={() => toggleSection('Performance')}
          >
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 flex items-center">
                   <TrendingUp className="w-4 h-4 mr-2 text-blue-500" /> 성과 (35%)
                </span>
                <span className="text-lg font-bold text-slate-800 flex items-center">
                    {stats.performance}
                    {expandedSection === 'Performance' ? <ChevronUp className="w-4 h-4 ml-1 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />}
                </span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.performance}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 flex justify-between">
                <span>KPI 달성률 및 업무 완수도</span>
                <span className="text-blue-600 font-medium text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">상세보기</span>
             </p>
          </div>

          {/* 2. People */}
          <div 
            className={`space-y-2 p-3 rounded-lg transition-all cursor-pointer relative group ${expandedSection === 'People' ? 'bg-rose-50 ring-1 ring-rose-200' : 'hover:bg-rose-50/50'}`}
            onClick={() => toggleSection('People')}
          >
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 flex items-center">
                   <Heart className="w-4 h-4 mr-2 text-rose-500" /> 조직/사람 (35%)
                </span>
                <span className="text-lg font-bold text-slate-800 flex items-center">
                    {stats.people}
                    {expandedSection === 'People' ? <ChevronUp className="w-4 h-4 ml-1 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />}
                </span>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${stats.people < 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${stats.people}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 flex justify-between">
                <span>행복도 및 안전감</span>
                <span className="text-rose-600 font-medium text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">상세보기</span>
             </p>
          </div>

          {/* 3. Skill */}
          <div 
            className={`space-y-2 p-3 rounded-lg transition-all cursor-pointer relative group ${expandedSection === 'Skill' ? 'bg-amber-50 ring-1 ring-amber-200' : 'hover:bg-amber-50/50'}`}
            onClick={() => toggleSection('Skill')}
          >
             <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700 flex items-center">
                   <Zap className="w-4 h-4 mr-2 text-amber-500" /> 역량/잠재력 (30%)
                </span>
                <div className="flex items-center">
                    <span className="text-lg font-bold text-slate-800 mr-2">{stats.skill}</span>
                    {expandedSection === 'Skill' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
             </div>
             <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${stats.skill}%` }}></div>
             </div>
             <p className="text-xs text-slate-400 flex justify-between">
                <span>보유 스킬 레벨 및 성장</span>
                <span className="text-amber-600 font-medium text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">상세보기</span>
             </p>
          </div>
        </div>

        {/* Alert Section */}
        {stats.criticalCount > 0 && (
            <div className="lg:w-48 bg-rose-50 p-4 rounded-lg border border-rose-100 flex flex-col justify-center">
                <div className="flex items-center text-rose-700 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 mr-2" /> 리스크 감점
                </div>
                <p className="text-xs text-rose-600 leading-relaxed">
                    Critical 멤버 <span className="font-bold">{stats.criticalCount}명</span> 발생으로 인해 <span className="font-bold">-{stats.penalty}점</span> 페널티가 적용되었습니다.
                </p>
            </div>
        )}
      </div>

      {/* DRILL DOWN AREA with Scroll */}
      {expandedSection && (
        <div className="mt-4 pt-6 border-t border-slate-100 animate-fade-in bg-slate-50/50 p-4 rounded-xl mx-0 md:mx-6 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
            
            {/* 1. Performance Drill-down */}
            {expandedSection === 'Performance' && (
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center sticky top-0 bg-slate-50/0 pb-2">
                        <TrendingUp className="w-4 h-4 mr-2 text-blue-500" /> 팀원 성과 현황 (Performance Detail)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...members].sort((a,b) => a.performanceScore - b.performanceScore).map(m => (
                            <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${m.performanceScore < 70 ? 'bg-rose-500' : m.performanceScore < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                    <span className="text-sm font-medium text-slate-700">{m.name} <span className="text-xs text-slate-400">({m.role})</span></span>
                                </div>
                                <span className="text-sm font-bold text-slate-800">{m.performanceScore}점</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. People Drill-down */}
            {expandedSection === 'People' && (
                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center sticky top-0 bg-slate-50/0 pb-2">
                        <Heart className="w-4 h-4 mr-2 text-rose-500" /> 팀원 행복도 현황 (People Detail)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...members].sort((a,b) => a.happinessScore - b.happinessScore).map(m => (
                            <div key={m.id} className="bg-white p-3 rounded-lg border border-slate-100 flex items-center justify-between hover:shadow-sm transition-shadow">
                                <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${m.happinessScore < 50 ? 'bg-rose-500' : m.happinessScore < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                    <span className="text-sm font-medium text-slate-700">{m.name} <span className="text-xs text-slate-400">({m.role})</span></span>
                                </div>
                                <span className="text-sm font-bold text-slate-800">{m.happinessScore} / 100</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Skill Drill-down */}
            {expandedSection === 'Skill' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-r border-slate-200 pr-4 last:border-r-0">
                        <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center text-slate-600 text-xs font-bold">
                            <ShieldCheck className="w-3 h-3 mr-2 text-indigo-500" />
                            스킬 커버리지 (3.0+)
                        </div>
                        <span className="text-lg font-bold text-slate-800">{stats.coverage}%</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${stats.coverage}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">역량이 '보통' 이상인 비율</p>
                    </div>
                    <div className="border-r border-slate-200 pr-4 last:border-r-0">
                        <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-slate-600 text-xs font-bold">
                            <AlertTriangle className="w-3 h-3 mr-2 text-amber-500" />
                            팀 리스크 스코어
                        </div>
                        </div>
                        <span className="text-xl font-black text-amber-600">{stats.riskScore}</span>
                        <p className="text-[10px] text-slate-500 mt-2">낮은 역량 및 인식 차이 기반</p>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-slate-600 text-xs font-bold">
                            <Activity className="w-3 h-3 mr-2 text-rose-500" />
                            평가 인식 차이 (Gap)
                        </div>
                        </div>
                        <span className="text-xl font-bold text-slate-800">{stats.avgGap}점</span>
                        <div className="mt-2 text-[10px] text-slate-500 bg-white px-2 py-1 rounded inline-block border border-slate-100">
                            {parseFloat(stats.avgGap) > 1.0 ? '⚠️ 눈높이 조정 필요' : '✅ 양호'}
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div className="mt-6 p-5 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in-down">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-indigo-500" />
                팀 건강지수(THI) 산출 근거
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="space-y-2">
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                        <span>📈 성과 (Performance)</span>
                        <span className="font-bold">35% 반영</span>
                    </p>
                    <p className="text-slate-500 pl-2">KPI 달성률, 업무 완수율, 성과 평가 점수의 평균</p>
                </div>
                <div className="space-y-2">
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                        <span>❤️ 사람 (People)</span>
                        <span className="font-bold">35% 반영</span>
                    </p>
                    <p className="text-slate-500 pl-2">행복도, 심리적 안전감, 리텐션(유지율) 지표</p>
                </div>
                <div className="space-y-2">
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                        <span>⚡ 역량 (Skill/Potential)</span>
                        <span className="font-bold">30% 반영</span>
                    </p>
                    <p className="text-slate-500 pl-2">핵심 역량 보유 레벨 및 성장 잠재력(Gap) 평가</p>
                </div>
                <div className="space-y-2">
                    <p className="flex justify-between border-b border-slate-200 pb-1">
                        <span>⚠️ 리스크 페널티 (Risk)</span>
                        <span className="font-bold text-rose-500">감점 요인</span>
                    </p>
                    <p className="text-slate-500 pl-2">Critical(위험) 상태 멤버 1명당 종합 점수 -2점 차감</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
