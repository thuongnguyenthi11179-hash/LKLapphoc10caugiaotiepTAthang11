import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Printer,
  Lightbulb,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  KeyRound,
  Cpu,
  FileDown,
  MessageSquareHeart,
  Send,
  Volume2
} from 'lucide-react';
import { CLASSROOM_PHRASES } from '../data/phrasesData';
import {
  generateContentWithFallback,
  getStoredModel,
  GeminiModelId
} from '../utils/geminiService';
import { exportLessonPlanToWord } from '../utils/wordExport';
import { playEnglishSpeech } from '../utils/audioSpeech';
import { playSuccessSound } from '../utils/soundEffects';

interface Props {
  onOpenApiKeyModal?: () => void;
  teacherName?: string;
  onEarnStars?: (amount: number) => void;
}

type StepStatus = 'idle' | 'running' | 'completed' | 'error_stopped';

interface StepResult {
  step1: string;
  step2: string;
  step3: string;
}

const ROLEPLAY_SCENARIOS = [
  {
    id: 1,
    title: 'Giờ học thủ công cắt dán (Lớp 2)',
    situation: 'Học sinh vừa hoàn thành bài cắt dán thiệp 20/11 nhưng trên mặt bàn và dưới sàn còn rất nhiều giấy vụn. Chuông báo sắp hết giờ học.',
    expectedPhraseId: 7
  },
  {
    id: 2,
    title: 'Học sinh rụt rè khi làm bài khó (Lớp 4)',
    situation: 'Em Minh đang loay hoay với bài ghép câu Tiếng Anh khó và định gấp vở lại vì sợ làm sai.',
    expectedPhraseId: 4
  },
  {
    id: 3,
    title: 'Cả lớp hào hứng phát biểu tự do (Lớp 3)',
    situation: 'Khi cô vừa chiếu câu đố lên bảng Smartboard, nhiều học sinh đồng loạt hô to đáp án làm lớp học khá ồn.',
    expectedPhraseId: 9
  },
  {
    id: 4,
    title: 'Di chuyển xuống sân chào cờ đầu tuần (Lớp 1)',
    situation: 'Chuông báo giờ sinh hoạt dưới cờ vang lên, các em học sinh lớp 1 đang chạy lộn xộn ra cửa lớp.',
    expectedPhraseId: 8
  }
];

