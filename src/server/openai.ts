import OpenAI from "openai";
import { ERROR_MESSAGES } from "./utils/error-code";

class AIBot {
  private bot: OpenAI;
  constructor(key?: string) {
    this.bot = new OpenAI({
      apiKey: key,
    });
  }

  public async chat(content: string, model = "gpt-3.5-turbo") {
    try {
      const completion = await this.bot.chat.completions.create({
        messages: [{ role: "system", content }],
        model,
      });
  
      return completion.choices[0].message.content;
    } catch(error: any) {
      return ERROR_MESSAGES[error.error.code] ?? 'AI服务调用异常';
    }
  }
}

export const AI = new AIBot(process.env.AI_KEY);