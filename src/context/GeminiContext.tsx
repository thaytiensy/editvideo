import React, { createContext, useContext, useState, useEffect } from 'react';
import { geminiService, AVAILABLE_MODELS } from '../services/geminiService';
import { GeminiModelId, GeminiModelOption } from '../types';

interface GeminiContextType {
  apiKey: string;
  selectedModel: GeminiModelId;
  hasApiKey: boolean;
  isSettingsModalOpen: boolean;
  models: GeminiModelOption[];
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  saveSettings: (key: string, model: GeminiModelId) => void;
  testConnection: (key: string, model?: GeminiModelId) => Promise<{ success: boolean; message: string; rawError?: string }>;
}

const GeminiContext = createContext<GeminiContextType | undefined>(undefined);

export const GeminiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => geminiService.getApiKey());
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(() => geminiService.getSelectedModel());
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // If no API key is present initially, we can leave isSettingsModalOpen false or let components trigger it
    const key = geminiService.getApiKey();
    setApiKey(key);
  }, []);

  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0);

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  const saveSettings = (newKey: string, newModel: GeminiModelId) => {
    geminiService.setApiKey(newKey);
    geminiService.setSelectedModel(newModel);
    setApiKey(newKey.trim());
    setSelectedModel(newModel);
  };

  const testConnection = async (key: string, model?: GeminiModelId) => {
    return geminiService.testConnection(key, model || selectedModel);
  };

  return (
    <GeminiContext.Provider
      value={{
        apiKey,
        selectedModel,
        hasApiKey,
        isSettingsModalOpen,
        models: AVAILABLE_MODELS,
        openSettingsModal,
        closeSettingsModal,
        saveSettings,
        testConnection,
      }}
    >
      {children}
    </GeminiContext.Provider>
  );
};

export const useGemini = (): GeminiContextType => {
  const ctx = useContext(GeminiContext);
  if (!ctx) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return ctx;
};
