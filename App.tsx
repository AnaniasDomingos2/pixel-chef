
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import InputIngredients from './components/InputIngredients';
import RecipeCard from './components/RecipeCard';
import History from './components/History';
import AdBanner from './components/AdBanner';
import Notification, { NotificationState } from './components/Notification';
import { Recipe, Language } from './types';
import { generateRecipe, generateDishImage, validateIngredients } from './services/geminiService';
import { TRANSLATIONS } from './constants';

// Helper function to convert Base64 to Blob reliably across browsers
const base64ToBlob = (base64: string, mimeType: string = 'image/png'): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
};

const App: React.FC = () => {
  // Views: 'input' | 'result' | 'history'
  const [view, setView] = useState<'input' | 'result' | 'history'>('input');
  
  // State
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [dishImage, setDishImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [history, setHistory] = useState<Recipe[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  
  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pixelchef_language');
      return (saved as Language) || 'pt-BR';
    }
    return 'pt-BR';
  });

  // Persist Language
  useEffect(() => {
    localStorage.setItem('pixelchef_language', language);
  }, [language]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pixelchef_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Toggle Theme Handler
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('pixelchef_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pixelchef_theme', 'light');
    }
  }, [isDarkMode]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('pixelchef_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save or Update History Item
  const saveOrUpdateHistory = useCallback((recipeToSave: Recipe) => {
    setHistory(prev => {
      // Check if recipe already exists to update it (e.g. adding image)
      const index = prev.findIndex(r => r.id === recipeToSave.id);
      
      let updatedHistory;
      if (index >= 0) {
        updatedHistory = [...prev];
        updatedHistory[index] = recipeToSave;
      } else {
        updatedHistory = [recipeToSave, ...prev];
      }

      try {
        localStorage.setItem('pixelchef_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error("LocalStorage full or error saving history", e);
      }
      return updatedHistory;
    });
  }, []);

  // Get current translations
  const t = TRANSLATIONS[language];

  const showNotification = (title: string, message: string, type: 'error' | 'success') => {
    setNotification({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const handleGenerate = async (variationType: string = "Clássica") => {
    setIsLoading(true);
    setDishImage(null); // Reset image on new generation
    
    try {
      // Determine which ingredients to use
      let ingredientsToUse = ingredients.length > 0 ? ingredients : recipe?.ingredientes || [];
      
      // If generating from fresh input (not a variation of an existing result), Validate first!
      if (view === 'input') {
         const validIngredients = await validateIngredients(ingredients);
         
         if (validIngredients.length === 0) {
            setIsLoading(false);
            showNotification(t.oops, t.invalidIngredientsError, 'error');
            return;
         }
         
         // Update ingredients to use only valid ones
         ingredientsToUse = validIngredients;
         
         // If some ingredients were removed, we silently update, or we could warn user.
         if (validIngredients.length !== ingredients.length) {
            setIngredients(validIngredients);
         }
      }
      
      // 1. Generate Text Recipe
      const result = await generateRecipe(ingredientsToUse, variationType, language);
      setRecipe(result);
      
      // 2. Auto Save to History (Initial Save - Text Only)
      saveOrUpdateHistory(result);
      
      setView('result');
      setIsLoading(false); // Stop text loading

      // 3. Auto Generate Image (Now passing variationType)
      setIsGeneratingImage(true);
      try {
        const imageBase64 = await generateDishImage(result.titulo, variationType, language);
        setDishImage(imageBase64);
        
        // 4. Update Recipe with Image and Save again to History
        const recipeWithImage = { ...result, imageUrl: imageBase64 };
        setRecipe(recipeWithImage);
        saveOrUpdateHistory(recipeWithImage);

      } catch (imgError) {
        console.error("Failed to auto-generate image", imgError);
      } finally {
        setIsGeneratingImage(false);
      }

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      showNotification(t.oops, t.genError, 'error');
    }
  };

  // Core Capture Logic using html2canvas (Used for Export Card only)
  const captureRecipeCard = async (): Promise<Blob | null> => {
    if (!window.html2canvas) return null;

    const element = document.getElementById('recipe-card');
    if (!element) return null;

    try {
        // Detect background color based on theme
        const bgColor = isDarkMode ? '#18181b' : '#ECFDF5';

        const canvas = await window.html2canvas(element, {
            scale: 2, // Retina quality
            backgroundColor: bgColor, 
            useCORS: true,
            logging: false,
            windowWidth: 1080, // Simulate mobile width for consistency
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.getElementById('recipe-card');
                if(clonedElement) {
                    clonedElement.style.borderRadius = '2rem';
                    clonedElement.style.overflow = 'hidden';
                }
            }
        });

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png', 1.0);
        });
    } catch (err) {
        console.error("Capture failed", err);
        return null;
    }
  };

  const handleCopyText = async () => {
    if (!recipe) return;
    const textToCopy = `
🍽️ ${recipe.titulo.toUpperCase()}
${recipe.descricao}

🥘 INGREDIENTES:
${recipe.ingredientes.map(i => `• ${i}`).join('\n')}

👨‍🍳 MODO DE PREPARO:
${recipe.modo_preparo.map((step, i) => `${i + 1}. ${step}`).join('\n')}

💡 ${t.chefTip}: ${recipe.variacoes[0] || ''}

⏱️ ${recipe.tempo} | ✨ Generated by PixelChef
    `.trim();

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleExport = async () => {
    if (!window.html2canvas) {
      showNotification(t.oops, t.exportError, 'error');
      return;
    }
    
    setIsExporting(true);
    // Allow UI to update (remove buttons and ads) before capturing
    await new Promise(resolve => setTimeout(resolve, 200));

    const blob = await captureRecipeCard();
    
    if (blob) {
        const link = document.createElement("a");
        const filename = recipe?.titulo 
          ? `pixelchef-${recipe.titulo.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
          : 'pixelchef-receita.png';
          
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        showNotification(t.success, t.copySuccess, 'success');
    } else {
        showNotification(t.oops, "Erro ao exportar a imagem.", 'error');
    }
    
    setIsExporting(false);
  };

  const handleShare = async () => {
    if (!recipe) return;

    // 1. Smart Copy: Copy text first so user can paste in caption
    await handleCopyText();
    showNotification(t.success, t.shareTextCopied, 'success');

    // 2. Check if we have a dish image to share
    if (!dishImage) {
      // Only share if the image exists. We do not fallback to card capture anymore per user request.
      if (isGeneratingImage) {
        showNotification(t.oops, "Aguarde a imagem ser gerada...", 'error');
      } else {
        showNotification(t.oops, "Imagem não disponível para esta receita.", 'error');
      }
      return;
    }

    try {
      // 3. Convert Base64 Image to Blob securely
      const blob = base64ToBlob(dishImage);
      
      // Create a File object (required for navigator.share)
      const cleanTitle = recipe.titulo.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const file = new File([blob], `pixelchef-${cleanTitle}.png`, { type: "image/png" });

      // 4. Share using Native API
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
              files: [file],
              title: recipe.titulo,
              text: `Confira esta receita de ${recipe.titulo}!`, 
          });
      } else {
          // Fallback for Desktop/Unsupported: Download the image file
          const link = document.createElement("a");
          link.download = `pixelchef-${cleanTitle}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          showNotification(t.success, "Imagem baixada! (Seu dispositivo não suporta partilha direta)", 'success');
      }
    } catch (err) {
      console.error("Share failed", err);
      // Ignore AbortError (user cancelled share sheet)
      if ((err as Error).name !== 'AbortError') {
        showNotification(t.oops, t.shareError, 'error');
      }
    }
  };

  const handleHistorySelect = (selected: Recipe) => {
    setRecipe(selected);
    // Restore image from history if it exists
    setDishImage(selected.imageUrl || null); 
    setView('result');
  };

  const clearHistory = () => {
    if (window.confirm(t.confirmClear)) {
      setHistory([]);
      localStorage.removeItem('pixelchef_history');
    }
  };

  const handleGoHome = () => {
      setView('input');
      setIngredients([]);
      setRecipe(null);
      setDishImage(null);
  };

  return (
    <div className="min-h-screen font-sans bg-chef-50 dark:bg-darkbg-950 text-chef-900 dark:text-gray-100 flex flex-col transition-colors duration-500">
      <div className="max-w-2xl w-full mx-auto min-h-screen flex flex-col relative shadow-2xl shadow-chef-900/5 dark:shadow-black/50 bg-white/60 dark:bg-darkbg-950 sm:bg-chef-50 sm:dark:bg-darkbg-950">
        <Header 
          onShowHistory={() => setView('history')} 
          onGoHome={handleGoHome}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          language={language}
          setLanguage={setLanguage}
          hasHistory={history.length > 0}
        />

        <main className="flex-1 px-4 flex flex-col relative z-10">
          {view === 'input' && (
            <div className="my-auto pb-20 animate-fade-in">
              <InputIngredients 
                ingredients={ingredients}
                setIngredients={setIngredients}
                onGenerate={() => handleGenerate(t.classic)}
                isLoading={isLoading}
                texts={t}
                language={language}
              />
            </div>
          )}

          {view === 'result' && recipe && (
            <div className="pb-8">
              <RecipeCard 
                recipe={recipe}
                dishImage={dishImage}
                onGenerateVariation={(type) => handleGenerate(type)}
                onExport={handleExport}
                onShare={handleShare}
                onCopyText={handleCopyText}
                onGoHome={handleGoHome}
                isExporting={isExporting}
                isGeneratingImage={isGeneratingImage}
                texts={t}
              />
            </div>
          )}

          {view === 'history' && (
            <History 
              history={history}
              onSelectRecipe={handleHistorySelect}
              onClearHistory={clearHistory}
              texts={t}
            />
          )}
        </main>
        
        {/* Notification Toast */}
        <Notification 
          notification={notification} 
          onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} 
        />

        {/* Bottom Ad Slot - The only one remaining */}
        <div className="px-4 mt-4">
           <AdBanner label={t.adLabel} />
        </div>

        <footer className="py-8 text-center text-chef-400 dark:text-gray-600 text-xs mt-auto border-t border-chef-100 dark:border-darkbg-800 bg-chef-50 dark:bg-darkbg-950 transition-colors">
           <p className="font-semibold text-chef-600 dark:text-chef-400">{t.footerText} © {new Date().getFullYear()}</p>
           <p className="mt-1 opacity-70">Criado por Ananias Domingos</p>
        </footer>
      </div>
      
      {/* Loading Overlay for text generation only */}
      {view === 'result' && isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-chef-200 dark:border-darkbg-800 border-t-chef-500 dark:border-t-chef-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">👨‍🍳</div>
          </div>
          <p className="mt-4 text-chef-800 dark:text-white font-serif font-bold text-lg animate-pulse">
            {t.creatingVersion}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
