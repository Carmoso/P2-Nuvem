SELECT
    a.id AS auditorio_id,
    a.nome AS auditorio,
    a.capacidade,
    a.localizacao,
    COUNT(e.id) AS total_eventos,
    COUNT(e.id) FILTER (
        WHERE e.status = 'agendado'
    ) AS eventos_agendados,
    COUNT(e.id) FILTER (
        WHERE e.status = 'finalizado'
    ) AS eventos_finalizados,
    COUNT(e.id) FILTER (
        WHERE e.status = 'cancelado'
    ) AS eventos_cancelados
FROM auditorios a
LEFT JOIN eventos e
    ON e.auditorio_id = a.id
GROUP BY
    a.id,
    a.nome,
    a.capacidade,
    a.localizacao
ORDER BY
    total_eventos DESC,
    a.nome;
