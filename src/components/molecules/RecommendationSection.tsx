import Image from 'next/image'
import { getGameClasses, games } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
interface Recommendation {
  label: string
  score: number
}
interface RecommendationSectionProps {
  game: string
  recommendations: Recommendation[]
  isLoading: boolean
  error?: string
  onRetry?: () => void
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

export default function RecommendationSection({
  game,
  recommendations,
  isLoading,
  error,
  onRetry,
}: RecommendationSectionProps) {
  if (error)
    return (
      <section className="rounded-2xl border bg-card p-8 text-center" role="alert">
        <h2 className="text-xl font-bold">추천을 불러오지 못했어요</h2>
        <p className="my-4 text-muted-foreground">
          성격 결과는 아래에서 확인할 수 있어요. 추천 모델을 다시 불러와볼까요?
        </p>
        <Button onClick={onRetry}>다시 시도</Button>
      </section>
    )
  if (isLoading)
    return (
      <section className="rounded-2xl border bg-card p-12 text-center" role="status">
        <Sparkles className="mx-auto mb-4 animate-pulse text-primary" />
        <h2 className="text-xl font-semibold">당신의 다음 직업을 찾고 있어요</h2>
        <p className="mt-3 text-sm text-muted-foreground">처음에는 추천 모델을 불러오는 데 시간이 걸릴 수 있어요.</p>
      </section>
    )
  const items = recommendations.slice(0, 3).flatMap((item) => {
    const cls = getGameClasses(game).find((c) => c.specs.some((s) => `${c.name}_${s.name}` === item.label))
    const spec = cls?.specs.find((s) => `${cls.name}_${s.name}` === item.label)
    return cls && spec ? [{ ...item, cls, spec }] : []
  })
  if (!items.length)
    return (
      <section className="rounded-2xl border p-8">
        <h2>추천 결과가 아직 없어요</h2>
        <Button className="mt-4" onClick={onRetry}>
          다시 시도
        </Button>
      </section>
    )
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
        {items.map(({ cls, spec, score, label }, i) => (
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
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">{spec.description}</p>
            <p className="mt-5 text-xs text-muted-foreground">
              모델 추천 점수 <span className="ml-2 font-semibold text-foreground">{(score * 100).toFixed(1)}</span>
            </p>
          </article>
        ))}
      </div>
      <details className="mt-4 text-xs leading-6 text-muted-foreground">
        <summary className="cursor-pointer">추천 점수는 무엇인가요?</summary>
        <p className="mt-2">
          다섯 가지 성격 점수를 입력한 모델이 전체 직업 후보에 나누어 부여한 상대 점수입니다. 궁합의 확률이나 플레이
          실력을 의미하지 않으며, 게임마다 후보 수가 달라 점수를 직접 비교하기 어렵습니다. 직업 설명은 각 직업의
          일반적인 특징입니다.
        </p>
      </details>
    </section>
  )
}
