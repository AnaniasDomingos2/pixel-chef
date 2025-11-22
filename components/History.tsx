import React from 'react';
import { Recipe } from '../types';
import { Clock, Trash2 } from 'lucide-react';

interface HistoryProps {
  history: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onClearHistory: () => void;
  texts: any;
}

const History: React.FC<HistoryProps> = ({ history, onSelectRecipe, onClearHistory, texts }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-20 px-6 animate-fade-in">
        <div className="w-24 h-24 bg-chef-100 dark:bg-darkbg-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-colors animate-pulse-slow">
          <Clock className="text-chef-300 dark:text-gray-600" size={40} />
        </div>
        <h3 className="text-chef-900 dark:text-white font-bold text-xl mb-2">{texts.historyEmptyTitle}</h3>
        <p className="text-chef-500 dark:text-gray-400 font-medium">{texts.historyEmptySub}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto pb-20 animate-slide-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-chef-900 dark:text-white transition-colors">{texts.historyTitle}</h2>
        <button 
          onClick={onClearHistory}
          className="text-xs font-bold text-chef-800 dark:text-gray-300 bg-chef-200 dark:bg-darkbg-800 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors active:scale-95"
        >
          <Trash2 size={12} /> {texts.clearHistory}
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item, idx) => (
          <div 
            key={item.id || idx}
            onClick={() => onSelectRecipe(item)}
            className="bg-white dark:bg-darkbg-800 p-5 rounded-2xl shadow-sm dark:shadow-none border-2 border-transparent hover:border-chef-200 dark:hover:border-chef-800 cursor-pointer hover:shadow-md transition-all flex justify-between items-center group animate-scale-in hover:-translate-x-[-5px]"
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-chef-600 dark:text-chef-300 bg-chef-100 dark:bg-darkbg-700 px-2 py-0.5 rounded transition-colors">
                  {item.type || texts.classic}
                </span>
                <span className="text-xs font-medium text-chef-400 dark:text-gray-500">
                  {new Date(item.timestamp || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg text-chef-900 dark:text-white group-hover:text-chef-500 dark:group-hover:text-chef-400 transition-colors">{item.titulo}</h3>
              <p className="text-xs text-chef-500 dark:text-gray-400 mt-1 truncate max-w-[200px] font-medium">
                {item.ingredientes.join(", ")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-chef-50 dark:bg-darkbg-700 flex items-center justify-center text-chef-300 dark:text-gray-500 group-hover:bg-chef-500 group-hover:text-white transition-all transform group-hover:rotate-45">
              →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;