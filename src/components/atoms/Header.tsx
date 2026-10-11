import Link from 'next/link'
import { Sparkles } from 'lucide-react'
export const Header = () => (
  <header className="border-b border-border/60">
    <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
      <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
        <Sparkles className="text-primary" size={20} /> PLAY / PERSONA
      </Link>
      <span className="text-xs text-muted-foreground">Big5 게임 직업 탐색</span>
    </div>
  </header>
)
