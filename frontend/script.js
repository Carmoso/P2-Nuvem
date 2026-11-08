

let eventos = [];
let auditorios = [];

const $ = (id) => document.getElementById(id);

async function requisicao(endpoint, options = {}) {
    const resposta = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    if (!resposta.ok) {
        let erro = `Erro HTTP ${resposta.status}`;

        try {
            const dados = await resposta.json();
            erro = dados.erro || erro;
        } catch {}

        throw new Error(erro);
    }

    if (resposta.status === 204) return null;
    return resposta.json();
}

function notificar(mensagem) {
    const elemento = $("mensagem");
    elemento.textContent = mensagem;
    elemento.classList.add("visivel");

    setTimeout(() => elemento.classList.remove("visivel"), 3500);
}

function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}

function formatarData(valor) {
    if (!valor) return "Não informada";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;

    return data.toLocaleString("pt-BR");
}

function dataParaInput(valor) {
    if (!valor) return "";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";

    const ajustar = new Date(
        data.getTime() - data.getTimezoneOffset() * 60000
    );

    return ajustar.toISOString().slice(0, 16);
}

function mostrarPagina(pagina) {
    document.querySelectorAll(".page").forEach(item => {
        item.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(item => {
        item.classList.toggle("active", item.dataset.page === pagina);
    });

    $(pagina).classList.add("active");

    const titulos = {
        inicio: "Visão geral",
        eventos: "Gestão de eventos",
        auditorios: "Gestão de auditórios",
          disponibilidade: "Consultar disponibilidade"
    };

    $("page-title").textContent = titulos[pagina];
}

async function carregarAuditorios() {
    auditorios = await requisicao("/auditorios");

    $("total-auditorios").textContent = auditorios.length;

    $("lista-auditorios").innerHTML = auditorios.length
        ? `<div class="item-list">${auditorios.map(a => `
            <article class="item">
                <div>
                    <h3>${escapar(a.nome)}</h3>
                    <p>Capacidade: ${escapar(a.capacidade)} pessoas</p>
                      <p>Situação: ${a.ativo ? "Ativo" : "Desativado"}</p>
                    <p>Localização: ${escapar(a.localizacao)}</p>
                    <p>Recursos: ${escapar(a.recursos || "Não informados")}</p>
                </div>
                <div class="item-actions">
                    <button class="edit" onclick="editarAuditorio(${a.id})">Editar</button>
                    <button class="delete" onclick="excluirAuditorio(${a.id})">Excluir</button>
                </div>
            </article>
        `).join("")}</div>`
        : '<p class="empty">Nenhum auditório cadastrado.</p>';

    $("evento-auditorio").innerHTML =
        '<option value="">Selecione um auditório</option>' +
        auditorios.map(a =>
            `<option value="${a.id}">${escapar(a.nome)}</option>`
        ).join("");
}

async function carregarEventos() {
    eventos = await requisicao("/eventos");

    $("total-eventos").textContent = eventos.length;

    const conteudo = eventos.length
        ? `<div class="item-list">${eventos.map(e => `
            <article class="item">
                <div>
                    <img
                         data-banner-evento="${e.id}"
                         alt="Banner do evento ${escapar(e.titulo)}"
                         style="display:none; width:160px; height:105px; object-fit:cover; border-radius:10px;"
                    >
                    <h3>${escapar(e.titulo)}</h3>
                    <p>Auditório: ${escapar(e.auditorio_nome)}</p>
                    <p>Início: ${escapar(formatarData(e.data_inicio))}</p>
                    <p>Término: ${escapar(formatarData(e.data_fim))}</p>
                    <p>Status: ${escapar(e.status || "Não informado")}</p>
                </div>
                <div class="item-actions">
                    <button class="edit" onclick="editarEvento(${e.id})">Editar</button>
                    <button class="delete" onclick="excluirEvento(${e.id})">Excluir</button>
                </div>
            </article>
        `).join("")}</div>`
        : '<p class="empty">Nenhum evento cadastrado.</p>';

    $("lista-eventos").innerHTML = conteudo;
    $("resumo-eventos").innerHTML = conteudo;

    for (const e of eventos) {
    if (!e.thumbnail_url && !e.banner_url) continue;

    try {
        const dados = await requisicao(
            `/eventos/${e.id}/imagem-url`
        );

        document.querySelectorAll(
            `img[data-banner-evento="${e.id}"]`
        ).forEach(imagem => {
            imagem.onload = () => {
                imagem.style.display = "block";
            };

            imagem.onerror = () => {
                console.warn(`Falha ao carregar imagem do evento ${e.id}`);
            };

            imagem.src = dados.url;
        });

    } catch (erro) {
        console.warn(
            `Imagem do evento ${e.id} indisponível:`,
            erro.message
        );
    }
 }
}


async function carregarRelatorio() {
    const area = $("relatorio-gerencial");
    if (!area) return;

    area.textContent = "Carregando relatório...";

    try {
        const resposta = await fetch(
            "https://10ciu9d8h0.execute-api.us-east-1.amazonaws.com/relatorios/auditorios"
        );

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados.auditorios)) {
            throw new Error("Formato de relatório inválido");
        }

        if (dados.auditorios.length === 0) {
            area.textContent = "Nenhum auditório cadastrado.";
            return;
        }

        area.innerHTML = `
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;text-align:left;">
                    <thead>
                        <tr>
                            <th>Auditório</th>
                            <th>Capacidade</th>
                            <th>Total</th>
                            <th>Agendados</th>
                            <th>Finalizados</th>
                            <th>Cancelados</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dados.auditorios.map(a => `
                            <tr>
                                <td>${escapar(a.auditorio)}</td>
                                <td>${escapar(a.capacidade)}</td>
                                <td>${escapar(a.total_eventos)}</td>
                                <td>${escapar(a.eventos_agendados)}</td>
                                <td>${escapar(a.eventos_finalizados)}</td>
                                <td>${escapar(a.eventos_cancelados)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

    } catch (erro) {
        console.error("Erro ao carregar relatório:", erro);
        area.textContent = "Relatório indisponível no momento.";
    }
}

async function atualizarSistema() {
    try {
        await carregarAuditorios();
        sincronizarSeletorBloqueios();
        await carregarEventos();
        await carregarRelatorio();
        $("api-status").textContent = "API conectada";
        $("api-status").style.background = "#dcfce7";
        $("api-status").style.color = "#166534";
    } catch (erro) {
        $("api-status").textContent = "API indisponível";
        notificar(erro.message);
    }
}

// Navegação
document.querySelectorAll(".nav-btn").forEach(botao => {
    botao.addEventListener("click", () => {
        mostrarPagina(botao.dataset.page);
    });
});

// Validar as datas do evento no formulário
function validarPeriodoEvento() {
    const inicio = $("evento-inicio");
    const fim = $("evento-fim");

    fim.min = inicio.value || "";

    if (inicio.value && fim.value && fim.value <= inicio.value) {
        fim.setCustomValidity(
            "A data de término deve ser posterior à data de início."
        );
    } else {
        fim.setCustomValidity("");
    }
}

["evento-inicio", "evento-fim"].forEach(id => {
    $(id).addEventListener("input", validarPeriodoEvento);
    $(id).addEventListener("change", validarPeriodoEvento);
});


// Validar as datas da consulta de disponibilidade
function validarPeriodoDisponibilidade() {
    const inicio = $("disponibilidade-inicio");
    const fim = $("disponibilidade-fim");
    const resultado = $("resultado-disponibilidade");

    fim.min = inicio.value || "";

    if (inicio.value && fim.value && fim.value <= inicio.value) {
        fim.setCustomValidity(
            "A data de término deve ser posterior à data de início."
        );

        resultado.textContent =
            "Período inválido: o término deve ser posterior ao início.";
    } else {
        fim.setCustomValidity("");

        resultado.textContent =
            "Preencha os campos e clique em Buscar auditórios disponíveis.";
    }
}

// Revalidar sempre que uma das datas for modificada
["disponibilidade-inicio", "disponibilidade-fim"].forEach(id => {
    $(id).addEventListener("input", validarPeriodoDisponibilidade);
    $(id).addEventListener("change", validarPeriodoDisponibilidade);
});

// RF-06: Consulta de disponibilidade dos auditórios
$("form-disponibilidade").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const inicio = $("disponibilidade-inicio").value;
    const fim = $("disponibilidade-fim").value;
    const capacidade = Number($("disponibilidade-capacidade").value);
    const area = $("resultado-disponibilidade");

    if (!inicio || !fim || fim <= inicio) {
        notificar("A data de término deve ser posterior à de início.");
        return;
    }

    if (!Number.isSafeInteger(capacidade) || capacidade <= 0) {
        notificar("Informe uma quantidade válida de participantes.");
        return;
    }

    const parametros = new URLSearchParams({
        data_inicio: new Date(inicio).toISOString(),
        data_fim: new Date(fim).toISOString(),
        capacidade: String(capacidade)
    });

    area.textContent = "Consultando disponibilidade...";

    try {
        const resultado = await requisicao(
            `/auditorios/disponiveis?${parametros.toString()}`
        );

        const disponiveis = resultado.auditorios;

        if (!Array.isArray(disponiveis)) {
            throw new Error("Resposta inesperada da API.");
        }

        if (disponiveis.length === 0) {
            area.textContent =
                resultado.mensagem ||
                "Nenhum auditório disponível para esse período.";
            return;
        }

        area.innerHTML = `
            <p>${escapar(resultado.mensagem)}</p>
            <div class="item-list">
                ${disponiveis.map(a => `
                    <article class="item">
                        <div>
                            <h3>${escapar(a.nome)}</h3>
                            <p>Capacidade: ${escapar(a.capacidade)} pessoas</p>
                            <p>Localização: ${escapar(a.localizacao)}</p>
                            <p>Recursos: ${escapar(a.recursos || "Não informados")}</p>
                        </div>

                        <div class="item-actions">
                            <button
                                type="button"
                                class="edit"
                                data-auditorio-id="${escapar(a.id)}"
                            >
                                Selecionar auditório
                            </button>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;

    } catch (erro) {
        area.textContent = `Erro ao consultar disponibilidade: ${erro.message}`;
        notificar(erro.message);
    }
});

