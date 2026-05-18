export default function Header() {
  const dbHost = import.meta.env.VITE_DB_HOST || 'localhost'
  const appEnv = import.meta.env.VITE_APP_ENV || 'development'

  return (
    <header style={{
      background: '#1a1d2e',
      borderBottom: '1px solid #2d3147',
      padding: '0 2rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, #6c63ff, #9b5de5)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '800',
          color: 'white',
          letterSpacing: '-0.5px',
        }}>
          PF
        </div>
        <div>
          <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#e2e8f0', letterSpacing: '-0.3px' }}>
            PayFlow
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: '#6c63ff',
            background: '#6c63ff18',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: '600',
            marginLeft: '8px',
            border: '1px solid #6c63ff33',
          }}>
            DASHBOARD
          </span>
        </div>
      </div>

      {/* Status + env info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>
            host: {dbHost}
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: appEnv === 'production' ? '#22c55e' : '#f59e0b',
            background: appEnv === 'production' ? '#22c55e18' : '#f59e0b18',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: '600',
            border: `1px solid ${appEnv === 'production' ? '#22c55e33' : '#f59e0b33'}`,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {appEnv}
          </span>
        </div>

        {/* DB status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 0 3px #22c55e22',
            }} />
            <div style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: '#22c55e',
              borderRadius: '50%',
              animation: 'pulse 2s ease-out infinite',
              opacity: 0.4,
            }} />
          </div>
          <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>
            Banco conectado
          </span>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </header>
  )
}
