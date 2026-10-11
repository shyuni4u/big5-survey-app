// app/api/save-result/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { surveyRateLimiter } from '@/lib/rate-limiter'
import { validateSurveyResult } from '@/lib/survey-result'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY')
}

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
interface Database {
  public: {
    Tables: {
      survey_results: {
        Row: {
          id: number
          app: string
          answers: Json
          class: string
          specialization: string
        }
        Insert: {
          id?: never // generated columns must not be supplied
          app: string
          answers: Json
          class: string
          specialization: string
        }
      }
    }
  }
}
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const { allowed, resetTime, remaining } = surveyRateLimiter.isAllowed(req)

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime?.toString() || '',
          },
        },
      )
    }

    const rateLimitHeaders = {
      'X-RateLimit-Limit': '10',
      'X-RateLimit-Remaining': remaining?.toString() || '0',
      'X-RateLimit-Reset': resetTime?.toString() || '',
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400, headers: rateLimitHeaders })
    }

    // app / class / specialization / answers 를 data.ts 기준으로 검증하고, 어긋나면 insert 하지 않는다.
    const validation = validateSurveyResult(body)
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400, headers: rateLimitHeaders })
    }

    const { data, error } = await supabase.from('survey_results').insert(validation.value)

    if (error) {
      console.error('[Supabase insert error]', error)
      return NextResponse.json({ error: 'Database insertion failed' }, { status: 500, headers: rateLimitHeaders })
    }

    return NextResponse.json(data, { headers: rateLimitHeaders })
  } catch (err) {
    console.error('[API Uncaught Error]', err)
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 })
  }
}
