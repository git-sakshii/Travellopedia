import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'

let geminiModel: GenerativeModel | null = null

export function getGeminiModel(): GenerativeModel {
  if (!geminiModel) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('Missing Google Gemini API Key')
    }
    
    const modelName = process.env.GOOGLE_GEMINI_MODEL || 'gemini-1.5-flash'
    
    const genAI = new GoogleGenerativeAI(apiKey)
    geminiModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      }
    })
  }
  
  return geminiModel
}
