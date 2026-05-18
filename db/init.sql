-- ============================================================
-- PayFlow — Script de inicialização do banco de dados
-- Executado automaticamente pelo PostgreSQL na primeira subida
-- ============================================================

CREATE TABLE IF NOT EXISTS transactions (
    id             SERIAL PRIMARY KEY,
    customer_name  VARCHAR(100)   NOT NULL,
    amount         NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    status         VARCHAR(20)    NOT NULL CHECK (status IN ('Aprovado', 'Recusado', 'Pendente')),
    payment_method VARCHAR(20)    NOT NULL CHECK (payment_method IN ('Pix', 'Cartão', 'Boleto')),
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_transactions_status         ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_method ON transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at     ON transactions(created_at DESC);

-- ============================================================
-- Dados de exemplo (espelhados no frontend React)
-- ============================================================
INSERT INTO transactions (customer_name, amount, status, payment_method, created_at) VALUES
  ('Ana Silva',       1250.00, 'Aprovado', 'Cartão', '2024-05-18 09:23:00'),
  ('Bruno Costa',       89.90, 'Aprovado', 'Pix',    '2024-05-18 09:45:00'),
  ('Carla Mendes',    3400.00, 'Recusado', 'Cartão', '2024-05-18 10:12:00'),
  ('Diego Rocha',      156.50, 'Pendente', 'Boleto', '2024-05-18 10:30:00'),
  ('Elena Farias',    2100.00, 'Aprovado', 'Cartão', '2024-05-18 11:05:00'),
  ('Felipe Lima',       45.00, 'Aprovado', 'Pix',    '2024-05-18 11:22:00'),
  ('Gabriela Nunes',   899.99, 'Aprovado', 'Cartão', '2024-05-18 11:48:00'),
  ('Hugo Batista',     320.00, 'Recusado', 'Cartão', '2024-05-18 12:10:00'),
  ('Isabela Cruz',      75.00, 'Aprovado', 'Pix',    '2024-05-18 12:35:00'),
  ('João Ferreira',   1800.00, 'Pendente', 'Boleto', '2024-05-18 13:00:00'),
  ('Karen Oliveira',   550.00, 'Aprovado', 'Pix',    '2024-05-18 13:20:00'),
  ('Lucas Alves',     4200.00, 'Aprovado', 'Cartão', '2024-05-18 13:45:00'),
  ('Marina Santos',    230.00, 'Recusado', 'Boleto', '2024-05-18 14:10:00'),
  ('Nicolas Pereira',  680.00, 'Aprovado', 'Cartão', '2024-05-18 14:30:00'),
  ('Olivia Martins',   120.00, 'Aprovado', 'Pix',    '2024-05-18 14:55:00');
