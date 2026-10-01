import { 
  GeminiModelId, 
  GeminiModelOption,
  Industry
} from '../types';

export const GEMINI_STORAGE_KEYS = {
  API_KEY: 'gemini_api_key',
  MODEL: 'gemini_model',
};

export const AVAILABLE_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    tag: 'Mặc định (Default)',
    badge: 'Khuyên Dùng',
    description: 'Tốc độ cực nhanh, tư duy logic nhạy bén, tối ưu chi phí và hạn mức quota.',
    isDefault: true,
    recommended: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    tag: 'Chất lượng cao nhất',
    badge: 'Pro Reasoning',
    description: 'Mô hình thông minh và sâu sắc nhất cho kịch bản quảng cáo và tối ưu hóa khuôn mặt chuyên sâu.',
    isDefault: false,
    recommended: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tag: 'Dự phòng ổn định (Fallback)',
    badge: 'High Stability',
    description: 'Bền bỉ, ổn định cao, sẵn sàng tự động kích hoạt khi các model trên quá tải.',
    isDefault: false,
    recommended: false,
  },
];

export class GeminiService {
  // Get active API key prioritizing localStorage
  getApiKey(): string {
    const localKey = localStorage.getItem(GEMINI_STORAGE_KEYS.API_KEY);
    if (localKey && localKey.trim()) return localKey.trim();

    // Check env vars if any
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || 
                   (typeof process !== 'undefined' ? (process.env as any)?.GEMINI_API_KEY : '');
    if (envKey && typeof envKey === 'string' && envKey.trim()) {
      return envKey.trim();
    }
    return '';
  }

  setApiKey(key: string): void {
    if (key) {
      localStorage.setItem(GEMINI_STORAGE_KEYS.API_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEYS.API_KEY);
    }
  }

  // Get active model
  getSelectedModel(): GeminiModelId {
    const localModel = localStorage.getItem(GEMINI_STORAGE_KEYS.MODEL) as GeminiModelId | null;
    if (localModel && ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'].includes(localModel)) {
      return localModel;
    }
    return 'gemini-3-flash-preview';
  }

  setSelectedModel(model: GeminiModelId): void {
    localStorage.setItem(GEMINI_STORAGE_KEYS.MODEL, model);
  }

  // Build fallback cascade chain based on selected model
  getFallbackChain(initialModel: GeminiModelId): GeminiModelId[] {
    const allModels: GeminiModelId[] = [
      'gemini-3-flash-preview',
      'gemini-3-pro-preview',
      'gemini-2.5-flash',
    ];
    const remaining = allModels.filter((m) => m !== initialModel);
    return [initialModel, ...remaining];
  }

