// api/generate.js — Vercel Serverless Function
// Uses Together AI with mistral-7b-instruct-v0.1

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions'
const MODEL = 'mistralai/Mistral-7B-Instruct-v0.1'

const SYSTEM_PROMPTS = {
  shopify: 'You are an expert e-commerce copywriter specializing in high-converting Shopify product descriptions. Write compelling, benefit-driven copy that speaks directly to customer pain points and desires. Be specific, persuasive, and action-oriented.',
  email: 'You are a world-class email marketing strategist. Write email sequences that are personal, engaging, and drive measurable results. Use proven copywriting frameworks (AIDA, PAS) naturally within a conversational tone.',
  facebook: 'You are a performance marketing expert with deep expertise in Facebook advertising. Write ad copy that stops the scroll, resonates emotionally, and drives clicks. Focus on benefits over features and create urgency.',
  linkedin: 'You are a LinkedIn content strategist who creates viral, thought-leadership posts. Write content that balances professional insight with authentic storytelling. Format for readability with short paragraphs.',
  youtube: 'You are a professional YouTube scriptwriter who understands viewer psychology and the YouTube algorithm. Write scripts with strong hooks, engaging pacing, and natural spoken language. Include production notes.',
  blog: 'You are an SEO content strategist who creates comprehensive, search-optimized blog outlines. Create structures that satisfy search intent, cover topics thoroughly, and guide writers to produce outstanding content.',
}

const DEFAULT_SYSTEM = 'You are an expert marketing copywriter and content strategist. Write high-quality, professional content that achieves marketing goals and engages the target audience effectively.'

// Rate limiting (simple in-memory, use Redis for production)
const requestCounts = new Map()

function getRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const limit = 10 // requests per minute

  const key = `${ip}-${Math.floor(now / windowMs)}`
  const count = (requestCounts.get(key) || 0) + 1
  requestCounts.set(key, count)

  // Cleanup old keys
  if (requestCounts.size > 1000) {
    const oldKey = `${ip}-${Math.floor(now / windowMs) - 2}`
    requestCounts.delete(oldKey)
  }

  return count > limit
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (getRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
  }

  const { prompt, type } = req.body

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt' })
  }

  if (prompt.length > 4000) {
    return res.status(400).json({ error: 'Prompt too long' })
  }

  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service not configured. Please add TOGETHER_API_KEY to environment variables.' })
  }

  const systemPrompt = SYSTEM_PROMPTS[type] || DEFAULT_SYSTEM

  try {
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.75,
        top_p: 0.9,
        repetition_penalty: 1.1,
        stop: ['</s>', '[INST]'],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Together AI error:', response.status, errorData)

      if (response.status === 401) {
        return res.status(500).json({ error: 'Invalid AI API key. Please check your TOGETHER_API_KEY.' })
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'AI service is busy. Please try again in a moment.' })
      }
      return res.status(500).json({ error: 'AI generation failed. Please try again.' })
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content?.trim()

    if (!result) {
      return res.status(500).json({ error: 'No content generated. Please try again.' })
    }

    return res.status(200).json({
      result,
      model: MODEL,
      usage: data.usage || null,
    })

  } catch (err) {
    console.error('Generation error:', err)
    return res.status(500).json({ error: 'Internal server error. Please try again.' })
  }
}
