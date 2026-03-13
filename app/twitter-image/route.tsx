import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'HANBANG - 크리에이터 IP 투자 플랫폼';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: 48,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            HANBANG
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.95)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            내가 좋아하는 크리에이터와 동업자가 되고,
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255,255,255,0.95)',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            매달 수익을 받습니다.
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 20,
              color: 'rgba(96, 165, 250, 0.9)',
              letterSpacing: '0.02em',
            }}
          >
            크리에이터 IP 투자 플랫폼
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
