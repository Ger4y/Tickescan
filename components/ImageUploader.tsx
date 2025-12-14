import React, { useRef } from 'react';
import { useLanguage } from '../LanguageContext';

interface ImageUploaderProps {
  onImageSelected: (base64: string, file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageSelected(event.target.result as string, file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center items-center space-y-6 animate-fade-in">
      {/* Input específico para Cámara (fuerza la cámara trasera) */}
      <input
        type="file"
        ref={cameraInputRef}
        className="hidden"
        accept="image/*"
        capture="environment" 
        onChange={handleFileChange}
      />

      {/* Input específico para Galería (abre selector de archivos) */}
      <input
        type="file"
        ref={galleryInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="w-full space-y-4">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-95"
        >
          <div className="bg-white/20 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">{t.takePhoto}</span>
        </button>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-full group relative flex items-center justify-center gap-3 bg-white border-2 border-indigo-100 text-indigo-600 p-5 rounded-2xl hover:bg-indigo-50 transition-all duration-200 active:scale-95"
        >
           <div className="bg-indigo-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-lg font-semibold">{t.gallery}</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-left mt-6">
        <span className="text-2xl">💡</span>
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>{t.tipTitle}</strong> {t.tipBody}
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;