import Header from './components/Header.jsx'
import KPICards from './components/KPICards.jsx'
import TransactionsTable from './components/TransactionsTable.jsx'
import PaymentChart from './components/PaymentChart.jsx'
import { transactions } from './data/transactions.js'

export default function App() {
  const appTitle = import.meta.env.VITE_APP_TITLE || 'PayFlow Dashboard'

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      <Header />

      <main style={{ padding: '2rem 2.5rem', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Page title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: '700',
            color: '#f1f5f9',
            marginBottom: '0.3rem',
            letterSpacing: '-0.3px',
          }}>
            {appTitle}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Monitoramento de transações em tempo real · {transactions.length} registros carregados
          </p>
        </div>

        {/* KPI Cards row */}
        <KPICards transactions={transactions} />

        {/* Transactions table */}
        <TransactionsTable transactions={transactions} />

        {/* CSS-only bar chart */}
        <PaymentChart transactions={transactions} />

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '1.5rem 0',
          borderTop: '1px solid #2d3147',
          color: '#475569',
          fontSize: '0.78rem',
          marginTop: '0.5rem',
        }}>
          PayFlow Dashboard · Dados mockados para demonstração ·{' '}
          <span style={{ color: '#6c63ff' }}>FIAP Cloud Computing</span>
        </footer>
      </main>
    </div>
  )
}
