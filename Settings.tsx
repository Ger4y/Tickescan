import React from 'react';
import { ExtractionSettings } from './types';
import { useLanguage } from './LanguageContext';

interface SettingsProps {
  settings: ExtractionSettings;
  onSave: (newSettings: ExtractionSettings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<ExtractionSettings>(settings);
  const { t } = useLanguage();

  const toggle = (key: keyof ExtractionSettings) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      <div className="bg-white p-4 shadow-sm z-10 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">⚙️ {t.settingsTitle}</h2>
        <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">✕</button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">{t.whatToExtract}</h3>
        <div className="space-y-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-col"><span className="font-semibold text-gray-800">🛒 {t.settingItems}</span><span className="text-xs text-gray-500">{t.settingItemsDesc}</span></div>
            <button onClick={() => toggle('extractItems')} className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.extractItems ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${localSettings.extractItems ? 'left-7' : 'left-1'}`} /></button>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col"><span className="font-semibold text-gray-800">📦 {t.settingCount}</span><span className="text-xs text-gray-500">{t.settingCountDesc}</span></div>
            <button onClick={() => toggle('extractItemCount')} className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.extractItemCount ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${localSettings.extractItemCount ? 'left-7' : 'left-1'}`} /></button>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col"><span className="font-semibold text-gray-800">🏷️ {t.settingCategory}</span><span className="text-xs text-gray-500">{t.settingCategoryDesc}</span></div>
            <button onClick={() => toggle('extractCategory')} className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.extractCategory ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${localSettings.extractCategory ? 'left-7' : 'left-1'}`} /></button>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col"><span className="font-semibold text-gray-800">📝 {t.settingNotes}</span><span className="text-xs text-gray-500">{t.settingNotesDesc}</span></div>
            <button onClick={() => toggle('extractNotes')} className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.extractNotes ? 'bg-indigo-600' : 'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${localSettings.extractNotes ? 'left-7' : 'left-1'}`} /></button>
          </div>
        </div>
        <div className="mt-8">
          <button onClick={handleSave} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg">{t.saveChanges}</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;