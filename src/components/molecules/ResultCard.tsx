import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { traitInfo, resultInterpretations } from '@/lib/data'
import { cn } from '@/lib/utils'

interface ResultCardProps {
  trait: keyof typeof traitInfo
  score: number
}

export default function ResultCard({ trait, score }: ResultCardProps) {
  const interpretation = score >= 50 ? resultInterpretations[trait].high : resultInterpretations[trait].low

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-red-400'
    if (score >= 60) return 'text-cyan-400'
    if (score >= 40) return 'text-blue-400'
    if (score >= 20) return 'text-green-400'
    return 'text-gray-400'
  }

  const getProgressColorClass = (score: number) => {
    if (score >= 80) return '[&>div]:bg-red-400'
    if (score >= 60) return '[&>div]:bg-cyan-400'
    if (score >= 40) return '[&>div]:bg-blue-400'
    if (score >= 20) return '[&>div]:bg-green-400'
    return '[&>div]:bg-gray-400'
  }

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:scale-105 hover:border-primary/50">
      <CardHeader className="items-center pb-4 text-center">
        <div className="mb-2 text-3xl">{traitInfo[trait].icon}</div>
        <CardTitle className="text-lg text-foreground">{traitInfo[trait].name}</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground">
          {traitInfo[trait].description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">점수</span>
            <span className={cn('text-xl font-bold', getScoreColorClass(score))}>{score}%</span>
          </div>
          <Progress value={score} className={cn('h-2 bg-muted', getProgressColorClass(score))} />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{interpretation}</p>
      </CardContent>
    </Card>
  )
}