export const AILessonPlanner: React.FC<Props> = ({
  onOpenApiKeyModal,
  teacherName,
  onEarnStars
}) => {
  const [subTab, setSubTab] = useState<'planner' | 'roleplay'>('planner');

  const [selectedPhraseId, setSelectedPhraseId] = useState<number>(1);
  const [selectedGrade, setSelectedGrade] = useState<string>('Khối 3');
  const [activityType, setActivityType] = useState<string>('warmup');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 3-Step AI Processing State (per AI_INSTRUCTIONS.md)
  const [stepStatuses, setStepStatuses] = useState<[StepStatus, StepStatus, StepStatus]>([
    'idle',
    'idle',
    'idle'
  ]);
  const [stepResults, setStepResults] = useState<StepResult>({
    step1: '',
    step2: '',
    step3: ''
  });
  const [activeModel, setActiveModel] = useState<GeminiModelId>(getStoredModel());
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Roleplay State
  const [scenarioIdx, setScenarioIdx] = useState<number>(0);
  const [teacherReply, setTeacherReply] = useState<string>('');
  const [roleplayFeedback, setRoleplayFeedback] = useState<string>('');
  const [isRoleplayLoading, setIsRoleplayLoading] = useState<boolean>(false);
  const [roleplayError, setRoleplayError] = useState<string>('');

  const phrase = CLASSROOM_PHRASES.find(p => p.id === selectedPhraseId) || CLASSROOM_PHRASES[0];
  const activeScenario = ROLEPLAY_SCENARIOS[scenarioIdx];

  const activityLabelMap: Record<string, string> = {
    warmup: 'Khởi động 3 phút (Warm-up Game)',
    tpr: 'Phản xạ cơ thể TPR (Body Language)',
    chant: 'Vè đồng dao vỗ tay (Rhythm Chant)',
    management: 'Quản lý nề nếp lớp học (Discipline)'
  };

  // Run the 3-step AI pipeline; preserves already-completed steps when retrying!
  const handleRunAIPipeline = async (resumeFromFailed = false) => {
    setIsGenerating(true);
    setApiError(null);

    const preferredModel = getStoredModel();
    setActiveModel(preferredModel);

    const currentResults = resumeFromFailed
      ? { ...stepResults }
      : { step1: '', step2: '', step3: '' };

    const statuses: [StepStatus, StepStatus, StepStatus] = resumeFromFailed
      ? [
          currentResults.step1 ? 'completed' : 'idle',
          currentResults.step2 ? 'completed' : 'idle',
          currentResults.step3 ? 'completed' : 'idle'
        ]
      : ['idle', 'idle', 'idle'];

    if (!resumeFromFailed) {
      setStepResults(currentResults);
    }
    setStepStatuses([...statuses]);

    const prompts = [
      `Bạn là chuyên gia phương pháp sư phạm Tiếng Anh Tiểu học tại Trường Tiểu học Lê Kim Lăng (Đà Nẵng).
Hãy soạn BƯỚC 1: MỤC TIÊU BÀI DẠY & PHÂN TÍCH NGỮ ÂM cho mẫu câu khẩu lệnh tháng 11:
- Mẫu câu: "${phrase.english}" (${phrase.vietnamese})
- Phiên âm: ${phrase.phonetic}
- Khối lớp: ${selectedGrade}
- Hình thức: ${activityLabelMap[activityType] || activityType}
${customNotes ? `- Ghi chú thêm của giáo viên: ${customNotes}` : ''}
Trình bày ngắn gọn, súc tích (3-4 gạch đầu dòng) về mục tiêu phản xạ, lưu ý nối âm/âm đuôi và cách làm mẫu cho học sinh ${selectedGrade}.`,

      `Bạn là chuyên gia phương pháp sư phạm Tiếng Anh Tiểu học tại Trường Tiểu học Lê Kim Lăng.
Hãy soạn BƯỚC 2: KỊCH BẢN HOẠT ĐỘNG TƯƠNG TÁC & PHẢN XẠ VẬN ĐỘNG (TPR) cho mẫu câu:
- Mẫu câu: "${phrase.english}" (${phrase.vietnamese})
- Cử chỉ TPR gốc: ${phrase.tprGesture}
- Khối lớp: ${selectedGrade}
- Hình thức chủ đạo: ${activityLabelMap[activityType] || activityType}
Trình bày chi tiết kịch bản 3-5 phút gồm lời hô của Giáo viên, phản hồi của Học sinh và luật chơi thi đua tổ nhóm sôi nổi.`,

      `Bạn là chuyên gia phương pháp sư phạm Tiếng Anh Tiểu học tại Trường Tiểu học Lê Kim Lăng.
Hãy soạn BƯỚC 3: VÈ ĐỒNG DAO VỖ TAY (RHYTHM CHANT) & TÌNH HUỐNG MỞ RỘNG cho mẫu câu:
- Mẫu câu: "${phrase.english}" (${phrase.vietnamese})
- Vè gợi ý: "${phrase.chant}"
- Khối lớp: ${selectedGrade}
Hãy sáng tạo thêm 1 bài vè 4 câu nhịp 2/4 dễ nhớ kèm hướng dẫn nhịp vỗ tay và 1 lời khen thưởng khích lệ học sinh cuối hoạt động.`
    ];

    const stepKeys: (keyof StepResult)[] = ['step1', 'step2', 'step3'];

    for (let i = 0; i < 3; i++) {
      const key = stepKeys[i];
      if (resumeFromFailed && currentResults[key]) {
        continue;
      }

      statuses[i] = 'running';
      setStepStatuses([...statuses]);

      try {
        const { text, usedModel } = await generateContentWithFallback(
          prompts[i],
          preferredModel,
          (tryingModel) => setActiveModel(tryingModel)
        );

        setActiveModel(usedModel);
        currentResults[key] = text;
        setStepResults({ ...currentResults });

        statuses[i] = 'completed';
        setStepStatuses([...statuses]);
      } catch (err: any) {
        for (let j = i; j < 3; j++) {
          if (statuses[j] !== 'completed') {
            statuses[j] = 'error_stopped';
          }
        }
        setStepStatuses([...statuses]);
        setApiError(err?.message || String(err));
        setIsGenerating(false);
        return;
      }
    }

    playSuccessSound();
    onEarnStars?.(15);
    setIsGenerating(false);
  };

  const handleEvaluateRoleplay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherReply.trim()) return;

    setIsRoleplayLoading(true);
    setRoleplayError('');
    setRoleplayFeedback('');

    try {
      const expectedPhrase = CLASSROOM_PHRASES.find(p => p.id === activeScenario.expectedPhraseId);
      const prompt = `Bạn là Trợ lý Sư phạm Tiếng Anh tại Trường Tiểu học Lê Kim Lăng.
Tình huống lớp học: "${activeScenario.title} - ${activeScenario.situation}"
Mẫu câu chuẩn gợi ý của tháng 11: "${expectedPhrase?.english}" (${expectedPhrase?.vietnamese}).
Câu khẩu lệnh Giáo viên vừa nói với học sinh: "${teacherReply.trim()}".

Hãy phản hồi theo 3 phần ngắn gọn, ấm áp:
1. 🧒 [Học sinh cả lớp đồng thanh đáp lại bằng Tiếng Anh + dịch nghĩa].
2. ⭐ [Đánh giá mức độ phù hợp và tự nhiên của câu Giáo viên vừa dùng trên thang 100 điểm].
3. 💡 [Gợi ý thêm 1 câu mở rộng kèm cử chỉ TPR để làm tình huống sinh động hơn].`;

      const { text, usedModel } = await generateContentWithFallback(prompt);
      setActiveModel(usedModel);
      setRoleplayFeedback(text);
      playSuccessSound();
      onEarnStars?.(10);
    } catch (err: any) {
      setRoleplayError(err?.message || String(err));
    } finally {
      setIsRoleplayLoading(false);
    }
  };

  const completedCount = stepStatuses.filter(s => s === 'completed').length;
  const progressPercent = Math.round((completedCount / 3) * 100);
  const hasAnyError = stepStatuses.includes('error_stopped');

  const handleCopy = () => {
    const contentToCopy =
      stepResults.step1 || stepResults.step2 || stepResults.step3
        ? `GIÁO ÁN AI - TRƯỜNG TH LÊ KIM LĂNG (${selectedGrade})\nMẫu câu: ${phrase.english} (${phrase.vietnamese})\n\n--- BƯỚC 1 ---\n${stepResults.step1}\n\n--- BƯỚC 2 ---\n${stepResults.step2}\n\n--- BƯỚC 3 ---\n${stepResults.step3}`
        : `GIÁO ÁN MẪU - TRƯỜNG TH LÊ KIM LĂNG (${selectedGrade})\nMẫu câu: ${phrase.english} (${phrase.vietnamese})\nBước 1: ${phrase.dialogue.teacher}\nBước 2: ${phrase.tprGesture}\nBước 3: ${phrase.chant}`;

    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadWord = () => {
    exportLessonPlanToWord({
      phrase,
      grade: selectedGrade,
      activityTypeLabel: activityLabelMap[activityType] || activityType,
      step1: stepResults.step1 || undefined,
      step2: stepResults.step2 || undefined,
      step3: stepResults.step3 || undefined,
      teacherName
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-teal-700 via-teal-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>TRỢ LÝ SƯ PHẠM AI THÁNG 11 · TRƯỜNG TH LÊ KIM LĂNG</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/25 rounded-full text-[11px] font-mono text-amber-300 border border-white/15">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model: {activeModel}</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white">
          AI Tạo Bài Dạy & Đóng Vai Tình Huống Lớp Học
        </h2>
        <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
          Thiết kế giáo án 3 bước xuất trực tiếp ra file Word (.doc) chuẩn hành chính hoặc thực hành phản xạ xử lý tình huống sư phạm cùng AI.
        </p>

        {/* Sub-mode switch */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('planner')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'planner'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. AI Soạn Giáo Án 3 Bước & Xuất Word</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('roleplay')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === 'roleplay'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>2. AI Đóng Vai Tình Huống Lớp Học (Roleplay)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: 3-STEP AI LESSON PLANNER */}
      {subTab === 'planner' && (
        <>
          {/* Control Configuration Bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Chọn mẫu câu tiếng Anh
                </label>
                <select
                  value={selectedPhraseId}
                  onChange={(e) => setSelectedPhraseId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  {CLASSROOM_PHRASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id}. {p.english} ({p.vietnamese})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Khối lớp áp dụng
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Khối 1">Khối 1 (Chậm rãi, nhiều cử chỉ vui nhộn)</option>
                  <option value="Khối 2">Khối 2 (Đồng dao, bài hát, vỗ tay)</option>
                  <option value="Khối 3">Khối 3 (Phản xạ cặp, thi đua tổ nhóm)</option>
                  <option value="Khối 4">Khối 4 (Đóng vai tình huống thực tế)</option>
                  <option value="Khối 5">Khối 5 (Thuyết trình, giao tiếp độc lập)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Hình thức hoạt động
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                >
                  <option value="warmup">Khởi động 3 phút (Warm-up Game)</option>
                  <option value="tpr">Phản xạ cơ thể TPR (Body Language)</option>
                  <option value="chant">Vè đồng dao vỗ tay (Rhythm Chant)</option>
                  <option value="management">Quản lý nề nếp lớp học (Discipline)</option>
                </select>
              </div>
            </div>

            {/* Custom Input & Generate Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Yêu cầu thêm cho AI (VD: Lớp đông 40 học sinh, tích hợp đạo đức ngày 20/11...)"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleRunAIPipeline(false)}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Tạo Giáo Án Bằng AI (3 Bước)</span>
                    </>
                  )}
                </button>

                {hasAnyError && !isGenerating && (
                  <button
                    type="button"
                    onClick={() => handleRunAIPipeline(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-xs transition-all cursor-pointer"
                    title="Giữ nguyên các bước đã xong, chỉ chạy lại bước bị lỗi"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Thử lại bước lỗi</span>
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar & 3 Step Columns Status (Always visible per AI_INSTRUCTIONS.md) */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Tiến trình xử lý AI ({completedCount}/3 bước hoàn thành)
                </span>
                <span
                  className={`font-black ${
                    hasAnyError
                      ? 'text-rose-600'
                      : completedCount === 3
                      ? 'text-emerald-600'
                      : 'text-slate-600'
                  }`}
                >
                  {hasAnyError
                    ? 'Đã dừng do lỗi'
                    : completedCount === 3
                    ? '100% Hoàn tất'
                    : `${progressPercent}%`}
                </span>
              </div>

              {/* 3-Segment Progress Bar: Only turns green (bg-emerald-500) for steps that actually succeeded */}
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((idx) => {
                  const st = stepStatuses[idx];
                  return (
                    <div
                      key={idx}
                      className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/80"
                    >
                      <div
                        className={`h-full w-full transition-all duration-300 ${
                          st === 'completed'
                            ? 'bg-emerald-500'
                            : st === 'running'
                            ? 'bg-teal-500 animate-pulse'
                            : st === 'error_stopped'
                            ? 'bg-rose-500'
                            : 'bg-transparent'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* 3 Step Status Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { idx: 0, title: 'Step 1: Mục tiêu & Ngữ âm' },
                  { idx: 1, title: 'Step 2: Hoạt động TPR & Game' },
                  { idx: 2, title: 'Step 3: Vè Chant & Mở rộng' }
                ].map((step) => {
                  const st = stepStatuses[step.idx];
                  return (
                    <div
                      key={step.idx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
                        st === 'completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : st === 'running'
                          ? 'bg-teal-50 border-teal-300 text-teal-900 animate-pulse'
                          : st === 'error_stopped'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="font-bold truncate">{step.title}</div>
                      <div className="shrink-0 flex items-center gap-1 font-extrabold text-[11px]">
                        {st === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Hoàn tất
                          </span>
                        )}
                        {st === 'running' && (
                          <span className="inline-flex items-center gap-1 text-teal-700">
                            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                            Đang xử lý...
                          </span>
                        )}
                        {st === 'error_stopped' && (
                          <span className="inline-flex items-center gap-1 text-rose-700">
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Đã dừng do lỗi
                          </span>
                        )}
                        {st === 'idle' && <span>Đang chờ</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Raw Red Error Box if all fallback models fail */}
              {apiError && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 space-y-2 animate-in fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-black uppercase text-rose-800">
                          Tất cả các Model AI đều thất bại — Đã dừng do lỗi:
                        </div>
                        <pre className="text-xs font-mono bg-white/90 p-2.5 rounded-xl border border-rose-200 text-rose-700 whitespace-pre-wrap break-all">
                          {apiError}
                        </pre>
                      </div>
                    </div>

                    {onOpenApiKeyModal && (
                      <button
                        type="button"
                        onClick={onOpenApiKeyModal}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 shadow-xs cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Đổi API Key</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated Activity Plan Output */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase">
                  Kế hoạch bài dạy chi tiết · {selectedGrade}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Hoạt Động: "{phrase.english}"
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadWord}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  title="Tải file giáo án Microsoft Word (.doc)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Tải Giáo Án Word (.doc)</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In</span>
                </button>
              </div>
            </div>

            {/* Plan Body */}
            {stepResults.step1 || stepResults.step2 || stepResults.step3 ? (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-1.5">
                  <div className="font-bold text-teal-950 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Bước 1: Mục tiêu bài dạy & Phân tích ngữ âm
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {stepStatuses[0] === 'completed' ? '✓ Hoàn tất' : 'Đã dừng do lỗi'}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-slate-700">
                    {stepResults.step1 || 'Đã dừng do lỗi.'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Bước 2: Kịch bản Hoạt động tương tác & Phản xạ TPR</span>
                    <span
                      className={`text-[11px] font-bold ${
                        stepStatuses[1] === 'completed' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {stepStatuses[1] === 'completed'
                        ? '✓ Hoàn tất'
                        : stepStatuses[1] === 'error_stopped'
                        ? '✕ Đã dừng do lỗi'
                        : 'Đang chờ'}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-slate-700">
                    {stepResults.step2 || (stepStatuses[1] === 'error_stopped' ? 'Đã dừng do lỗi.' : 'Đang chờ xử lý...')}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-1.5">
                  <div className="font-bold text-indigo-950 flex items-center justify-between">
                    <span>Bước 3: Vè đồng dao Rhythm Chant & Tình huống mở rộng</span>
                    <span
                      className={`text-[11px] font-bold ${
                        stepStatuses[2] === 'completed' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {stepStatuses[2] === 'completed'
                        ? '✓ Hoàn tất'
                        : stepStatuses[2] === 'error_stopped'
                        ? '✕ Đã dừng do lỗi'
                        : 'Đang chờ'}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-slate-700">
                    {stepResults.step3 || (stepStatuses[2] === 'error_stopped' ? 'Đã dừng do lỗi.' : 'Đang chờ xử lý...')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-1">
                  <div className="font-bold text-teal-950 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Mục tiêu bài dạy chuẩn (Objectives):</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Học sinh hiểu và phản xạ tức thì với khẩu lệnh <strong>"{phrase.english}"</strong> ({phrase.vietnamese}).</li>
                    <li>Phát âm chuẩn âm vị IPA: <code className="text-teal-700 font-mono font-bold">{phrase.phonetic}</code>.</li>
                    <li>Thực hiện đúng động tác cử chỉ TPR đồng bộ toàn lớp ({selectedGrade}).</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                      Bước 1: Mô phỏng & Làm mẫu (Model & Repeat - 2 phút)
                    </span>
                    <p>Giáo viên hô to: <strong className="text-teal-700">"{phrase.dialogue.teacher}"</strong> đồng thời thực hiện động tác: <em>{phrase.tprGesture}</em>. Yêu cầu cả lớp nhắc lại 3 lần theo nhịp vỗ tay.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                      Bước 2: Trò chơi phản xạ nhanh (Action Game - 3 phút)
                    </span>
                    <p>Giáo viên chia lớp thành 4 tổ thi đua. Khi giáo viên làm động tác không nói, tổ nào hô đúng câu tiếng Anh nhanh nhất được cộng 1 ngôi sao thi đua.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
                      Bước 3: Vè đồng thanh kết thúc (Rhythm Chant)
                    </span>
                    <p className="font-bold text-indigo-900 italic">"{phrase.chant}"</p>
                    <p className="text-slate-500 text-xs">Cả lớp vỗ tay nhịp 2/4 theo nhịp điệu của bài vè trước khi chuyển sang phần nội dung chính của tiết học.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODE 2: AI CLASSROOM ROLEPLAY COACH */}
      {subTab === 'roleplay' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase">
                Thực hành đóng vai xử lý tình huống sư phạm
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {activeScenario.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {ROLEPLAY_SCENARIOS.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    setScenarioIdx(idx);
                    setTeacherReply('');
                    setRoleplayFeedback('');
                    setRoleplayError('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    scenarioIdx === idx
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tình huống #{sc.id}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Box */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <div className="text-xs font-black uppercase text-amber-800">
              🏫 Bối cảnh lớp học tại Trường TH Lê Kim Lăng:
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">
              {activeScenario.situation}
            </p>
          </div>

          {/* Quick phrase chips */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500">
              Gợi ý chọn nhanh 1 trong 10 câu khẩu lệnh hoặc tự gõ lời nói của Thầy/Cô:
            </div>
            <div className="flex flex-wrap gap-2">
              {CLASSROOM_PHRASES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setTeacherReply(p.dialogue.teacher);
                    playEnglishSpeech(p.dialogue.teacher, { rate: 0.9 });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-800 border border-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  #{p.id}. {p.english}
                </button>
              ))}
            </div>
          </div>

          {/* Teacher Response Form */}
          <form onSubmit={handleEvaluateRoleplay} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Lời hô khẩu lệnh bằng Tiếng Anh của Thầy/Cô:
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                required
                value={teacherReply}
                onChange={(e) => setTeacherReply(e.target.value)}
                placeholder="Nhập câu tiếng Anh bạn sẽ nói với cả lớp (VD: Put paper in the bin! Keep your classroom clean!)..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
              {teacherReply && (
                <button
                  type="button"
                  onClick={() => playEnglishSpeech(teacherReply, { rate: 0.9 })}
                  className="px-3.5 py-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-2xl text-xs font-bold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  title="Nghe phát âm câu vừa nhập"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe thử</span>
                </button>
              )}
              <button
                type="submit"
                disabled={isRoleplayLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-black shadow-sm transition-all disabled:opacity-60 shrink-0 cursor-pointer"
              >
                {isRoleplayLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI đang phản hồi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi & Chấm Điểm Phản Xạ</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {roleplayFeedback && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed animate-in fade-in">
              <div className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Phản hồi từ Lớp học ảo & Chuyên gia AI (+10 ⭐):</span>
              </div>
              {roleplayFeedback}
            </div>
          )}

          {roleplayError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {roleplayError}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
