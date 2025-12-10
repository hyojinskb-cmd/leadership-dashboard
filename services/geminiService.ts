
import { GoogleGenAI, Type } from "@google/genai";
import { TeamMember, LearningResource, TaskDetail, LeaderFeedback, SimulationMessage } from '../types';

// Safely access API_KEY from either LocalStorage (Browser) or Process Env (Build)
const getApiKey = () => {
  // 1. Check Local Storage (User Override for Browser Environments like AI Studio)
  try {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;
  } catch (e) {
    // Ignore localStorage errors
  }

  // 2. Check Process Env (Build time / Vercel)
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();

// API Key가 있으면 인스턴스 생성, 없으면 null (데모 모드 진입용)
export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const model = 'gemini-2.5-flash';

export interface TaskAssignmentAdvice {
  summary: string;
  suggestedDueDate: string;
  riskAnalysis: string;
  brainScienceStrategy: {
    dlpfc_goal: string;
    ofc_value: string;
    nacc_reward: string;
  };
}

// ------------------------------------------------------------------
// Mock Data Generators (Cost-free Preview)
// ------------------------------------------------------------------

const getMockLeadershipAdvice = () => `
### 💡 [데모] AI 리더십 조언
**상황 분석:** 현재 팀은 마감 기한 압박으로 인해 스트레스 레벨이 다소 높아진 상태입니다. (API Key가 설정되지 않아 데모 응답을 보여줍니다.)

**액션 아이템:**
1. **설정 페이지 확인:** 우측 상단 프로필 또는 사이드바 설정 메뉴에서 **Gemini API Key**를 입력하면 실시간 AI 분석이 가능합니다.
2. **우선순위 재조정:** '긴급함'과 '중요함'을 구분하여, 이번 주에 꼭 하지 않아도 되는 업무 2가지를 다음 스프린트로 이관하세요.
3. **작은 성취 축하:** 아주 사소한 진척이라도 데일리 스크럼에서 박수치며 격려하는 시간을 가지세요.
`;

const getMockSkillGapAdvice = (name: string) => `
### ⚡ [데모] ${name}님 역량 Gap 분석
동료 평균 대비 **'DevOps & 자동화'** 역량에서 약 -1.2점의 Gap이 확인되었습니다.

**추천 육성 전략:**
- **단기:** 현재 팀 내 테라폼(Terraform) 전문가인 김철수 님과 주 1회 페어 프로그래밍 세션 진행.
- **중기:** 'Infrastructure as Code 입문' 사내 스터디 리딩 권유 (가르치며 배우기).
`;

const getMockTeamInsight = () => `
**[데모] AI 팀 종합 진단 결과**

(현재 데모 모드입니다. 설정에서 API Key를 등록하면 실시간 분석이 제공됩니다.)

팀 전체적으로 **성취감(Performance)**은 높으나, **정서적 소진(Burnout)** 징후가 감지됩니다.

### 📈 주요 발견점
- **강점:** 위기 상황에서의 결속력과 문제 해결 속도가 매우 뛰어납니다.
- **위험:** 구성원 3명이 '피드백 부족'을 호소하고 있습니다.

### 🚀 리더를 위한 액션 플랜
1. **휴식의 의무화:** 이번 프로젝트 종료 후 전원 '리프레시 데이'를 지정하세요.
2. **성장 대화 시작:** "어떤 커리어를 꿈꾸나요?"라는 질문으로 1on1을 시작하세요.
`;

const getMockFeedbackSuggestion = (name: string, type: string) => {
    return `[데모] ${name}님, 지난번 장애 대응 시 침착하게 대응해주신 덕분에 서비스 중단을 막을 수 있었습니다. (API Key를 입력하면 상황에 맞는 AI 피드백을 생성해드립니다.)`;
};

const getMockKPIAnalysis = () => `
### 📊 [데모] KPI 전략 분석
현재 4분기 목표 달성률은 **92%**로 순항 중입니다.

- **전략 제안:** 남은 1개월간 신규 기능 개발보다는 **인프라 최적화 Task에 리소스를 40% 집중**하세요.
`;

const getMockLeaderCoaching = () => `
### 🚀 [데모] Dream Leader 분석
익명 피드백을 분석한 결과, 팀장님은 **'성과 중심(Task-Oriented)'** 성향이 강합니다.

**Action Plan:**
- **3분 잡담:** 회의 시작 전 3분 동안은 업무 배제하고 사적인 대화 나누기.
- **감정 단어 사용:** 피드백 시 "아쉬워요, 고마워요" 같은 감정 언어 섞어 쓰기.
`;

// ------------------------------------------------------------------
// Actual Service Functions (API Calls + Fallback)
// ------------------------------------------------------------------

// 1. Leadership Advice
export const generateLeadershipAdvice = async (context: string, question: string): Promise<string> => {
  if (!ai) return getMockLeadershipAdvice();
  
  const prompt = `
    당신은 숙련된 리더십 코치입니다.
    다음 팀 상황을 고려하여 리더의 질문에 대한 조언을 해주세요.
    
    [팀 상황]
    ${context}
    
    [리더의 질문]
    ${question}
    
    답변은 구체적이고 실천 가능한 액션 아이템을 포함해야 합니다. 마크다운 형식으로 작성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "답변을 생성할 수 없습니다.";
  } catch (error) {
    console.error(error);
    return getMockLeadershipAdvice();
  }
};

// 2. Skill Gap Advice
export const generateSkillGapAdvice = async (member: TeamMember, peerAvgs: any[]): Promise<string> => {
   if (!ai) return getMockSkillGapAdvice(member.name);

   const prompt = `
     당신은 HR 및 역량 개발 전문가입니다.
     다음 팀원('${member.name}')의 역량 평가 데이터를 분석하여 Skill Gap 분석 및 육성 전략을 제안하세요.

     [평가 데이터]
     - 직무: ${member.jobName}
     - 개인 역량 평가: ${JSON.stringify(member.skillAssessments)}
     - 동료 평균(Peer Avg): ${JSON.stringify(peerAvgs)}

     특히 동료 평균보다 낮은 항목(Weakness)에 집중하여, 이를 어떻게 보완할지 구체적인 학습 방법이나 업무 할당 팁을 포함하세요.
   `;

   try {
     const response = await ai.models.generateContent({
       model: model,
       contents: prompt,
     });
     return response.text || "분석 결과를 생성할 수 없습니다.";
   } catch (error) {
     console.error(error);
     return getMockSkillGapAdvice(member.name);
   }
};

// 3. Analyze Team Comprehensive Status
export const analyzeTeamComprehensiveStatus = async (analysisData: string): Promise<string> => {
  if (!ai) return getMockTeamInsight();

  const prompt = `
    당신은 조직 심리 및 성과 관리 전문가입니다.
    아래 팀원들의 데이터를 바탕으로 팀의 현재 상태(성과, 몰입도, 리스크)를 종합 진단하고,
    리더가 취해야 할 핵심 전략 3가지를 제안하세요.

    [팀원 데이터]
    ${analysisData}

    출력 형식:
    1. 전체 요약 (감성적이고 통찰력 있게)
    2. ### 📈 주요 발견점 (강점 및 위험 신호)
    3. ### 🚀 리더를 위한 액션 플랜 (3가지)
  `;

  try {
     const response = await ai.models.generateContent({
       model: model,
       contents: prompt,
     });
     return response.text || "분석을 완료할 수 없습니다.";
  } catch (error) {
     console.error(error);
     return getMockTeamInsight();
  }
};

// 4. Generate Feedback Suggestion
export const generateFeedbackSuggestion = async (member: TeamMember, type: 'Positive' | 'Constructive'): Promise<string> => {
    if (!ai) return getMockFeedbackSuggestion(member.name, type);

    const prompt = `
      당신은 피드백 전문가입니다.
      '${member.name}' 팀원에게 줄 '${type === 'Positive' ? '칭찬/격려' : '개선 요청/피드백'}' 메시지를 작성해주세요.
      
      [팀원 정보]
      - 직무: ${member.role}
      - 성향: ${member.strengths.join(', ')}
      - 최근 업무: ${member.tasks.slice(0, 2).map(t => t.title).join(', ')}

      SBI(Situation-Behavior-Impact) 모델을 활용하여 구체적이고 감동적이거나(칭찬 시) 수용 가능한(개선 시) 톤으로 작성하세요.
      공손하지만 명확하게 작성해주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "피드백을 생성할 수 없습니다.";
    } catch (error) {
        console.error(error);
        return getMockFeedbackSuggestion(member.name, type);
    }
};

