import React, { useState } from 'react';
import { RetrospectiveSession, RetrospectiveType } from '../types';
import { Plus, ThumbsUp, Trash2, MessageSquare, Save, RefreshCw, Target, AlertTriangle } from 'lucide-react';

// Mock Initial Data
const initialSession: RetrospectiveSession = {
  id: 'retro-1',
  title: '11월 월간 회고 (SRE Team)',
  date: '2025-11-22',
  status: 'InProgress',
  items: [
    { id: '1', type: 'Keep', content: '장애 발생 시 Failover 스크립트가 완벽하게 작동함', votes: 5, author: '김철수' },
    { id: '2', type: 'Problem', content: 'CDN 비용이 예상보다 15% 초과됨', votes: 3, author: '이영희' },
    { id: '3', type: 'Try', content: 'AWS Savings Plan 적극 활용 검토', votes: 4, author: '박민준' },
  ]
};

export const TeamRetrospective: React.FC = () => {
  const [session, setSession] = useState<RetrospectiveSession>(initialSession);
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemType, setNewItemType] = useState<RetrospectiveType>('Keep');

  const handleAddItem = () => {
    if (!newItemContent.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      type: newItemType,
      content: newItemContent,
      votes: 0,
      author: '나' // Mock User
    };
    setSession(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setNewItemContent('');
  };

  const handleVote = (id: string) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item)
    }));
  };

  const handleDelete = (id: string) => {
    setSession(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const columns: { type: RetrospectiveType; color: string; icon: React.ReactNode; label: string }[] = [
    { type: 'Keep', color: 'bg-emerald-50 border-emerald-100', icon: <Target className="w-4 h-4 text-emerald-600" />, label: 'Keep (유지할 점)' },
    { type: 'Problem', color: 'bg-rose-50 border-rose-100', icon: <AlertTriangle className="w-4 h-4 text-rose-600" />, label: 'Problem (문제점)' },
    { type: 'Try', color: 'bg-indigo-50 border-indigo-100', icon: <RefreshCw className="w-4 h-4 text-indigo-600" />, label: 'Try (시도할 점)' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col pb-10">
      <header className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3 text-indigo-600" />
            팀 회고 (Retrospective)
          </h2>
          <p className="text-slate-500 mt-1 text-sm">KPT(Keep, Problem, Try) 방식으로 우리 팀의 성장 포인트를 찾아보세요.</p>
        </div>
        <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-full">{session.date}</span>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center shadow-sm">
                <Save className="w-4 h-4 mr-2" /> 회고 저장
            </button>
        </div>
      </header>

      {/* Input Area */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex-shrink-0">
        <div className="flex gap-4">
            <select 
                value={newItemType} 
                onChange={(e) => setNewItemType(e.target.value as RetrospectiveType)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            >
                <option value="Keep">🟢 Keep</option>
                <option value="Problem">🔴 Problem</option>
                <option value="Try">🔵 Try</option>
            </select>
            <input 
                type="text" 
                value={newItemContent}
                onChange={(e) => setNewItemContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="의견을 입력하세요..."
                className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <button 
                onClick={handleAddItem}
                disabled={!newItemContent.trim()}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 disabled:opacity-50"
            >
                <Plus className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* KPT Boards */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {columns.map(col => (
                <div key={col.type} className={`rounded-xl border ${col.color} flex flex-col h-full`}>
                    <div className="p-4 border-b border-inherit flex items-center justify-between bg-white/50 rounded-t-xl">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            {col.icon} <span className="ml-2">{col.label}</span>
                        </h3>
                        <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-full text-slate-500 border border-slate-100">
                            {session.items.filter(i => i.type === col.type).length}
                        </span>
                    </div>
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                        {session.items.filter(i => i.type === col.type).map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                <p className="text-slate-700 text-sm leading-relaxed mb-3">{item.content}</p>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                    <span className="text-xs text-slate-400 font-medium">{item.author}</span>
                                    <div className="flex items-center space-x-2">
                                        <button 
                                            onClick={() => handleVote(item.id)}
                                            className="flex items-center text-xs font-bold text-indigo-500 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                                        >
                                            <ThumbsUp className="w-3 h-3 mr-1" /> {item.votes}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};