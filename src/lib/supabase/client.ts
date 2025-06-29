import { supabase } from '@/lib/supabase/database'
import type { PersonalityScores, UserAnswers } from '@/lib/types'

export interface SaveTestResultParams {
  userType: 'existing' | 'new'
  personalityScores: PersonalityScores
  userAnswers: UserAnswers
  currentClass?: string
  currentSpec?: string
  recommendedJobs?: Array<{
    class: string
    talent: string
    score: number
    matchReason: string
  }>
}

export async function saveTestResult(params: SaveTestResultParams) {
  try {
    const { data, error } = await supabase
      .from('personality_results')
      .insert({
        user_type: params.userType,
        personality_scores: params.personalityScores,
        user_answers: params.userAnswers,
        current_class: params.currentClass,
        current_spec: params.currentSpec,
        recommended_jobs: params.recommendedJobs,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving test result:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to save test result:', error)
    throw error
  }
}

export async function getTestResults(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('personality_results')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching test results:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch test results:', error)
    throw error
  }
}