// 5. Analyze KPI Performance
export const analyzeKPIPerformance = async (kpiData: any[], krData: any[], workloadData: any[]): Promise<string> => {
    if (!ai) return getMockKPIAnalysis();

    const prompt = `
      현재 팀의 KPI 성과 데이터를 분석하고, 목표 달성을 위한 전략적 조언을 해주세요.

      [분기별 달성률 추이]
      ${JSON.stringify(kpiData)}

      [핵심 결과(KR) 현황]
      ${JSON.stringify(krData)}

      [업무 부하량]
      ${JSON.stringify(workloadData)}

      분석 포인트:
      1. 현재 목표 달성 가능성 예측
      2. 가장 리스크가 큰 KR 식별 및 원인 추정
      3. 리소스 재배치나 우선순위 조정 제안
      
      마크다운으로 가독성 있게 작성하세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "분석 불가";
    } catch (error) {
        console.error(error);
        return getMockKPIAnalysis();
    }
};

// 6. Recommend Learning Resources
export const recommendLearningResources = async (topic: string): Promise<any[]> => {
    const mockResources = [
        { title: `[데모] ${topic} 정복하기`, type: 'Article', author: 'HBR Korea', description: '최신 리더십 트렌드와 적용 사례', tags: [topic, '트렌드'] },
        { title: `[데모] 성과를 내는 리더의 ${topic}`, type: 'Book', author: 'Simon Sinek', description: '위대한 리더들이 실천하는 원칙', tags: [topic, '추천도서'] },
        { title: `[데모] 10분만에 배우는 ${topic}`, type: 'Video', author: 'TED Talk', description: '짧지만 강력한 인사이트 영상', tags: [topic, '영상'] }
    ];

    if (!ai) return mockResources;

    const prompt = `
      리더십 주제 '${topic}'와 관련된 추천 학습 콘텐츠(책, 아티클, 영상 등) 3개를 추천해주세요.
      JSON 형식으로 반환하세요.

      Schema:
      Array<{
        title: string;
        type: 'Book' | 'Article' | 'Video' | 'Course';
        author: string;
        description: string;
        tags: string[];
      }>
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error(error);
        return mockResources;
    }
};

