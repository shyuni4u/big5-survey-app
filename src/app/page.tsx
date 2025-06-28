// src/app/page.tsx
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <article className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">Welcome to the Big 5 Survey App</h1>
        <p className="text-lg">Redirecting to the survey...</p>
      </div>
    </article>
  )
}
