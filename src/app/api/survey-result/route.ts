// app/api/save-result/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PersonalityScores } from '@/lib/types'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

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
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type SurveyResultSchema = {
  id?: number
  app: string
  createdAt?: string
  answers: PersonalityScores
  class: string
  specialization: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { data, error } = await supabase
      .from('survey_results')
      .insert({
        app: body.app,
        answers: body.answers,
        class: body.class,
        specialization: body.specialization,
      })
      .select()
      .single()

    if (error) {
      console.error('[Supabase insert error]', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Uncaught Error]', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase.from('survey_results').select('*').order('created_at', { ascending: false })

    if (error) {
      console.error('[Supabase fetch error]', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[API Uncaught Error]', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}

// export async function getTestResults() {
//   try {
//     const { data, error } = await supabase.from('survey_results').select('*').order('created_at', { ascending: false })

//     if (error) {
//       console.error('Error fetching test results:', error)
//       throw error
//     }

//     return data
//   } catch (error) {
//     console.error('Failed to fetch test results:', error)
//     throw error
//   }
// }
