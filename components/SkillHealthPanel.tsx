import React, { useMemo } from 'react';
import { TeamMember } from '../types';
import { Target, AlertTriangle, Activity, ShieldCheck, HelpCircle } from 'lucide-react';

interface SkillHealthPanelProps {
  members: TeamMember[];
}

export const SkillHealthPanel: React.FC<SkillHealthPanelProps> = ({ members }) => {
  // 통계 계산 로직
  const stats = useMemo(() => {
    let totalAssessments = 0;
    let passedAssessments = 0; // 3점 이상
    let totalLeaderScore = 0;
    let totalGap = 0; // |Leader - Self|

    members.forEach(m => {
      m.skillAssessments.forEach(s => {
        totalAssessments++;
        if (s.leaderReview >= 3) passedAssessments++;
        totalLeaderScore += s.leaderReview;
        totalGap += Math.abs(s.leaderReview - s.selfReview);
      });
    });

    const avgLeaderScore = totalAssessments > 0 ? totalLeaderScore / totalAssessments : 0;
    const avgGap = totalAssessments > 0 ? totalGap / totalAssessments : 0;
    const coverage = totalAssessments > 0 ? (passedAssessments / totalAssessments) * 100 : 0;

    // Risk Score 계산 (100점 만점 기준)
    // 기본 점수 100
    // - Gap 감점: Gap 1점당 20점 감점 (Gap이 클수록 리스크 큼)
    // - Skill 감점: 평균 5점 만점에서 부족한 만큼 감점 (5 - avg) * 10
    const riskScoreRaw = 100 - (avgGap * 20) - ((5 - avgLeaderScore) * 10);
    const riskScore = Math.max(0, Math.min(100, Math.round(riskScoreRaw)));

    return {
      coverage: Math.round(coverage),
      riskScore,
      avgGap: avgGap.toFixed(2)
    };
  }, [members]);

  // Risk Score에 따른 색상 및 상태 결정
  const getRiskStatus = (score: number) => {
    if (score >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-100', bar: 'bg-emerald-500', label: 'Stable' };
    if (score >= 60) return { color: 'text-amber-600', bg: 'bg-amber-100', bar: 'bg-amber-500', label: 'Warning' };
    return { color: 'text-rose-600', bg: 'bg-rose-100', bar: 'bg-rose-500', label: 'Critical' };
  };

  const riskStatus = getRiskStatus(stats.riskScore);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      
      {/* 1. Skill Coverage */}
      <div className="border-r border-slate-100 pr-4 last:border-r-0">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <ShieldCheck className="w-4 h-4 mr-2 text-indigo-500" />
            스킬 커버리지 (3.0+)
          </div>
          <span className="text-xl font-bold text-slate-800">{stats.coverage}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${stats.coverage}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">팀원 역량이 '보통' 이상인 비율</p>
      </div>

      {/* 2. Risk Score */}
      <div className="border-r border-slate-100 pr-4 px-0 md:px-4 last:border-r-0">
         <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
            팀 리스크 스코어
          </div>
          <span className={`px-2 py-1 rounded text-xs font-bold ${riskStatus.bg} ${riskStatus.color}`}>
            {riskStatus.label}
          </span>
        </div>
        <div className="flex items-center justify-between">
           <span className={`text-2xl font-black ${riskStatus.color}`}>{stats.riskScore}</span>
           <div className="flex space-x-1 h-3">
              {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-6 rounded-sm ${i < (stats.riskScore / 20) ? riskStatus.bar : 'bg-slate-100'}`}
                ></div>
              ))}
           </div>
        </div>
        <p className="text-xs text-slate-400 mt-2">낮은 역량 및 인식 차이 기반 산출</p>
      </div>

      {/* 3. Leader-Self Gap */}
      <div className="pl-0 md:pl-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <Activity className="w-4 h-4 mr-2 text-rose-500" />
            평가 인식 차이 (Gap)
          </div>
          <div className="group relative">
            <HelpCircle className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-500" />
             <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                리더 평가와 본인 평가의 점수 차이 평균입니다. 0에 가까울수록 객관화가 잘 되어 있습니다.
             </div>
          </div>
        </div>
        <div className="flex items-baseline">
            <span className="text-2xl font-bold text-slate-800">{stats.avgGap}</span>
            <span className="text-sm text-slate-400 ml-2">점</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-1.5 rounded inline-block">
            {parseFloat(stats.avgGap) > 1.0 ? '⚠️ 코칭을 통한 눈높이 조정 필요' : '✅ 양호한 인식 수준'}
        </div>
      </div>

    </div>
  );
};