// 7. Recommend Personalized Content
export const recommendPersonalizedContent = async (members: TeamMember[]): Promise<any[]> => {
    const mockContent = [
        { title: "[데모] 팀원들의 마음을 여는 대화법", type: 'Book', author: '오은영', description: '상처주지 않고 성장시키는 관계의 기술', tags: ['소통', '심리학'] },
        { title: "[데모] 번아웃 예방을 위한 팀 관리", type: 'Article', author: 'McKinsey', description: '지속 가능한 성과를 위한 조직 문화 가이드', tags: ['웰빙', '문화'] },
        { title: "[데모] 데이터 기반 성과 관리 (Data-Driven)", type: 'Course', author: 'Udemy', description: '객관적인 지표로 팀을 리딩하는 방법', tags: ['데이터', '성과'] }
    ];

    if (!ai) return mockContent;

    const prompt = `
      현재 팀원들의 상태를 기반으로 리더에게 가장 필요한 학습 콘텐츠 3개를 추천해주세요.
      
      [팀원 현황 요약]
      - 총 인원: ${members.length}
      - 평균 행복도: ${members.reduce((acc, m) => acc + m.happinessScore, 0) / members.length}
      - 주요 이슈: ${members.flatMap(m => m.areasForImprovement).slice(0, 5).join(', ')}

      JSON 형식으로 반환하세요.
      
      Schema:
      Array<{
        title: string;
        type: 'Book' | 'Article' | 'Video' | 'Course';
        author: string;
        description: string;
        tags: string[];
      }>
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error(error);
        return mockContent;
    }
};

// 8. Generate Skill Coaching Questions
export const generateSkillCoachingQuestions = async (member: TeamMember, weakSkillsData: any[]): Promise<string[]> => {
    const mockQuestions = [
        `[데모] ${member.name}님은 ${weakSkillsData[0]?.skill || '해당 역량'}을 향상시키기 위해 평소 어떤 노력을 하고 계신가요?`,
        `[데모] 업무를 수행하면서 ${weakSkillsData[0]?.skill || '역량'} 부족으로 어려움을 겪었던 구체적인 상황이 있었나요?`,
        `[데모] 제가 어떤 지원을 해드리면 3개월 내에 이 역량을 '보통' 수준으로 올릴 수 있을까요?`
    ];

    if (!ai) return mockQuestions;

    const prompt = `
      '${member.name}' 팀원의 역량 갭(Gap)을 해소하기 위한 1:1 코칭 질문 3가지를 생성해주세요.
      
      [부족한 역량]
      ${JSON.stringify(weakSkillsData)}
      
      질문은 팀원이 스스로 생각하게 만드는 '열린 질문'이어야 합니다.
      JSON 배열 형태로 반환하세요. 예: ["질문1", "질문2", "질문3"]
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error(error);
        return mockQuestions;
    }
};

