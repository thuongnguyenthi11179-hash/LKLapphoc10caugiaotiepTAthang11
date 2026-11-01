import React, { useState, useEffect } from 'react';
import { KeyRound, Sparkles, ExternalLink, Check, X, ShieldCheck, AlertCircle, Eye, EyeOff, Cpu } from 'lucide-react';
import {
  AI_MODELS,
  GeminiModelId,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  BUILTIN_AUTO_KEY
} from '../utils/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (apiKey: string, model: GeminiModelId) => void;
  forceRequireKey?: boolean;
}

export const ApiKeyModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  forceRequireKey = false
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>('gemini-3-flash-preview');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setErrorMsg('');
      setSavedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim() || BUILTIN_AUTO_KEY;

    setStoredApiKey(trimmed);
    setStoredModel(selectedModel);
    setErrorMsg('');
    setSavedNotice(true);

    setTimeout(() => {
      onSaveSuccess(trimmed, selectedModel);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-teal-700 via-teal-800 to-indigo-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-200">
                Thiết lập hệ thống AI · Trường TH Lê Kim Lăng
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Thiết Lập Model AI & Gemini API Key
              </h3>
            </div>
          </div>

          {!forceRequireKey && (
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Step 1: API Key Input & Guide */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                <span>1. Nhập Gemini API Key của bạn (Bắt buộc)</span>
              </label>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2"
              >
                <span>Lấy API Key miễn phí tại đây</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Dán mã Gemini API Key (bắt đầu bằng AIzaSy...)"
                className="w-full pl-4 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                title={showKey ? 'Ẩn API Key' : 'Hiện API Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Hướng dẫn lấy Gemini API Key trong 30 giây:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-[11px] text-amber-900/90 leading-relaxed">
                <li>
                  Truy cập trang chính thức của Google AI Studio:{' '}
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-800 underline hover:text-teal-600"
                  >
                    https://aistudio.google.com/api-keys
                  </a>
                </li>
                <li>Đăng nhập bằng tài khoản Google (Gmail) cá nhân của Thầy/Cô.</li>
                <li>Bấm nút <strong>"Create API key"</strong>, sao chép mã key và dán vào ô bên trên.</li>
              </ol>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-bold pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã tích hợp sẵn Mã Khóa AI Tự Động (`{BUILTIN_AUTO_KEY}`) — Giáo viên vào học ngay không cần tự lấy API Key!</span>
              </div>
            </div>
          </div>

          {/* Step 2: Model Selection Cards */}
          <div className="space-y-2.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              <span>2. Chọn Model AI (Tự động chuyển đổi dự phòng khi quá tải)</span>
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {AI_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs sm:text-sm font-black text-slate-900">
                          {model.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {model.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {model.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lưu cấu hình API Key & Model AI thành công!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            {!forceRequireKey && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu cấu hình & Sử dụng App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
