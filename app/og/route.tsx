import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '30px',
          padding: '50px',
        }}
      >
        {/* Logo background circle */}
        <div
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '80px',
            fontWeight: 'bold',
            color: 'white',
            backdropFilter: 'blur(10px)',
          }}
        >
          SA
        </div>

        {/* Main Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            color: 'white',
          }}
        >
          <div style={{ fontSize: '80px', fontWeight: 'bold' }}>SAYBA ARC</div>
          <div style={{ fontSize: '48px', fontWeight: '300', opacity: 0.9 }}>
            Art You Believe
          </div>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '36px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '20px' }}>
          Solusi Digital Terbaik untuk Bisnis Anda
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
