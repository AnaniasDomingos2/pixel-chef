import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { COMMON_INGREDIENTS_BY_LANG } from '../constants';
import { Language } from '../types';

interface InputIngredientsProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: () => void;
  isLoading: boolean;
  texts: any;
  language: Language;
}

const InputIngredients: React.FC<InputIngredientsProps> = ({ 
  ingredients, 
  setIngredients, 
  onGenerate,
  isLoading,
  texts,
  language
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 0) {
      const commonList = COMMON_INGREDIENTS_BY_LANG[language] || COMMON_INGREDIENTS_BY_LANG['pt-BR'];
      const filtered = commonList.filter(item => 
        item.toLowerCase().includes(value.toLowerCase()) && 
        !ingredients.includes(item)
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const addIngredient = (ingredient: string) => {
    if (ingredients.length < 3 && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue) {
      addIngredient(inputValue);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-8 animate-slide-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl text-chef-900 dark:text-white font-bold mb-3 transition-colors tracking-tight">{texts.inputTitle}</h2>
        <p className="text-chef-600 dark:text-gray-400 font-medium transition-colors">{texts.inputSubtitle}</p>
      </div>

      {/* Ingredient Display Chips */}
      <div className="flex flex-wrap gap-3 justify-center min-h-[70px] content-start transition-all duration-300">
        {ingredients.map((ing, idx) => (
          <div 
            key={`${ing}-${idx}`} 
            className="flex items-center gap-2 bg-white dark:bg-darkbg-800 border-2 border-chef-200 dark:border-darkbg-700 px-5 py-2.5 rounded-2xl shadow-sm animate-scale-in transition-all hover:border-chef-400 dark:hover:border-chef-600 hover:-translate-y-1"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <span className="text-chef-900 dark:text-gray-100 font-semibold">{ing}</span>
            <button 
              onClick={() => removeIngredient(idx)}
              className="text-chef-500 dark:text-chef-400 hover:text-red-500 dark:hover:text-red-400 transition-colors bg-chef-50 dark:bg-darkbg-900 rounded-full p-0.5 hover:bg-red-50 dark:hover:bg-red-900/50"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ))}
        {ingredients.length === 0 && (
          <div className="text-chef-400 dark:text-gray-600 border-2 border-dashed border-chef-200 dark:border-darkbg-800 rounded-2xl px-6 py-3 text-sm font-medium animate-pulse">
            {texts.noIngredients}
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="relative z-20 transform transition-all duration-300">
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={ingredients.length >= 3}
            placeholder={ingredients.length >= 3 ? texts.placeholderLimit : texts.placeholderNormal}
            className="w-full bg-white dark:bg-darkbg-900 border-2 border-chef-200 dark:border-darkbg-700 text-chef-900 dark:text-white rounded-3xl py-5 pl-14 pr-4 shadow-sm placeholder:text-chef-300 dark:placeholder:text-gray-600 focus:outline-none focus:border-chef-500 dark:focus:border-chef-500 focus:ring-4 focus:ring-chef-500/10 dark:focus:ring-chef-500/20 transition-all disabled:opacity-50 disabled:bg-chef-50 dark:disabled:bg-darkbg-800 font-medium"
          />
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-chef-400 dark:text-gray-500 group-focus-within:text-chef-500 dark:group-focus-within:text-chef-400 transition-colors duration-300" size={22} />
          
          {inputValue && ingredients.length < 3 && (
            <button 
              onClick={() => addIngredient(inputValue)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-chef-500 hover:bg-chef-600 text-white p-2 rounded-xl transition-all shadow-md shadow-chef-500/20 hover:scale-110 active:scale-90"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-darkbg-800 border border-chef-100 dark:border-darkbg-700 rounded-2xl shadow-xl dark:shadow-black/50 overflow-hidden z-30 animate-scale-in origin-top">
            {suggestions.map((suggestion, idx) => (
              <li 
                key={idx}
                onClick={() => addIngredient(suggestion)}
                className="px-5 py-4 hover:bg-chef-50 dark:hover:bg-darkbg-700 text-chef-800 dark:text-gray-200 font-medium cursor-pointer border-b border-chef-50 dark:border-darkbg-700 last:border-0 flex justify-between items-center group transition-colors"
              >
                {suggestion}
                <Plus size={16} className="text-chef-300 dark:text-gray-600 group-hover:text-chef-500 dark:group-hover:text-chef-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110" />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={onGenerate}
        disabled={ingredients.length === 0 || isLoading}
        className={`
          w-full py-5 rounded-3xl text-lg font-bold text-white shadow-xl transform transition-all duration-300 border-b-4
          ${ingredients.length > 0 && !isLoading 
            ? "bg-gradient-to-r from-chef-500 to-chef-800 hover:from-chef-400 hover:to-chef-600 border-chef-900/20 hover:scale-[1.02] hover:shadow-chef-500/30 active:scale-[0.98]" 
            : "bg-chef-200 dark:bg-darkbg-800 border-chef-300 dark:border-darkbg-700 cursor-not-allowed text-chef-400 dark:text-gray-600"}
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {texts.loadingBtn}
          </span>
        ) : texts.generateBtn}
      </button>
    </div>
  );
};

export default InputIngredients;