

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
        auditorios: "Gestão de auditórios"
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
}

async function atualizarSistema() {
    try {
        await carregarAuditorios();
        await carregarEventos();
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

    const dados = {
        titulo: $("evento-titulo").value.trim(),
        descricao: $("evento-descricao").value.trim(),
        data_inicio: new Date($("evento-inicio").value).toISOString(),
        data_fim: new Date($("evento-fim").value).toISOString(),
        auditorio_id: Number($("evento-auditorio").value)
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
    $("evento-auditorio").value = evento.auditorio_id;
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
    $("evento-id").value = "";
    $("titulo-form-evento").textContent = "Cadastrar evento";
}

$("cancelar-evento").addEventListener("click", limparEvento);

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
