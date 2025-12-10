import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Language } from './types';

interface LayoutProps {
  children: React.ReactNode;
  onHistoryClick?: () => void;
  onSettingsClick?: () => void;
  onInfoClick?: () => void;
  showIcons?: boolean;
}

const FLAGS: Record<Language, string> = { es: '🇪🇸', en: '🇺🇸', it: '🇮🇹' };

const Layout: React.FC<LayoutProps> = ({ children, onHistoryClick, onSettingsClick, onInfoClick, showIcons = true }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-start pt-4 sm:pt-10 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative mb-4">
        <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between text-white shrink-0 shadow-md z-20">
          <div className="flex-1 min-w-0 mr-2">
            <h1 className="text-lg font-bold tracking-tight truncate leading-tight">📱 {t.appTitle}</h1>
            <p className="text-indigo-100 text-[10px] mt-0.5 opacity-90 truncate">{t.appSubtitle}</p>
          </div>
          
          <div className="flex items-center gap-0.5 shrink-0">
            <div className="relative mr-0.5" ref={langMenuRef}>
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none text-lg" title="Change Language">{FLAGS[language]}</button>
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl py-2 min-w-[50px] overflow-hidden z-50 border border-gray-100 animate-fade-in">
                  {(Object.keys(FLAGS) as Language[]).map((lang) => (
                    <button key={lang} onClick={() => { setLanguage(lang); setIsLangOpen(false); }} className={`w-full text-center py-2 hover:bg-gray-100 text-xl ${language === lang ? 'bg-indigo-50' : ''}`}>{FLAGS[lang]}</button>
                  ))}
                </div>
              )}
            </div>

            {showIcons && (
              <>
                 <button onClick={onInfoClick} className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50" title={t.infoTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                 <button onClick={onSettingsClick} className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50" title={t.settingsTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </button>
                <button onClick={onHistoryClick} className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50" title={t.historyTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </button>
              </>
            )}
          </div>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 h-full relative">{children}</main>
        <footer className="bg-gray-50 p-2 text-center border-t border-gray-100"><p className="text-[10px] text-gray-400 font-medium">App creada por Geray Padilla</p></footer>
      </div>
    </div>
  );
};

export default Layout;