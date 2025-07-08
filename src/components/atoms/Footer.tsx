import { GAME_NAME } from '@/lib/data'

export const Footer = () => {
  return (
    <footer className="mt-16 border-t bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          Big5 성격 모델을 기반으로 한 과학적 분석 • {GAME_NAME} 직업 추천
        </p>
      </div>
    </footer>
  )
}
