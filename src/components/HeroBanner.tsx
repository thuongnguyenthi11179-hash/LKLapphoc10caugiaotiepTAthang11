import React, { useState } from 'react';
import { Sparkles, ArrowRight, Camera, Check, UserPlus } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';
import { TeacherRecord } from '../data/teacherStorage';

interface Props {
  onStartPractice: () => void;
  onOpenAILesson: () => void;
  activeTeacher: TeacherRecord;
  onSaveTeacherName: (name: string, role?: string) => void;
}

export const HeroBanner: React.FC<Props> = ({
  onStartPractice,
  onOpenAILesson,
  activeTeacher,
  onSaveTeacherName,
}) => {
  const [teacherInput, setTeacherInput] = useState('');
  const [roleInput, setRoleInput] = useState(activeTeacher.role || 'Giáo viên Tổ Ngoại ngữ');
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [bgTheme, setBgTheme] = useState<number>(0);

  const backgroundStyles = [
    'from-sky-50/90 via-teal-50/40 to-cyan-50/60',
    'from-emerald-50/90 via-teal-50/40 to-sky-50/60',
    'from-indigo-50/80 via-white to-teal-50/60'
  ];

  const handleSaveName = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!teacherInput.trim()) return;
    onSaveTeacherName(teacherInput.trim(), roleInput);
    setTeacherInput('');
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3500);
  };

  const cycleBackground = () => {
    setBgTheme(prev => (prev + 1) % backgroundStyles.length);
  };

  return (
    <section className={`relative rounded-3xl p-6 sm:p-10 border border-teal-100 shadow-sm overflow-hidden bg-linear-to-br ${backgroundStyles[bgTheme]} transition-colors duration-500`}>
      {/* Background Watermark / School seal subtle overlay */}
      <div className="absolute right-[-40px] bottom-[-40px] opacity-5 pointer-events-none select-none">
        <SchoolLogo size={420} className="w-[420px] h-[420px]" />
      </div>

      {/* Top Bar inside Banner: Change Background Button */}
      <div className="flex items-center justify-between mb-4">
        {/* School Branding Pill Badge (Exact match to screenshot) */}
        <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-full border border-teal-300 shadow-2xs">
          <SchoolLogo size={36} className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
          <div className="leading-tight text-left">
            <div className="text-[10px] font-black uppercase tracking-wider text-rose-600">
              ỦY BAN NHÂN DÂN PHƯỜNG HÒA XUÂN
            </div>
            <div className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-tight">
              TRƯỜNG TIỂU HỌC LÊ KIM LĂNG
            </div>
          </div>
        </div>

        {/* Change background button */}
        <button
          onClick={cycleBackground}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold rounded-full border border-slate-200/80 shadow-2xs transition-colors"
          title="Đổi màu nền"
        >
          <Camera className="w-3.5 h-3.5 text-teal-600" />
          <span>Đổi ảnh nền</span>
        </button>
      </div>

      {/* Secondary Pill Tag: Classroom language for Le Kim Lang's teacher */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 rounded-full border border-rose-200 text-rose-600 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Classroom language for Le Kim Lang's teacher</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Headline, Description & Actions */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-orange-600 uppercase tracking-tight leading-tight">
            10 CLASSROOM LANGUAGE SENTENCES FOR TEACHERS IN NOVEMBER
          </h1>

          <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            “Learn – Practice – Speak – Shine!”
          </div>

          <p className="text-teal-800 font-semibold text-sm sm:text-base leading-relaxed">
            Chào mừng tất cả giáo viên cùng chinh phục 10 mẫu câu giao tiếp Tiếng Anh trong tháng 11 qua 4 kỹ năng nghe-nói-đọc-viết!
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAILesson}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI TẠO BÀI DẠY</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase">
                MỚI
              </span>
            </button>

            <button
              onClick={onStartPractice}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-teal-900 hover:bg-teal-950 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <span>BẮT ĐẦU LUYỆN TẬP</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Teacher Name Input Form (Auto-syncs to Cloud Teacher Dashboard) */}
          <div className="pt-3">
            <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={teacherInput}
                  onChange={(e) => setTeacherInput(e.target.value)}
                  placeholder={activeTeacher.name ? `Đang học: ${activeTeacher.name} (Nhập tên mới...)` : "Nhập họ và tên giáo viên..."}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-teal-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs font-semibold"
                />
              </div>

              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="px-3 py-2.5 bg-white rounded-xl border border-teal-200 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs shrink-0"
              >
                <option value="Giáo viên Tổ Ngoại ngữ">Tổ Ngoại ngữ</option>
                <option value="Giáo viên Khối 1">Giáo viên Khối 1</option>
                <option value="Giáo viên Khối 2">Giáo viên Khối 2</option>
                <option value="Giáo viên Khối 3">Giáo viên Khối 3</option>
                <option value="Giáo viên Khối 4">Giáo viên Khối 4</option>
                <option value="Giáo viên Khối 5">Giáo viên Khối 5</option>
                <option value="Giáo viên Tin học - Thể chất - Mỹ thuật">Tổ Bộ Môn</option>
                <option value="Ban Giám Hiệu">Ban Giám Hiệu</option>
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 font-bold text-xs sm:text-sm shadow-2xs transition-colors shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>Vào học & Lưu tên</span>
              </button>
            </form>

            {showSavedNotification && (
              <div className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu tên giáo viên và đồng bộ trực tuyến lên Teacher Dashboard toàn trường!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teacher Avatar & Speech Bubble (As in screenshot) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center justify-center gap-5">
          {/* Circular Teacher Mascot */}
          <div className="relative">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-linear-to-b from-amber-100 to-amber-200 p-1.5 shadow-xl border-4 border-white flex items-center justify-center overflow-hidden">
              {/* Cute Stylized Teacher Illustration with glasses & hair bun */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background light gradient */}
                <circle cx="50" cy="50" r="48" fill="#FEF3C7" />
                {/* Hair Bun */}
                <circle cx="50" cy="20" r="12" fill="#3D2314" />
                {/* Neck & Shoulders / Suit */}
                <path d="M 22 96 C 22 75, 40 70, 50 70 C 60 70, 78 75, 78 96 Z" fill="#0D9488" />
                {/* Shirt Collar */}
                <path d="M 44 70 L 50 82 L 56 70 Z" fill="#FFFFFF" />
                <path d="M 50 82 L 50 96" stroke="#F59E0B" strokeWidth="2" />
                {/* Hair Back */}
                <circle cx="50" cy="46" r="28" fill="#3D2314" />
                {/* Face */}
                <circle cx="50" cy="48" r="22" fill="#FDDCB5" />
                {/* Hair Front Bangs */}
                <path d="M 28 44 C 36 32, 64 32, 72 44 C 64 36, 36 36, 28 44 Z" fill="#3D2314" />
                {/* Purple Glasses */}
                <rect x="33" y="44" width="14" height="10" rx="3" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                <rect x="53" y="44" width="14" height="10" rx="3" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
                <line x1="47" y1="49" x2="53" y2="49" stroke="#7C3AED" strokeWidth="2.5" />
                {/* Eyes behind glasses */}
                <circle cx="40" cy="49" r="2" fill="#1E293B" />
                <circle cx="60" cy="49" r="2" fill="#1E293B" />
                {/* Smile */}
                <path d="M 43 58 Q 50 64 57 58" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
                {/* Cheeks blush */}
                <circle cx="35" cy="56" r="3" fill="#FB7185" opacity="0.4" />
                <circle cx="65" cy="56" r="3" fill="#FB7185" opacity="0.4" />
              </svg>
            </div>

            {/* AI badge */}
            <div className="absolute bottom-1 right-2 w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-md border-2 border-white">
              AI
            </div>
          </div>

          {/* Welcome Speech Bubble */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-100 max-w-xs relative text-left">
            <div className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase mb-1.5">
              👋 Welcome!
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
              Hello Teachers! Ready to practice today?
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Chúc quý thầy cô luyện tập thật vui và hiệu quả!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
