
import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, Target, MessageCircle, Award, BookOpen, ChevronRight, AlertCircle, UserPlus, UserMinus, TrendingDown, HelpCircle } from 'lucide-react';

type GuideTab = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Situational';

export const LeaderGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GuideTab>('Weekly');

  const tabs: { id: GuideTab; label: string; icon: React.ReactNode }[] = [
    { id: 'Daily', label: '일간 (Daily)', icon: <Clock className="w-4 h-4" /> },
    { id: 'Weekly', label: '주간 (Weekly)', icon: <Calendar className="w-4 h-4" /> },
    { id: 'Monthly', label: '월간 (Monthly)', icon: <Target className="w-4 h-4" /> },
    { id: 'Quarterly', label: '분기/연간', icon: <Award className="w-4 h-4" /> },
    { id: 'Situational', label: '상황별 플레이북', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Daily':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Daily Routine: 몰입 환경 조성
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                매일 아침, 팀원들이 업무에 집중할 수 있도록 방해 요소를 제거하고 컨디션을 살피는 것이 핵심입니다.
              </p>
              <ul className="space-y-4">
                {[
                  '팀원 출근 인사 및 컨디션 체크 (표정, 목소리 톤 확인)',
                  '업무 시작 전 스크럼/스탠드업: "오늘의 핵심 목표 1가지는 무엇인가요?"',
                  '업무 차단 요소(Blocker) 확인 및 해결 지원',
                  '주요 공지사항 및 일정 리마인드 (슬랙/메신저 활용)',
                  '퇴근 전 격려: "오늘도 고생 많으셨습니다" 한마디 건네기'
                ].map((item, i) => (
                  <li key={i} className="flex items-start p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <div className="mt-0.5 mr-3 text-slate-400 group-hover:text-indigo-500">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1">💡 Leadership Tip</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  "감시"가 아닌 "관심"입니다. 업무 진척도를 묻기보다 "제가 도와드릴 일이 있을까요?"라고 물어보세요.
                </p>
              </div>
            </div>
          </div>
        );
      case 'Weekly':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                Weekly Routine: 방향성 정렬 & 피드백
              </h3>
              <ul className="space-y-4">
                {[
                  '주간 회의 주재: 지난주 성과 회고(Review) 및 이번주 목표 설정(Plan)',
                  '리소스 밸런싱: 특정 팀원에게 업무 과부하가 없는지 체크',
                  '1on1 미팅 진행 (최소 주 1~2명씩 순환하여 월 1회 완료)',
                  '경영진/타 부서 주요 이슈 공유 및 팀 내 전파 (Context Sharing)',
                  '주간 칭찬/인정: 작은 성과라도 공개적으로 칭찬하기 (Recognition)'
                ].map((item, i) => (
                  <li key={i} className="flex items-start p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <div className="mt-0.5 mr-3 text-slate-400 group-hover:text-indigo-500">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'Monthly':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" />
                Monthly Routine: 회고 & 관계 강화
              </h3>
              <ul className="space-y-4">
                {[
                  '월간 성과 지표(KPI) 점검 및 달성 현황 분석',
                  '월간 회고(Retrospective): "Keep, Problem, Try" 방식으로 프로세스 점검',
                  '팀 빌딩 활동: 가벼운 티타임, 점심 회식 등 비업무적 소통 시간',
                  '다음 달 주요 마일스톤 및 휴가 일정 체크',
                  '타 부서와의 협업 이슈 점검 및 해결'
                ].map((item, i) => (
                  <li key={i} className="flex items-start p-3 bg-slate-50 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer group">
                    <div className="mt-0.5 mr-3 text-slate-400 group-hover:text-indigo-500">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <span className="text-slate-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case 'Quarterly':
        return (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-2">1분기 (Q1) - 목표 수립 (Set)</h4>
                   <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>연간 팀 미션/비전 공유 워크숍</li>
                      <li>개인별 OKR/KPI 목표 합의 및 설정</li>
                      <li>전년도 성과 평가 피드백 완료</li>
                   </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-2">2분기 (Q2) - 중간 점검 (Check)</h4>
                   <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>상반기 목표 달성도 중간 리뷰</li>
                      <li>목표 수정 필요성 검토 (시장/환경 변화 반영)</li>
                      <li>팀원 커리어 중간 면담 (성장 지원)</li>
                   </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-2">3분기 (Q3) - 가속화 (Sprint)</h4>
                   <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>하반기 핵심 과제 우선순위 재조정</li>
                      <li>차년도 예산/인력 계획 초안 구상</li>
                      <li>핵심 인재(Key Talent) 유지 관리(Retention) 점검</li>
                   </ul>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                   <h4 className="font-bold text-indigo-800 mb-2">4분기 (Q4) - 평가 & 마무리 (Close)</h4>
                   <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                      <li>연간 성과 최종 평가 및 등급 산정</li>
                      <li>차년도 사업 계획 수립</li>
                      <li>연말 송년회 및 한 해 노고 격려</li>
                   </ul>
                </div>
             </div>
          </div>
        );
      case 'Situational':
        return (
           <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-xl text-white shadow-lg">
                 <h3 className="text-xl font-bold mb-2">상황별 리더십 플레이북</h3>
                 <p className="text-indigo-100 text-sm">리더가 마주하는 까다로운 순간들, 이렇게 대처하세요.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* 1. Onboarding */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <UserPlus className="w-5 h-5 mr-2 text-emerald-500" /> 신규 입사자 온보딩
                    </h4>
                    <div className="space-y-3 text-sm text-slate-600">
                       <p><span className="font-bold text-emerald-600">Day 1:</span> 환영 점심, 팀 소개, PC/계정 세팅 지원, 멘토 지정.</p>
                       <p><span className="font-bold text-emerald-600">Week 1:</span> 업무 툴 교육, 초기 과제 부여(작은 성공 경험).</p>
                       <p><span className="font-bold text-emerald-600">Month 1:</span> 첫 1on1 면담. 적응도 체크 및 기대사항 조율.</p>
                       <p><span className="font-bold text-emerald-600">Month 3:</span> 수습 평가 및 정식 피드백 제공.</p>
                    </div>
                 </div>

                 {/* 2. Underperformer */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-rose-500" /> 저성과자 관리 & 피드백
                    </h4>
                    <div className="space-y-3 text-sm text-slate-600">
                       <p><span className="font-bold text-rose-600">1단계 (Fact):</span> "최근 3주간 마감일이 2번 지연되었습니다." (사실 기반)</p>
                       <p><span className="font-bold text-rose-600">2단계 (Impact):</span> "이로 인해 타 부서 일정도 함께 늦어졌습니다." (영향 설명)</p>
                       <p><span className="font-bold text-rose-600">3단계 (Listen):</span> "혹시 진행에 어려움이 있었나요?" (경청)</p>
                       <p><span className="font-bold text-rose-600">4단계 (Plan):</span> "다음엔 어떻게 개선할 수 있을까요? 제가 도울 점은요?" (행동 계획)</p>
                    </div>
                 </div>

                 {/* 3. 1on1 GROW Model */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-indigo-500" /> 1on1 코칭 (GROW 모델)
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                       <li><span className="font-bold bg-indigo-100 text-indigo-700 px-1.5 rounded">G</span>oal: "오늘 미팅에서 무엇을 얻어가고 싶나요?"</li>
                       <li><span className="font-bold bg-indigo-100 text-indigo-700 px-1.5 rounded">R</span>eality: "현재 상황은 어떤가요? 장애물은요?"</li>
                       <li><span className="font-bold bg-indigo-100 text-indigo-700 px-1.5 rounded">O</span>ptions: "어떤 해결책들이 있을까요?"</li>
                       <li><span className="font-bold bg-indigo-100 text-indigo-700 px-1.5 rounded">W</span>ill: "언제부터 실행해 보시겠어요?"</li>
                    </ul>
                 </div>

                 {/* 4. Offboarding */}
                 <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                        <UserMinus className="w-5 h-5 mr-2 text-slate-500" /> 퇴사 면담 (Offboarding)
                    </h4>
                    <div className="space-y-3 text-sm text-slate-600">
                       <p>1. 퇴사 사유 경청 ("우리가 개선할 점이 있다면?")</p>
                       <p>2. 그동안의 기여에 대한 감사 표현</p>
                       <p>3. 인수인계 계획 수립 및 잔여 연차 확인</p>
                       <p>4. "업계는 좁습니다. 언제든 다시 만날 수 있습니다." (좋은 마무리)</p>
                    </div>
                 </div>
              </div>
           </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <BookOpen className="w-7 h-7 mr-3 text-indigo-600" />
          팀장 가이드북 (Universal Leader Guide)
        </h2>
        <p className="text-slate-500 mt-2">
          모든 리더가 알아야 할 주기별 리더십 루틴과 상황별 대처 가이드를 확인하세요.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};
