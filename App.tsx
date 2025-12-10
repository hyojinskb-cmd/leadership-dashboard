
import React, { useState, useMemo, useEffect } from 'react';
import { LayoutDashboard, Users, MessageSquare, Settings, Bell, Search, LogOut, Activity, Target, BookOpen, Megaphone, GraduationCap, ChevronDown, ChevronUp, Sparkles, Loader2, X, Calendar as CalendarIcon, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MemberStatus, TeamMember, ViewState, TaskDetail } from './types';
import { TeamTable } from './components/TeamTable';
import { PerformanceChart } from './components/PerformanceChart';
import { AICoach } from './components/AICoach';
import { TeamGrowthCenter } from './components/TeamGrowthCenter';
import { TaskFeedbackManager } from './components/TaskFeedbackManager';
import { analyzeTeamComprehensiveStatus } from './services/geminiService';
import { KPIDashboard } from './components/KPIDashboard';
import { LeadershipHub } from './components/LeadershipHub';
import { LeaderGuide } from './components/LeaderGuide'; 
import { CompanySync } from './components/CompanySync'; 
import { TeamHealthMonitor } from './components/TeamHealthMonitor';
import { UnifiedCalendar } from './components/UnifiedCalendar';
import { SettingsPanel } from './components/SettingsPanel'; // Import SettingsPanel
import { ai } from './services/geminiService'; // Import ai instance to check status