// Preencher automaticamente o formulário de eventos
$("resultado-disponibilidade").addEventListener("click", (evento) => {
    const botao = evento.target.closest(
        "button[data-auditorio-id]"
    );

    if (!botao) return;

    const auditorioId = Number(botao.dataset.auditorioId);

    if (!Number.isSafeInteger(auditorioId)) return;

    limparEvento();

    $("evento-inicio").value = $("disponibilidade-inicio").value;
    $("evento-fim").value = $("disponibilidade-fim").value;
    $("evento-participantes").value =
        $("disponibilidade-capacidade").value;
    $("evento-auditorio").value = String(auditorioId);

    validarPeriodoEvento();
    mostrarPagina("eventos");

    $("evento-titulo").focus();
});

// Cadastro e edição de eventos
async function enviarBanner(eventoId, arquivo) {
    const dados = await requisicao(`/eventos/${eventoId}/banner-url`, {
        method: "POST",
        body: JSON.stringify({
            nome_arquivo: arquivo.name,
            tipo_arquivo: arquivo.type
        })
    });

    const upload = await fetch(dados.url, {
        method: "PUT",
        headers: {
            "Content-Type": arquivo.type
        },
        body: arquivo
    });

    if (!upload.ok) {
        throw new Error("Não foi possível enviar a imagem ao S3.");
    }

    await requisicao(`/eventos/${eventoId}/banner`, {
        method: "PUT",
        body: JSON.stringify({
            banner_url: dados.banner_url
        })
    });
}
$("form-evento").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = $("evento-id").value;

    const participantesTexto = $("evento-participantes").value.trim();

    const participantes = participantesTexto === ""
        ? null
        : Number(participantesTexto);

    if (
        participantes !== null &&
        (!Number.isSafeInteger(participantes) || participantes <= 0)
    ) {
        notificar("Informe uma quantidade válida de participantes.");
        return;
    }

    const dados = {
        titulo: $("evento-titulo").value.trim(),
        descricao: $("evento-descricao").value.trim(),
        data_inicio: new Date($("evento-inicio").value).toISOString(),
        data_fim: new Date($("evento-fim").value).toISOString(),
        auditorio_id: Number($("evento-auditorio").value),
          participantes_previstos: participantes
    };

    if (id) {
        dados.status = $("evento-status").value;
    }

    if (new Date(dados.data_fim) <= new Date(dados.data_inicio)) {
        notificar("A data de término deve ser posterior ao início.");
        return;
    }

    try {
        const eventoSalvo = await requisicao(
            id ? `/eventos/${id}` : "/eventos",
            {
               method: id ? "PUT" : "POST",
               body: JSON.stringify(dados)
            }
        );

        const arquivo = $("evento-banner").files[0];

        if (arquivo) {
           await enviarBanner(eventoSalvo.id, arquivo);
        }

        notificar(id ? "Evento atualizado!" : "Evento cadastrado!");
        limparEvento();
        await atualizarSistema();
    } catch (erro) {
        notificar(erro.message);
    }
});

