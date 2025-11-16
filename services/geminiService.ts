import { GoogleGenAI } from "@google/genai";
import type { Correction, Category } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

interface CategorizationResult {
    category: string;
    confidence: number;
}

export async function getCategoryFromGemini(
    description: string, 
    categories: Category[],
    corrections: Correction[]
): Promise<CategorizationResult> {
    const fallbackResult = { category: 'Other', confidence: 0.5 };
    if (!API_KEY) return fallbackResult;

    const categoryNames = categories.map(c => c.name);

    // Map corrections to include category names for the prompt
    const correctionExamples = corrections.map(corr => {
        const category = categories.find(c => c.id === corr.correctedCategoryId);
        return {
            description: corr.description,
            category: category ? category.name : 'Other'
        };
    }).slice(-10); // Use the last 10 corrections as examples

    try {
        const prompt = `
        You are an expert financial assistant. Your task is to categorize an expense based on its description.
        
        Available categories: [${categoryNames.join(', ')}]
        
        Here are some examples of how I categorize things. Use these as a strong guide:
        ${JSON.stringify(correctionExamples)}
        
        Now, analyze the following transaction.
        Description: "${description}"
        
        Respond with a JSON object containing the 'category' and a 'confidence' score (a number from 0.0 to 1.0, where 1.0 is highest confidence).
        Example response: {"category": "Groceries", "confidence": 0.95}
        
        Respond with ONLY the JSON object.
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        let textResponse = response.text.trim();
        if (textResponse.startsWith('```json')) {
            textResponse = textResponse.substring(7, textResponse.length - 3).trim();
        }

        const result: CategorizationResult = JSON.parse(textResponse);
        
        // Validate if the returned category is in our list
        if (categoryNames.map(c => c.toLowerCase()).includes(result.category.toLowerCase())) {
            const originalCasedCategory = categoryNames.find(c => c.toLowerCase() === result.category.toLowerCase())!;
            return { category: originalCasedCategory, confidence: result.confidence };
        }
        
        return fallbackResult; // Fallback if Gemini hallucinates a category
    } catch (error) {
        console.error("Error fetching category from Gemini:", error);
        return fallbackResult; // Fallback category
    }
}


export async function getFinancialInsights(transactions: any[]): Promise<string[]> {
    if (!API_KEY) return ["AI Insights are disabled. Please configure your API key."];

    try {
        const prompt = `
        Act as a friendly financial advisor. Analyze the following recent transactions and provide 3 concise, actionable tips for better financial management. Focus on spending patterns, potential savings, and encouragement. Format the response as a JSON array of strings.
        
        Transactions:
        ${JSON.stringify(transactions.slice(0, 20).map(t => ({ description: t.description, amount: t.amount, type: t.type, category: t.category.name, date: t.date })))}
        `;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        
        let textResponse = response.text.trim();
        
        // Clean up markdown code block formatting if present
        if (textResponse.startsWith('```json')) {
            textResponse = textResponse.substring(7, textResponse.length - 3).trim();
        }

        const insights = JSON.parse(textResponse);
        return Array.isArray(insights) ? insights : ["Could not generate insights at this time."];
    } catch (error) {
        console.error("Error fetching insights from Gemini:", error);
        return ["There was an issue getting AI insights. Please try again later."];
    }
}