// ====================================================================
// Mock Data (Platform SRE Team - Updated to Nov 2025)
// ====================================================================
const initialMembers: TeamMember[] = [
  {
    id: '1',
    name: '김철수',
    role: 'Senior SRE (DevOps)',
    jobLevel: 'L4',
    jobName: 'SRE Engineer',
    avatar: 'https://picsum.photos/seed/kim/150/150',
    status: MemberStatus.Warning,
    performanceScore: 88,
    happinessScore: 45,
    lastFeedbackDate: '2025-11-15',
    strengths: ['서버 관리', '스크립팅', '고가용성 클러스터'],
    areasForImprovement: ['AI 기술 활용', '피드백 분석'],
    tasks: [
      { id: 't1', title: '레거시 헤드엔드(Head-end) 장비 가상화 및 클라우드 이관 완료', dueDate: '2025-11-22', status: 'InProgress', progress: 85 },
      { id: 't2', title: 'Terraform 기반 고가용성(HA) 클러스터 인프라 코드화(IaC)', dueDate: '2025-12-15', status: 'Todo', progress: 0 },
      { id: 't1-3', title: '대규모 트래픽 처리를 위한 L4/L7 스위치 부하 분산 최적화', dueDate: '2025-12-20', status: 'Todo', progress: 0 },
    ],
    feedbackHistory: [
      { 
        id: 'fb1', date: '2025-11-15', type: 'Positive', 
        content: '지난 새벽 발생한 헤드엔드 장비 장애 시, 미리 작성해둔 Failover 스크립트 덕분에 서비스 중단을 막았습니다. 침착한 대응 훌륭합니다.',
        memberResponse: {
            date: '2025-11-15',
            reaction: 'Thanks',
            content: '감사합니다, 팀장님! 평소에 장애 대응 매뉴얼을 업데이트해둔 것이 큰 도움이 되었습니다.'
        }
      },
      { 
        id: 'fb2', date: '2025-10-20', type: 'Constructive', 
        content: '클라우드 이관 작업 시 비용 효율성(Cost Optimization) 측면도 함께 고려해서 인스턴스 타입을 선정해주세요.',
        memberResponse: {
            date: '2025-10-21',
            reaction: 'Check',
            content: '네, 알겠습니다. RI(Reserved Instance) 현황 확인 후 재산정하여 보고드리겠습니다.'
        }
      },
      { id: 'fb1-3', date: '2025-09-05', type: 'Positive', content: '새벽 긴급 점검 시 트래픽 우회 처리가 매우 신속했습니다. 고객 서비스 영향도를 최소화한 점 높이 평가합니다.' }
    ],
    skillAssessments: [
      { skillName: 'DevOps & 자동화', selfReview: 5, leaderReview: 5 },
      { skillName: '모니터링 & 데이터', selfReview: 4, leaderReview: 4 },
      { skillName: '네트워크 & 보안', selfReview: 3, leaderReview: 3 },
      { skillName: '서버 & 인프라', selfReview: 5, leaderReview: 5 },
      { skillName: '미디어 & 스트리밍', selfReview: 2, leaderReview: 2 },
      { skillName: 'AI & 신기술', selfReview: 2, leaderReview: 2 },
    ],
    historicalEvaluations: [
      { 
        year: 2025, performanceScore: 88, leaderComment: '물리적 하드웨어 설계를 클라우드 환경으로 성공적으로 전환했으나, AI 기반 운영 툴 도입에는 여전히 보수적임.', strengthsKeywords: ['인프라', '안정성', '이관성공'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 5.0 }, { skillName: '모니터링 & 데이터', score: 4.0 }, { skillName: '네트워크 & 보안', score: 3.0 },
            { skillName: '서버 & 인프라', score: 5.0 }, { skillName: '미디어 & 스트리밍', score: 2.0 }, { skillName: 'AI & 신기술', score: 2.0 }
        ],
        majorTasks: ['헤드엔드 가상화 POC', 'IDC -> AWS 이관 Phase 1', 'Ansible 자동화 배포']
      },
      { 
        year: 2024, performanceScore: 85, leaderComment: '안정적인 서버 운영 능력은 탁월하나, 새로운 Docker 컨테이너 환경 적응에 시간이 소요됨.', strengthsKeywords: ['운영', '성실함', '트러블슈팅'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 4.0 }, { skillName: '모니터링 & 데이터', score: 3.5 }, { skillName: '네트워크 & 보안', score: 2.5 },
            { skillName: '서버 & 인프라', score: 4.5 }, { skillName: '미디어 & 스트리밍', score: 1.5 }, { skillName: 'AI & 신기술', score: 1.5 }
        ],
        majorTasks: ['물리 서버 50대 증설', '레거시 모니터링 툴 유지보수', '장애 대응 매뉴얼 고도화']
      },
      { 
        year: 2023, performanceScore: 82, leaderComment: '입사 초기 인프라 적응 빠름. 네트워크 프로토콜 이해도 보강 필요.', strengthsKeywords: ['적응력', '하드웨어'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 3.0 }, { skillName: '모니터링 & 데이터', score: 3.0 }, { skillName: '네트워크 & 보안', score: 2.0 },
            { skillName: '서버 & 인프라', score: 4.0 }, { skillName: '미디어 & 스트리밍', score: 1.0 }, { skillName: 'AI & 신기술', score: 1.0 }
        ],
        majorTasks: ['IDC 상면 재배치', '노후 장비 교체 프로젝트', '백업 스토리지 증설']
      },
    ],
    avgLeaderSkillScore: 3.5,
    oneOnOneHistory: [
      {
        id: 's1', date: '2025-11-10', time: '14:00', title: 'AI 운영 툴 도입 논의',
        summary: '기존 Bash 스크립트 방식의 한계와 AI 기반 로그 분석 도입 필요성 논의.', strengthsMemo: '기존 시스템 아키텍처에 대한 깊은 이해도', 
        developmentTasks: 'AI 기반 이상 탐지 솔루션(AIOps) 리서치', nextStepCheckpoint: '2주 뒤 PoC 결과 공유', isCompleted: true,
        selfReview: {
            listeningScore: 4,
            questioningScore: 3,
            actionScore: 5,
            feedback: "기술적인 논의가 길어져서 경청보다는 설명이 많았던 것 같다. 다음엔 더 많이 듣자."
        }
      }
    ],
    leaderFeedbacks: [
      {
        id: 'lf1', date: '2025-11-20', 
        scores: { vision: 3, decision: 4, execution: 5, coaching: 3, communication: 3, innovation: 2 }, 
        comment: "기술적인 아키텍처 가이드는 명확(Execution)하지만, 새로운 툴 도입 제안(Innovation)에 대해 조금 더 열린 마음을 가져주셨으면 합니다."
      }
    ]
  },
  {
    id: '2',
    name: '이영희',
    role: 'Media Network Specialist',
    jobLevel: 'L3',
    jobName: 'Network Engineer',
    avatar: 'https://picsum.photos/seed/lee/150/150',
    status: MemberStatus.Active,
    performanceScore: 95,
    happinessScore: 80,
    lastFeedbackDate: '2025-11-01',
    strengths: ['미디어 & 스트리밍', 'QoS 관리', 'CDN'],
    areasForImprovement: ['DevOps', '스크립팅'],
    tasks: [
      { id: 't3', title: '글로벌 CDN 엣지 노드 대역폭 최적화 및 비용 절감', dueDate: '2025-11-25', status: 'InProgress', progress: 85 },
      { id: 't4', title: '실시간 OTT 서비스 품질(QoS) 모니터링 알림 시스템 고도화', dueDate: '2025-12-10', status: 'Todo', progress: 0 },
      { id: 't2-3', title: '스트리밍 프로토콜(HLS/DASH) 지연 시간(Latency) 최적화', dueDate: '2025-12-30', status: 'Todo', progress: 0 },
    ],
    feedbackHistory: [
      { 
          id: 'fb3', date: '2025-11-01', type: 'Positive', 
          content: '이번 대규모 라이브 이벤트에서 트래픽 분산 처리가 완벽했습니다. QoS 지표가 역대 최고 수준입니다.',
          memberResponse: {
              date: '2025-11-01',
              reaction: 'Fire',
              content: '팀원분들이 새벽까지 모니터링 지원해주신 덕분입니다! 다음 이벤트는 더 완벽하게 준비하겠습니다 🔥'
          }
      },
      { id: 'fb4', date: '2025-10-10', type: 'Constructive', content: 'CDN 로그 분석 시 수동 엑셀 작업보다는 파이썬 스크립트를 활용해 자동화하는 방안을 고민해보세요.' },
      { id: 'fb2-3', date: '2025-09-15', type: 'Constructive', content: 'CDN 비용 절감을 위한 구체적인 아이디어가 필요합니다. 현재 아키텍처를 재검토해주세요.' }
    ],
    skillAssessments: [
      { skillName: 'DevOps & 자동화', selfReview: 3, leaderReview: 2 },
      { skillName: '모니터링 & 데이터', selfReview: 4, leaderReview: 4 },
      { skillName: '네트워크 & 보안', selfReview: 5, leaderReview: 5 },
      { skillName: '서버 & 인프라', selfReview: 3, leaderReview: 3 },
      { skillName: '미디어 & 스트리밍', selfReview: 5, leaderReview: 5 },
      { skillName: 'AI & 신기술', selfReview: 3, leaderReview: 3 },
    ],
    historicalEvaluations: [
      { 
        year: 2025, performanceScore: 95, leaderComment: '동계 아시안게임 중계 대비 스트리밍 프로토콜(HLS/DASH) 최적화로 지연 시간을 획기적으로 단축함.', strengthsKeywords: ['트래픽', '미디어', 'QoS'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 2.0 }, { skillName: '모니터링 & 데이터', score: 4.0 }, { skillName: '네트워크 & 보안', score: 5.0 },
            { skillName: '서버 & 인프라', score: 3.0 }, { skillName: '미디어 & 스트리밍', score: 5.0 }, { skillName: 'AI & 신기술', score: 3.0 }
        ],
        majorTasks: ['글로벌 CDN 다중화 적용', 'Low Latency HLS 적용', '라이브 인코딩 프로파일 최적화']
      },
      {
        year: 2024, performanceScore: 92, leaderComment: '파리 올림픽 대규모 트래픽을 안정적으로 처리함. 네트워크 설계 능력 우수.', strengthsKeywords: ['설계', '전문성', '이벤트대응'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 1.5 }, { skillName: '모니터링 & 데이터', score: 3.5 }, { skillName: '네트워크 & 보안', score: 4.5 },
            { skillName: '서버 & 인프라', score: 2.5 }, { skillName: '미디어 & 스트리밍', score: 4.5 }, { skillName: 'AI & 신기술', score: 2.0 }
        ],
        majorTasks: ['올림픽 전용망 구축', 'DDoS 방어 시스템 고도화', 'CDN 엣지 캐싱 효율화']
      },
      {
        year: 2023, performanceScore: 88, leaderComment: '국내 CDN 팝(PoP) 증설 프로젝트 주도적 수행. 인프라 자동화 역량은 보완 필요.', strengthsKeywords: ['실행력', '네트워크'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 1.0 }, { skillName: '모니터링 & 데이터', score: 3.0 }, { skillName: '네트워크 & 보안', score: 4.0 },
            { skillName: '서버 & 인프라', score: 2.0 }, { skillName: '미디어 & 스트리밍', score: 3.5 }, { skillName: 'AI & 신기술', score: 1.0 }
        ],
        majorTasks: ['국내 CDN PoP 3개소 증설', '1080p 화질 서비스 런칭', '네트워크 대역폭 2배 증설']
      }
    ],
    avgLeaderSkillScore: 3.6,
    oneOnOneHistory: [
        {
            id: 's2', date: '2025-11-22', time: '11:00', title: '커리어 성장 면담',
            summary: '네트워크 전문가로서의 성장 방향 논의', strengthsMemo: '독보적인 네트워크 지식', 
            developmentTasks: '후배 멘토링', nextStepCheckpoint: '다음 달 멘토링 계획 수립', isCompleted: false,
        }
    ],
    leaderFeedbacks: [
      {
        id: 'lf2', date: '2025-11-01', 
        scores: { vision: 4, decision: 5, execution: 4, coaching: 5, communication: 5, innovation: 3 }, 
        comment: "제가 부족한 인프라 자동화 부분에 대해 인내심을 갖고 지원해주셔서 감사합니다(Coaching). 네트워크 관련 의사결정이 명확해서 좋습니다(Decision)."
      }
    ]
  },
  {
    id: '3',
    name: '박민준',
    role: 'AI Ops Engineer',
    jobLevel: 'M1',
    jobName: 'SRE Engineer',
    avatar: 'https://picsum.photos/seed/park/150/150',
    status: MemberStatus.Critical,
    performanceScore: 60,
    happinessScore: 30,
    lastFeedbackDate: '2025-10-25',
    strengths: ['AI 기술 개발', '통계 데이터 분석', '피드백 분석'],
    areasForImprovement: ['네트워크 인프라', '보안'],
    tasks: [
      { id: 't5', title: '스트리밍 버퍼링 패턴 분석을 통한 장애 예측 AI 모델링 V2', dueDate: '2025-12-05', status: 'Todo', progress: 0 },
      { id: 't6', title: '침입 탐지 시스템(IDS) 오탐지율 개선을 위한 로그 데이터 정제', dueDate: '2025-11-28', status: 'InProgress', progress: 30 },
      { id: 't3-3', title: '고객 엑세스 제어 시스템(Access Control) 보안 취약점 점검', dueDate: '2025-12-15', status: 'Todo', progress: 0 },
    ],
    feedbackHistory: [
      { 
          id: 'fb5', date: '2025-10-25', type: 'Positive', 
          content: '시청자 피드백 데이터를 분석하여 버퍼링이 잦은 특정 구간을 찾아낸 것은 훌륭한 성과입니다. 데이터 기반 문제 해결의 정석이었습니다.',
          memberResponse: {
              date: '2025-10-25',
              reaction: 'Fire',
              content: '알아봐주셔서 감사합니다! 다음엔 자동 조치 모듈까지 연결해보겠습니다.'
          }
      },
      { id: 'fb6', date: '2025-09-15', type: 'Constructive', content: 'AI 모델의 정확도도 중요하지만, 실제 네트워크 환경(방화벽, 대역폭)에 대한 이해를 바탕으로 배포 계획을 세워주세요.' },
      { id: 'fb3-3', date: '2025-11-10', type: 'Positive', content: '작성해주신 보안 위협 분석 리포트의 시각화가 매우 뛰어났습니다. 경영진 보고에 큰 도움이 되었습니다.' }
    ],
    skillAssessments: [
      { skillName: 'DevOps & 자동화', selfReview: 4, leaderReview: 4 },
      { skillName: '모니터링 & 데이터', selfReview: 5, leaderReview: 5 },
      { skillName: '네트워크 & 보안', selfReview: 2, leaderReview: 2 },
      { skillName: '서버 & 인프라', selfReview: 3, leaderReview: 3 },
      { skillName: '미디어 & 스트리밍', selfReview: 2, leaderReview: 1 },
      { skillName: 'AI & 신기술', selfReview: 5, leaderReview: 5 },
    ],
    historicalEvaluations: [
      { 
        year: 2025, performanceScore: 60, leaderComment: 'AI Biz 툴 활용 능력은 팀 내 최고이나, 실제 네트워크 보안 프로토콜에 대한 이해가 부족하여 현장 적용에 난항.', strengthsKeywords: ['AI', '데이터', '분석'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 3.5 }, { skillName: '모니터링 & 데이터', score: 5.0 }, { skillName: '네트워크 & 보안', score: 2.0 },
            { skillName: '서버 & 인프라', score: 3.0 }, { skillName: '미디어 & 스트리밍', score: 1.0 }, { skillName: 'AI & 신기술', score: 5.0 }
        ],
        majorTasks: ['장애 예측 AI 모델 고도화', '보안 로그 분석 파이프라인 구축', '이상 징후 알림 봇 개발']
      },
      { 
        year: 2024, performanceScore: 55, leaderComment: '데이터 분석 능력은 뛰어나나, 인프라 운영 실무 경험 부족으로 장애 대응 시 시간이 지체됨.', strengthsKeywords: ['가능성', '데이터'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 3.0 }, { skillName: '모니터링 & 데이터', score: 4.5 }, { skillName: '네트워크 & 보안', score: 1.5 },
            { skillName: '서버 & 인프라', score: 2.5 }, { skillName: '미디어 & 스트리밍', score: 1.0 }, { skillName: 'AI & 신기술', score: 4.5 }
        ],
        majorTasks: ['로그 수집 시스템 구축', '사내 챗봇 프로토타입 개발', '데이터 시각화 대시보드 제작']
      },
      { 
        year: 2023, performanceScore: 50, leaderComment: '신입으로서 열정은 높으나, SRE 직무의 기본인 네트워크/리눅스 기초 역량 보강이 시급함.', strengthsKeywords: ['열정', '학습'],
        skillSnapshot: [ 
            { skillName: 'DevOps & 자동화', score: 2.0 }, { skillName: '모니터링 & 데이터', score: 4.0 }, { skillName: '네트워크 & 보안', score: 1.0 },
            { skillName: '서버 & 인프라', score: 2.0 }, { skillName: '미디어 & 스트리밍', score: 1.0 }, { skillName: 'AI & 신기술', score: 4.0 }
        ],
        majorTasks: ['온보딩 교육 이수', '팀 내 위키 문서 정리', '간단한 모니터링 알림 설정']
      },
    ],
    avgLeaderSkillScore: 3.3,
    oneOnOneHistory: [],
    leaderFeedbacks: [
      {
        id: 'lf3', date: '2025-10-25', 
        scores: { vision: 5, decision: 3, execution: 4, coaching: 2, communication: 2, innovation: 4 }, 
        comment: "새로운 AI 기술 도입(Innovation)에 적극적이신 점은 좋으나, 저처럼 기초가 부족한 팀원에게는 조금 더 친절한 설명(Communication)이 필요합니다."
      }
    ]
  }
];

