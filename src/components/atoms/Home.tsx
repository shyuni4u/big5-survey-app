'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, Sparkles, Share2, Compass } from 'lucide-react'
import { games } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

export default function Home() {
  const [game, setGame] = useState(games[1].id)
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <section>
            <p className="eyebrow">
              <Sparkles size={16} /> 성격으로 찾는 나의 플레이 스타일
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              현실의 나와
              <br />
              게임 속 직업이
              <br />
              <span className="text-primary">만난다면?</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-muted-foreground">
              새로운 모험을 시작할 때도, 부캐가 고민될 때도.
              <br />
              나의 성향을 알아보고 어울리는 직업을 발견하세요.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {['40문항', '회원가입 없이', '이 기기에서 이어하기'].map((t) => (
                <span key={t} className="rounded-full border px-3 py-2">
                  {t}
                </span>
              ))}
            </div>
          </section>
          <section
            className="rounded-3xl border bg-card p-6 shadow-2xl shadow-black/20 md:p-8"
            aria-labelledby="game-heading"
          >
            <p className="eyebrow">YOUR NEXT ADVENTURE</p>
            <h2 id="game-heading" className="mt-3 text-2xl font-bold">
              어디로 떠나볼까요?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">직업을 추천받을 게임을 선택하세요.</p>
            <div className="my-7 space-y-3" role="group" aria-label="게임 선택">
              {games.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={game === item.id}
                  onClick={() => setGame(item.id)}
                  className={cn(
                    'flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors',
                    game === item.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/40 hover:bg-secondary',
                  )}
                >
                  <Image src={item.image} alt="" width={44} height={44} className="rounded-lg" />
                  <span className="flex-1 font-semibold">{item.name}</span>
                  {game === item.id && <Check className="text-primary" size={20} />}
                </button>
              ))}
            </div>
            <Button asChild className="h-14 w-full rounded-xl text-base">
              <Link href={`/survey?type=new&game=${game}`}>
                내 직업 발견하기 <ArrowRight />
              </Link>
            </Button>
            <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
              Big5 기반의 성향 탐색 · 게임 추천은 재미로 참고해주세요
            </p>
          </section>
        </div>
        <div className="mt-16 grid gap-6 border-t pt-8 md:grid-cols-3">
          {[
            { icon: Compass, title: '나도 몰랐던 나의 성향', text: '다섯 가지 성격 특성으로 나의 스타일을 살펴봐요.' },
            { icon: Sparkles, title: '세 가지 새로운 가능성', text: '추천 직업 TOP 3를 비교하며 다음 모험을 골라요.' },
            { icon: Share2, title: '친구는 어떤 직업일까?', text: '결과 카드를 저장하고 서로의 추천을 공유해요.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="mb-3 text-primary" size={20} />
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
