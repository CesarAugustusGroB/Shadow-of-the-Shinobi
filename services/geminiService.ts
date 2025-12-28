import { GoogleGenAI } from "@google/genai";
import { SPIRIT_SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface SpiritAdviceParams {
  health: number;
  shurikens: number;
  score: number;
  enemiesCount: number;
  wave: number;
}

export const consultSpiritGuide = async (params: SpiritAdviceParams): Promise<string> => {
  try {
    const prompt = `
      The mortal warrior seeks guidance.
      Current State:
      - Floor/Wave: ${params.wave}
      - Health: ${params.health} / 3
      - Shurikens: ${params.shurikens}
      - Gold Collected: ${params.score}
      - Enemies Nearby: ${params.enemiesCount}

      Analyze the balance of risks. 
      If health is critical (<2), the path requires evasion.
      If shurikens are depleted, the warrior must rely on the blade (close combat).
      If the enemy count is high (>3), suggest crowd control or fleeing.
      
      Use your deep wisdom to formulate a strategy that balances survival with the warrior's honor.
      Think deeply about the tactical implications of this state before speaking.
    `;

    // Enable Thinking Mode for complex tactical reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: SPIRIT_SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768, // Max budget for deep thought
        }
      },
    });

    return response.text || "The spirits are silent...";
  } catch (error) {
    console.error("Spirit Guide Error:", error);
    return "The connection to the spirit world is severed (API Error).";
  }
};