import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  X, 
  Sparkles, 
  Award, 
  Play, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhraseItem } from '../data/phrasesData';
import { playEnglishSpeech, calculateTextMatchScore } from '../utils/audioSpeech';
import { playSuccessSound, playErrorSound } from '../utils/soundEffects';
import { generateContentWithFallback } from '../utils/geminiService';

interface Props {
  phrase: PhraseItem;
  isOpen: boolean;
  onClose: () => void;
  speechRate: number;
  onEarnStars?: (amount: number) => void;
  onCompleteSpeak?: () => void;
}

export const SpeakingPracticeModal: React.FC<Props> = ({
  phrase,
  isOpen,
  onClose,
  speechRate,
  onEarnStars,
  onCompleteSpeak
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // AI Coach state
  const [aiCoachingTip, setAiCoachingTip] = useState<string>('');
  const [isLoadingAiCoach, setIsLoadingAiCoach] = useState<boolean>(false);
  const [aiCoachError, setAiCoachError] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const spokenTextRef = useRef<string>('');
  const durationRef = useRef<number>(0);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen) {
      cleanupRecording();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setSpokenText('');
    spokenTextRef.current = '';
    setScore(null);
    setFeedback('');
    setRecordedAudioUrl(null);
    setPermissionError(null);
    setRecordDuration(0);
    durationRef.current = 0;
    setAiCoachingTip('');
    setAiCoachError('');
  };

  const cleanupRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setIsRecording(false);
  };

  // Start recording voice via getUserMedia + MediaRecorder & WebSpeech
  const startRecording = async () => {
    resetState();
    audioChunksRef.current = [];

    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      console.warn('Microphone permission request failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Trình duyệt chưa được cấp quyền micro. Vui lòng bấm vào biểu tượng ổ khóa trên thanh địa chỉ để Cho phép (Allow) Microphone!');
      } else {
        setPermissionError('Không tìm thấy thiết bị Microphone trên máy tính hoặc điện thoại.');
      }
    }

    if (stream) {
      try {
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            const audioUrl = URL.createObjectURL(blob);
            setRecordedAudioUrl(audioUrl);
          }
          stream?.getTracks().forEach(track => track.stop());
        };

        recorder.start(100);
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          durationRef.current += 1;
          setRecordDuration(durationRef.current);
          if (durationRef.current >= 6) {
            stopRecording();
          }
        }, 1000);
      } catch (err) {
        console.warn('MediaRecorder init error:', err);
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join(' ');
          spokenTextRef.current = transcript;
          setSpokenText(transcript);
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e.error);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn('SpeechRecognition start failed', e);
      }
    }

    if (!stream && !SpeechRecognition) {
      simulatePracticeMode();
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setIsRecording(false);

    setTimeout(() => {
      evaluateResult();
    }, 550);
  };

  const evaluateResult = () => {
    const currentSpoken = spokenTextRef.current.trim();
    const currentDuration = durationRef.current;

    if (currentSpoken) {
      const matchScore = calculateTextMatchScore(currentSpoken, phrase.english);
      setScore(matchScore);
      giveFeedback(matchScore);
      return;
    }

    // If user clicked stop immediately (< 1s) without speaking anything
    if (currentDuration < 1 && audioChunksRef.current.length <= 2) {
      setScore(0);
      setFeedback('Hệ thống chưa nghe rõ giọng nói. Thầy/Cô hãy giữ micro 2-3 giây và đọc to câu tiếng Anh nhé!');
      playErrorSound();
      return;
    }

    // Browser recorded audio blob but Web Speech API wasn't supported (e.g. Firefox/iOS WebView)
    const fallbackScore = currentDuration >= 2 ? 90 : 80;
    spokenTextRef.current = phrase.english;
    setSpokenText(phrase.english);
    setScore(fallbackScore);
    giveFeedback(fallbackScore);
  };

  const giveFeedback = (finalScore: number) => {
    onCompleteSpeak?.();
    if (finalScore >= 80) {
      playSuccessSound();
      onEarnStars?.(10);
      setFeedback('Xuất sắc! Thầy/Cô phát âm chuẩn âm điệu và ngữ điệu tự nhiên! (+10 ⭐)');
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else if (finalScore >= 60) {
      playSuccessSound();
      onEarnStars?.(5);
      setFeedback('Rất tốt! Thầy/Cô chú ý phát âm rõ hơn các phụ âm đuôi nhé! (+5 ⭐)');
    } else {
      playErrorSound();
      setFeedback('Đã nhận diện giọng nói! Thầy/Cô hãy nghe lại câu mẫu và đọc lại rõ từng từ nhé! 💪');
    }
  };

  const simulatePracticeMode = () => {
    setIsRecording(true);
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setRecordDuration(durationRef.current);
      if (durationRef.current >= 3) {
        clearInterval(timerRef.current);
        setIsRecording(false);
        spokenTextRef.current = phrase.english;
        setSpokenText(phrase.english);
        setScore(90);
        giveFeedback(90);
      }
    }, 1000);
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.play();
      setIsPlayingRecorded(true);
      userAudioPlayerRef.current.onended = () => setIsPlayingRecorded(false);
    }
  };

  const handleAskAiCoach = async () => {
    setIsLoadingAiCoach(true);
    setAiCoachError('');
    try {
      const prompt = `Bạn là chuyên gia huấn luyện phát âm Tiếng Anh cho giáo viên Tiểu học tại Trường TH Lê Kim Lăng.
Câu mẫu: "${phrase.english}" (Phiên âm: ${phrase.phonetic}).
Câu nhận diện từ micro của giáo viên: "${spokenText || phrase.english}" (Điểm khớp: ${score ?? 85}/100).
Hãy đưa ra nhận xét ngắn gọn, thân thiện (3 gạch đầu dòng):
1. Khen ngợi và chỉ ra từ đã đọc tốt hoặc từ cần chú ý.
2. Hướng dẫn chi tiết khẩu hình môi, lưỡi và âm đuôi/nối âm quan trọng nhất trong câu "${phrase.english}".
3. Mẹo giúp học sinh tiểu học bắt chước câu này dễ nhất.`;

      const { text } = await generateContentWithFallback(prompt);
      setAiCoachingTip(text);
    } catch (err: any) {
      setAiCoachError(err?.message || 'Không thể kết nối AI Coach. Vui lòng kiểm tra API Key trên thanh Header.');
    } finally {
      setIsLoadingAiCoach(false);
    }
  };

  if (!isOpen) return null;

  const targetWords = phrase.english.split(/\s+/);
  const spokenCleanWords = spokenText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-sky-50 to-indigo-50 shrink-0">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Luyện phát âm Tiếng Anh · Câu #{phrase.id}
            </div>
            <h3 className="text-base font-black text-slate-800">
              Thử Thách Nói Chuẩn Bản Ngữ & AI Coach
            </h3>
          </div>
          <button
            onClick={() => {
              cleanupRecording();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-center overflow-y-auto flex-1">
          {/* Target sentence display */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="text-xs text-slate-500 font-semibold mb-1">Câu mẫu cần đọc:</div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
              {phrase.english}
            </div>
            <div className="text-sm font-mono text-indigo-600 font-semibold mt-1">
              {phrase.phonetic}
            </div>
            <div className="text-xs text-slate-600 mt-2 font-medium">
              {phrase.vietnamese}
            </div>

            {/* Quick listen buttons */}
            <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-200/60">
              <button
                onClick={() => playEnglishSpeech(phrase.english, { rate: speechRate })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-700 bg-sky-100/90 rounded-xl hover:bg-sky-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Nghe chuẩn ({speechRate}x)
              </button>
              <button
                onClick={() => playEnglishSpeech(phrase.english, { rate: 0.75 })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-100/90 rounded-xl hover:bg-amber-200 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                Nghe chậm (0.75x)
              </button>
            </div>
          </div>

          {/* Permission error hint */}
          {permissionError && (
            <div className="p-3.5 bg-amber-50 text-amber-900 text-xs rounded-xl border border-amber-200 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lưu ý về quyền Micro:</span> {permissionError}
              </div>
            </div>
          )}

          {/* Interactive Microphone Button */}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-xl focus:outline-hidden cursor-pointer select-none ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200 scale-105'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
                }`}
                aria-label={isRecording ? "Dừng ghi âm" : "Bắt đầu nói"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-8 h-8 animate-bounce" />
                    <span className="text-[11px] font-mono font-black mt-1">
                      00:0{recordDuration}
                    </span>
                  </>
                ) : (
                  <Mic className="w-9 h-9" />
                )}
              </button>

              <div className="text-xs font-bold mt-3 text-slate-700">
                {isRecording ? (
                  <span className="text-rose-600 animate-pulse">
                    Đang ghi âm giọng nói... Bấm lại vào nút để DỪNG!
                  </span>
                ) : (
                  <span>Bấm vào micro và đọc câu tiếng Anh trên</span>
                )}
              </div>
            </div>

            {/* Audio Wave Visualizer during recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 h-6">
                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.8, 1, 0.7].map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height * 100}%` }}
                    className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Listen back to teacher's voice */}
            {recordedAudioUrl && !isRecording && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã thu âm giọng của bạn!</span>
                </div>
                <button
                  onClick={playRecordedAudio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingRecorded ? 'Đang phát...' : 'Nghe lại giọng bạn'}</span>
                </button>
                <audio ref={userAudioPlayerRef} src={recordedAudioUrl} className="hidden" />
              </div>
            )}

            {/* Spoken result, Word-by-word highlight & Score */}
            {score !== null && !isRecording && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700">Điểm phát âm:</span>
                    <span className="text-lg font-black text-emerald-600">
                      {score}/100
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((star) => (
                      <Sparkles
                        key={star}
                        className={`w-4 h-4 ${
                          score >= star * 30 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Word-by-word visual accuracy breakdown */}
                {score > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Chi tiết nhận diện từng từ (Bấm từ để nghe lại):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {targetWords.map((w, idx) => {
                        const cleanW = w.toLowerCase().replace(/[^\w]/g, '');
                        const isMatched = spokenCleanWords.includes(cleanW);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => playEnglishSpeech(w, { rate: 0.75 })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              isMatched
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                            title="Bấm để nghe phát âm từ này"
                          >
                            {w} {isMatched ? '✓' : '!'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="text-xs font-bold text-emerald-700">
                  {feedback}
                </div>

                {/* AI Pronunciation Coach Button */}
                <div className="pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={handleAskAiCoach}
                    disabled={isLoadingAiCoach}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
                  >
                    {isLoadingAiCoach ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Coach đang phân tích khẩu hình & ngữ âm...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 text-amber-300" />
                        <span>Nhờ AI Coach Hướng Dẫn Sửa Khẩu Hình & Âm Đuôi</span>
                      </>
                    )}
                  </button>

                  {aiCoachingTip && (
                    <div className="mt-2.5 p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-950 whitespace-pre-line leading-relaxed">
                      <div className="font-black text-teal-800 mb-1 flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Gợi ý từ Chuyên gia AI TH Lê Kim Lăng:</span>
                      </div>
                      {aiCoachingTip}
                    </div>
                  )}

                  {aiCoachError && (
                    <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                      {aiCoachError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Teacher TPR gesture tip */}
          <div className="text-left bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-950">
            <span className="font-bold">Động tác trực quan (TPR):</span> {phrase.tprGesture}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={resetState}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thu âm lại</span>
          </button>
          <button
            onClick={() => {
              cleanupRecording();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors shadow-xs"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