// 9. Suggest Task Assignment
export const suggestTaskAssignment = async (member: TeamMember, taskTitle: string, taskDescription: string): Promise<TaskAssignmentAdvice> => {
    const mockAdvice: TaskAssignmentAdvice = {
        summary: `[데모] ${member.name}님의 현재 업무 부하를 고려할 때 적절한 할당입니다.`,
        suggestedDueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        riskAnalysis: "[데모] 다만 현재 진행 중인 프로젝트 마감과 겹칠 수 있으니 일정 조율이 필요합니다.",
        brainScienceStrategy: {
            dlpfc_goal: `[데모] "이 업무는 우리 팀의 Q4 목표인 '자동화율 30% 달성'의 핵심 퍼즐입니다."`,
            ofc_value: `[데모] "이것을 완료하면 ${member.name}님의 포트폴리오에 큰 강점이 될 것입니다."`,
            nacc_reward: `[데모] "성공적으로 마치면 다음 주간 회의 때 베스트 사례로 공유하겠습니다."`
        }
    };

    if (!ai) return mockAdvice;

    const prompt = `
      당신은 업무 할당 최적화 AI입니다.
      '${member.name}' 팀원에게 '${taskTitle}' 업무를 할당하려 합니다.
      
      [팀원 특성]
      - 강점: ${member.strengths.join(', ')}
      - 현재 업무 부하: ${member.tasks.filter(t => t.status !== 'Done').length}개 진행 중

      [할당할 업무]
      - 제목: ${taskTitle}
      - 내용: ${taskDescription}

      다음 항목을 포함하여 JSON으로 응답하세요:
      1. summary: 할당 적합성 요약 (한 문장)
      2. suggestedDueDate: 추천 마감일 (YYYY-MM-DD 형식, 오늘(${new Date().toISOString().split('T')[0]}) 기준 작업량 고려)
      3. riskAnalysis: 예상되는 리스크 및 해결 방안
      4. brainScienceStrategy: 뇌과학 기반 동기부여 전략
         - dlpfc_goal: 전두엽(DLPFC)을 자극하는 목표 설정 멘트
         - ofc_value: 안와전두피질(OFC)을 자극하는 업무 가치 부여 멘트
         - nacc_reward: 측좌핵(NAcc)을 자극하는 보상/인정 멘트
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error(error);
        return mockAdvice;
    }
};

// 10. Generate OneOnOne Questions
export const generateOneOnOneQuestions = async (member: TeamMember): Promise<string[]> => {
    const mockQuestions = [
        `[데모] 요즘 업무량은 어떠신가요? 번아웃이 오지 않게 제가 도울 점이 있을까요?`,
        `[데모] 최근 ${member.name}님이 가장 성취감을 느꼈던 순간은 언제인가요?`,
        `[데모] 6개월 뒤에 어떤 모습으로 성장해 있기를 기대하시나요?`,
        `[데모] 우리 팀의 일하는 방식 중 개선했으면 하는 점이 있다면 솔직하게 말씀해주세요.`,
        `[데모] 현재 진행 중인 프로젝트에서 가장 큰 장애물(Blocker)은 무엇인가요?`
    ];

    if (!ai) return mockQuestions;

    const prompt = `
      '${member.name}' 팀원과의 1on1 미팅을 위한 맞춤형 질문 5가지를 생성해주세요.
      
      [상태]
      - 성과: ${member.performanceScore}
      - 행복도: ${member.happinessScore}
      - 최근 이슈: ${member.areasForImprovement.join(', ')}
      
      라포 형성, 성장, 업무 장애물 제거, 피드백 등 다양한 카테고리를 포함하세요.
      JSON 배열로 반환하세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error(error);
        return mockQuestions;
    }
};

