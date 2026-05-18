const METHODS = ['Cartão', 'Pix', 'Boleto']

const METHOD_COLORS = {
  Cartão: { primary: '#22c55e', secondary: '#22c55e66', bg: '#22c55e12' },
  Pix:    { primary: '#6c63ff', secondary: '#6c63ff66', bg: '#6c63ff12' },
  Boleto: { primary: '#f59e0b', secondary: '#f59e0b66', bg: '#f59e0b12' },
}

const METHOD_ICONS = {
  Cartão: '💳',
  Pix:    '⚡',
  Boleto: '📄',
}

function fmt(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PaymentChart({ transactions }) {
  const data = METHODS.map(method => {
    const filtered = transactions.filter(t => t.method === method)
    return {
      method,
      total: filtered.reduce((acc, t) => acc + t.amount, 0),
      count: filtered.length,
      approved: filtered.filter(t => t.status === 'Aprovado').length,
    }
  })

  const maxTotal = Math.max(...data.map(d => d.total))
  const grandTotal = data.reduce((acc, d) => acc + d.total, 0)

  return (
    <div style={{
      background: '#1a1d2e',
      border: '1px solid #2d3147',
      borderRadius: '14px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '0.2rem' }}>
            Volume por Método de Pagamento
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Total geral: R$ {fmt(grandTotal)}
          </p>
        </div>
        <span style={{ fontSize: '1.5rem' }}>📈</span>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {data.map(({ method, total, count, approved }) => {
          const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0
          const sharePct = grandTotal > 0 ? ((total / grandTotal) * 100).toFixed(1) : '0.0'
          const c = METHOD_COLORS[method]

          return (
            <div key={method}>
              {/* Label row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span style={{
                    fontSize: '1rem',
                    background: c.bg,
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${c.secondary}`,
                  }}>
                    {METHOD_ICONS[method]}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#e2e8f0' }}>
                    {method}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {count} transação{count !== 1 ? 'ões' : ''} · {approved} aprovadas
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#f1f5f9' }}>
                    R$ {fmt(total)}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: c.primary,
                    background: c.bg,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    marginLeft: '8px',
                    border: `1px solid ${c.secondary}`,
                  }}>
                    {sharePct}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div style={{
                background: '#0f1117',
                borderRadius: '6px',
                height: '36px',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #2d3147',
              }}>
                {/* Filled bar */}
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${c.secondary}, ${c.primary})`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: '12px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: pct > 5 ? 'auto' : '0',
                }}>
                  {pct > 15 && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'white',
                      textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                      whiteSpace: 'nowrap',
                    }}>
                      {pct.toFixed(0)}% do maior
                    </span>
                  )}
                </div>

                {/* Subtle grid lines */}
                {[25, 50, 75].map(mark => (
                  <div key={mark} style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${mark}%`,
                    width: '1px',
                    background: '#2d314755',
                    pointerEvents: 'none',
                  }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #2d3147',
        justifyContent: 'flex-end',
      }}>
        {data.map(({ method }) => {
          const c = METHOD_COLORS[method]
          return (
            <div key={method} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '2px',
                background: c.primary,
              }} />
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{method}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
