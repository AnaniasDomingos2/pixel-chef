
import React, { useState } from 'react';
import { ChefHat, History as HistoryIcon, Moon, Sun, Globe } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  onShowHistory: () => void;
  onGoHome: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  hasHistory: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onShowHistory, 
  onGoHome, 
  isDarkMode, 
  toggleTheme,
  language,
  setLanguage,
  hasHistory
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'es', label: 'ES', flag: '🇪🇸' }
  ];

  return (
    <header className="flex justify-between items-center py-6 px-4 mb-4 sticky top-0 bg-chef-50/90 dark:bg-darkbg-950/90 backdrop-blur-md z-50 transition-all duration-300 border-b border-transparent dark:border-darkbg-800/50">
      <div 
        className="flex items-center gap-3 cursor-pointer group select-none"
        onClick={onGoHome}
      >
        <div className="bg-chef-500 dark:bg-chef-600 text-white p-2.5 rounded-2xl shadow-lg shadow-chef-500/20 dark:shadow-none transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
          <ChefHat size={26} strokeWidth={2.5} />
        </div>
        <div>
            <h1 className="font-serif text-2xl font-extrabold text-chef-900 dark:text-white tracking-tight leading-none transition-colors">
            PixelChef
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-chef-500 dark:text-chef-400 uppercase animate-pulse-slow">AI Kitchen</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-3 flex items-center gap-1 text-chef-600 dark:text-gray-300 hover:bg-chef-100 dark:hover:bg-darkbg-800 rounded-2xl transition-all duration-300 active:scale-95"
            aria-label="Select Language"
          >
            <Globe size={20} strokeWidth={2} />
            <span className="text-xs font-bold uppercase ml-1">{languages.find(l => l.code === language)?.label}</span>
          </button>
          
          {showLangMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white dark:bg-darkbg-900 border border-chef-100 dark:border-darkbg-700 rounded-2xl shadow-xl overflow-hidden animate-scale-in origin-top-right min-w-[120px]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 hover:bg-chef-50 dark:hover:bg-darkbg-800 transition-colors
                    ${language === lang.code ? 'text-chef-600 dark:text-chef-400 bg-chef-50/50 dark:bg-darkbg-800/50' : 'text-chef-800 dark:text-gray-300'}
                  `}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-chef-200 dark:bg-darkbg-700 mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-3 text-chef-600 dark:text-gray-300 hover:bg-chef-100 dark:hover:bg-darkbg-800 rounded-2xl transition-all duration-300 active:scale-95 hover:rotate-12"
          aria-label="Alternar Tema"
        >
          {isDarkMode ? <Sun size={24} strokeWidth={2} /> : <Moon size={24} strokeWidth={2} />}
        </button>

        <button 
          onClick={onShowHistory}
          className="relative p-3 text-chef-600 dark:text-gray-300 hover:text-chef-800 dark:hover:text-white hover:bg-chef-100 dark:hover:bg-darkbg-800 rounded-2xl transition-all duration-300 active:scale-95"
          aria-label="Histórico"
        >
          <HistoryIcon size={24} strokeWidth={2} />
          {hasHistory && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-chef-500 border-2 border-chef-50 dark:border-darkbg-900 rounded-full animate-scale-in"></span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
