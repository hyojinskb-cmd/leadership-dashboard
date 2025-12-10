
import React, { useState, useMemo } from 'react';
import { CalendarEvent, OneOnOneSession, TeamMember } from '../types';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, AlignLeft, CheckCircle2, Megaphone, User, MapPin, UserCheck, Rocket } from 'lucide-react';

interface UnifiedCalendarProps {
  members: TeamMember[];
  notices?: { id: string; title: string; date: string; type: string }[];
  onUpdateMember: (member: TeamMember) => void;
  onNavigateToCoaching: (memberId: string) => void;
}

export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({ members, notices = [], onUpdateMember, onNavigateToCoaching }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState<CalendarEvent | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    '1on1': true,
    'Task': true,
    'Notice': true,
    'Personal': true,
  });

  // Add Event Form State
  const [eventTypeTab, setEventTypeTab] = useState<'Personal' | '1on1'>('Personal');
  
  // Personal Event Inputs
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

  // 1on1 Event Inputs
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [oneOnOneTime, setOneOnOneTime] = useState('');
  const [oneOnOnePlace, setOneOnOnePlace] = useState('');
  
  // Custom Events State (Personal)
  const [personalEvents, setPersonalEvents] = useState<CalendarEvent[]>([
    { id: 'p1', date: '2025-11-22', title: '팀 점심 회식', type: 'Personal', time: '12:00', description: '맛집 탐방' }
  ]);

  // 1. Aggregate All Events
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // 1on1s
    members.forEach(m => {
      m.oneOnOneHistory.forEach(s => {
        events.push({
          id: s.id,
          date: s.date,
          title: `1on1: ${m.name}`,
          type: '1on1',
          time: s.time,
          description: s.title, // Use title as description/location info
          memberId: m.id
        });
      });
    });

    // Tasks
    members.forEach(m => {
      m.tasks.forEach(t => {
        if (t.status !== 'Done') {
            events.push({
                id: t.id,
                date: t.dueDate,
                title: `마감: ${t.title}`,
                type: 'Task',
                description: `${m.name} 담당`,
                memberId: m.id
            });
        }
      });
    });

    // Notices
    notices.forEach(n => {
        events.push({
            id: n.id,
            date: n.date,
            title: `공지: ${n.title}`,
            type: 'Notice',
            description: n.type === 'Urgent' ? '긴급 공지' : '일반 공지'
        });
    });

    // Personal
    events.push(...personalEvents);

    return events;
  }, [members, notices, personalEvents]);

  // Filter Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => filters[e.type as keyof typeof filters]);
  }, [allEvents, filters]);

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setEventTypeTab('Personal'); // Reset tab
    setShowAddModal(true);
  };

  const handleAddEvent = () => {
    if (!selectedDate) return;

    if (eventTypeTab === 'Personal') {
        if (!newEventTitle.trim()) { alert('제목을 입력하세요.'); return; }
        const newEvent: CalendarEvent = {
            id: Date.now().toString(),
            date: selectedDate,
            title: newEventTitle,
            time: newEventTime,
            description: newEventDesc,
            type: 'Personal'
        };
        setPersonalEvents([...personalEvents, newEvent]);
        // Reset Inputs
        setNewEventTitle(''); setNewEventTime(''); setNewEventDesc('');

    } else if (eventTypeTab === '1on1') {
        const targetMember = members.find(m => m.id === selectedMemberId);
        if (!targetMember) return;
        
        const newSession: OneOnOneSession = {
            id: Date.now().toString(),
            date: selectedDate,
            time: oneOnOneTime || '10:00',
            title: oneOnOnePlace ? `[${oneOnOnePlace}] 1on1 미팅` : '1on1 정기 미팅',
            summary: '',
            strengthsMemo: '',
            developmentTasks: '',
            nextStepCheckpoint: '',
            isCompleted: false
        };
        
        // Update Member Data
        const updatedHistory = [...targetMember.oneOnOneHistory, newSession];
        onUpdateMember({ ...targetMember, oneOnOneHistory: updatedHistory });
        
        // Reset Inputs
        setOneOnOneTime(''); setOneOnOnePlace('');
    }

    setShowAddModal(false);
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
      switch(type) {
          case '1on1': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
          case 'Task': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Notice': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'Personal': return 'bg-slate-100 text-slate-700 border-slate-200';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
                통합 캘린더 (Schedule)
            </h2>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 font-bold text-slate-700 text-lg whitespace-nowrap w-40 text-center">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded-md transition-colors text-slate-500">
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
            {Object.keys(filters).map(key => (
                <button
                    key={key}
                    onClick={() => setFilters(prev => ({ ...prev, [key]: !prev[key as keyof typeof filters] }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center ${
                        filters[key as keyof typeof filters] 
                            ? getEventTypeColor(key)
                            : 'bg-white text-slate-400 border-slate-200'
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full mr-2 ${filters[key as keyof typeof filters] ? 'bg-current' : 'bg-slate-300'}`}></span>
                    {key}
                </button>
            ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 flex-shrink-0">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div key={day} className={`py-3 text-center text-sm font-bold ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : 'text-slate-600'}`}>
                    {day}
                </div>
            ))}
        </div>

        {/* Days Body */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-slate-100 gap-px border-b border-slate-200 overflow-y-auto">
            {days.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} className="bg-white min-h-[100px]"></div>;
                
                const dayEvents = getEventsForDay(day);
                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                return (
                    <div 
                        key={day} 
                        className={`bg-white p-2 min-h-[100px] hover:bg-slate-50 transition-colors cursor-pointer flex flex-col group relative`}
                        onClick={() => handleDateClick(day)}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}`}>
                                {day}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 rounded-full text-indigo-600 transition-opacity">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        
                        <div className="space-y-1">
                            {dayEvents.map(ev => (
                                <div 
                                    key={ev.id} 
                                    onClick={(e) => { e.stopPropagation(); setShowEventModal(ev); }}
                                    className={`px-2 py-1 rounded text-[10px] font-medium border truncate cursor-pointer hover:brightness-95 ${getEventTypeColor(ev.type)}`}
                                >
                                    {ev.time && <span className="mr-1 opacity-75">{ev.time}</span>}
                                    {ev.title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">일정 추가 ({selectedDate})</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Tab Switcher */}
                <div className="flex border-b border-slate-100">
                    <button 
                        onClick={() => setEventTypeTab('Personal')} 
                        className={`flex-1 py-3 text-sm font-bold ${eventTypeTab === 'Personal' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                    >
                        개인 일정
                    </button>
                    <button 
                        onClick={() => setEventTypeTab('1on1')} 
                        className={`flex-1 py-3 text-sm font-bold ${eventTypeTab === '1on1' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
                    >
                        1on1 미팅
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {eventTypeTab === 'Personal' ? (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">일정 제목</label>
                                <input type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" placeholder="예: 팀 점심 회식" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">시간 (선택)</label>
                                <input type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">메모</label>
                                <textarea value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm h-24 resize-none" placeholder="상세 내용을 입력하세요" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">대상 팀원</label>
                                <select 
                                    value={selectedMemberId} 
                                    onChange={e => setSelectedMemberId(e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded text-sm bg-white"
                                >
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">미팅 시간</label>
                                <input type="time" value={oneOnOneTime} onChange={e => setOneOnOneTime(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">장소 / 주제</label>
                                <input type="text" value={oneOnOnePlace} onChange={e => setOneOnOnePlace(e.target.value)} className="w-full p-2 border border-slate-200 rounded text-sm" placeholder="예: 회의실 A, 커리어 면담" />
                            </div>
                            <div className="text-xs text-indigo-500 bg-indigo-50 p-2 rounded">
                                * 저장 시 해당 팀원의 1on1 히스토리에 자동 추가됩니다.
                            </div>
                        </>
                    )}
                    
                    <button onClick={handleAddEvent} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700">저장하기</button>
                </div>
            </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border-t-4 border-indigo-500">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getEventTypeColor(showEventModal.type)}`}>
                            {showEventModal.type}
                        </span>
                        <button onClick={() => setShowEventModal(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{showEventModal.title}</h3>
                    
                    <div className="space-y-2 text-sm text-slate-600 mb-6">
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 opacity-50" /> {showEventModal.date}</div>
                        {showEventModal.time && <div className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-50" /> {showEventModal.time}</div>}
                        {showEventModal.description && <div className="flex items-start mt-2 p-3 bg-slate-50 rounded-lg text-slate-700"><AlignLeft className="w-4 h-4 mr-2 opacity-50 mt-0.5 flex-shrink-0" /> {showEventModal.description}</div>}
                    </div>
                    
                    {/* Deep Link Button for 1on1 */}
                    {showEventModal.type === '1on1' && showEventModal.memberId && (
                        <button 
                            onClick={() => {
                                if (showEventModal.memberId) {
                                    onNavigateToCoaching(showEventModal.memberId);
                                    setShowEventModal(null); // Close modal
                                }
                            }}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center justify-center mb-2 shadow-sm transition-all animate-pulse-slight"
                        >
                            <Rocket className="w-4 h-4 mr-2" />
                            코칭/질문 준비하러 가기
                        </button>
                    )}

                    <button onClick={() => setShowEventModal(null)} className="w-full border border-slate-200 text-slate-600 py-2 rounded-lg font-bold text-sm hover:bg-slate-50">닫기</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
