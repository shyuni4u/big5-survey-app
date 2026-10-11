import { traitInfo, resultInterpretations } from '@/lib/data'
export default function ResultCard({ trait, score }: { trait: string; score: number }) {
  const color: Record<string, string> = { E: '#7dd3fc', A: '#6ee7b7', C: '#c4b5fd', N: '#fcd34d', O: '#f9a8d4' }
  return (
    <article className="rounded-2xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{traitInfo[trait].name}</h3>
        <span style={{ color: color[trait] }} className="text-lg font-bold">
          {score}
          <span className="ml-1 text-xs font-normal text-muted-foreground">/ 100</span>
        </span>
      </div>
      <div className="my-4 h-1.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color[trait] }} />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {score >= 40 && score <= 60
          ? '두 성향 사이에서 상황에 따라 유연하게 반응하는 편입니다.'
          : score > 60
            ? resultInterpretations[trait].high
            : resultInterpretations[trait].low}
      </p>
    </article>
  )
}
