import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractionSettings, ReceiptData } from "./types";

const AI_MODEL_ID = "gemini-2.5-flash";

export const scanReceipt = async (base64Image: string, settings: ExtractionSettings): Promise<Partial<ReceiptData>> => {
  if (!process.env.API_KEY) {
    throw new Error("Google Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 1. Prepare Image Data
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  let mimeType = "image/jpeg";
  let cleanBase64 = base64Image;

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    cleanBase64 = matches[2];
  } else {
    const split = base64Image.split('base64,');
    if (split.length > 1) {
      cleanBase64 = split[1];
    }
  }

  // 2. Build Dynamic Schema based on Settings
  const properties: any = {
    date: { type: Type.STRING, description: "Date in DD/MM/YYYY format." },
    establishment: { type: Type.STRING, description: "Store name." },
    amount: { type: Type.STRING, description: "Total amount." }
  };
  
  const requiredFields = ["date", "establishment", "amount"];

  if (settings.extractItemCount) {
    properties.itemCount = { type: Type.STRING, description: "Total count of individual items purchased (e.g. '5')." };
  }
  if (settings.extractCategory) {
    properties.category = { 
      type: Type.STRING, 
      description: "Category of the expense. Choose from: Supermercado, Hogar, Gasolina, Ocio, Regalos, Restaurantes, Personal, Viajes." 
    };
  }
  if (settings.extractItems) {
    properties.items = {
      type: Type.ARRAY,
      description: "List of purchased items.",
      items: {
        type: Type.OBJECT,
        properties: {
          description: { 
            type: Type.STRING, 
            description: "Item name. IMPORTANT: If quantity is > 1, prefix with 'x{qty}' (e.g. 'x2 Milk'). If quantity is 1, just the name." 
          },
          price: { type: Type.STRING }
        }
      }
    };
  }

  // 3. Build Prompt
  let promptText = "Analyze this receipt. Extract: Date, Establishment, Total Amount.";
  if (settings.extractItemCount) promptText += " Also extract the total count of items (quantity of products) purchased.";
  if (settings.extractCategory) promptText += " Also categorize the expense into one of these: Supermercado, Hogar, Gasolina, Ocio, Regalos, Restaurantes, Personal, Viajes.";
  if (settings.extractItems) promptText += " Also extract all line items. IMPORTANT: If an item has a quantity greater than 1, prefix the description with 'x{Quantity}' (e.g., 'x2 Coffee'). If quantity is 1, just provide the name.";
  promptText += " Return JSON.";

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL_ID,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: cleanBase64 } },
          { text: promptText }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: properties,
          required: requiredFields
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI.");

    const data = JSON.parse(text);
    return data;

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw new Error("Failed to extract data. Please try again.");
  }
};