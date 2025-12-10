
import React, { useState } from 'react';
import { BookOpen, Video, FileText, Sparkles, Loader2, ExternalLink, Bookmark, Target, Users } from 'lucide-react';
import { LearningResource, TeamMember } from '../types';
import { recommendLearningResources, recommendPersonalizedContent } from '../services/geminiService';

// Initial static resources for demo
const initialResources: LearningResource[] = [
  {
    id: '1',
    title: '실리콘밸리의 팀장들 (Radical Candor)',
    type: 'Book',
    author: 'Kim Scott',
    description: '솔직하게 피드백하고, 개인적인 관심을 기울이며 성과를 내는 완전한 솔직함의 미학.',
    tags: ['피드백', '조직문화']
  },
  {
    id: '2',
    title: '팀의 성과를 높이는 심리적 안전감',
    type: 'Article',
    author: 'Google re:Work',
    description: '고성과 팀의 가장 중요한 특징인 심리적 안전감을 구축하는 5가지 단계.',
    tags: ['심리적안전감', '팀빌딩']
  },
  {
    id: '3',
    title: '원격 근무 시대의 리더십',
    type: 'Video',
    author: 'Simon Sinek',
    description: '비대면 환경에서도 신뢰를 구축하고 팀원들에게 영감을 주는 방법.',
    tags: ['리모트워크', '신뢰']
  }
];

interface LeadershipHubProps {
  members: TeamMember[];
}

export const LeadershipHub: React.FC<LeadershipHubProps> = ({ members }) => {
  const [resources, setResources] = useState<LearningResource[]>(initialResources);
  const [personalizedResources, setPersonalizedResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [topic, setTopic] = useState('');

  // 1. Keyword Search
  const handleGetRecommendations = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    
    try {
      const recommendations = await recommendLearningResources(topic);
      const newResources: LearningResource[] = recommendations.map((rec: any, index: number) => ({
        id: rec.id || `rec-${Date.now()}-${index}`,
        title: rec.title,
        type: (['Book', 'Video', 'Article', 'Course'].includes(rec.type) ? rec.type : 'Article') as any,
        author: rec.author,
        description: rec.description,
        tags: rec.tags || []
      }));
      setResources(newResources);
    } catch (e) {
      console.error("Failed to get recommendations", e);
      alert("추천 내용을 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Data-Driven Personal Recommendation
  const handleGetPersonalized = async () => {
    if (!members || members.length === 0) return;
    setAiLoading(true);
    
    try {
      const recommendations = await recommendPersonalizedContent(members);
      const newResources: LearningResource[] = recommendations.map((rec: any, index: number) => ({
        id: rec.id || `ai-rec-${Date.now()}-${index}`,
        title: rec.title,
        type: (['Book', 'Video', 'Article', 'Course'].includes(rec.type) ? rec.type : 'Article') as any,
        author: rec.author,
        description: rec.description,
        tags: rec.tags || []
      }));
      setPersonalizedResources(newResources);
    } catch (e) {
      console.error("Failed to get personalized recommendations", e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. AI Smart Recommendation Section (New) */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Sparkles className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center backdrop-blur-sm border border-white/10">
               <Target className="w-3 h-3 mr-1" /> Data-Driven
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            우리 팀 맞춤형 AI 리더십 코칭
          </h2>
          <p className="text-indigo-100 mb-6 max-w-2xl text-lg">
            AI가 팀원들의 스킬 Gap, 행복도, 리더십 피드백 데이터를 종합 분석하여<br/>
            지금 리더님에게 가장 필요한 솔루션을 제안합니다.
          </p>
          
          <button 
            onClick={handleGetPersonalized}
            disabled={aiLoading}
            className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-lg font-bold flex items-center transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {aiLoading ? (
               <><Loader2 className="w-5 h-5 animate-spin mr-2" /> 팀 데이터 분석 중...</>
            ) : (
               <><Sparkles className="w-5 h-5 mr-2" /> 데이터 기반 추천 받기</>
            )}
          </button>
        </div>

        {/* Personalized Results */}
        {personalizedResources.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 animate-fade-in-up">
            {personalizedResources.map((res) => (
              <div key={res.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 hover:bg-white/20 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">AI 추천</span>
                    {res.type === 'Book' ? <BookOpen className="w-4 h-4 text-emerald-300" /> : <Video className="w-4 h-4 text-rose-300" />}
                 </div>
                 <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{res.title}</h4>
                 <p className="text-indigo-100 text-xs line-clamp-2 mb-2 opacity-80">{res.description}</p>
                 <div className="flex flex-wrap gap-1">
                    {res.tags.map(t => <span key={t} className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-white/70">#{t}</span>)}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Manual Search Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
            <BookOpen className="w-6 h-6 text-slate-400 mr-2" />
            관심 토픽 검색
          </h2>
          <p className="text-slate-500 mb-6 text-sm">
            MZ세대 소통법, 성과 관리, 번아웃 등 구체적인 키워드로 검색해보세요.
          </p>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="관심있는 리더십 주제를 입력하세요..." 
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleGetRecommendations()}
            />
            <button 
              onClick={handleGetRecommendations}
              disabled={loading || !topic.trim()}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Resources Grid (Search Results) */}
      <div>
        <h3 className="font-bold text-lg text-slate-800 mb-4">검색 결과 / 추천 콘텐츠</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
              <div className={`h-1.5 w-full ${
                resource.type === 'Book' ? 'bg-emerald-500' : 
                resource.type === 'Video' ? 'bg-rose-500' : 'bg-blue-500'
              }`}></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold flex items-center ${
                    resource.type === 'Book' ? 'bg-emerald-50 text-emerald-700' : 
                    resource.type === 'Video' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {resource.type === 'Book' && <BookOpen className="w-3 h-3 mr-1" />}
                    {resource.type === 'Video' && <Video className="w-3 h-3 mr-1" />}
                    {resource.type === 'Article' && <FileText className="w-3 h-3 mr-1" />}
                    {resource.type}
                  </span>
                  <button className="text-slate-400 hover:text-indigo-600">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                
                <h4 className="font-bold text-base text-slate-800 mb-2 line-clamp-2">{resource.title}</h4>
                <p className="text-xs text-slate-500 mb-4 font-medium">by {resource.author}</p>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">{resource.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-medium">#{tag}</span>
                  ))}
                </div>

                <button className="w-full mt-auto border border-slate-200 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center font-medium">
                  상세 보기 <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
