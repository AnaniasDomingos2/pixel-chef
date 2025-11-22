
import React, { useState } from 'react';
import { Recipe } from '../types';
import { Clock, ChefHat, Flame, Download, Bookmark, Check, Copy, Share2, ArrowLeft } from 'lucide-react';
import { RECIPE_TYPES } from '../constants';

interface RecipeCardProps {
  recipe: Recipe;
  dishImage: string | null;
  onGenerateVariation: (type: string) => void;
  onExport: () => void;
  onShare: () => void;
  onCopyText: () => void;
  onGoHome: () => void;
  isExporting: boolean;
  isGeneratingImage: boolean;
  texts: any;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  dishImage,
  onGenerateVariation, 
  onExport,
  onShare,
  onCopyText,
  onGoHome,
  isExporting,
  isGeneratingImage,
  texts
}) => {
  
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const handleCopy = () => {
    onCopyText();
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  const handleDownloadImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dishImage) {
      const link = document.createElement('a');
      link.href = dishImage;
      link.download = `pixelchef-${recipe.titulo.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
    }
  };

  const variations = [
    { type: RECIPE_TYPES.FITNESS, label: `🥗 ${texts.fitness}`, color: 'hover:border-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-darkbg-800 dark:hover:text-green-400' },
    { type: RECIPE_TYPES.ECONOMICA, label: `💰 ${texts.economic}`, color: 'hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-darkbg-800 dark:hover:text-yellow-400' },
    { type: RECIPE_TYPES.RAPIDA, label: `⚡ ${texts.quick}`, color: 'hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-darkbg-800 dark:hover:text-blue-400' },
    { type: RECIPE_TYPES.SEM_FOGAO, label: `🚫 ${texts.noStove}`, color: 'hover:border-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-darkbg-800 dark:hover:text-red-400' }
  ];

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up pb-10">
      
      {/* Action Bar - Hidden during export */}
      {!isExporting && (
        <div className="flex justify-between items-center mb-6 px-2 flex-wrap gap-y-3">
          <div className="flex gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-chef-600 dark:text-chef-400 bg-chef-100 dark:bg-darkbg-800 px-4 py-1.5 rounded-full transition-colors animate-scale-in">
              {recipe.type || texts.classic}
            </span>
          </div>
          <div className="flex gap-3">
            {/* Copy Button */}
            <button 
              onClick={handleCopy}
              className="p-3 rounded-full text-chef-600 dark:text-gray-300 bg-white dark:bg-darkbg-800 hover:bg-chef-50 dark:hover:bg-darkbg-700 shadow-sm transition-all hover:scale-110 active:scale-90 relative"
              title={texts.copyText}
            >
              {showCopySuccess ? <Check size={20} className="text-chef-500" /> : <Copy size={20} />}
              {showCopySuccess && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-[10px] bg-chef-900 text-white px-2 py-1 rounded opacity-90 whitespace-nowrap">
                  {texts.copySuccess}
                </span>
              )}
            </button>

            {/* Download Button */}
            <button 
              onClick={onExport}
              disabled={isExporting}
              className="p-3 rounded-full text-chef-600 dark:text-gray-300 bg-white dark:bg-darkbg-800 hover:bg-chef-50 dark:hover:bg-darkbg-700 shadow-sm transition-all hover:scale-110 active:scale-90"
              title={texts.export}
            >
              <Download size={20} />
            </button>

            {/* SHARE BUTTON (Prominent) */}
            <button 
              onClick={onShare}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-chef-500 to-chef-600 hover:from-chef-400 hover:to-chef-500 shadow-lg shadow-chef-500/20 transition-all hover:scale-105 active:scale-95"
              title={texts.share}
            >
              <Share2 size={18} />
              <span>{texts.share}</span>
            </button>
          </div>
        </div>
      )}

      {/* The Printable Card Area */}
      <div 
        id="recipe-card" 
        className="bg-white dark:bg-darkbg-900 rounded-[2rem] shadow-2xl shadow-chef-900/5 dark:shadow-black/40 border border-chef-100 dark:border-darkbg-800 relative mx-auto transform transition-all duration-500 hover:shadow-chef-500/10"
        style={{ maxWidth: '100%' }}
      >
        {/* Hero Image Area - Rounded Top, Straight Bottom */}
        <div className="relative w-full bg-chef-200 dark:bg-darkbg-800 aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center rounded-t-[2rem] overflow-hidden group">
           {dishImage ? (
             <>
               <img src={dishImage} alt={recipe.titulo} className="w-full h-full object-cover animate-fade-in" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
               
               {/* Download Button for Image Only */}
               {!isExporting && (
                 <button 
                    onClick={handleDownloadImage}
                    className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-all transform hover:scale-110 active:scale-95 border border-white/30"
                    title={texts.downloadImage}
                 >
                   <Download size={18} />
                 </button>
               )}
             </>
           ) : (
             <div className="absolute inset-0 flex items-center justify-center bg-chef-100 dark:bg-darkbg-800">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center gap-3">
                     <div className="w-8 h-8 border-4 border-chef-300 border-t-chef-600 rounded-full animate-spin"></div>
                     <span className="text-xs font-bold text-chef-600 dark:text-chef-400 animate-pulse">{texts.generatingImage}</span>
                  </div>
                ) : (
                  // Fallback pattern if image fails or isn't present
                  <div className="opacity-20 dark:opacity-5 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #10B981 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                )}
             </div>
           )}
        </div>

        {/* Decorative Header Info - Sits right below image with slight overlap visual effect handled by padding/margin */}
        <div className="bg-chef-900 dark:bg-black p-8 text-center relative overflow-hidden z-10 -mt-1">
           <div className="relative z-10">
             <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-md animate-float">
               {recipe.titulo}
             </h2>
             <div className="inline-flex items-center gap-3 text-chef-100 text-sm font-semibold mt-2 bg-white/10 px-5 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
               <Clock size={16} className="text-chef-400" /> {recipe.tempo}
               <span className="w-1 h-1 rounded-full bg-white/30"></span>
               <ChefHat size={16} className="text-chef-400" /> {texts.easy}
             </div>
           </div>
        </div>
        
        <div className="p-8 space-y-8 bg-white dark:bg-darkbg-900 relative transition-colors rounded-b-[2rem]">
           {/* Description */}
          <p className="text-chef-800 dark:text-gray-300 italic text-center font-medium text-sm leading-relaxed px-6 border-l-4 border-chef-500 pl-6 bg-chef-50 dark:bg-darkbg-800 py-4 rounded-r-2xl transition-colors">
            "{recipe.descricao}"
          </p>

          {/* Content Grid */}
          <div className="space-y-8">
            {/* Ingredients */}
            <div>
              <h3 className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-widest text-chef-500 dark:text-chef-400 mb-5">
                <span className="w-6 h-[2px] bg-chef-500 rounded-full"></span>
                {texts.ingredientsTitle}
              </h3>
              <ul className="grid grid-cols-1 gap-3">
                {recipe.ingredientes.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 text-chef-900 dark:text-gray-200 text-sm font-medium group">
                    <div className="w-2 h-2 bg-chef-400/40 rounded-full group-hover:bg-chef-500 transition-all group-hover:scale-150"></div>
                    <span className="border-b border-transparent group-hover:border-chef-100 dark:group-hover:border-darkbg-700 pb-0.5 transition-all">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation */}
            <div>
              <h3 className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-widest text-chef-500 dark:text-chef-400 mb-5">
                <span className="w-6 h-[2px] bg-chef-500 rounded-full"></span>
                {texts.prepTitle}
              </h3>
              <div className="space-y-6">
                {recipe.modo_preparo.map((step, i) => (
                  <div key={i} className="flex gap-4 relative group">
                    <div className="flex flex-col items-center">
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-chef-100 dark:bg-darkbg-800 text-chef-800 dark:text-chef-400 font-bold text-sm shrink-0 border border-chef-200 dark:border-darkbg-700 transition-colors group-hover:bg-chef-500 group-hover:text-white">
                        {i + 1}
                      </span>
                      {i !== recipe.modo_preparo.length - 1 && (
                        <div className="w-[2px] h-full bg-chef-50 dark:bg-darkbg-800 my-1 transition-colors"></div>
                      )}
                    </div>
                    <p className="text-chef-700 dark:text-gray-300 text-sm leading-relaxed py-1 font-medium group-hover:text-chef-900 dark:group-hover:text-white transition-colors">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef's Tip */}
            {recipe.variacoes && recipe.variacoes.length > 0 && (
              <div className="bg-gradient-to-br from-chef-50 to-chef-100 dark:from-darkbg-800 dark:to-darkbg-800/50 p-6 rounded-2xl border border-chef-200 dark:border-darkbg-700 dashed border-2 transition-colors hover:border-chef-300 dark:hover:border-darkbg-600">
                <h4 className="flex items-center gap-2 text-chef-900 dark:text-white font-bold text-sm mb-2">
                  <Flame size={20} className="text-chef-500 fill-current animate-pulse" /> {texts.chefTip}
                </h4>
                <p className="text-chef-800 dark:text-gray-300 text-xs leading-relaxed font-medium">
                  {recipe.variacoes[0]}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer for Export */}
        <div className="bg-chef-50 dark:bg-darkbg-950 border-t border-chef-100 dark:border-darkbg-800 py-5 px-8 flex justify-between items-center transition-colors rounded-b-[2rem]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-chef-900 dark:bg-chef-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <ChefHat size={18} />
            </div>
            <div>
              <p className="text-chef-900 dark:text-white font-serif font-bold text-sm leading-none">PixelChef</p>
              <p className="text-[10px] text-chef-500 dark:text-chef-400 font-bold uppercase tracking-wider mt-0.5">AI Kitchen</p>
            </div>
          </div>
          <p className="text-[10px] text-chef-400 dark:text-gray-500 font-bold">
            pixelchef.app
          </p>
        </div>
      </div>

      {/* Alternative Options Buttons - Hidden during export */}
      {!isExporting && (
        <div className="mt-8 space-y-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="space-y-4">
            <p className="text-center text-chef-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest">
                {texts.variationsTitle}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {variations.map((opt, idx) => (
                <button 
                    key={opt.type}
                    onClick={() => onGenerateVariation(opt.type)}
                    className={`bg-white dark:bg-darkbg-800 border-2 border-chef-100 dark:border-darkbg-700 py-3 px-2 rounded-2xl text-chef-600 dark:text-gray-300 text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 hover:-translate-y-1 ${opt.color}`}
                    style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
                >
                    {opt.label}
                </button>
                ))}
            </div>
          </div>

          {/* New Recipe Button */}
          <button 
            onClick={onGoHome}
            className="w-full flex items-center justify-center gap-2 py-4 text-chef-500 dark:text-chef-400 hover:bg-chef-50 dark:hover:bg-darkbg-800 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-chef-200 dark:hover:border-darkbg-700 group"
          >
             <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
             {texts.newRecipeBtn}
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
