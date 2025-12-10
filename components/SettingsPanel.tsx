
import React, { useState, useEffect } from 'react';
import { Save, Key, RefreshCw, Trash2, CheckCircle2, ShieldAlert, Code2, FileJson, Terminal, Copy, Check } from 'lucide-react';
import { ai } from '../services/geminiService';

export const SettingsPanel: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasEnvKey, setHasEnvKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'General' | 'Deployment'>('General');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) {
        setApiKey(localKey);
    }
    
    // Check if env key exists
    try {
        if (process.env.API_KEY) setHasEnvKey(true);
    } catch(e) {}

  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    setIsSaved(true);
    setTimeout(() => {
        window.location.reload(); // Reload to apply new key to singleton
    }, 1000);
  };

  const handleClear = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    setIsSaved(false);
    setTimeout(() => {
        window.location.reload();
    }, 500);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const packageJsonContent = `{
  "name": "leadership-lens",
  "private": true,
  "version": "1.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^0.1.1",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.10.3",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}`;

  const viteConfigContent = `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});`;

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8">
       <header className="mb-6 border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <Key className="w-7 h-7 mr-3 text-indigo-600" />
          환경 설정 (Settings)
        </h2>
        <p className="text-slate-500 mt-2">
          애플리케이션 설정 및 배포 가이드를 확인하세요.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
            onClick={() => setActiveTab('General')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                activeTab === 'General' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
            일반 설정 (API Key)
        </button>
        <button
            onClick={() => setActiveTab('Deployment')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center ${
                activeTab === 'Deployment' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
        >
            <Code2 className="w-4 h-4 mr-2" /> 개발 및 배포 가이드
        </button>
      </div>

      {activeTab === 'General' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center">
                        <ShieldAlert className="w-5 h-5 mr-2 text-indigo-600" />
                        Gemini API Key 설정
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Google AI Studio에서 발급받은 API Key를 입력하세요. 입력된 키는 브라우저(로컬)에만 저장됩니다.
                    </p>
                </div>
                
                <div className="p-6 space-y-6">
                    {hasEnvKey && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center text-emerald-800 text-sm font-medium">
                            <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-600" />
                            시스템 환경 변수(ENV)에 API Key가 이미 설정되어 있습니다. (우선 순위: LocalStorage {'>'} Env)
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">API Key 입력</label>
                        <input 
                            type="password" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="text-xs text-slate-400">
                            * 키를 변경하면 페이지가 자동으로 새로고침됩니다.
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={handleClear}
                                className="px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center text-sm font-bold"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> 초기화
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={!apiKey.trim() && !isSaved}
                                className={`px-6 py-2 rounded-lg text-white font-bold transition-all flex items-center shadow-md ${
                                    isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {isSaved ? (
                                    <><CheckCircle2 className="w-4 h-4 mr-2" /> 저장됨 (재로딩 중...)</>
                                ) : (
                                    <><Save className="w-4 h-4 mr-2" /> 저장 및 적용</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-lg text-slate-800 mb-4">애플리케이션 정보</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="block text-slate-400 text-xs font-bold uppercase mb-1">Version</span>
                        <span className="font-mono text-slate-700">v1.2.0 (Leadership Lens)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <span className="block text-slate-400 text-xs font-bold uppercase mb-1">AI Model</span>
                        <span className="font-mono text-slate-700">gemini-2.5-flash</span>
                    </div>
                </div>
            </div>
          </div>
      )}

      {activeTab === 'Deployment' && (
          <div className="space-y-6 animate-fade-in">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center">
                      <Terminal className="w-5 h-5 mr-2" />
                      내 PC(로컬)로 프로젝트 가져오기
                  </h3>
                  <p className="text-sm text-blue-800 mb-4 leading-relaxed">
                      현재 이 코드는 <strong>클라우드 상의 임시 공간</strong>에 있습니다. 
                      Github이나 Vercel에 배포하려면 아래 파일들을 <strong>팀장님의 PC에 직접 생성</strong>해야 합니다.
                  </p>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1 bg-white/50 p-4 rounded-lg">
                      <li>바탕화면에 <strong>leadership-dashboard</strong> 폴더 생성</li>
                      <li>VS Code로 해당 폴더 열기</li>
                      <li>아래의 <strong>package.json</strong>과 <strong>vite.config.ts</strong> 파일 생성 후 내용 붙여넣기</li>
                      <li>나머지 소스 코드(`src/` 내부)들도 복사하여 저장</li>
                      <li>터미널에서 <code>npm install</code> 실행 후 <code>npm run dev</code>로 실행</li>
                  </ol>
              </div>

              {/* package.json Viewer */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-sm flex items-center font-mono">
                          <FileJson className="w-4 h-4 mr-2 text-amber-500" /> package.json
                      </h4>
                      <button 
                        onClick={() => copyToClipboard(packageJsonContent, 'pkg')}
                        className="text-xs flex items-center text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                      >
                          {copiedField === 'pkg' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          {copiedField === 'pkg' ? '복사됨' : '복사하기'}
                      </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto custom-scrollbar">
                      {packageJsonContent}
                  </pre>
              </div>

              {/* vite.config.ts Viewer */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="font-bold text-slate-700 text-sm flex items-center font-mono">
                          <Code2 className="w-4 h-4 mr-2 text-blue-500" /> vite.config.ts
                      </h4>
                      <button 
                        onClick={() => copyToClipboard(viteConfigContent, 'vite')}
                        className="text-xs flex items-center text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                      >
                          {copiedField === 'vite' ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                          {copiedField === 'vite' ? '복사됨' : '복사하기'}
                      </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto custom-scrollbar">
                      {viteConfigContent}
                  </pre>
              </div>
          </div>
      )}
    </div>
  );
};
