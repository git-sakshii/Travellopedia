/**
 * Attempts to repair and parse malformed JSON from AI responses
 */
export function repairAndParseJSON(text: string): any {
  // First, try direct parse
  try {
    return JSON.parse(text)
  } catch (e) {
    // Continue with repairs
  }

  let cleaned = text
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '')
  cleaned = cleaned.replace(/```\s*/g, '')
  cleaned = cleaned.replace(/`/g, '')
  
  // Remove any text before first { and after last }
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  } else {
    console.error('No JSON object found in response')
    return null
  }
  
  // Remove control characters but keep valid whitespace
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  // Replace curly/smart quotes with straight quotes
  // But DON'T touch apostrophes in words - they're fine in JSON strings
  cleaned = cleaned.replace(/[""„‟]/g, '"')
  // Only replace smart single quotes, not regular apostrophes
  cleaned = cleaned.replace(/[‚‛'']/g, "'")
  
  // Normalize whitespace (but keep single spaces)
  cleaned = cleaned.replace(/[\r\n\t]+/g, ' ')
  cleaned = cleaned.replace(/  +/g, ' ')
  
  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1')
  
  // Try parsing
  try {
    return JSON.parse(cleaned)
  } catch (e1) {
    // If still failing, the JSON might be truncated
    // Try to complete it by adding missing brackets
    let fixed = cleaned
    
    // Count braces and brackets
    const openBraces = (fixed.match(/{/g) || []).length
    const closeBraces = (fixed.match(/}/g) || []).length
    const openBrackets = (fixed.match(/\[/g) || []).length
    const closeBrackets = (fixed.match(/]/g) || []).length
    
    // Add missing closing brackets/braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed += ']'
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixed += '}'
    }
    
    // Remove any trailing comma before the added closers
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1')
    
    try {
      return JSON.parse(fixed)
    } catch (e2) {
      // Try one more thing: escape any unescaped quotes in string values
      // This is complex, so just log and return null
      console.error('JSON repair failed after all attempts')
      console.log('Cleaned text length:', cleaned.length)
      return null
    }
  }
}
