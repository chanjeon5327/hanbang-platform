# Supabase Client Library

이 폴더는 Supabase 클라이언트 설정을 관리합니다.

## 파일 구조

- `client.ts` - 브라우저 클라이언트 (클라이언트 컴포넌트에서 사용)
- `server.ts` - 서버 클라이언트 (서버 컴포넌트/API Route에서 사용)
- `middleware.ts` - 미들웨어용 클라이언트 (세션 관리)
- `types.ts` - TypeScript 타입 정의

## 사용 방법

### 클라이언트 컴포넌트에서

```typescript
'use client'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('*')
  
  return <div>...</div>
}
```

### 서버 컴포넌트에서

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('*')
  
  return <div>...</div>
}
```

### API Route에서

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('projects')
    .select('*')
  
  return NextResponse.json(data)
}
```

