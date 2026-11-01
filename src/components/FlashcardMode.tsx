import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, RotateCw, ChevronLeft, ChevronRight, Shuffle, Play, Pause, Sparkles, Mic } from 'lucide-react';
import { PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech } from '../utils/audioSpeech';

interface Props {
  phrases: PhraseItem[];
  speechRate: number;
  onOpenPractice: (phrase: PhraseItem) => void;
}

export const FlashcardMode: React.FC<Props> = ({ phrases, speechRate, onOpenPractice }) => {
  const [deck, setDeck] = useState<PhraseItem[]>(phrases);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    setDeck(phrases);
    setCurrentIndex(0);
  }, [phrases]);

  const currentPhrase = deck[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % deck.length);
  }, [deck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + deck.length) % deck.length);
  }, [deck.length]);

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handlePlayAudio = (e?: React.MouseEvent, slow = false) => {
    e?.stopPropagation();
    if (currentPhrase) {
      playEnglishSpeech(currentPhrase.english, {
        rate: slow ? 0.75 : speechRate
      });
    }
  };

  // Auto-play slideshow timer
  useEffect(() => {
    let timer: any;
    if (isAutoPlaying) {
      // Speak audio when entering card
      handlePlayAudio(undefined, false);

      timer = setInterval(() => {
        handleNext();
      }, 5500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!currentPhrase) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Deck Navigation & Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">
            Thẻ {currentIndex + 1} / {deck.length}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
            {currentPhrase.category}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              isAutoPlaying
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Tạm dừng chiếu' : 'Tự động chạy'}</span>
          </button>

          <button
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            title="Trộn ngẫu nhiên câu"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Trộn thẻ</span>
          </button>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="group relative w-full min-h-[480px] cursor-pointer perspective-1000 select-none"
      >
        <div
          className={`w-full h-full min-h-[480px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-xl border border-slate-200/80 bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE (English + Visual + Phonetic) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden flex flex-col justify-between bg-white">
            {/* Top Image Banner */}
            <div className="relative h-64 w-full bg-slate-100">
              <img
                src={currentPhrase.image}
                alt={currentPhrase.english}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-extrabold text-slate-900 shadow-xs">
                Mẫu câu #{currentPhrase.id}
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={(e) => handlePlayAudio(e, false)}
                  className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                  title="Nghe phát âm chuẩn"
                  aria-label="Nghe câu"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => handlePlayAudio(e, true)}
                  className="px-3 py-2 rounded-full bg-amber-500 text-white text-xs font-bold shadow-md hover:bg-amber-600 transition-all"
                  title="Nghe tốc độ chậm"
                >
                  0.75x
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-6">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {currentPhrase.english}
                </h2>
                <div className="text-base font-mono text-sky-200 font-medium mt-1 drop-shadow-xs">
                  {currentPhrase.phonetic}
                </div>
              </div>
            </div>

            {/* Bottom info on Front */}
            <div className="p-6 flex-1 flex flex-col justify-between bg-linear-to-b from-white to-slate-50/50">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold bg-indigo-50/80 px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vè nhịp điệu:</span>
                  <span className="italic">"{currentPhrase.chant}"</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPractice(currentPhrase);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-amber-700" />
                  <span>Luyện đọc mic</span>
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                <RotateCw className="w-4 h-4 animate-spin-slow" />
                <span>Bấm vào thẻ hoặc phím Space để lật xem nghĩa Tiếng Việt & Phân tích</span>
              </div>
            </div>
          </div>

          {/* BACK FACE (Vietnamese + TPR + Breakdown + Dialogue) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 md:p-8 flex flex-col justify-between bg-linear-to-br from-indigo-50/60 via-white to-sky-50/60 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {currentPhrase.id}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Bản dịch & Hướng dẫn sư phạm
                  </span>
                </div>
                <button
                  onClick={(e) => handlePlayAudio(e, false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Nghe lại
                </button>
              </div>

              {/* Vietnamese Heading */}
              <div className="mt-4">
                <div className="text-xs text-slate-500 font-medium">Ý nghĩa tiếng Việt:</div>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {currentPhrase.vietnamese}
                </h3>
              </div>

              {/* Context */}
              <div className="mt-3 p-3 bg-white/80 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                <span className="font-bold text-slate-900">Tình huống áp dụng:</span> {currentPhrase.contextVi}
              </div>

              {/* TPR Gesture */}
              <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-950">
                <span className="font-bold text-emerald-900 block mb-1">
                  Động tác tương tác trực quan (TPR):
                </span>
                {currentPhrase.tprGesture}
              </div>

              {/* Dialogue */}
              <div className="mt-3 p-3 bg-sky-50 rounded-xl border border-sky-200/80 text-xs text-sky-950 space-y-1">
                <div className="font-bold text-sky-900">Hội thoại thực tế trong lớp:</div>
                <div>
                  <span className="font-semibold text-indigo-700">Cô:</span> "{currentPhrase.dialogue.teacher}" ({currentPhrase.dialogue.teacherVi})
                </div>
                <div>
                  <span className="font-semibold text-emerald-700">Trò:</span> "{currentPhrase.dialogue.students}" ({currentPhrase.dialogue.studentsVi})
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400">
              <span>Bấm lần nữa để lật lại mặt Tiếng Anh</span>
              <span className="font-semibold text-indigo-600">TH Lê Kim Lăng · Tháng 11</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination & Next/Prev Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Câu trước</span>
        </button>

        {/* 10 Dots / Numeric Indicator */}
        <div className="flex items-center gap-1.5">
          {deck.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(idx);
              }}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                currentIndex === idx
                  ? 'bg-indigo-600 text-white shadow-xs scale-110'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.id}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-95 transition-all shadow-xs"
        >
          <span>Câu tiếp theo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
