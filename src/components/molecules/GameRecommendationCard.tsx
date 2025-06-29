import type { GameRecommendation } from '@/lib/data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface GameRecommendationCardProps {
  recommendation: GameRecommendation
  rank: number
}

export default function GameRecommendationCard({ recommendation, rank }: GameRecommendationCardProps) {
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-primary text-primary-foreground hover:bg-primary/90'
    if (rank === 2) return 'bg-cyan-600 text-white hover:bg-cyan-700'
    if (rank === 3) return 'bg-secondary text-secondary-foreground hover:bg-muted'
    return 'bg-muted text-muted-foreground'
  }

  const getRoleInfo = (position: string) => {
    const roles = {
      tanker: { emoji: '🛡️', name: '탱커', color: 'text-blue-400' },
      dealer: { emoji: '⚔️', name: '딜러', color: 'text-red-400' },
      healer: { emoji: '💚', name: '힐러', color: 'text-green-400' },
    }
    return roles[position as keyof typeof roles] || { emoji: '⚡', name: '기타', color: 'text-muted-foreground' }
  }

  const roleInfo = getRoleInfo(
    recommendation.talent.includes('tanker')
      ? 'tanker'
      : recommendation.talent.includes('healer')
        ? 'healer'
        : 'dealer',
  )

  return (
    <Card className="border-border bg-card transition-all duration-300 hover:scale-105 hover:border-primary/50">
      <CardHeader className="pb-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge className={getRankBadgeColor(rank)}>
            {rank === 1 && '🥇'}
            {rank === 2 && '🥈'}
            {rank === 3 && '🥉'}
            <span className="ml-1">#{rank}</span>
          </Badge>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">매칭도</div>
            <div className="text-sm font-bold text-primary">{recommendation.score}점</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={recommendation.image || '/placeholder.svg?height=48&width=48'}
              alt={recommendation.class}
              className="h-12 w-12 rounded border border-border"
              style={{ backgroundColor: recommendation.color }}
            />
            <img
              src={recommendation.talentImage || '/placeholder.svg?height=24&width=24'}
              alt={recommendation.talent}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded border border-border bg-card"
            />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base text-foreground">{recommendation.class}</CardTitle>
            <div className="mt-1 flex items-center gap-2">
              <span className={roleInfo.color}>{roleInfo.emoji}</span>
              <span className="text-sm text-muted-foreground">{recommendation.talent}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{recommendation.desc}</p>
        <div className="border-t border-border pt-3">
          <div className="mb-1 text-xs text-muted-foreground">추천 이유</div>
          <p className="text-sm font-medium text-primary">{recommendation.matchReason}</p>
        </div>
      </CardContent>
    </Card>
  )
}