function editarEvento(id) {
    const evento = eventos.find(e => e.id === id);
    if (!evento) return;

    $("evento-id").value = evento.id;
    $("evento-titulo").value = evento.titulo;
    $("evento-descricao").value = evento.descricao || "";
    $("evento-inicio").value = dataParaInput(evento.data_inicio);
    $("evento-fim").value = dataParaInput(evento.data_fim);
    validarPeriodoEvento();
    $("evento-auditorio").value = evento.auditorio_id;
    $("evento-participantes").value =
        evento.participantes_previstos ?? "";

    // Eventos antigos sem participantes continuam editáveis.
    $("evento-participantes").required =
        evento.participantes_previstos != null;
    $("evento-status").value = evento.status || "agendado";

    $("titulo-form-evento").textContent = "Editar evento";
    mostrarPagina("eventos");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirEvento(id) {
    if (!confirm("Deseja realmente excluir este evento?")) return;

    try {
        await requisicao(`/eventos/${id}`, { method: "DELETE" });
        notificar("Evento excluído!");
        await atualizarSistema();
    } catch (erro) {
        notificar(erro.message);
    }
}

function limparEvento() {
    $("form-evento").reset();
    $("evento-participantes").required = true;
    validarPeriodoEvento();
    $("evento-id").value = "";
    $("titulo-form-evento").textContent = "Cadastrar evento";
}

$("cancelar-evento").addEventListener("click", limparEvento);

// Restaurar o formulário de auditórios
$("form-auditorio").addEventListener("reset", () => {
    $("auditorio-situacao-edicao").hidden = true;
    $("auditorio-ativo").value = "true";
});


// RF-05: Consultar bloqueios de auditórios
async function carregarBloqueiosSelecionados() {
    const seletor = $("bloqueio-auditorio");
    const area = $("lista-bloqueios");
    const auditorioId = seletor.value;

    if (!auditorioId) {
        area.textContent =
            "Selecione um auditório para consultar seus bloqueios.";
        return;
    }

    area.textContent = "Carregando bloqueios...";

    try {
        const bloqueios = await requisicao(
            `/auditorios/${auditorioId}/bloqueios`
        );

        // Evitar mostrar resultados de outro auditório
        if (seletor.value !== auditorioId) return;

        if (!Array.isArray(bloqueios)) {
            throw new Error("Resposta inesperada da API.");
        }

        if (bloqueios.length === 0) {
            area.textContent =
                "Este auditório não possui bloqueios cadastrados.";
            return;
        }

        area.innerHTML = `
            <div class="item-list">
                ${bloqueios.map(b => `
                    <article class="item">
                        <div>
                            <h3>${escapar(b.motivo || "Indisponibilidade")}</h3>
                            <p>Início: ${escapar(formatarData(b.data_inicio))}</p>
                            <p>Término: ${escapar(formatarData(b.data_fim))}</p>
                        </div>
                        <div class="item-actions">
                            <button
                                type="button"
                                class="delete"
                                data-bloqueio-id="${Number(b.id)}"
                            >
                                Remover bloqueio
                            </button>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;

    } catch (erro) {
        if (seletor.value !== auditorioId) return;
        area.textContent = "Não foi possível carregar os bloqueios.";
        notificar(erro.message);
    }
}

// Atualizar as opções quando os auditórios forem carregados
function sincronizarSeletorBloqueios() {
    const seletor = $("bloqueio-auditorio");
    const selecaoAnterior = seletor.value;

    seletor.innerHTML =
        '<option value="">Selecione um auditório</option>' +
        auditorios.map(a => `
            <option value="${Number(a.id)}">
                ${escapar(a.nome)} (${a.ativo ? "Ativo" : "Desativado"})
            </option>
        `).join("");

    if (auditorios.some(a => String(a.id) === selecaoAnterior)) {
        seletor.value = selecaoAnterior;
    }

    carregarBloqueiosSelecionados();
}

$("bloqueio-auditorio").addEventListener(
    "change",
    carregarBloqueiosSelecionados
);


// RF-05: Validar datas dos bloqueios
function validarPeriodoBloqueio() {
    const inicio = $("bloqueio-inicio");
    const fim = $("bloqueio-fim");

    fim.min = inicio.value || "";

    if (inicio.value && fim.value && fim.value <= inicio.value) {
        fim.setCustomValidity(
            "O término do bloqueio deve ser posterior ao início."
        );
    } else {
        fim.setCustomValidity("");
    }
}

["bloqueio-inicio", "bloqueio-fim"].forEach(id => {
    $(id).addEventListener("input", validarPeriodoBloqueio);
    $(id).addEventListener("change", validarPeriodoBloqueio);
});

// RF-05: Cadastrar bloqueio
$("form-bloqueio").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const auditorioId = Number($("bloqueio-auditorio").value);
    const inicio = $("bloqueio-inicio").value;
    const fim = $("bloqueio-fim").value;
    const motivo = $("bloqueio-motivo").value.trim();

    if (!Number.isSafeInteger(auditorioId) || auditorioId <= 0) {
        notificar("Selecione um auditório válido.");
        return;
    }

    if (!inicio || !fim || fim <= inicio) {
        notificar("O término do bloqueio deve ser posterior ao início.");
        return;
    }

    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);

    if (
        Number.isNaN(dataInicio.getTime()) ||
        Number.isNaN(dataFim.getTime())
    ) {
        notificar("Informe datas válidas.");
        return;
    }

    try {
        await requisicao(`/auditorios/${auditorioId}/bloqueios`, {
            method: "POST",
            body: JSON.stringify({
                data_inicio: dataInicio.toISOString(),
                data_fim: dataFim.toISOString(),
                motivo: motivo
            })
        });

        notificar("Bloqueio cadastrado com sucesso!");

        $("bloqueio-inicio").value = "";
        $("bloqueio-fim").value = "";
        $("bloqueio-motivo").value = "";

        validarPeriodoBloqueio();
        await carregarBloqueiosSelecionados();

    } catch (erro) {
        notificar(erro.message);
    }
});

