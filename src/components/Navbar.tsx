import React from 'react';
import { 
  Home, 
  Sparkles, 
  Headphones, 
  Mic, 
  BookOpen, 
  PenTool, 
  Gamepad2, 
  Trophy, 
  GraduationCap,
  Star,
  UserCheck,
  Settings,
  KeyRound
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { TeacherRecord } from '../data/teacherStorage';

export type AppTab = 
  | 'home' 
  | 'ai-lesson' 
  | 'listen' 
  | 'speak' 
  | 'read' 
  | 'write' 
  | 'practice' 
  | 'progress' 
  | 'teacher';

interface Props {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  activeTeacher: TeacherRecord;
  stars: number;
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  activeTeacher,
  stars,
  onOpenApiKeyModal,
  hasApiKey
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200/90 sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: School Logo & Title */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <SchoolLogo size={46} className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-xs" />
          <div className="leading-tight">
            <div className="text-xs sm:text-sm font-black tracking-tight text-teal-700 uppercase">
              10 CLASSROOM LANGUAGE SENTENCES
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
              For Teachers in November · TH Lê Kim Lăng
            </div>
          </div>
        </div>

        {/* Middle: Rounded Pill Navigation Menu */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-teal-600" />
            <span>Trang chủ</span>
          </button>

          <button
            onClick={() => onSelectTab('ai-lesson')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ai-lesson'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Tạo Bài Dạy</span>
          </button>

          <button
            onClick={() => onSelectTab('listen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'listen'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-blue-600" />
            <span>Listen</span>
          </button>

          <button
            onClick={() => onSelectTab('speak')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'speak'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-600" />
            <span>Speak</span>
          </button>

          <button
            onClick={() => onSelectTab('read')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'read'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Read</span>
          </button>

          <button
            onClick={() => onSelectTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'write'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-purple-600" />
            <span>Write</span>
          </button>

          <button
            onClick={() => onSelectTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'practice'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Practice</span>
          </button>

          <button
            onClick={() => onSelectTab('progress')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'progress'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>My Progress</span>
          </button>

          <button
            onClick={() => onSelectTab('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
            <span>Teacher</span>
          </button>
        </nav>

        {/* Right: Settings (API Key), Star Score Badge & Teacher Profile Card */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Settings (API Key) Button with Red Subtext */}
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-rose-50/90 hover:bg-rose-100 rounded-2xl border border-rose-200 transition-all text-left cursor-pointer shadow-2xs"
            title="Thiết lập Model AI & Gemini API Key"
          >
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              hasApiKey ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white animate-pulse'
            }`}>
              <Settings className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                <span>Settings (API Key)</span>
                {hasApiKey && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Đã lưu API Key" />
                )}
              </div>
              <div className="text-[10px] font-bold text-rose-600 whitespace-nowrap">
                Lấy API key để sử dụng app
              </div>
            </div>
          </button>

          {/* Star score */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200 text-amber-800 shadow-2xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-xs sm:text-sm font-black tabular-nums">{stars}</span>
          </div>

          {/* Teacher Badge */}
          <button
            onClick={() => onSelectTab('teacher')}
            className="flex items-center gap-2 px-3 py-1 bg-emerald-50/80 hover:bg-emerald-100/90 rounded-2xl border border-emerald-200/90 transition-all text-left group"
            title="Mở Teacher Dashboard"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              👩‍🏫
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[11px] font-extrabold text-slate-800 group-hover:text-teal-700 transition-colors max-w-[130px] truncate">
                {activeTeacher.name || 'Giáo viên'}
              </div>
              <div className="text-[10px] text-teal-700 font-semibold max-w-[130px] truncate">
                {activeTeacher.role || 'Tổ Ngoại ngữ'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Scrollable Sub-bar */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-3 py-2 bg-slate-50 border-t border-slate-200/60 no-scrollbar">
        {[
          { id: 'home', label: 'Trang chủ', icon: Home },
          { id: 'ai-lesson', label: 'AI Bài Dạy', icon: Sparkles },
          { id: 'listen', label: 'Listen', icon: Headphones },
          { id: 'speak', label: 'Speak', icon: Mic },
          { id: 'read', label: 'Read', icon: BookOpen },
          { id: 'write', label: 'Write', icon: PenTool },
          { id: 'practice', label: 'Practice', icon: Gamepad2 },
          { id: 'progress', label: 'Tiến độ', icon: Trophy },
          { id: 'teacher', label: 'Teacher', icon: GraduationCap },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as AppTab)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
