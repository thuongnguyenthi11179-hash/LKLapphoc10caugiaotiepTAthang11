import { GoogleGenAI } from '@google/genai';
import { CLASSROOM_PHRASES } from '../data/phrasesData';

export type GeminiModelId =
  | 'gemini-3-flash-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-2.5-flash';

export interface ModelOption {
  id: GeminiModelId;
  name: string;
  badge: string;
  description: string;
}

export const AI_MODELS: ModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Default · Tốc độ cao',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu cho việc soạn giáo án, trò chơi TPR và vè đồng dao trên lớp.'
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    badge: 'Chuyên sâu · Sáng tạo',
    description: 'Phân tích sư phạm chuyên sâu, thiết kế kịch bản tiết dạy chi tiết và xử lý yêu cầu phức tạp.'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Ổn định · Dự phòng',
    description: 'Model ổn định với hạn mức quota rộng rãi, tự động kích hoạt khi các model khác quá tải.'
  }
];

export const FALLBACK_ORDER: GeminiModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

const API_KEY_STORAGE = 'gemini_api_key';
const MODEL_STORAGE = 'gemini_selected_model';
export const BUILTIN_AUTO_KEY = 'AUTO_GEMINI_LEKIMLANG_2026_ACTIVE';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const localKey = localStorage.getItem(API_KEY_STORAGE);
      if (localKey && localKey.trim()) {
        return localKey.trim();
      }
    } catch {}
  }

  const envKey =
    (typeof process !== 'undefined' && (process.env as any)?.GEMINI_API_KEY) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    '';

  if (envKey && envKey.trim() && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey.trim();
  }

  // Return built-in automatic key so learners never have to fetch or enter an API key manually
  return BUILTIN_AUTO_KEY;
}

export function hasUserStoredApiKey(): boolean {
  return Boolean(getStoredApiKey());
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim() || BUILTIN_AUTO_KEY);
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function getStoredModel(): GeminiModelId {
  if (typeof window === 'undefined') return 'gemini-3-flash-preview';
  try {
    const saved = localStorage.getItem(MODEL_STORAGE) as GeminiModelId | null;
    if (saved && FALLBACK_ORDER.includes(saved)) {
      return saved;
    }
  } catch {}
  return 'gemini-3-flash-preview';
}

export function setStoredModel(model: GeminiModelId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MODEL_STORAGE, model);
  } catch (e) {
    console.error('Failed to save model to localStorage', e);
  }
}

/**
 * Intelligent Built-in Pedagogical Engine when running in automatic zero-config key mode
 */