// RF-05: Remover bloqueio
$("lista-bloqueios").addEventListener("click", async (evento) => {
    const botao = evento.target.closest(
        "button[data-bloqueio-id]"
    );

    if (!botao) return;

    const bloqueioId = Number(botao.dataset.bloqueioId);

    if (!Number.isSafeInteger(bloqueioId) || bloqueioId <= 0) {
        notificar("Bloqueio inválido.");
        return;
    }

    if (!confirm("Deseja realmente remover este bloqueio?")) {
        return;
    }

    botao.disabled = true;

    try {
        await requisicao(`/bloqueios/${bloqueioId}`, {
            method: "DELETE"
        });

        notificar("Bloqueio removido com sucesso!");
        await carregarBloqueiosSelecionados();

    } catch (erro) {
        botao.disabled = false;
        notificar(erro.message);
    }
});

// Cadastro e edição de auditórios
$("form-auditorio").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const id = $("auditorio-id").value;

    const dados = {
        nome: $("auditorio-nome").value.trim(),
        capacidade: Number($("auditorio-capacidade").value),
        localizacao: $("auditorio-localizacao").value.trim(),
        recursos: $("auditorio-recursos").value.trim()
    };

    if (id) {
        dados.ativo = $("auditorio-ativo").value === "true";
    }

    try {
        await requisicao(id ? `/auditorios/${id}` : "/auditorios", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(dados)
        });

        notificar(id ? "Auditório atualizado!" : "Auditório cadastrado!");
        limparAuditorio();
        await atualizarSistema();
    } catch (erro) {
        notificar(erro.message);
    }
});

function editarAuditorio(id) {
    const auditorio = auditorios.find(a => a.id === id);
    if (!auditorio) return;

    $("auditorio-id").value = auditorio.id;
    $("auditorio-nome").value = auditorio.nome;
    $("auditorio-capacidade").value = auditorio.capacidade;
    $("auditorio-localizacao").value = auditorio.localizacao;
    $("auditorio-recursos").value = auditorio.recursos || "";
    $("auditorio-ativo").value = String(auditorio.ativo);
    $("auditorio-situacao-edicao").hidden = false;

    $("titulo-form-auditorio").textContent = "Editar auditório";
    mostrarPagina("auditorios");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function excluirAuditorio(id) {
    if (!confirm("Deseja realmente excluir este auditório?")) return;

    try {
        await requisicao(`/auditorios/${id}`, { method: "DELETE" });
        notificar("Auditório excluído!");
        await atualizarSistema();
    } catch (erro) {
        notificar(erro.message);
    }
}

function limparAuditorio() {
    $("form-auditorio").reset();
    $("auditorio-id").value = "";
    $("titulo-form-auditorio").textContent = "Cadastrar auditório";
}

$("cancelar-auditorio").addEventListener("click", limparAuditorio);

// Inicialização
atualizarSistema();
