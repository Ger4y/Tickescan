import React from 'react';
import { useLanguage } from '../LanguageContext';

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full animate-fade-in bg-gray-50">
      <div className="bg-white p-4 shadow-sm z-10 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">ℹ️ {t.infoTitle}</h2>
        <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">✕</button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto space-y-8">
        
        {/* Step 1: Scanning */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">1</span>
            <h3 className="font-bold text-gray-800">{t.howItWorks}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-8">
            {t.howItWorksBody}
          </p>
        </section>

        {/* Step 2: Export */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">2</span>
            <h3 className="font-bold text-gray-800">{t.exportSheets}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-8 mb-2">
            {t.exportSheetsBody}
          </p>
          <div className="bg-white border border-gray-200 rounded-lg p-3 ml-8">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">{t.onDevice}</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>{t.openSheets}</li>
              <li>{t.openCSV}</li>
            </ol>
          </div>
        </section>

        {/* Step 3: Formulas */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">3</span>
            <h3 className="font-bold text-gray-800">{t.trickTitle}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-8 mb-3">
            {t.trickBody}
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 ml-8 text-sm text-green-800">
            <p className="font-mono bg-white p-1 rounded border border-green-100 mb-2 text-center select-all">=SUMA(C:C)</p>
            <p>{t.trickInstruction}</p>
          </div>
        </section>

         <section className="pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-400">Versión 1.3.0</p>
         </section>
      </div>
    </div>
  );
};

export default InfoModal;