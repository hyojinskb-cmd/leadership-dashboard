
import React, { useMemo } from 'react';
import { TeamMember } from '../types';
import { Calendar, CheckCircle2, Clock, AlertTriangle, Megaphone, ChevronRight } from 'lucide-react';

interface TodaysTimelineProps {
  members: TeamMember[];
}

export const TodaysTimeline: React.FC<TodaysTimelineProps> = ({ members }) => {
  // Mock Current Date for Demo (Usually new Date())
  const TODAY = '2025-11-22';

  const timelineItems = useMemo(() => {
    const items: { type: '1on1' | 'Task' | 'Notice'; time?: string; title: string; sub: string; id: string; urgent?: boolean }[] = [];

    // 1. 1on1s Today
    members.forEach(m => {
      m.oneOnOneHistory.forEach(s => {
        if (s.date === TODAY) {
          items.push({
            type: '1on1',
            time: s.time,
            title: `1on1: ${m.name}`,
            sub: s.title,
            id: s.id
          });
        }
      });
    });

    // 2. Tasks Due Today or Overdue
    members.forEach(m => {
      m.tasks.forEach(t => {
        if (t.status !== 'Done' && t.dueDate <= TODAY) {
          items.push({
            type: 'Task',
            title: `${t.title}`,
            sub: `${m.name} - ${t.dueDate === TODAY ? '오늘 마감' : '지연됨'}`,
            id: t.id,
            urgent: true
          });
        }
      });
    });

    // 3. Urgent Notices (Mock)
    items.push({
      type: 'Notice',
      title: '전사 보안 점검',
      sub: '오후 2시까지 완료 필수',
      id: 'notice-1',
      urgent: true
    });

    // Sort by Time (Tasks/Notices without time go last or first based on priority)
    return items.sort((a, b) => {
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.type === 'Notice') return -1; 
        return 0;
    });
  }, [members]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-indigo-600" />
          Today's Timeline
        </h3>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{TODAY}</span>
      </div>

      <div className="space-y-4 relative">
        {/* Vertical Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

        {timelineItems.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm pl-6">
                오늘 예정된 일정이 없습니다.
            </div>
        ) : (
            timelineItems.map((item, idx) => (
            <div key={idx} className="relative pl-8 flex items-start group cursor-pointer">
                <div className={`absolute left-0 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 flex items-center justify-center ${
                    item.type === '1on1' ? 'bg-indigo-500' :
                    item.type === 'Task' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                </div>
                
                <div className="flex-1 bg-slate-50 p-3 rounded-lg hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:border-indigo-100">
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            item.type === '1on1' ? 'bg-indigo-100 text-indigo-700' :
                            item.type === 'Task' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                            {item.type === '1on1' && item.time}
                            {item.type === 'Task' && '마감'}
                            {item.type === 'Notice' && '공지'}
                        </span>
                        {item.urgent && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mb-0.5">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
            </div>
            ))
        )}
      </div>
      
      <button className="w-full mt-4 text-xs text-slate-400 hover:text-indigo-600 flex items-center justify-center pt-2 border-t border-slate-50">
        전체 일정 보기 <ChevronRight className="w-3 h-3 ml-1" />
      </button>
    </div>
  );
};
