-- RF-05: Situação dos auditórios
ALTER TABLE auditorios
ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

-- RF-05: Períodos de indisponibilidade
CREATE TABLE IF NOT EXISTS bloqueios_auditorios (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auditorio_id BIGINT NOT NULL
        REFERENCES auditorios(id),

    data_inicio TIMESTAMP NOT NULL,
    data_fim TIMESTAMP NOT NULL,
    motivo TEXT,

    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_bloqueio_periodo
        CHECK (data_fim > data_inicio)
);

CREATE INDEX IF NOT EXISTS idx_bloqueios_auditorios_periodo
ON bloqueios_auditorios (
    auditorio_id,
    data_inicio,
    data_fim
);

-- RF-06 e RF-07: Capacidade necessária para o evento
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS participantes_previstos INTEGER
CHECK (participantes_previstos > 0);
