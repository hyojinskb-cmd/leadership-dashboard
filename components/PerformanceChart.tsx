
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Updated to Late 2025 Context
const data = [
  { name: '6월', productivity: 65, morale: 70 },
  { name: '7월', productivity: 72, morale: 68 },
  { name: '8월', productivity: 78, morale: 75 },
  { name: '9월', productivity: 85, morale: 82 },
  { name: '10월', productivity: 82, morale: 78 },
  { name: '11월', productivity: 88, morale: 85 },
];

export const PerformanceChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">팀 생산성 및 사기 추이 (2025 하반기)</h3>
          <p className="text-sm text-slate-500">최근 6개월 데이터</p>
        </div>
        <div className="flex space-x-4 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
            <span className="text-slate-600">생산성</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400 mr-2"></span>
            <span className="text-slate-600">팀 사기</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMorale" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
            />
            <Area 
              type="monotone" 
              dataKey="productivity" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProd)" 
            />
            <Area 
              type="monotone" 
              dataKey="morale" 
              stroke="#34d399" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMorale)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