// Helper to render markdown structure (Reverted to specific card structure)
const renderMarkdown = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    
    const parts = trimmed.split(/(\*\*.*?\*\*)/g).map((part, i) => 
      part.startsWith('**') && part.endsWith('**') 
        ? <strong key={i} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong> 
        : part
    );

    if (trimmed.startsWith('### ')) {
      return (
        <div key={index} className="mt-4 mb-2">
            <h3 className="text-base font-bold text-indigo-800 border-b border-indigo-100 pb-1 inline-block">
                {trimmed.replace('### ', '')}
            </h3>
        </div>
      );
    }

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes(':')) {
         // Standalone Bold Line -> treated as Subheader
         return <p key={index} className="font-bold text-slate-800 mt-3 mb-1">{parts}</p>;
    }
    
    if (trimmed.startsWith('- ')) {
      return (
        <div key={index} className="flex items-start mb-1.5 pl-1">
           <span className="mr-2 text-indigo-500 mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
           <span className="text-slate-700 text-sm leading-relaxed">{parts}</span>
        </div>
      );
    }
    
    // Numbered list
    if (/^\d+\./.test(trimmed)) {
        return (
             <div key={index} className="flex items-start mb-1.5 pl-1">
                <span className="mr-2 text-indigo-600 font-bold text-sm">{trimmed.split('.')[0]}.</span>
                <span className="text-slate-700 text-sm leading-relaxed">{trimmed.replace(/^\d+\.\s*/, '')}</span>
             </div>
        )
    }

    if (trimmed === '') {
      return <div key={index} className="h-2"></div>;
    }

    return <p key={index} className="text-slate-700 mb-1 text-sm leading-relaxed">{parts}</p>;
  });
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.Dashboard);
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // Navigation State (Deep Linking)
  const [navTargetMemberId, setNavTargetMemberId] = useState<string | null>(null);
  
  // AI Team Insight State
  const [teamSentiment, setTeamSentiment] = useState('');
  const [isSentimentLoading, setIsSentimentLoading] = useState(false);
  const [isInsightExpanded, setIsInsightExpanded] = useState(false); // Default collapsed

  // Auto-run AI Insight on Mount
  useEffect(() => {
    // Only run if empty to avoid re-fetching on every render, but run immediately on mount
    if (viewState === ViewState.Dashboard && !teamSentiment && !isSentimentLoading) {
        handleAnalyzeTeam();
    }
  }, [viewState]); // Run when switching back to Dashboard too

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
    if (selectedMember?.id === updatedMember.id) {
      setSelectedMember(updatedMember);
    }
  };

  const handleNavigateToOneOnOne = (memberId: string) => {
    setNavTargetMemberId(memberId);
    setViewState(ViewState.TaskFeedback);
  };

  // ------------------------------------------------------------------
  // Excel Export Logic
  // ------------------------------------------------------------------
  const handleExportToExcel = () => {
    if (!members || members.length === 0) {
        alert("내보낼 데이터가 없습니다.");
        return;
    }

    // 1. Prepare Data for Each Sheet
    // Sheet 1: Team Overview
    const overviewData = members.map(m => ({
        ID: m.id,
        이름: m.name,
        직무: m.role,
        레벨: m.jobLevel,
        상태: m.status,
        성과점수: m.performanceScore,
        행복점수: m.happinessScore,
        최근피드백: m.lastFeedbackDate
    }));

    // Sheet 2: Tasks
    const taskData = members.flatMap(m => m.tasks.map(t => ({
        담당자: m.name,
        업무명: t.title,
        상태: t.status,
        진행률: `${t.progress}%`,
        마감일: t.dueDate
    })));

    // Sheet 3: Feedback History
    const feedbackData = members.flatMap(m => m.feedbackHistory.map(fb => ({
        대상자: m.name,
        날짜: fb.date,
        유형: fb.type,
        내용: fb.content,
        팀원반응: fb.memberResponse ? `${fb.memberResponse.reaction} - ${fb.memberResponse.content}` : ''
    })));

    // Sheet 4: 1on1 Logs
    const oneOnOneData = members.flatMap(m => m.oneOnOneHistory.map(s => ({
        대상자: m.name,
        날짜: s.date,
        시간: s.time,
        주제: s.title,
        상태: s.isCompleted ? '완료' : '예정',
        요약: s.summary,
        NextStep: s.nextStepCheckpoint
    })));

    // 2. Create Workbook and Sheets
    const wb = XLSX.utils.book_new();
    
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "팀 현황");

    const wsTasks = XLSX.utils.json_to_sheet(taskData);
    XLSX.utils.book_append_sheet(wb, wsTasks, "업무 현황");

    const wsFeedback = XLSX.utils.json_to_sheet(feedbackData);
    XLSX.utils.book_append_sheet(wb, wsFeedback, "피드백 기록");

    const wsOneOnOne = XLSX.utils.json_to_sheet(oneOnOneData);
    XLSX.utils.book_append_sheet(wb, wsOneOnOne, "1on1 로그");

    // 3. Export File
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Leadership_Dashboard_Data_${dateStr}.xlsx`);
  };

  // AI Insight Generation
  const handleAnalyzeTeam = async () => {
    setIsSentimentLoading(true);
    try {
        const analysisData = members.map(m => `
            - ${m.name} (${m.role}): 성과 ${m.performanceScore}점, 행복도 ${m.happinessScore}점.
            - 이슈: ${m.areasForImprovement.join(', ')}
            - 강점: ${m.strengths.join(', ')}
            - 최근 피드백: ${m.feedbackHistory[0]?.content || '없음'}
        `).join('\n');

        const insight = await analyzeTeamComprehensiveStatus(analysisData);
        setTeamSentiment(insight);
    } catch (error) {
        console.error("AI Error:", error);
        setTeamSentiment("분석 중 오류가 발생했습니다.");
    } finally {
        setIsSentimentLoading(false);
    }
  };

  const renderContent = () => {
    switch (viewState) {
      case ViewState.Dashboard:
        return (
          <div className="space-y-6">
            {/* 1. Team Health Monitor (Hero Section) */}
            <TeamHealthMonitor members={members} />

            {/* 2. AI Comprehensive Team Insight (Auto-Loaded) */}
            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden transition-all">
                <div className="bg-gradient-to-r from-indigo-50 to-white p-5 border-b border-indigo-100 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-indigo-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-indigo-900 text-lg">AI 팀 종합 인사이트 (성과 & 조직)</h3>
                            <p className="text-xs text-slate-500 mt-1">데이터 기반 실시간 성과/조직 건강 진단</p>
                        </div>
                    </div>
                    {/* Status Badge instead of button if loaded */}
                    {isSentimentLoading ? (
                        <div className="flex items-center text-xs text-indigo-500 font-medium px-3 py-1 bg-white rounded-full border border-indigo-100">
                            <Loader2 className="w-3 h-3 animate-spin mr-2" /> 분석 중...
                        </div>
                    ) : (
                        <div className="flex items-center text-xs text-emerald-600 font-medium px-3 py-1 bg-white rounded-full border border-emerald-100">
                            <Sparkles className="w-3 h-3 mr-1" /> 분석 완료
                        </div>
                    )}
                </div>
                
                <div className="relative">
                    {/* Content Area */}
                    <div className={`p-6 bg-white transition-all duration-500 ease-in-out ${isInsightExpanded ? 'max-h-none' : 'max-h-40 overflow-hidden'}`}>
                         {teamSentiment ? (
                             <div className="prose prose-sm max-w-none">
                                 {renderMarkdown(teamSentiment)}
                             </div>
                         ) : (
                             <div className="space-y-3 animate-pulse">
                                 <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                 <div className="h-4 bg-slate-100 rounded w-full"></div>
                                 <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                             </div>
                         )}
                    </div>
                    
                    {/* Gradient & Toggle Button */}
                    {!isInsightExpanded && teamSentiment && (
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    )}
                    
                    {teamSentiment && (
                         <button 
                            onClick={() => setIsInsightExpanded(!isInsightExpanded)}
                            className="w-full py-2.5 bg-slate-50 border-t border-slate-100 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center z-10 relative"
                        >
                            {isInsightExpanded ? (
                                <>분석 결과 접기 <ChevronUp className="w-4 h-4 ml-1" /></>
                            ) : (
                                <>전체 분석 결과 펼쳐보기 <ChevronDown className="w-4 h-4 ml-1" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* 3. Main Metrics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Chart & Table */}
              <div className="xl:col-span-2 space-y-6">
                 <PerformanceChart />
                 <TeamTable members={members} onMemberSelect={setSelectedMember} />
              </div>

              {/* Right Column: AI Coach */}
              <div className="xl:col-span-1 h-full">
                 <AICoach members={members} />
              </div>
            </div>
          </div>
        );

      case ViewState.Calendar:
        return (
          <UnifiedCalendar 
            members={members} 
            onUpdateMember={handleUpdateMember}
            onNavigateToCoaching={handleNavigateToOneOnOne}
          />
        );

      case ViewState.CompanySync:
        return <CompanySync />;

      case ViewState.TaskFeedback:
        return (
          <TaskFeedbackManager 
            members={members} 
            onUpdateMember={handleUpdateMember} 
            initialMemberId={navTargetMemberId}
            initialViewMode={navTargetMemberId ? 'OneOnOne' : undefined}
          />
        );
      
      case ViewState.KPI:
        return <KPIDashboard members={members} />;
      
      case ViewState.GrowthHub:
        return <LeadershipHub members={members} />;

      case ViewState.LeaderGuide:
        return <LeaderGuide />;

      case ViewState.Settings:
        return <SettingsPanel />;

      default:
        return <div>페이지를 준비 중입니다.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-inter overflow-hidden">
      
      {/* Sidebar */}
      <nav className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-full">
        <div className="p-6 flex items-center border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-800">Leadership Lens</span>
        </div>

        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-4">Overview</div>
          <button
            onClick={() => setViewState(ViewState.Dashboard)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.Dashboard 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">대시보드</span>
          </button>
          
          <button
            onClick={() => setViewState(ViewState.Calendar)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.Calendar 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <CalendarIcon className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">통합 캘린더</span>
          </button>

          <button
            onClick={() => setViewState(ViewState.CompanySync)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.CompanySync 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Megaphone className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">전사/조직 소식</span>
          </button>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-6">Management</div>
          <button
            onClick={() => setViewState(ViewState.TaskFeedback)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.TaskFeedback 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">팀원 코칭 & 피드백</span>
          </button>
          <button
            onClick={() => setViewState(ViewState.KPI)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.KPI 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Target className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">KPI 성과 관리</span>
          </button>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3 mt-6">Growth & Guide</div>
          <button
            onClick={() => setViewState(ViewState.GrowthHub)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.GrowthHub 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <GraduationCap className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">리더십 허브</span>
          </button>
          <button
            onClick={() => setViewState(ViewState.LeaderGuide)}
            className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
              viewState === ViewState.LeaderGuide 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            <span className="font-bold text-sm">팀장 가이드북</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => setViewState(ViewState.Settings)}
            className={`w-full flex items-center p-3 transition-colors ${
              viewState === ViewState.Settings 
                ? 'bg-indigo-600 text-white rounded-xl shadow-md' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">설정</span>
          </button>
          {/* Demo Indicator */}
          {!ai && (
             <div className="mt-2 text-center text-xs text-amber-500 font-bold bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center justify-center">
                 <Sparkles className="w-3 h-3 mr-1" /> 데모 모드 (AI 제한)
             </div>
          )}
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden bg-slate-50 relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 relative">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-slate-400 bg-slate-100 px-4 py-2 rounded-lg w-96">
                <Search className="w-4 h-4 mr-2" />
                <input 
                type="text" 
                placeholder="팀원, 업무, 리더십 가이드 검색..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                />
            </div>
            
            {/* Excel Download Button */}
            <button 
                onClick={handleExportToExcel}
                className="flex items-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                title="대시보드 데이터 엑셀 다운로드"
            >
                <Download className="w-4 h-4 mr-2" />
                엑셀 내보내기
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center pl-4 border-l border-slate-200">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                alt="Leader" 
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
              />
              <div className="ml-3">
                <p className="text-sm font-bold text-slate-800">홍길동</p>
                <p className="text-xs text-slate-500 font-medium">플랫폼 SRE 팀장</p>
              </div>
            </div>
          </div>
        </header>

        {/* Render Content */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar p-6 pb-20">
           {renderContent()}
        </div>
      </main>

      {/* Member Detail Modal (Centered Popup) */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div 
            className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">팀원 상세 분석</h3>
                    <p className="text-sm text-slate-500 mt-1">개인별 역량 성장 및 코칭 포인트를 확인하세요.</p>
                </div>
                <button 
                    onClick={() => setSelectedMember(null)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
               <TeamGrowthCenter member={selectedMember} members={members} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
