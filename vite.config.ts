import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function marketDataProxy(): Plugin {
  const handler = async (req: any, res: any, next: any) => {
    if (!req.url?.startsWith('/api/market') && !req.url?.startsWith('/api/pause-saver')) {
      return next()
    }
    try {
      const url = new URL(req.url, 'http://localhost')

      // 1. Groq Explanatory LLM endpoint for Pause Saver Historical Context
      if (url.pathname === '/api/pause-saver/market-context' && req.method === 'POST') {
        let body = ''
        req.on('data', (chunk: any) => { body += chunk })
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body || '{}')
            const apiKey = process.env.GROQ_API_KEY

            const {
              currentDrawdown,
              benchmark,
              comparableEpisodes,
              sipAmount,
              primaryGoal,
              targetDate,
              pauseDuration
            } = payload

            let explanation = ''
            let model = 'finlit-deterministic-rules'
            let source = 'deterministic_fallback'

            if (apiKey) {
              try {
                const systemPrompt = `You are a financial decision-support assistant inside a SIP management product.
Explain historical market behavior using only the supplied verified data.
Do not predict future market movements.
Do not guarantee recovery.
Do not provide personalized investment advice.
Do not tell the user that they must continue or pause their SIP.
Use language such as:
- historically
- in the periods shown
- may
- varied
- estimated
- for context
Explicitly state that past performance does not guarantee future results.
Connect the historical context to the user's stated concern without being manipulative.
Keep the explanation concise (2 short paragraphs, approximately 100-120 words maximum).`

                const userPrompt = `Here is the verified data:
- Benchmark: ${benchmark || 'NIFTY 50'}
- Current observed decline from recent peak: ${currentDrawdown ? Number(currentDrawdown).toFixed(1) : '-14.2'}%
- Comparable historical drawdowns: ${JSON.stringify(comparableEpisodes || [])}
- User monthly SIP: ₹${sipAmount || 4000}/month
- User Primary Goal: ${primaryGoal || 'Dream Bike'} (${targetDate || 'Mar 2029'})
- User selected hypothetical pause duration: ${pauseDuration || 6} months

Provide a factual, calm, educational explanation connecting the historical evidence and the personal SIP context.`

                const groqResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.2,
                    max_tokens: 300,
                  }),
                })

                if (groqResp.ok) {
                  const groqJson: any = await groqResp.json()
                  const text = groqJson.choices?.[0]?.message?.content
                  if (text) {
                    explanation = text.trim()
                    model = 'groq/llama-3.3-70b-versatile'
                    source = 'groq_llm'
                  }
                }
              } catch (groqErr) {
                console.warn('Groq API call error, falling back to deterministic explanation:', groqErr)
              }
            }

            if (!explanation) {
              const epSummaries = (comparableEpisodes || [])
                .map((e: any) => `${e.name} (${Number(e.drawdownPercent).toFixed(1)}%, recovered in ${e.recoveryMonths} months)`)
                .join(', ')

              explanation = `Markets have experienced declines of a similar magnitude before. In historical periods such as ${epSummaries || 'the 2018 and 2021–2022 drawdowns'}, the NIFTY 50 benchmark subsequently returned to its previous peak, though recovery durations varied substantially between 8 and 13 months.

Past market behavior provides historical perspective rather than a guarantee of future outcomes. Pausing your ₹${(sipAmount || 4000).toLocaleString('en-IN')}/month contribution for ${pauseDuration || 6} months creates an estimated ₹${((pauseDuration || 6) * (sipAmount || 4000)).toLocaleString('en-IN')} contribution gap toward your ${primaryGoal || 'primary'} target, potentially delaying your ${targetDate || 'target'} milestone regardless of broader market fluctuations.`
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              explanation,
              model,
              source,
              generatedAt: new Date().toISOString()
            }))
          } catch (parseErr: any) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid JSON request body', message: parseErr?.message }))
          }
        })
        return
      }

      if (url.pathname === '/api/market/chart') {
        const symbol = url.searchParams.get('symbol')
        const range = url.searchParams.get('range') || '1mo'
        const interval = url.searchParams.get('interval') || '1d'

        if (!symbol) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing symbol parameter' }))
          return
        }

        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`
        const upstream = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        const data = await upstream.text()
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = upstream.status
        res.end(data)
        return
      }

      if (url.pathname === '/api/market/search') {
        const q = url.searchParams.get('q') || ''
        const targetUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`
        const upstream = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        const data = await upstream.text()
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = upstream.status
        res.end(data)
        return
      }

      if (url.pathname === '/api/market/mf') {
        const scheme = url.searchParams.get('scheme') || '122639'
        const targetUrl = `https://api.mfapi.in/mf/${encodeURIComponent(scheme)}`
        const upstream = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        })
        const data = await upstream.text()
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = upstream.status
        res.end(data)
        return
      }

      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Market API endpoint not found' }))
    } catch (err: any) {
      res.statusCode = 502
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Failed to fetch upstream market data', message: err?.message }))
    }
  }

  return {
    name: 'market-data-proxy',
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), marketDataProxy()],
})
