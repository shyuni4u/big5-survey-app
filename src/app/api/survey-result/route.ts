// app/api/save-result/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { surveyRateLimiter } from '@/lib/rate-limiter'

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

    const body = await req.json()

    // Request body validation
    if (!body.app || !body.answers || !body.class || !body.specialization) {
      return NextResponse.json(
        { error: 'Missing required fields: app, answers, class, specialization' },
        {
          status: 400,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': remaining?.toString() || '0',
            'X-RateLimit-Reset': resetTime?.toString() || '',
          },
        },
      )
    }

    const { data, error } = await supabase.from('survey_results').insert({
      app: body.app,
      answers: body.answers,
      class: body.class,
      specialization: body.specialization,
    })

    if (error) {
      console.error('[Supabase insert error]', error)
      return NextResponse.json(
        { error: 'Database insertion failed' },
        {
          status: 500,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': remaining?.toString() || '0',
            'X-RateLimit-Reset': resetTime?.toString() || '',
          },
        },
      )
    }

    return NextResponse.json(data, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': remaining?.toString() || '0',
        'X-RateLimit-Reset': resetTime?.toString() || '',
      },
    })
  } catch (err) {
    console.error('[API Uncaught Error]', err)
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 })
  }
}
