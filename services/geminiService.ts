import { GoogleGenAI } from "@google/genai";
import { Recipe, Language } from "../types";

// Função helper para recuperar a chave de API de forma segura em diferentes ambientes
const getApiKey = (): string => {
  // 1. Tenta recuperar via Vite (padrão para Vercel/React modernos)
  try {
    // @ts-ignore - import.meta é padrão ESModules/Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignora se não suportado
  }

  // 2. Fallback para ambientes Node.js ou compatíveis com process.env
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // process não definido, ignora
  }

  return "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const validateIngredients = async (ingredients: string[]): Promise<string[]> => {
  const model = "gemini-2.5-flash";
  
  // Prompt para filtrar ingredientes falsos ou perigosos
  const prompt = `
    Analyze the following list of items: ${JSON.stringify(ingredients)}.
    Filter this list and return ONLY the items that are valid, edible food ingredients used in cooking.
    Remove any items that are:
    1. Inedible objects (e.g., car, cement, stone)
    2. Concepts or abstract ideas (e.g., love, politics)
    3. Dangerous substances.
    
    Return the result strictly as a JSON object with a single key "validIngredients" containing the array of strings.
    Example input: ["Chicken", "Cement", "Tomato"] -> Output: {"validIngredients": ["Chicken", "Tomato"]}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0, // Low temperature for strict classification
      },
    });

    const text = response.text;
    if (!text) return [];

    const result = JSON.parse(text);
    return result.validIngredients || [];
  } catch (error) {
    console.error("Erro na validação de ingredientes:", error);
    // Em caso de erro na validação, retornamos a lista original para não travar o app (fallback), 
    // ou array vazio se preferir ser restritivo. Vamos retornar original.
    return ingredients;
  }
};

export const generateRecipe = async (
  ingredients: string[], 
  style: string = "Clássica",
  language: Language = "pt-BR"
): Promise<Recipe> => {
  const model = "gemini-2.5-flash"; 
  
  const langName = language === 'en' ? 'Inglês' : language === 'es' ? 'Espanhol' : 'Português do Brasil';
  
  const prompt = `
    Atue como um chef profissional. Crie uma receita ${style} utilizando os seguintes ingredientes principais: ${ingredients.join(", ")}.
    
    INSTRUÇÃO IMPORTANTE: O CONTEÚDO (valores) deve ser escrito em ${langName}.
    Mantenha as CHAVES do JSON exatamente como solicitado abaixo (em português), mas traduza o texto dos valores para ${langName}.

    Estrutura obrigatória JSON:
    {
      "titulo": "Nome da receita em ${langName}",
      "descricao": "Breve descrição apetitosa em ${langName}",
      "ingredientes": ["Lista de ingredientes em ${langName}"],
      "modo_preparo": ["Passos em ${langName}"],
      "tempo": "Tempo (ex: 30 min)",
      "variacoes": ["Dica do chef em ${langName}"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    const recipeData = JSON.parse(text) as Recipe;
    
    // Add metadata
    return {
      ...recipeData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: style
    };

  } catch (error) {
    console.error("Erro ao gerar receita:", error);
    throw new Error("Não foi possível criar a receita. Tente novamente.");
  }
};

export const generateDishImage = async (
  recipeTitle: string,
  style: string,
  language: Language
): Promise<string> => {
  const model = "gemini-2.5-flash-image";

  // Translate prompt context for better consistency, though English prompts often work best for visuals
  const prompt = `
    Create a professional, mouth-watering food photography style image of the dish: "${recipeTitle}".
    Context/Style: The dish is a "${style}" version. 
    
    LAYOUT RULES (Strictly follow):
    1. Format: Vertical Aspect Ratio (3:4 or 4:5).
    2. Composition: 
       - TOP: Small, elegant title text of the dish "${recipeTitle}".
       - CENTER: The main dish, beautifully plated, high contrast, soft lighting, appetizing.
       - BOTTOM: A very short caption (max 5 lines) or just visual space.
    3. Style: Social media aesthetic (Instagram/Pinterest), balanced, not cluttered.
    4. If style is "Fitness", make it look fresh and healthy. If "Fast Food/Comfort", make it look indulgent.
    5. Do not make the text too large. Keep it elegant.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4", // Matches 1080x1350 approx logic
        }
      },
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error("No image data returned");
    return imageUrl;

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate dish image.");
  }
};