CREATE TABLE IF NOT EXISTS auditorios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    capacidade INTEGER NOT NULL CHECK (capacidade > 0),
    localizacao VARCHAR(150) NOT NULL,
    recursos TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'agendado'
        CHECK (status IN ('agendado', 'cancelado', 'finalizado')),
    auditorio_id BIGINT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_eventos_auditorios
        FOREIGN KEY (auditorio_id)
        REFERENCES auditorios(id),

    CONSTRAINT chk_eventos_periodo
        CHECK (data_fim > data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_eventos_auditorio_id
    ON eventos(auditorio_id);
