import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KIA Bus Finder';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        {/* dot grid background suggestion via box shadow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            display: 'flex',
          }}
        />
        {/* green glow orb */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />
        {/* content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: 12,
              padding: '6px 16px',
              color: '#22c55e',
              fontSize: 14,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            BMTC Vayu Vajra · Bangalore
          </div>
          <div
            style={{
              color: 'white',
              fontSize: 80,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            KIA Bus Finder
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 24,
            }}
          >
            Find your nearest airport bus, instantly.
          </div>
          <div
            style={{
              marginTop: 16,
              color: '#22c55e',
              fontSize: 18,
              letterSpacing: 1,
            }}
          >
            kia-finder.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
