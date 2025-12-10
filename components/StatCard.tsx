import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { DashboardStat } from '../types';

interface StatCardProps {
  stat: DashboardStat;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ stat, icon, colorClass }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />}
        {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-rose-500 mr-1" />}
        {stat.trend === 'neutral' && <Minus className="w-4 h-4 text-slate-400 mr-1" />}
        
        <span className={`font-medium ${
          stat.trend === 'up' ? 'text-emerald-500' : 
          stat.trend === 'down' ? 'text-rose-500' : 'text-slate-500'
        }`}>
          {Math.abs(stat.change)}%
        </span>
        <span className="text-slate-400 ml-1">지난 달 대비</span>
      </div>
    </div>
  );
};