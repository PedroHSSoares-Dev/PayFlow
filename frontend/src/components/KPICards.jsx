function KPICard({ title, value, subtitle, accentColor, icon }) {
  return (
    <div style={{
      background: '#1a1d2e',
      border: '1px solid #2d3147',
      borderRadius: '14px',
      padding: '1.5rem',
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
        borderRadius: '14px 14px 0 0',
      }} />

      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-20px',
        width: '80px',
        height: '80px',
        background: accentColor,
        borderRadius: '50%',
        opacity: 0.06,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </p>
        <span style={{
          fontSize: '1.25rem',
          background: `${accentColor}18`,
          padding: '4px 8px',
          borderRadius: '8px',
          border: `1px solid ${accentColor}30`,
        }}>
          {icon}
        </span>
      </div>

      <p style={{ fontSize: '1.875rem', fontWeight: '700', color: '#f1f5f9', lineHeight: 1, marginBottom: '0.5rem' }}>
        {value}
      </p>

      {subtitle && (
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default function KPICards({ transactions }) {
  const total = transactions.length
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0)
  const approved = transactions.filter(t => t.status === 'Aprovado').length
  const approvalRate = ((approved / total) * 100).toFixed(1)
  const avgTicket = totalVolume / total

  const fmt = (n) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2rem' }}>
      <KPICard
        title="Total de Transações"
        value={total}
        subtitle={`${approved} aprovadas · ${total - approved} pendentes/recusadas`}
        accentColor="#6c63ff"
        icon="💳"
      />
      <KPICard
        title="Volume Total"
        value={`R$ ${fmt(totalVolume)}`}
        subtitle="Soma de todas as transações"
        accentColor="#22c55e"
        icon="💰"
      />
      <KPICard
        title="Taxa de Aprovação"
        value={`${approvalRate}%`}
        subtitle={`${approved} de ${total} transações`}
        accentColor="#f59e0b"
        icon="✅"
      />
      <KPICard
        title="Ticket Médio"
        value={`R$ ${fmt(avgTicket)}`}
        subtitle="Valor médio por transação"
        accentColor="#6c63ff"
        icon="📊"
      />
    </div>
  )
}