  // Test an API key with a small prompt
  async testConnection(apiKey: string, model: GeminiModelId = 'gemini-3-flash-preview'): Promise<{ success: boolean; message: string; rawError?: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Vui lòng nhập API Key để kiểm tra.' };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời ngắn gọn đúng 1 từ "OK" để test kết nối API.' }] }],
          generationConfig: { maxOutputTokens: 10, temperature: 0.1 },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const rawMsg = errorData?.error?.message || errorData?.error?.status || `HTTP ${res.status}: ${res.statusText}`;
        return {
          success: false,
          message: `Lỗi kết nối Gemini API (${res.status})`,
          rawError: `${res.status} ${rawMsg}`,
        };
      }

      return {
        success: true,
        message: `Kết nối thành công tới mô hình ${model}! API Key hợp lệ và sẵn sàng sử dụng.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'Không thể kết nối tới máy chủ Google AI Studio.',
        rawError: err?.message || 'Network / Fetch Error',
      };
    }
  }

  // Execute raw generation with fallback across models
  async generateWithFallback(
    prompt: string,
    systemInstruction?: string,
    onModelRetry?: (failedModel: string, nextModel: string, error: string) => void
  ): Promise<{ text: string; modelUsed: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chưa thiết lập Gemini API Key. Vui lòng bấm "Lấy API key để sử dụng app" trên Header để nhập key.');
    }

    const startModel = this.getSelectedModel();
    const fallbackChain = this.getFallbackChain(startModel);

    let lastRawError = '';

    for (let i = 0; i < fallbackChain.length; i++) {
      const currentModel = fallbackChain[i];
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
        
        const payload: any = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        };

        if (systemInstruction) {
          payload.systemInstruction = {
            parts: [{ text: systemInstruction }],
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || errData?.error?.status || `HTTP ${res.status}: ${res.statusText}`;
          const formattedErr = `${res.status} ${errMsg}`;
          lastRawError = formattedErr;

          // If there is a next model in chain, notify and continue loop
          if (i < fallbackChain.length - 1) {
            const nextModel = fallbackChain[i + 1];
            if (onModelRetry) {
              onModelRetry(currentModel, nextModel, formattedErr);
            }
            continue; // Retry with next model
          } else {
            // All models exhausted
            throw new Error(formattedErr);
          }
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) {
          throw new Error('API phản hồi dữ liệu rỗng. Hãy thử lại hoặc chọn gợi ý khác.');
        }

        return { text, modelUsed: currentModel };
      } catch (err: any) {
        lastRawError = err?.message || 'Network Error';
        if (i < fallbackChain.length - 1) {
          const nextModel = fallbackChain[i + 1];
          if (onModelRetry) {
            onModelRetry(currentModel, nextModel, lastRawError);
          }
          continue;
        } else {
          // Re-throw raw API error (VD: 429 RESOURCE_EXHAUSTED)
          throw new Error(lastRawError);
        }
      }
    }

    throw new Error(lastRawError || 'Tất cả các mô hình Gemini AI đều gặp sự cố.');
  }

  // Commercial Video Script & Prompt Generator for the 4 core industries
  async generateCommercialScript(
    industry: Industry,
    productName: string,
    tone: string,
    targetAudience: string,
    onModelRetry?: (failed: string, next: string, err: string) => void
  ): Promise<{
    title: string;
    hook: string;
    scenes: { sceneNumber: number; visual: string; voiceover: string }[];
    recommendedTags: string[];
    modelUsed: string;
  }> {
    const prompt = `Bạn là đạo diễn sáng tạo kịch bản video quảng cáo AI Face-Swap hàng đầu. Hãy viết kịch bản video thương mại ngắn (15-30 giây) cho:
- Ngành hàng: ${industry}
- Tên sản phẩm/dịch vụ: ${productName}
- Tông giọng: ${tone}
- Khách hàng mục tiêu: ${targetAudience}

Trả về DUY NHẤT một chuỗi JSON hợp lệ với cấu trúc sau:
{
  "title": "Tiêu đề video cuốn hút",
  "hook": "Câu mở đầu 3 giây đầu tiên giữ chân người xem",
  "scenes": [
    { "sceneNumber": 1, "visual": "Mô tả góc quay và khuôn mặt người mẫu", "voiceover": "Lời thoại người mẫu AI" },
    { "sceneNumber": 2, "visual": "Mô tả cận cảnh sản phẩm và tính năng nổi bật", "voiceover": "Lời thuyết minh" },
    { "sceneNumber": 3, "visual": "Lời kêu gọi hành động (Call To Action)", "voiceover": "Lời chốt mua hàng" }
  ],
  "recommendedTags": ["tag1", "tag2", "tag3"]
}`;

    const { text, modelUsed } = await this.generateWithFallback(
      prompt,
      'Bạn là chuyên gia sáng tạo kịch bản video AI. Luôn trả về định dạng JSON hợp lệ.',
      onModelRetry
    );

    try {
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        title: parsed.title || `Video Quảng Cáo ${productName}`,
        hook: parsed.hook || 'Khám phá giải pháp đột phá ngay hôm nay!',
        scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
        recommendedTags: Array.isArray(parsed.recommendedTags) ? parsed.recommendedTags : [industry.toLowerCase(), 'ai-faceswap', 'trending'],
        modelUsed,
      };
    } catch {
      return {
        title: `Video Quảng Cáo ${productName}`,
        hook: 'Sản phẩm đỉnh cao dành cho bạn!',
        scenes: [
          { sceneNumber: 1, visual: 'Người mẫu AI tươi cười cầm sản phẩm', voiceover: `Bạn đã biết đến ${productName} chưa?` },
          { sceneNumber: 2, visual: 'Cận cảnh hiệu ứng sử dụng sản phẩm thực tế', voiceover: 'Mang lại trải nghiệm khác biệt và đẳng cấp vượt trội.' },
          { sceneNumber: 3, visual: 'Bảng giá ưu đãi và logo thương hiệu', voiceover: 'Đặt hàng ngay hôm nay để nhận ưu đãi đặc biệt!' }
        ],
        recommendedTags: [industry.toLowerCase(), 'art-video-pro'],
        modelUsed,
      };
    }
  }
}

export const geminiService = new GeminiService();