// 11. Analyze Leader Coaching
export const analyzeLeaderCoaching = async (feedbacks: LeaderFeedback[]): Promise<string> => {
    if (!ai) return getMockLeaderCoaching();

    const prompt = `
      팀원들이 리더에게 보낸 익명 피드백을 분석하여 리더십 인사이트를 제공하세요.

      [피드백 데이터]
      ${JSON.stringify(feedbacks.map(f => ({ scores: f.scores, comment: f.comment })))}

      분석 결과에는 다음이 포함되어야 합니다 (마크다운):
      1. 리더십 스타일 진단 (강점/약점)
      2. 팀원들이 진정으로 원하는 것 (숨겨진 니즈)
      3. Dream Leader가 되기 위한 구체적인 Action Plan 3가지

      긍정적이고 건설적인 톤으로 작성하세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text || "분석 실패";
    } catch (error) {
        console.error(error);
        return getMockLeaderCoaching();
    }
};

// 12. 1on1 Simulation (Persona)
export const simulateMemberResponse = async (
  member: TeamMember,
  topic: string,
  history: SimulationMessage[],
  stage: string
): Promise<string> => {
  if (!ai) {
      // Mock Responses based on stage
      if (stage.includes('Check-in')) return `[데모/가상] 네 팀장님! 요즘 ${member.status === 'Warning' ? '좀 바쁘긴 하지만' : '컨디션 좋습니다.'} 괜찮습니다. 팀장님은 어떠세요?`;
      if (stage.includes('GROW')) return `[데모/가상] 음.. 사실 ${topic} 관련해서 고민이 좀 있습니다. 제가 생각한 방향은 A인데, 리소스가 부족할 것 같아서 걱정이에요.`;
      return `[데모/가상] 네, 오늘 이야기 나눠서 마음이 한결 편해졌습니다. 말씀하신 대로 다음 주까지 초안 작성해서 공유드리겠습니다. 감사합니다!`;
  }

  const conversationHistory = history.map(h => 
    `${h.role === 'leader' ? '팀장(나)' : `팀원(${member.name})`}: ${h.text}`
  ).join('\n');

  const persona = `
    당신은 '${member.name}'이라는 팀원입니다. 지금부터 팀장과 1on1 미팅을 진행합니다.
    [프로필] ... (생략)
  `;
  // ... rest of prompt

  const prompt = `
    ${persona}
    [대화 기록]
    ${conversationHistory}
    팀장(사용자)의 마지막 말에 이어지는 '${member.name}'의 답변을 작성하세요:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.8 }
    });
    return response.text || "...";
  } catch (error) {
    console.error("Simulation Error:", error);
    return "[데모] (연결 상태가 좋지 않아 가상 응답을 보냅니다) 네, 알겠습니다.";
  }
};
