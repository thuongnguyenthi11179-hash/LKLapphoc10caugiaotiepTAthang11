import React, { useState, useEffect } from 'react';
import { Volume2, Maximize, Minimize, ChevronLeft, ChevronRight, Sparkles, Users, Award, Play, Pause, Music } from 'lucide-react';
import { PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech } from '../utils/audioSpeech';
import { startChantMetronome, stopChantMetronome } from '../utils/soundEffects';

interface Props {
  phrases: PhraseItem[];
  speechRate: number;
}

export const SmartboardMode: React.FC<Props> = ({ phrases, speechRate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlayingChant, setIsPlayingChant] = useState(false);

  const current = phrases[currentIndex];

  useEffect(() => {
    return () => {
      stopChantMetronome();
    };
  }, []);

  const toggleSmartboardChantBeat = () => {
    if (isPlayingChant) {
      stopChantMetronome();
      setIsPlayingChant(false);
    } else {
      setIsPlayingChant(true);
      startChantMetronome(105);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handlePlayVoice = (slow = false) => {
    if (current) {
      playEnglishSpeech(current.english, {
        rate: slow ? 0.75 : speechRate
      });
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % phrases.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + phrases.length) % phrases.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Enter' || e.key === ' ') handlePlayVoice(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, speechRate]);

  if (!current) return null;

  return (
    <div className="w-full bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Smartboard Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-lg">
            {current.id}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Bảng Tương Tác Lớp Học · Smartboard TH Lê Kim Lăng
            </div>
            <div className="text-base font-bold text-slate-200">
              10 Câu Giao Tiếp Tiếng Anh Tháng 11
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handlePlayVoice(false)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 active:scale-95 transition-all shadow-md"
          >
            <Volume2 className="w-4 h-4" />
            <span>Phát âm chuẩn</span>
          </button>

          <button
            onClick={() => handlePlayVoice(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
          >
            <span>Chậm 0.75x</span>
          </button>

          <button
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Bật/Tắt toàn màn hình"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Classroom Projection View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Huge English Sentence & Meaning */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-block px-3 py-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            {current.category} · Cụm câu #{current.id}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {current.english}
          </h1>

          <div className="text-xl md:text-2xl font-mono text-cyan-300">
            {current.phonetic}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-xs text-slate-400 uppercase font-semibold">Nghĩa Tiếng Việt:</div>
            <div className="text-2xl md:text-3xl font-bold text-amber-300 mt-1">
              {current.vietnamese}
            </div>
          </div>

          {/* Call & Response for Whole Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                <Users className="w-3.5 h-3.5" /> Cô giáo hô:
              </div>
              <div className="text-sm font-semibold text-white italic">
                "{current.dialogue.teacher}"
              </div>
              <div className="text-xs text-indigo-200/80 mt-1">
                {current.dialogue.teacherVi}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                <Award className="w-3.5 h-3.5" /> Cả lớp đồng thanh:
              </div>
              <div className="text-sm font-semibold text-white italic">
                "{current.dialogue.students}"
              </div>
              <div className="text-xs text-emerald-200/80 mt-1">
                {current.dialogue.studentsVi}
              </div>
            </div>
          </div>
        </div>

        {/* Right: High-Res Illustration & TPR instructions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 aspect-4/3 shadow-xl">
            <img
              src={current.image}
              alt={current.english}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 right-4">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Động tác cử chỉ TPR:
              </div>
              <div className="text-xs text-white/90 font-medium mt-0.5">
                {current.tprGesture}
              </div>
            </div>
          </div>

          {/* Rhythmic Chant Banner */}
          <div className="p-3.5 rounded-xl bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-amber-300 block">
                Nhịp điệu vỗ tay đồng thanh cả lớp (Clapping Chant):
              </span>
              <button
                type="button"
                onClick={toggleSmartboardChantBeat}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isPlayingChant
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>{isPlayingChant ? 'Dừng nhịp' : 'Bật nhịp vỗ tay 2/4'}</span>
              </button>
            </div>
            <span className="text-sm font-semibold italic text-white block">
              "{current.chant}"
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Footer for Teachers */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={handlePrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        {/* 10 Sentence Quick Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {phrases.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                currentIndex === idx
                  ? 'bg-indigo-500 text-white shadow-lg scale-110'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-500 transition-colors"
        >
          <span>Câu tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
