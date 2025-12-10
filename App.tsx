import React, { useState, useCallback, useEffect } from 'react';
import Layout from './Layout';
import ImageUploader from './ImageUploader';
import ReceiptForm from './ReceiptForm';
import History from './History';
import Settings from './Settings';
import InfoModal from './InfoModal';
import { scanReceipt } from './geminiService';
import { AppState, ReceiptData, ProcessingError, ExtractionSettings } from './types';
import { useLanguage } from './LanguageContext';

const INITIAL_DATA: ReceiptData = {
  id: '',
  date: '',
  establishment: '',
  amount: '',
  payer: '',
  timestamp: 0
};

const DEFAULT_SETTINGS: ExtractionSettings = {
  extractItems: false,
  extractItemCount: false,
  extractCategory: false,
  extractNotes: false
};

const STORAGE_KEY = 'receipt_scanner_history_v1';
const SETTINGS_KEY = 'receipt_scanner_settings_v1';
const SESSION_KEY = 'receipt_scanner_session_v1';

const App: React.FC = () => {
  const [view, setView] = useState<AppState>(AppState.UPLOAD);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptData>(INITIAL_DATA);
  const [error, setError] = useState<ProcessingError | null>(null);
  const [history, setHistory] = useState<ReceiptData[]>([]);
  const [settings, setSettings] = useState<ExtractionSettings>(DEFAULT_SETTINGS);
  
  const { t } = useLanguage();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading history", e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      try {
        const loaded = JSON.parse(savedSettings);
        setSettings({
          extractItems: loaded.extractItems || false,
          extractItemCount: loaded.extractItemCount || false,
          extractCategory: loaded.extractCategory || false,
          extractNotes: loaded.extractNotes || false
        });
      } catch (e) {
        console.error("Error loading settings", e);
      }
    }

    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.currentReceipt && session.currentReceipt.id && session.view === AppState.FORM) {
          setCurrentReceipt(session.currentReceipt);
          setImagePreview(session.imagePreview || null);
          setView(AppState.FORM);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (view === AppState.FORM && currentReceipt.id) {
      const sessionData = { view, currentReceipt, imagePreview };
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch (e) {
        try {
          const sessionNoImage = { ...sessionData, imagePreview: null };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionNoImage));
        } catch (e2) {}
      }
    } else if (view === AppState.SUCCESS || (view === AppState.UPLOAD && !currentReceipt.id)) {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [view, currentReceipt, imagePreview]);

  const saveSettings = (newSettings: ExtractionSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const saveToHistory = (newItem: ReceiptData) => {
    setHistory(prevHistory => {
      const updatedHistory = [...prevHistory, newItem];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prevHistory => {
      const updatedHistory = prevHistory.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  const handleImageSelected = useCallback(async (base64: string) => {
    setImagePreview(base64);
    setView(AppState.PROCESSING);
    setError(null);

    try {
      const extractedData = await scanReceipt(base64, settings);
      setCurrentReceipt({
        ...INITIAL_DATA,
        ...extractedData,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now()
      });
      setView(AppState.FORM);
    } catch (err: unknown) {
      setError({ message: t.errors.scanFailed });
      setCurrentReceipt({
        ...INITIAL_DATA,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now()
      });
      setView(AppState.FORM);
    }
  }, [settings, t]);

  const handleSubmitData = (data: ReceiptData) => {
    try {
      saveToHistory(data);
      setView(AppState.SUCCESS);
    } catch (err) {
      setError({ message: t.errors.saveFailed });
      setView(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setImagePreview(null);
    setCurrentReceipt(INITIAL_DATA);
    setError(null);
    setView(AppState.UPLOAD);
  };

  const renderContent = () => {
    switch (view) {
      case AppState.HISTORY:
        return <History data={history} onBack={() => setView(AppState.UPLOAD)} onClear={clearHistory} onDeleteOne={deleteHistoryItem} />;
      case AppState.SETTINGS:
        return <Settings settings={settings} onSave={saveSettings} onClose={() => setView(AppState.UPLOAD)} />;
      case AppState.INFO:
        return <InfoModal onClose={() => setView(AppState.UPLOAD)} />;
      case AppState.UPLOAD:
        return <div className="p-6 h-full flex flex-col"><ImageUploader onImageSelected={handleImageSelected} /></div>;
      case AppState.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 animate-pulse p-6">
            <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800">{t.analyzing}</h3>
              <p className="text-gray-500 mt-2">{t.extracting}</p>
            </div>
          </div>
        );
      case AppState.FORM:
        return (
          <div className="h-full flex flex-col p-4">
            {error && <div className="bg-orange-50 text-orange-800 p-3 rounded-lg mb-4 text-sm border border-orange-200 flex items-center gap-2"><span>⚠️</span> {error.message}</div>}
            <ReceiptForm initialData={currentReceipt} settings={settings} imagePreview={imagePreview || ''} onSubmit={handleSubmitData} onCancel={resetApp} isSubmitting={false} />
          </div>
        );
      case AppState.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 animate-fade-in p-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="text-center"><h3 className="text-2xl font-bold text-gray-800">{t.savedTitle}</h3><p className="text-gray-600 mt-2">{t.savedBody}</p></div>
            <div className="flex flex-col w-full gap-3 mt-4">
              <button onClick={resetApp} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg transition transform active:scale-95">{t.scanAnother}</button>
              <button onClick={() => setView(AppState.HISTORY)} className="w-full py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-bold hover:bg-indigo-50 transition">{t.viewHistory}</button>
            </div>
          </div>
        );
      case AppState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 p-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"><svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>
            <div className="text-center"><h3 className="text-2xl font-bold text-gray-800">{t.errorTitle}</h3><p className="text-gray-600 mt-2 max-w-xs">{error?.message || "Error"}</p></div>
            <button onClick={resetApp} className="text-indigo-600 font-bold hover:underline mt-4">{t.backHome}</button>
          </div>
        );
      default: return null;
    }
  };

  const showIcons = view !== AppState.HISTORY && view !== AppState.PROCESSING && view !== AppState.FORM && view !== AppState.SETTINGS && view !== AppState.INFO;

  return (
    <Layout onHistoryClick={() => setView(AppState.HISTORY)} onSettingsClick={() => setView(AppState.SETTINGS)} onInfoClick={() => setView(AppState.INFO)} showIcons={showIcons}>
      {renderContent()}
    </Layout>
  );
};

export default App;