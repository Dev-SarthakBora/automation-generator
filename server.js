// Development API server for handling /api/generate requests
// This is only used during development with Vite
import http from 'http'
import url from 'url'

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

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.writeHead(200).end()
  }

  const parsedUrl = url.parse(req.url, true)

  // Handle /api/generate
  if (parsedUrl.pathname === '/api/generate' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk.toString()
    })

    req.on('end', async () => {
      try {
        const { prompt, type } = JSON.parse(body)

        if (!prompt || typeof prompt !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'Invalid prompt' }))
        }

        if (prompt.length > 4000) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'Prompt too long' }))
        }

        const apiKey = process.env.TOGETHER_API_KEY
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'AI service not configured. Please add TOGETHER_API_KEY to environment variables.' }))
        }

        const systemPrompt = SYSTEM_PROMPTS[type] || DEFAULT_SYSTEM

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
            res.writeHead(500, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'Invalid AI API key. Please check your TOGETHER_API_KEY.' }))
          }
          if (response.status === 429) {
            res.writeHead(429, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }))
          }
          res.writeHead(500, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'AI generation failed. Please try again.' }))
        }

        const data = await response.json()
        const result = data.choices?.[0]?.message?.content?.trim()

        if (!result) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          return res.end(JSON.stringify({ error: 'No content generated. Please try again.' }))
        }

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          result,
          model: MODEL,
          usage: data.usage || null,
        }))

      } catch (err) {
        console.error('Generation error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error. Please try again.' }))
      }
    })
    return
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

const PORT = 3001
server.listen(PORT, () => {
  console.log(`Dev API server running at http://localhost:${PORT}`)
})
