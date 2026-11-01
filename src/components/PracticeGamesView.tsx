import React, { useState, useEffect, useCallback } from 'react';
import { 
  Gamepad2, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Shuffle, 
  Trophy, 
  Dices, 
  ArrowRight,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CLASSROOM_PHRASES, PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech } from '../utils/audioSpeech';
import { playSuccessSound, playErrorSound, playTickSound } from '../utils/soundEffects';

interface Props {
  onEarnStars?: (earned: number) => void;
  onCompletePractice?: () => void;
}

interface MemoryCard {
  uid: string;
  phraseId: number;
  text: string;
  lang: 'en' | 'vi';
  matched: boolean;
}

interface GeneratedQuestion {
  id: number;
  type: 'listen' | 'situation' | 'translate';
  targetPhrase: PhraseItem;
  prompt: string;
  options: PhraseItem[]; // Always randomly shuffled
  correctPhraseId: number;
}

export const PracticeGamesView: React.FC<Props> = ({ onEarnStars, onCompletePractice }) => {
  const [gameMode, setGameMode] = useState<'quiz' | 'scramble' | 'spinner' | 'memory'>('quiz');

  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setIsQuizFinished] = useState(false);

  // Scramble State
  const [scramblePhrase, setScramblePhrase] = useState<PhraseItem>(CLASSROOM_PHRASES[0]);
  const [scrambleAvailable, setScrambleAvailable] = useState<string[]>([]);
  const [scrambleSelected, setScrambleSelected] = useState<string[]>([]);
  const [scrambleStatus, setScrambleStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Spinner / Lucky Pick State
  const [spinning, setSpinning] = useState(false);
  const [spunPhrase, setSpunPhrase] = useState<PhraseItem | null>(null);

  // Memory Match Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState<number>(0);
  const [memoryWon, setMemoryWon] = useState<boolean>(false);

  // Helper: Fisher-Yates array shuffle
  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Generate 10 dynamic questions with 100% RANDOMIZED choices
  const generateRandomQuestions = useCallback(() => {
    const shuffledPhrases = shuffleArray(CLASSROOM_PHRASES);

    const generated: GeneratedQuestion[] = shuffledPhrases.map((phrase, idx) => {
      // Pick 3 random distractors from other phrases
      const others = CLASSROOM_PHRASES.filter(p => p.id !== phrase.id);
      const distractors = shuffleArray(others).slice(0, 3);
      
      // Combine target + 3 distractors and shuffle choices randomly!
      const randomOptions = shuffleArray([phrase, ...distractors]);

      const type = idx % 2 === 0 ? 'listen' : 'situation';
      const prompt = type === 'listen'
        ? `Nghe đoạn phát âm và chọn mẫu câu tiếng Anh chính xác:`
        : `Tình huống: "${phrase.contextVi}". Cô giáo trường TH Lê Kim Lăng nên nói câu nào?`;

      return {
        id: idx + 1,
        type,
        targetPhrase: phrase,
        prompt,
        options: randomOptions,
        correctPhraseId: phrase.id
      };
    });

    setQuestions(generated);
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setIsQuizFinished(false);
  }, [shuffleArray]);

  useEffect(() => {
    generateRandomQuestions();
  }, [generateRandomQuestions]);

  const currentQ = questions[currentQIndex];

  // Auto-play speech when listen question loads
  useEffect(() => {
    if (currentQ && currentQ.type === 'listen' && !isAnswered) {
      playEnglishSpeech(currentQ.targetPhrase.english, { rate: 0.85 });
    }
  }, [currentQ, isAnswered]);

  const handleSelectOption = (chosenId: number) => {
    if (isAnswered) return;
    setSelectedOptionId(chosenId);
    setIsAnswered(true);

    if (chosenId === currentQ.correctPhraseId) {
      setScore(prev => prev + 1);
      onEarnStars?.(10);
      onCompletePractice?.();
      playSuccessSound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      playEnglishSpeech(currentQ.targetPhrase.english, { rate: 0.9 });
    } else {
      playErrorSound();
    }
  };

  // Fun helper: Pick a random answer option automatically!
  const handlePickRandomAnswer = () => {
    if (isAnswered || !currentQ) return;
    const randomIndex = Math.floor(Math.random() * currentQ.options.length);
    const chosen = currentQ.options[randomIndex];
    handleSelectOption(chosen.id);
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      setIsQuizFinished(true);
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  };

  // Scramble Game Logic
  const startRandomScramble = useCallback((target?: PhraseItem) => {
    const p = target || CLASSROOM_PHRASES[Math.floor(Math.random() * CLASSROOM_PHRASES.length)];
    setScramblePhrase(p);
    const words = p.english.replace(/[!?,.]/g, '').split(' ');
    setScrambleAvailable(shuffleArray(words));
    setScrambleSelected([]);
    setScrambleStatus('idle');
  }, [shuffleArray]);

  useEffect(() => {
    if (gameMode === 'scramble') {
      startRandomScramble();
    }
  }, [gameMode, startRandomScramble]);

  const handlePickWord = (word: string, index: number) => {
    if (scrambleStatus === 'correct') return;
    const newAvail = [...scrambleAvailable];
    newAvail.splice(index, 1);
    setScrambleAvailable(newAvail);
    setScrambleSelected(prev => [...prev, word]);
  };

  const handleDropWord = (word: string, index: number) => {
    if (scrambleStatus === 'correct') return;
    const newSel = [...scrambleSelected];
    newSel.splice(index, 1);
    setScrambleSelected(newSel);
    setScrambleAvailable(prev => [...prev, word]);
  };

  const checkScramble = () => {
    const cleanTarget = scramblePhrase.english.replace(/[!?,.]/g, '').trim().toLowerCase();
    const cleanUser = scrambleSelected.join(' ').trim().toLowerCase();

    if (cleanUser === cleanTarget) {
      setScrambleStatus('correct');
      onEarnStars?.(15);
      onCompletePractice?.();
      playSuccessSound();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      playEnglishSpeech(scramblePhrase.english, { rate: 0.85 });
    } else {
      setScrambleStatus('wrong');
      playErrorSound();
    }
  };

  // Lucky Sentence Wheel / Spinner
  const spinRandomSentence = () => {
    if (spinning) return;
    setSpinning(true);
    let counter = 0;
    const interval = setInterval(() => {
      const rand = CLASSROOM_PHRASES[Math.floor(Math.random() * CLASSROOM_PHRASES.length)];
      setSpunPhrase(rand);
      playTickSound();
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setSpinning(false);
        const finalPick = CLASSROOM_PHRASES[Math.floor(Math.random() * CLASSROOM_PHRASES.length)];
        setSpunPhrase(finalPick);
        playSuccessSound();
        playEnglishSpeech(finalPick.english, { rate: 0.9 });
      }
    }, 100);
  };

  // Memory Match Game Logic (6 pairs = 12 cards)
  const initMemoryGame = useCallback(() => {
    const picked = shuffleArray(CLASSROOM_PHRASES).slice(0, 6);
    const deck: MemoryCard[] = [];
    picked.forEach(p => {
      deck.push({
        uid: `en-${p.id}`,
        phraseId: p.id,
        text: p.english,
        lang: 'en',
        matched: false
      });
      deck.push({
        uid: `vi-${p.id}`,
        phraseId: p.id,
        text: p.vietnamese,
        lang: 'vi',
        matched: false
      });
    });
    setMemoryCards(shuffleArray(deck));
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  }, [shuffleArray]);

  useEffect(() => {
    if (gameMode === 'memory') {
      initMemoryGame();
    }
  }, [gameMode, initMemoryGame]);

  const handleFlipMemoryCard = (idx: number) => {
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(idx)) return;
    if (memoryCards[idx]?.matched) return;

    playTickSound();
    const card = memoryCards[idx];
    if (card.lang === 'en') {
      playEnglishSpeech(card.text, { rate: 0.9 });
    }

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves(m => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = memoryCards[firstIdx];
      const secondCard = memoryCards[secondIdx];

      if (firstCard.phraseId === secondCard.phraseId && firstCard.lang !== secondCard.lang) {
        // Match!
        setTimeout(() => {
          playSuccessSound();
          setMemoryCards(prev => {
            const updated = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, matched: true } : c
            );
            if (updated.every(c => c.matched)) {
              setMemoryWon(true);
              onEarnStars?.(20);
              onCompletePractice?.();
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
            return updated;
          });
          setFlippedIndices([]);
        }, 450);
      } else {
        setTimeout(() => {
          playErrorSound();
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Game Mode Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setGameMode('quiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'quiz'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Trắc Nghiệm Ngẫu Nhiên
          </button>
          <button
            onClick={() => setGameMode('scramble')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'scramble'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ghép Từ Thành Câu
          </button>
          <button
            onClick={() => setGameMode('spinner')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'spinner'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vòng Quay Ngẫu Nhiên
          </button>
          <button
            onClick={() => setGameMode('memory')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              gameMode === 'memory'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lật Thẻ Trí Nhớ (Anh - Việt)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateRandomQuestions()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            title="Đổi bộ câu hỏi và xáo trộn vị trí đáp án"
          >
            <Shuffle className="w-3.5 h-3.5 text-teal-600" />
            <span>Xáo trộn ngẫu nhiên</span>
          </button>
        </div>
      </div>

      {/* GAME 1: Dynamic Quiz with Random Answer Choices */}
      {gameMode === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          {!quizFinished && currentQ ? (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-extrabold text-xs flex items-center justify-center">
                    {currentQIndex + 1}/{questions.length}
                  </span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {currentQ.type === 'listen' ? '🎧 Kỹ năng Nghe' : '🏫 Tình huống lớp học'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Random answer chooser button as requested by user */}
                  <button
                    onClick={handlePickRandomAnswer}
                    disabled={isAnswered}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold border border-amber-200 transition-colors disabled:opacity-40"
                    title="Hệ thống tự động chọn một câu trả lời ngẫu nhiên"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chọn ngẫu nhiên</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-md">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Điểm: {score * 10}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQ.prompt}
                </h3>

                {currentQ.type === 'listen' && (
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center justify-between">
                    <button
                      onClick={() => playEnglishSpeech(currentQ.targetPhrase.english, { rate: 0.85 })}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-all shadow-xs"
                    >
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span>Nghe lại âm thanh</span>
                    </button>
                    <span className="text-xs text-teal-700 font-medium">
                      (Bấm nút để nghe phát âm chuẩn bản ngữ)
                    </span>
                  </div>
                )}
              </div>

              {/* 4 Shuffled Random Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isCorrect = opt.id === currentQ.correctPhraseId;
                  const isChosen = opt.id === selectedOptionId;

                  let cardStyle = "bg-slate-50 hover:bg-teal-50/50 hover:border-teal-300 border-slate-200 text-slate-800";
                  if (isAnswered) {
                    if (isCorrect) {
                      cardStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-300";
                    } else if (isChosen) {
                      cardStyle = "bg-rose-50 border-rose-400 text-rose-800";
                    } else {
                      cardStyle = "opacity-40 border-slate-200 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isAnswered}
                      className={`p-4 rounded-2xl border text-left font-bold text-sm transition-all flex flex-col justify-between gap-1 shadow-2xs ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs uppercase font-extrabold text-slate-400">
                          Đáp án {String.fromCharCode(65 + idx)}
                        </span>
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isChosen && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                      </div>

                      <div className="text-base text-slate-900 mt-1">
                        {opt.english}
                      </div>

                      <div className="text-xs font-normal text-slate-500 mt-0.5">
                        {opt.vietnamese}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next Question */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div>
                    {selectedOptionId === currentQ.correctPhraseId ? (
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Thầy/Cô nhận được +10 sao!</span>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>Chưa chính xác! Đáp án đúng là: "{currentQ.targetPhrase.english}"</span>
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {currentQ.targetPhrase.contextVi}
                    </div>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
                  >
                    <span>Câu tiếp theo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Completed */
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Chúc mừng Thầy/Cô đã hoàn thành bài ôn tập!
              </h3>
              <p className="text-sm text-slate-600">
                Đạt được: <span className="font-black text-teal-700 text-lg">{score}</span> / {questions.length} câu đúng (+{score * 10} sao)
              </p>
              <button
                onClick={generateRandomQuestions}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi vòng ngẫu nhiên mới</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: Word Scramble */}
      {gameMode === 'scramble' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-bold text-teal-700 uppercase">
                Trò chơi ghép từ ngẫu nhiên
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xếp các từ theo đúng thứ tự câu khẩu lệnh
              </h3>
            </div>
            <button
              onClick={() => startRandomScramble()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-teal-600" />
              <span>Đổi câu ngẫu nhiên</span>
            </button>
          </div>

          <div className="p-3.5 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs">
            <span className="font-bold text-teal-900">Nghĩa tiếng Việt:</span> "{scramblePhrase.vietnamese}"
          </div>

          {/* Selected dropzone */}
          <div className="min-h-20 p-4 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/20 flex flex-wrap items-center gap-2">
            {scrambleSelected.length === 0 ? (
              <span className="text-xs text-slate-400 italic">
                Bấm các từ bên dưới để đưa lên đây theo thứ tự...
              </span>
            ) : (
              scrambleSelected.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDropWord(w, idx)}
                  className="px-3.5 py-2 bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-2xs hover:bg-rose-500 transition-colors"
                >
                  {w}
                </button>
              ))
            )}
          </div>

          {/* Available word pool */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
              Kho từ xáo trộn:
            </div>
            <div className="flex flex-wrap gap-2">
              {scrambleAvailable.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePickWord(w, idx)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => startRandomScramble(scramblePhrase)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm lại
            </button>

            {scrambleStatus === 'idle' ? (
              <button
                onClick={checkScramble}
                disabled={scrambleSelected.length === 0}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                Kiểm tra câu
              </button>
            ) : scrambleStatus === 'correct' ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đúng rồi! (+15 sao)
                </span>
                <button
                  onClick={() => startRandomScramble()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Câu tiếp theo
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-500" /> Chưa đúng rồi
                </span>
                <button
                  onClick={() => startRandomScramble(scramblePhrase)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Thử lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GAME 3: Lucky Random Sentence Spinner */}
      {gameMode === 'spinner' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 text-center">
          <div className="max-w-md mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200">
              <Dices className="w-4 h-4 text-amber-600" />
              <span>VÒNG QUAY KHẨU LỆNH NGẪU NHIÊN</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Quay Ngẫu Nhiên 1 Trong 10 Câu Tiếng Anh
            </h3>
            <p className="text-xs text-slate-500">
              Dành cho giáo viên gọi học sinh thực hành phát âm hoặc đóng vai bất ngờ trong tiết học!
            </p>
          </div>

          <div className="py-6">
            <button
              onClick={spinRandomSentence}
              disabled={spinning}
              className={`w-28 h-28 rounded-full font-black text-base shadow-xl border-4 border-white transition-all ${
                spinning
                  ? 'bg-amber-400 text-slate-950 animate-spin'
                  : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 active:scale-95'
              }`}
            >
              {spinning ? 'Đang quay...' : 'QUAY NGAY'}
            </button>
          </div>

          {spunPhrase && (
            <div className="p-6 rounded-3xl bg-linear-to-br from-teal-50 to-sky-50 border border-teal-200 max-w-lg mx-auto text-left space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-600 text-white text-[11px] font-bold">
                  Câu #{spunPhrase.id}
                </span>
                <button
                  onClick={() => playEnglishSpeech(spunPhrase.english, { rate: 0.85 })}
                  className="p-2 rounded-xl bg-white text-teal-700 hover:bg-teal-100 shadow-2xs"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-2xl font-black text-teal-950">
                {spunPhrase.english}
              </div>
              <div className="text-xs font-mono text-teal-700">
                {spunPhrase.phonetic}
              </div>
              <div className="text-sm font-bold text-slate-800">
                {spunPhrase.vietnamese}
              </div>

              <div className="pt-2 border-t border-teal-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Động tác cử chỉ:</span> {spunPhrase.tprGesture}
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: Memory Card Flip Match (English <-> Vietnamese) */}
      {gameMode === 'memory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="text-xs font-bold text-teal-700 uppercase">
                Trò chơi lật thẻ trí nhớ song ngữ
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ghép Cặp Khẩu Lệnh Tiếng Anh & Nghĩa Tiếng Việt Tương Ứng
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
                Lượt lật: {memoryMoves}
              </span>
              <button
                onClick={initMemoryGame}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                <span>Ván mới</span>
              </button>
            </div>
          </div>

          {memoryWon && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Tuyệt vời! Thầy/Cô đã ghép đúng toàn bộ 6 cặp câu khẩu lệnh chỉ sau {memoryMoves} lượt! (+20 ⭐)</span>
              </span>
              <button
                onClick={initMemoryGame}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Chơi tiếp
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {memoryCards.map((card, idx) => {
              const isFlipped = flippedIndices.includes(idx) || card.matched;
              return (
                <button
                  key={card.uid}
                  type="button"
                  onClick={() => handleFlipMemoryCard(idx)}
                  disabled={card.matched}
                  className={`min-h-28 p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer select-none shadow-2xs ${
                    card.matched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : isFlipped
                      ? 'bg-teal-50 border-teal-500 text-teal-950 scale-[1.02]'
                      : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-500'
                  }`}
                >
                  {isFlipped ? (
                    <>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          card.lang === 'en'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {card.lang === 'en' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold leading-snug">
                        {card.text}
                      </span>
                    </>
                  ) : (
                    <>
                      <Gamepad2 className="w-6 h-6 text-teal-600/70" />
                      <span className="text-[11px] font-bold text-slate-500">
                        Thẻ #{idx + 1}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