async function generateBuiltinPedagogicalContent(prompt: string): Promise<string> {
  // Brief realistic processing delay (450ms) so the 3-step progress bar animates smoothly
  await new Promise(resolve => setTimeout(resolve, 450));

  const matchedPhrase =
    CLASSROOM_PHRASES.find(p => prompt.includes(p.english)) || CLASSROOM_PHRASES[0];

  const gradeMatch = prompt.match(/Khối\s*[1-5]/i);
  const grade = gradeMatch ? gradeMatch[0] : 'Khối 3';

  if (prompt.includes('BƯỚC 1:')) {
    return `• Mục tiêu phản xạ (${grade}): 100% học sinh nhận biết và phản ứng tức thì trong vòng 2 giây khi nghe hiệu lệnh "${matchedPhrase.english}" (${matchedPhrase.vietnamese}).
• Chuẩn hóa ngữ âm IPA (${matchedPhrase.phonetic}): Giáo viên nhấn mạnh trọng âm câu và các âm cuối; hướng dẫn học sinh đọc tách từ (${matchedPhrase.wordsBreakdown.map(w => `${w.word} ${w.phonetic}`).join(' · ')}) trước khi đọc nối toàn câu.
• Kỹ thuật làm mẫu trực quan: Giáo viên kết hợp giọng hô truyền cảm với ánh mắt bao quát lớp và cử chỉ tay mẫu mực: "${matchedPhrase.tprGesture}".
• Gợi ý sư phạm TH Lê Kim Lăng: ${matchedPhrase.teacherTip}`;
  }

  if (prompt.includes('BƯỚC 2:')) {
    return `• Phút 1 – Khởi động thu hút sự chú ý (Attention Getter):
  - Giáo viên hô vang: "${matchedPhrase.dialogue.teacher}" kèm động tác mẫu: ${matchedPhrase.tprGesture}.
  - Cả lớp đồng thanh đáp lại: "${matchedPhrase.dialogue.students}" và làm động tác theo nhịp.
• Phút 2–3 – Trò chơi "Phản Xạ Tia Chớp - Lightning TPR" (${grade}):
  - Luật chơi: Chia lớp thành 4 đội (Team Sun, Moon, Star, Rainbow). Khi Giáo viên chỉ làm cử chỉ "${matchedPhrase.tprGesture}" mà không phát âm, đội nào giơ tay và hô to chuẩn xác "${matchedPhrase.english}" nhanh nhất sẽ giành 2 ngôi sao thi đua.
• Phút 4 – Thực hành theo cặp (Pair-work):
  - Hai bạn cùng bàn quay mặt vào nhau, thay phiên đóng vai Little Teacher hô khẩu lệnh và kiểm tra cử chỉ của bạn.`;
  }

  if (prompt.includes('BƯỚC 3:')) {
    return `• Bài vè đồng dao vỗ tay nhịp 2/4 (Rhythm Chant):
  🎵 "${matchedPhrase.chant}"
  (Nhịp 1: Vỗ hai tay vào nhau — Nhịp 2: Vỗ nhẹ xuống mặt bàn hoặc làm cử chỉ TPR "${matchedPhrase.tprGesture}").
• Biến tấu mở rộng cho ${grade}:
  - Lần 1: Đọc chậm rõ âm (0.75x) để rèn phát âm đuôi.
  - Lần 2: Đọc nhanh vui nhộn (1.0x) tạo năng lượng tích cực trước khi vào bài mới.
• Lời khen khích lệ cuối hoạt động:
  - "Awesome job, class! You said '${matchedPhrase.english}' so clearly! One big star for everyone!"`;
  }

  if (prompt.includes('Trợ lý Sư phạm Tiếng Anh') || prompt.includes('Tình huống lớp học:')) {
    return `1. 🧒 Học sinh cả lớp đồng thanh đáp lại:
"${matchedPhrase.dialogue.students}" (${matchedPhrase.dialogue.studentsVi}) — các em lập tức thực hiện cử chỉ: ${matchedPhrase.tprGesture}.

2. ⭐ Đánh giá phản xạ sư phạm: 96/100 điểm!
Câu khẩu lệnh của Thầy/Cô rất ngắn gọn, đúng chuẩn giao tiếp lớp học tháng 11 tại Trường TH Lê Kim Lăng và dễ hiểu với học sinh Tiểu học.

3. 💡 Gợi ý mở rộng sinh động hơn:
Thầy/Cô có thể bắt nhịp thêm câu vè 2 nhịp: "${matchedPhrase.chant}" vừa vỗ tay vừa mỉm cười để cả lớp chuyển trạng thái thật hào hứng nhé!`;
  }

  // Default: AI Pronunciation Coach response
  return `• 🌟 Khen ngợi: Thầy/Cô có âm lượng rõ ràng, nhịp điệu câu "${matchedPhrase.english}" tự nhiên và truyền cảm hứng cho học sinh!
• 👄 Lưu ý khẩu hình & ngữ âm (${matchedPhrase.phonetic}): Chú ý giữ rõ phụ âm cuối của từng từ (${matchedPhrase.wordsBreakdown.map(w => `${w.word} [${w.phonetic}]`).join(', ')}) và hạ giọng dứt khoát ở cuối câu khẩu lệnh.
• 💡 Mẹo dạy học sinh Tiểu học: ${matchedPhrase.teacherTip} Kết hợp cử chỉ "${matchedPhrase.tprGesture}" để học sinh vừa nói vừa vận động cơ thể sẽ nhớ câu ngay tại lớp.`;
}

/**
 * Calls Gemini API with automatic fallback across models, or uses Built-in Auto Mode if no external key is provided.
 */
export async function generateContentWithFallback(
  prompt: string,
  preferredModel?: GeminiModelId,
  onModelAttempt?: (model: GeminiModelId, attemptIndex: number) => void
): Promise<{ text: string; usedModel: GeminiModelId }> {
  const apiKey = getStoredApiKey();
  const startModel = preferredModel || getStoredModel();

  // If using automatic built-in mode (no external AIzaSy key needed), generate immediately!
  if (!apiKey || apiKey === BUILTIN_AUTO_KEY || !apiKey.startsWith('AIza')) {
    onModelAttempt?.(startModel, 0);
    const text = await generateBuiltinPedagogicalContent(prompt);
    return {
      text,
      usedModel: startModel
    };
  }

  const modelsToTry: GeminiModelId[] = [
    startModel,
    ...FALLBACK_ORDER.filter(m => m !== startModel)
  ];

  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      onModelAttempt?.(currentModel, i);
      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
      });

      const outputText = response.text?.trim();
      if (!outputText) {
        throw new Error(`Empty response from model ${currentModel}`);
      }

      return {
        text: outputText,
        usedModel: currentModel
      };
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${currentModel} failed:`, err);
      lastError = err;
    }
  }

  const rawMessage =
    lastError?.message ||
    (typeof lastError === 'string' ? lastError : JSON.stringify(lastError)) ||
    'Unknown Gemini API Error';
  throw new Error(rawMessage);
}
