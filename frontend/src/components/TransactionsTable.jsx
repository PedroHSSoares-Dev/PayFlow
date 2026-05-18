const STATUS_CONFIG = {
  Aprovado: { color: '#22c55e', bg: '#22c55e18', border: '#22c55e33', dot: '#22c55e' },
  Recusado: { color: '#ef4444', bg: '#ef444418', border: '#ef444433', dot: '#ef4444' },
  Pendente:  { color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b33', dot: '#f59e0b' },
}

const METHOD_CONFIG = {
  Pix:    { icon: '⚡', color: '#6c63ff' },
  Cartão: { icon: '💳', color: '#22c55e' },
  Boleto: { icon: '📄', color: '#f59e0b' },
}

const COLS = ['ID', 'Cliente', 'Valor', 'Status', 'Método', 'Data']

export default function TransactionsTable({ transactions }) {
  return (
    <div style={{
      background: '#1a1d2e',
      border: '1px solid #2d3147',
      borderRadius: '14px',
      overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      {/* Table header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #2d3147',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#e2e8f0' }}>
            Transações Recentes
          </h2>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#6c63ff',
            background: '#6c63ff18',
            padding: '2px 10px',
            borderRadius: '20px',
            border: '1px solid #6c63ff33',
          }}>
            {transactions.length} registros
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Hoje, 18/05/2024</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f111799' }}>
              {COLS.map(col => (
                <th key={col} style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const sc = STATUS_CONFIG[t.status]
              const mc = METHOD_CONFIG[t.method]
              return (
                <tr
                  key={t.id}
                  style={{ borderTop: '1px solid #2d314766' }}
                >
                  {/* ID */}
                  <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
                    #{String(t.id).padStart(4, '0')}
                  </td>

                  {/* Cliente */}
                  <td style={{ padding: '0.875rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, #6c63ff44, #9b5de544)`,
                        border: '1px solid #6c63ff33',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#9b8fff',
                        flexShrink: 0,
                      }}>
                        {t.customer.charAt(0)}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: '500' }}>
                        {t.customer}
                      </span>
                    </div>
                  </td>

                  {/* Valor */}
                  <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '700' }}>
                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '0.875rem 1.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: sc.color,
                      background: sc.bg,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: `1px solid ${sc.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                      {t.status}
                    </span>
                  </td>

                  {/* Método */}
                  <td style={{ padding: '0.875rem 1.5rem' }}>
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: mc.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}>
                      <span>{mc.icon}</span>
                      {t.method}
                    </span>
                  </td>

                  {/* Data */}
                  <td style={{ padding: '0.875rem 1.5rem', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {t.date}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
