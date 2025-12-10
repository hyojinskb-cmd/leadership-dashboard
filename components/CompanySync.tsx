
import React, { useState } from 'react';
import { Bell, FileText, Download, Search, AlertTriangle, Megaphone, FolderOpen, Calendar, Paperclip } from 'lucide-react';

interface Notice {
  id: string;
  type: 'Urgent' | 'Company' | 'Org' | 'Doc';
  title: string;
  date: string;
  author: string;
  isRead: boolean;
  hasAttachment: boolean;
}

// Mock Data
const initialNotices: Notice[] = [
  { id: '1', type: 'Urgent', title: '[긴급] 전사 보안 가이드라인 업데이트 및 필수 교육 이수 안내', date: '2025-11-22', author: '보안팀', isRead: false, hasAttachment: true },
  { id: '2', type: 'Company', title: '2025년도 연말 인사 평가 일정 및 프로세스 안내', date: '2025-11-20', author: 'HR실', isRead: false, hasAttachment: true },
  { id: '3', type: 'Org', title: '플랫폼 본부 Q4 타운홀 미팅 자료 공유', date: '2025-11-18', author: '플랫폼기획팀', isRead: true, hasAttachment: true },
  { id: '4', type: 'Doc', title: '신규 입사자 온보딩 가이드 (SRE팀 Ver 2.0)', date: '2025-10-15', author: '김철수', isRead: true, hasAttachment: true },
  { id: '5', type: 'Company', title: '동계 아시안게임 대비 비상 근무 체제 운영 계획', date: '2025-11-10', author: '경영지원팀', isRead: true, hasAttachment: false },
];

export const CompanySync: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Company' | 'Org' | 'Doc'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotices = initialNotices.filter(notice => {
    const matchesFilter = filter === 'All' || notice.type === filter;
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Company': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Org': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Doc': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Urgent': return <AlertTriangle className="w-4 h-4" />;
      case 'Company': return <Megaphone className="w-4 h-4" />;
      case 'Org': return <FolderOpen className="w-4 h-4" />;
      case 'Doc': return <FileText className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Megaphone className="w-7 h-7 mr-3 text-indigo-600" />
            전사/조직 소식 (Company Sync)
          </h2>
          <p className="text-slate-500 mt-2">
            전사 중요 공지, 긴급 알림, 그리고 조직 내부 문서를 한곳에서 확인하세요.
          </p>
        </div>
        <div className="hidden md:block">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="제목 검색..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar Filter */}
        <div className="w-full lg:w-64 space-y-2">
            {[
                { id: 'All', label: '전체 보기', icon: <Bell className="w-4 h-4" /> },
                { id: 'Urgent', label: '긴급 / 중요', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
                { id: 'Company', label: '전사 공지', icon: <Megaphone className="w-4 h-4 text-indigo-500" /> },
                { id: 'Org', label: '조직 / 본부', icon: <FolderOpen className="w-4 h-4 text-emerald-500" /> },
                { id: 'Doc', label: '문서 / 서식', icon: <FileText className="w-4 h-4 text-slate-500" /> },
            ].map((item) => (
                <button
                    key={item.id}
                    onClick={() => setFilter(item.id as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-colors ${
                        filter === item.id 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-white text-slate-600 border border-transparent hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-center">
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                    </div>
                    {item.id === 'Urgent' && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>}
                </button>
            ))}
            
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-900 text-sm mb-2">📅 주요 일정</h4>
                <ul className="space-y-2 text-xs text-indigo-800">
                    <li className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> 11/25 급여일</li>
                    <li className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> 11/28 Q4 타운홀</li>
                </ul>
            </div>
        </div>

        {/* Main List */}
        <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">분류</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">작성자</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">날짜</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider w-24">첨부</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {filteredNotices.map((notice) => (
                            <tr key={notice.id} className={`hover:bg-slate-50 transition-colors cursor-pointer ${!notice.isRead ? 'bg-indigo-50/30' : ''}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getBadgeStyle(notice.type)} flex items-center w-fit`}>
                                        {getIcon(notice.type)}
                                        <span className="ml-1.5">
                                            {notice.type === 'Urgent' ? '긴급' : 
                                             notice.type === 'Company' ? '전사' :
                                             notice.type === 'Org' ? '조직' : '문서'}
                                        </span>
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <span className={`text-sm font-medium ${!notice.isRead ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                                            {notice.title}
                                        </span>
                                        {!notice.isRead && <span className="ml-2 w-2 h-2 bg-rose-500 rounded-full"></span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {notice.author}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {notice.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {notice.hasAttachment && (
                                        <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredNotices.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      </div>
    </div>
  );
};
