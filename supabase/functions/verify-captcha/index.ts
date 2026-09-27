import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

const BodySchema = z.object({
  token: z.string().min(1).max(4096),
  action: z.enum(['signup', 'todo_create']),
})

// Per-action rate limits: [max events, window in seconds]
const RATE_LIMITS: Record<string, [number, number]> = {
  signup: [5, 3600],       // 5 sign-up attempts per IP per hour
  todo_create: [60, 3600], // 60 CAPTCHA-verified task creations per IP per hour
}

const MIN_SCORE = 0.5

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return json({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }, 400)
    }
    const { token, action } = parsed.data

    const secret = Deno.env.get('RECAPTCHA_SECRET_KEY')
    if (!secret) {
      console.error('RECAPTCHA_SECRET_KEY is not configured')
      return json({ error: 'CAPTCHA is not configured on the server' }, 500)
    }

    // Identify the caller by IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 1. Rate limit BEFORE hitting Google's API (also protects the endpoint itself)
    const [limit, windowSeconds] = RATE_LIMITS[action]
    const { data: allowed, error: rlError } = await supabase.rpc('check_rate_limit', {
      p_event_key: ip,
      p_action: action,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    })
    if (rlError) {
      console.error('Rate limit check failed:', rlError)
      return json({ error: 'Could not verify request, please try again' }, 500)
    }
    if (!allowed) {
      return json({ error: 'Too many attempts. Please wait a while and try again.' }, 429)
    }

    // 2. Verify the reCAPTCHA token with Google
    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const verify = await verifyRes.json()

    if (!verify.success) {
      console.error('reCAPTCHA verification failed:', verify['error-codes'])
      return json({ error: 'CAPTCHA verification failed. Please try again.' }, 403)
    }
    if (verify.action !== action) {
      return json({ error: 'CAPTCHA action mismatch' }, 403)
    }
    if (typeof verify.score !== 'number' || verify.score < MIN_SCORE) {
      return json({ error: 'Your request looked automated. Please try again later.' }, 403)
    }

    return json({ ok: true, score: verify.score })
  } catch (err) {
    console.error('verify-captcha error:', err)
    return json({ error: 'Unexpected server error' }, 500)
  }
})
