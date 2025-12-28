import React from 'react';

interface SpiritGuideProps {
  isOpen: boolean;
  isLoading: boolean;
  message: string;
  onClose: () => void;
}

export const SpiritGuide: React.FC<SpiritGuideProps> = ({ isOpen, isLoading, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border-2 border-emerald-900 w-full max-w-2xl p-8 shadow-2xl shadow-emerald-900/20 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-emerald-700 hover:text-emerald-400 text-2xl font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-serif text-emerald-500 mb-6 border-b border-emerald-900 pb-2 text-center">
          Whispers of the Void
        </h2>

        <div className="min-h-[150px] flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-900 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-emerald-700 animate-pulse font-serif italic">The spirits are contemplating the threads of fate...</p>
            </div>
          ) : (
            <p className="text-lg text-emerald-100 font-serif leading-relaxed italic text-center">
              "{message}"
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 rounded transition-colors font-serif"
          >
            Return to the Mortal Realm
          </button>
        </div>
      </div>
    </div>
  );
};