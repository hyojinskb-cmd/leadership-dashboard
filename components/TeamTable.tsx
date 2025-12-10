
import React from 'react';
import { TeamMember, MemberStatus } from '../types';
import { MoreVertical, AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

interface TeamTableProps {
  members: TeamMember[];
  onMemberSelect: (member: TeamMember) => void;
}

const statusColors = {
  [MemberStatus.Active]: 'bg-emerald-100 text-emerald-700',
  [MemberStatus.Warning]: 'bg-amber-100 text-amber-700',
  [MemberStatus.Critical]: 'bg-rose-100 text-rose-700',
  [MemberStatus.OnLeave]: 'bg-slate-100 text-slate-600',
};

const statusIcons = {
  [MemberStatus.Active]: <CheckCircle2 className="w-3 h-3 mr-1" />,
  [MemberStatus.Warning]: <AlertCircle className="w-3 h-3 mr-1" />,
  [MemberStatus.Critical]: <AlertCircle className="w-3 h-3 mr-1" />,
  [MemberStatus.OnLeave]: <Clock className="w-3 h-3 mr-1" />,
};

export const TeamTable: React.FC<TeamTableProps> = ({ members, onMemberSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
      {/* Header (Fixed) */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center flex-shrink-0 bg-white">
        <h3 className="font-bold text-slate-800 text-lg">팀원 현황 ({members.length}명)</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
          전체 보기
        </button>
      </div>
      
      {/* Scrollable Body */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">이름 / 직무</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">상태</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">성과 점수</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">행복 지수</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">최근 피드백</th>
              {/* ⚠️ 'text-right' -> 'text-center' */}
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">상세</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      className="w-8 h-8 rounded-full object-cover mr-3" 
                      src={member.avatar} 
                      alt={member.name} 
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-800">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role} ({member.jobLevel})</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[member.status]} flex items-center`}>
                    {statusIcons[member.status]}
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center w-24">
                    <div className="w-full h-2 mr-2 bg-slate-100 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${member.performanceScore >= 80 ? 'bg-emerald-500' : member.performanceScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                        style={{ width: `${member.performanceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600">{member.performanceScore}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-sm font-bold ${member.happinessScore >= 80 ? 'text-emerald-600' : member.happinessScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {member.happinessScore}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">/ 100</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                  {member.lastFeedbackDate}
                </td>
                {/* ⚠️ 'text-right' -> 'text-center', removed 'ml-auto', added 'justify-center' */}
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <button 
                    onClick={() => onMemberSelect(member)}
                    className="text-indigo-600 hover:text-indigo-800 p-1 rounded-md hover:bg-indigo-50 transition-colors flex items-center justify-center font-medium text-sm mx-auto"
                  >
                    상세 분석 <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
