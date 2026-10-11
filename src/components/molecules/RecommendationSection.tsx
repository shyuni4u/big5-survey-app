import Image from 'next/image'
import { getGameClasses, games } from '@/lib/data'
import type { Recommendation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface RecommendationSectionProps {
  game: string
  recommendations: Recommendation[]
}

export const SpriteIcon = ({
  imageUrl,
  position,
  scale = 0.17,
  spriteSize = 256,
  imageSize = 'h-8 w-8',
}: {
  imageUrl: string
  position: string
  scale?: number
  spriteSize?: number
  imageSize?: string
}) => (
  <div className={cn('relative overflow-hidden rounded', imageSize)}>
    <div
      className="absolute"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: position,
        backgroundRepeat: 'no-repeat',
        width: spriteSize,
        height: spriteSize,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    />
  </div>
)

export default function RecommendationSection({ game, recommendations }: RecommendationSectionProps) {
  const items = recommendations.slice(0, 3).flatMap((item) => {
    const cls = getGameClasses(game).find((c) => c.specs.some((s) => `${c.name}_${s.name}` === item.label))
    const spec = cls?.specs.find((s) => `${cls.name}_${s.name}` === item.label)
    return cls && spec ? [{ ...item, cls, spec }] : []
  })
  if (!items.length) return null
  const roles = { tanker: '탱커', dealer: '딜러', healer: '힐러', supporter: '서포터', buffer: '버퍼' }
  return (
    <section aria-labelledby="recommend-heading">
      <p className="eyebrow">
        <Sparkles size={16} /> YOUR NEXT CLASS
      </p>
      <h2 id="recommend-heading" className="mt-3 text-2xl font-bold md:text-3xl">
        이번 모험의 주인공은?
      </h2>
      <p className="mb-6 mt-2 text-sm text-muted-foreground">
        {games.find((g) => g.id === game)?.name}에서 발견한 세 가지 가능성
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(({ cls, spec, score, reason, label }, i) => (
          <article
            key={label}
            className={cn(
              'rounded-2xl border bg-card p-6',
              i === 0 && 'border-primary/40 bg-gradient-to-br from-primary/10 to-card md:col-span-2 md:p-8',
            )}
          >
            <div className="mb-5 flex items-center justify-between">
              <span
                className={cn('text-xs font-bold tracking-widest', i === 0 ? 'text-primary' : 'text-muted-foreground')}
              >
                {i === 0 ? '01 / 가장 먼저 만나볼 직업' : `0${i + 1} / 함께 살펴볼 직업`}
              </span>
              <span className="rounded-full border px-3 py-1 text-xs">{roles[spec.role]}</span>
            </div>
            <div className="flex items-center gap-5">
              {game.toLowerCase() === 'dnf' ? (
                <SpriteIcon
                  imageUrl={cls.image}
                  position={spec.position || '0px 0px'}
                  scale={0.33}
                  spriteSize={512}
                  imageSize="h-16 w-16 shrink-0"
                />
              ) : (
                <Image
                  src={spec.image || cls.image}
                  alt=""
                  width={72}
                  height={72}
                  className="h-16 w-16 rounded-xl object-contain"
                  unoptimized
                />
              )}
              <div>
                <p className="text-sm text-muted-foreground">{cls.nameKr}</p>
                <h3 className={cn('mt-1 font-bold', i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl')}>{spec.nameKr}</h3>
              </div>
            </div>
            <p className="mt-5 text-sm font-medium text-primary">{reason}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{spec.description}</p>
            <p className="mt-5 text-xs text-muted-foreground">
              적합도 <span className="ml-2 font-semibold text-foreground">{score}%</span>
            </p>
          </article>
        ))}
      </div>
      <details className="mt-4 text-xs leading-6 text-muted-foreground">
        <summary className="cursor-pointer">적합도는 무엇인가요?</summary>
        <p className="mt-2">
          다섯 가지 성격 점수를 응답자 평균 기준으로 환산한 뒤, 각 직업의 목표 성향(역할과 플레이 스타일)과 얼마나
          가까운지를 0~100으로 나타낸 값입니다. 궁합의 확률이나 플레이 실력을 의미하지 않으며, 직업 설명은 각 직업의
          일반적인 특징입니다.
        </p>
      </details>
    </section>
  )
}
