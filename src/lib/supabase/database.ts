import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      personality_results: {
        Row: {
          id: string
          created_at: string
          user_type: 'existing' | 'new'
          personality_scores: {
            E: number // 외향성
            A: number // 친화성
            C: number // 성실성
            N: number // 신경증
            O: number // 개방성
          }
          current_class?: string // 기존 유저의 현재 직업
          current_spec?: string // 기존 유저의 현재 전문화
          recommended_jobs?: Array<{
            class: string
            talent: string
            score: number
            matchReason: string
          }>
          user_answers: Record<string, number>
        }
        Insert: {
          id?: string
          created_at?: string
          user_type: 'existing' | 'new'
          personality_scores: {
            E: number
            A: number
            C: number
            N: number
            O: number
          }
          current_class?: string
          current_spec?: string
          recommended_jobs?: Array<{
            class: string
            talent: string
            score: number
            matchReason: string
          }>
          user_answers: Record<string, number>
        }
        Update: {
          id?: string
          created_at?: string
          user_type?: 'existing' | 'new'
          personality_scores?: {
            E: number
            A: number
            C: number
            N: number
            O: number
          }
          current_class?: string
          current_spec?: string
          recommended_jobs?: Array<{
            class: string
            talent: string
            score: number
            matchReason: string
          }>
          user_answers?: Record<string, number>
        }
      }
    }
  }
}
