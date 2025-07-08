# 게임 변경 시 주의사항

## next.config.ts

```typescript
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'render.worldofwarcraft.com',
    pathname: '/**',
  },
],
```

## src/lib/data.ts

```typescript
export const GAME_NAME = 'WoW' // 게임 이름 변경
```
