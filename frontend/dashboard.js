const nomeUsuario = localStorage.getItem("usuarioNome");
const usuarioId = localStorage.getItem("usuarioId");
const token = localStorage.getItem("token");

const API_URL = "https://controlamigo-2.onrender.com";

let saldoBancarioAtual = null;
let transacoesCarregadas = [];
let graficoEvolucaoInstancia = null;
let graficoCategoriasInstancia = null;

if (!usuarioId || !token) {
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioUsername");
    localStorage.removeItem("token");

    window.location.href = "index.html";
}

function obterNomeCurto(nomeCompleto) {
    if (!nomeCompleto) {
        return "";
    }

    const nomes = nomeCompleto.trim().split(/\s+/);

    if (nomes.length === 1) {
        return nomes[0];
    }

    return nomes[0] + " " + nomes[1];
}

function atualizarNomeUsuario(nome) {
    const tituloUsuario = document.getElementById("tituloUsuario");

    if (!tituloUsuario || !nome) {
        return;
    }

    tituloUsuario.textContent = `Olá, ${obterNomeCurto(nome)}!`;
}

if (nomeUsuario) {
    atualizarNomeUsuario(nomeUsuario);
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(dataTransacao) {
    if (!dataTransacao) {
        return "Data não informada";
    }

    const partes = String(dataTransacao).split("-");

    if (partes.length < 3) {
        return dataTransacao;
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(String(partes[2]).substring(0, 2));

    const data = new Date(ano, mes, dia);

    if (Number.isNaN(data.getTime())) {
        return dataTransacao;
    }

    return data.toLocaleDateString("pt-BR");
}

async function carregarSaldoBancario() {
    try {
        const responseContas = await fetch(
            `${API_URL}/contas-bancarias/usuario/${usuarioId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!responseContas.ok) {
            throw new Error("Não foi possível verificar as contas bancárias.");
        }

        const contas = await responseContas.json();

        if (!Array.isArray(contas) || contas.length === 0) {
            saldoBancarioAtual = null;
            await carregarTransacoes();
            return;
        }

        const responseSaldo = await fetch(
            `${API_URL}/contas-bancarias/usuario/${usuarioId}/saldo`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!responseSaldo.ok) {
            throw new Error("Não foi possível carregar o saldo bancário.");
        }

        const dadosSaldo = await responseSaldo.json();

        saldoBancarioAtual = Number(dadosSaldo.saldo || 0);

        await carregarTransacoes();

    } catch (error) {
        console.error("Erro ao carregar saldo bancário:", error);

        saldoBancarioAtual = null;

        await carregarTransacoes();
    }
}

async function carregarTransacoes() {
    try {
        const response = await fetch(
            `${API_URL}/transacoes/usuario/${usuarioId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Erro ao buscar transações");
        }

        const transacoes = await response.json();

        transacoesCarregadas = Array.isArray(transacoes)
            ? transacoes
            : [];

        atualizarResumo(transacoesCarregadas);
        mostrarUltimasTransacoes();
        atualizarGraficos(transacoesCarregadas);

    } catch (error) {
        console.error("Erro ao carregar transações:", error);
    }
}

function atualizarResumo(transacoes) {
    let totalReceitas = 0;
    let totalDespesas = 0;
    let receitasManuais = 0;
    let despesasManuais = 0;

    transacoes.forEach(transacao => {
        const valor = Number(transacao.valor || 0);

        if (transacao.tipo === "RECEITA") {
            totalReceitas += valor;

            if (transacao.origem === "MANUAL") {
                receitasManuais += valor;
            }
        }

        if (transacao.tipo === "DESPESA") {
            totalDespesas += valor;

            if (transacao.origem === "MANUAL") {
                despesasManuais += valor;
            }
        }
    });

    const saldoCalculado = totalReceitas - totalDespesas;

    const saldoAtual =
        saldoBancarioAtual !== null
            ? saldoBancarioAtual + receitasManuais - despesasManuais
            : saldoCalculado;

    const receitas = document.getElementById("receitas");
    const despesas = document.getElementById("despesas");
    const saldo = document.getElementById("saldo");

    if (receitas) {
        receitas.textContent = formatarMoeda(totalReceitas);
    }

    if (despesas) {
        despesas.textContent = formatarMoeda(totalDespesas);
    }

    if (saldo) {
        saldo.textContent = formatarMoeda(saldoAtual);
    }
}

function atualizarGraficos(transacoes) {
    criarGraficoEvolucao(transacoes);
    criarGraficoCategorias(transacoes);
}

function obterUltimosSeisMeses() {
    const meses = [];
    const hoje = new Date();

    for (let i = 5; i >= 0; i--) {
        const data = new Date(
            hoje.getFullYear(),
            hoje.getMonth() - i,
            1
        );

        meses.push({
            ano: data.getFullYear(),
            mes: data.getMonth(),
            label: data.toLocaleDateString("pt-BR", {
                month: "short"
            }).replace(".", "")
        });
    }

    return meses;
}

function criarGraficoEvolucao(transacoes) {
    const canvas = document.getElementById("graficoEvolucao");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const meses = obterUltimosSeisMeses();

    const receitas = meses.map(() => 0);
    const despesas = meses.map(() => 0);

    transacoes.forEach(transacao => {
        if (!transacao.data) {
            return;
        }

        const partes = String(transacao.data).split("-");

        if (partes.length < 2) {
            return;
        }

        const ano = Number(partes[0]);
        const mes = Number(partes[1]) - 1;
        const valor = Number(transacao.valor || 0);

        const indice = meses.findIndex(
            item =>
                item.ano === ano &&
                item.mes === mes
        );

        if (indice === -1) {
            return;
        }

        if (transacao.tipo === "RECEITA") {
            receitas[indice] += valor;
        }

        if (transacao.tipo === "DESPESA") {
            despesas[indice] += valor;
        }
    });

    if (graficoEvolucaoInstancia) {
        graficoEvolucaoInstancia.destroy();
    }

    graficoEvolucaoInstancia = new Chart(canvas, {
        type: "line",

        data: {
            labels: meses.map(item => item.label),

            datasets: [
                {
                    label: "Receitas",
                    data: receitas,
                    borderColor: "#27ad75",
                    backgroundColor: "rgba(39, 173, 117, 0.10)",
                    pointBackgroundColor: "#27ad75",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: "Despesas",
                    data: despesas,
                    borderColor: "#df5c62",
                    backgroundColor: "rgba(223, 92, 98, 0.08)",
                    pointBackgroundColor: "#df5c62",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            interaction: {
                mode: "index",
                intersect: false
            },

            plugins: {
                legend: {
                    position: "top",
                    align: "end",

                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: 9,
                        boxHeight: 9,
                        padding: 20,
                        color: "#718397",

                        font: {
                            family: "Poppins",
                            size: 12
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "#12385d",
                    padding: 12,
                    titleFont: {
                        family: "Poppins",
                        size: 12
                    },
                    bodyFont: {
                        family: "Poppins",
                        size: 12
                    },

                    callbacks: {
                        label: contexto => {
                            return `${contexto.dataset.label}: ${formatarMoeda(contexto.raw)}`;
                        }
                    }
                }
            },

            scales: {
                x: {
                    grid: {
                        display: false
                    },

                    ticks: {
                        color: "#718397",

                        font: {
                            family: "Poppins",
                            size: 11
                        }
                    },

                    border: {
                        display: false
                    }
                },

                y: {
                    beginAtZero: true,

                    grid: {
                        color: "rgba(18, 56, 93, 0.06)"
                    },

                    ticks: {
                        color: "#718397",

                        font: {
                            family: "Poppins",
                            size: 11
                        },

                        callback: valor => {
                            return Number(valor).toLocaleString(
                                "pt-BR",
                                {
                                    notation: "compact",
                                    maximumFractionDigits: 1
                                }
                            );
                        }
                    },

                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

function criarGraficoCategorias(transacoes) {
    const canvas = document.getElementById("graficoCategorias");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const categorias = {};

    transacoes.forEach(transacao => {
        if (transacao.tipo !== "DESPESA") {
            return;
        }

        const categoria =
            transacao.categoria &&
            String(transacao.categoria).trim() !== ""
                ? transacao.categoria
                : "Outros";

        categorias[categoria] =
            (categorias[categoria] || 0) +
            Number(transacao.valor || 0);
    });

    const entradas = Object.entries(categorias)
        .sort((a, b) => b[1] - a[1]);

    let labels = entradas.map(item => item[0]);
    let valores = entradas.map(item => item[1]);

    if (labels.length === 0) {
        labels = ["Sem despesas"];
        valores = [1];
    }

    const paleta = [
        "#2787d5",
        "#27ad75",
        "#f1a84b",
        "#8d72d9",
        "#df5c62",
        "#4aa9b8",
        "#77889b",
        "#e47cac"
    ];

    if (graficoCategoriasInstancia) {
        graficoCategoriasInstancia.destroy();
    }

    graficoCategoriasInstancia = new Chart(canvas, {
        type: "doughnut",

        data: {
            labels,

            datasets: [
                {
                    data: valores,

                    backgroundColor:
                        labels[0] === "Sem despesas"
                            ? ["#e4ebf0"]
                            : labels.map(
                                (_, indice) =>
                                    paleta[indice % paleta.length]
                            ),

                    borderColor: "#ffffff",
                    borderWidth: 3,
                    hoverOffset: 6
                }
            ]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",

            plugins: {
                legend: {
                    position: "bottom",

                    labels: {
                        usePointStyle: true,
                        pointStyle: "circle",
                        boxWidth: 9,
                        boxHeight: 9,
                        padding: 17,
                        color: "#718397",

                        font: {
                            family: "Poppins",
                            size: 11
                        }
                    }
                },

                tooltip: {
                    backgroundColor: "#12385d",
                    padding: 12,

                    titleFont: {
                        family: "Poppins",
                        size: 12
                    },

                    bodyFont: {
                        family: "Poppins",
                        size: 12
                    },

                    callbacks: {
                        label: contexto => {
                            if (labels[0] === "Sem despesas") {
                                return "Nenhuma despesa registrada";
                            }

                            return `${contexto.label}: ${formatarMoeda(contexto.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

function mostrarUltimasTransacoes() {
    const lista = document.getElementById("listaTransacoes");

    if (!lista) {
        return;
    }

    lista.innerHTML = "";

    if (transacoesCarregadas.length === 0) {
        lista.innerHTML = `
            <div class="sem-transacoes">

                <div class="sem-transacoes-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>

                <h4>Nenhuma movimentação encontrada</h4>

                <p>
                    Suas movimentações mais recentes aparecerão aqui.
                </p>

            </div>
        `;

        return;
    }

    const transacoesOrdenadas = [...transacoesCarregadas].sort(
        (a, b) => {
            const dataA = a.data
                ? new Date(String(a.data).substring(0, 10))
                : new Date(0);

            const dataB = b.data
                ? new Date(String(b.data).substring(0, 10))
                : new Date(0);

            return dataB - dataA;
        }
    );

    const ultimasTransacoes = transacoesOrdenadas.slice(0, 5);

    ultimasTransacoes.forEach(transacao => {
        const item = document.createElement("div");

        item.classList.add("transacao-item");

        const receita = transacao.tipo === "RECEITA";

        const sinal = receita ? "+" : "-";

        const icone = receita
            ? "fa-arrow-down"
            : "fa-arrow-up";

        const classeValor = receita
            ? "valor-receita"
            : "valor-despesa";

        const classeIcone = receita
            ? "icone-receita"
            : "icone-despesa";

        const categoria =
            transacao.categoria &&
            String(transacao.categoria).trim() !== ""
                ? transacao.categoria
                : "Sem categoria";

        const descricao =
            transacao.descricao &&
            String(transacao.descricao).trim() !== ""
                ? transacao.descricao
                : categoria;

        const dataFormatada = formatarData(transacao.data);

        item.innerHTML = `
            <div class="transacao-esquerda">

                <div class="transacao-icon ${classeIcone}">
                    <i class="fa-solid ${icone}"></i>
                </div>

                <div class="transacao-dados">

                    <div class="transacao-nome">
                        ${transacao.destinatario || "Transação"}
                    </div>

                    <div class="transacao-descricao">
                        ${descricao}
                    </div>

                    <div class="transacao-detalhes">

                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${dataFormatada}
                        </span>

                        <span>
                            <i class="fa-solid fa-tag"></i>
                            ${categoria}
                        </span>

                    </div>

                </div>

            </div>

            <div class="transacao-direita">

                <span class="transacao-tipo">
                    ${receita ? "Receita" : "Despesa"}
                </span>

                <strong class="transacao-valor ${classeValor}">
                    ${sinal}${formatarMoeda(transacao.valor)}
                </strong>

            </div>
        `;

        lista.appendChild(item);
    });
}

const btnPerfil = document.getElementById("btnPerfil");
const modalPerfil = document.getElementById("modalPerfil");
const fecharModalPerfil = document.getElementById("fecharModalPerfil");

const perfilNomeExibicao =
    document.getElementById("perfilNomeExibicao");

const perfilUsernameExibicao =
    document.getElementById("perfilUsernameExibicao");

const perfilNome =
    document.getElementById("perfilNome");

const perfilUsername =
    document.getElementById("perfilUsername");

const perfilEmail =
    document.getElementById("perfilEmail");

const perfilTelefone =
    document.getElementById("perfilTelefone");

const statusEmail =
    document.getElementById("statusEmail");

const statusTelefone =
    document.getElementById("statusTelefone");

const btnEditarPerfil =
    document.getElementById("btnEditarPerfil");

function atualizarStatusVerificacao(elemento, verificado) {
    if (!elemento) {
        return;
    }

    if (verificado) {
        elemento.textContent = "Verificado";
        elemento.classList.add("verificado");
    } else {
        elemento.textContent = "Não verificado";
        elemento.classList.remove("verificado");
    }
}

function preencherPerfil(usuario) {
    if (perfilNomeExibicao) {
        perfilNomeExibicao.textContent =
            usuario.nome || "Usuário";
    }

    if (perfilUsernameExibicao) {
        perfilUsernameExibicao.textContent =
            usuario.username
                ? `@${usuario.username}`
                : "@usuario";
    }

    if (perfilNome) {
        perfilNome.value =
            usuario.nome || "";
    }

    if (perfilUsername) {
        perfilUsername.value =
            usuario.username || "";
    }

    if (perfilEmail) {
        perfilEmail.value =
            usuario.email || "";
    }

    if (perfilTelefone) {
        perfilTelefone.value =
            usuario.telefone || "";
    }

    atualizarStatusVerificacao(
        statusEmail,
        usuario.emailVerificado
    );

    atualizarStatusVerificacao(
        statusTelefone,
        usuario.telefoneVerificado
    );

    if (usuario.nome) {
        localStorage.setItem(
            "usuarioNome",
            usuario.nome
        );

        atualizarNomeUsuario(usuario.nome);
    }

    if (usuario.username) {
        localStorage.setItem(
            "usuarioUsername",
            usuario.username
        );
    }
}

async function carregarPerfil() {
    if (!usuarioId) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/usuarios/${usuarioId}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const mensagemErro = await response.text();

            throw new Error(
                mensagemErro ||
                "Não foi possível carregar o perfil."
            );
        }

        const usuario = await response.json();

        preencherPerfil(usuario);

    } catch (error) {
        console.error(
            "Erro ao carregar perfil:",
            error
        );

        mostrarMensagem(
            "Erro ao carregar perfil",
            "Não foi possível carregar seus dados.",
            "erro"
        );
    }
}

function abrirModalPerfil() {
    if (!modalPerfil) {
        return;
    }

    modalPerfil.classList.add("ativo");

    carregarPerfil();
}

function fecharPerfil() {
    if (!modalPerfil) {
        return;
    }

    modalPerfil.classList.remove("ativo");
}

if (btnPerfil) {
    btnPerfil.addEventListener(
        "click",
        abrirModalPerfil
    );
}

if (fecharModalPerfil) {
    fecharModalPerfil.addEventListener(
        "click",
        fecharPerfil
    );
}

if (modalPerfil) {
    modalPerfil.addEventListener(
        "click",
        event => {
            if (event.target === modalPerfil) {
                fecharPerfil();
            }
        }
    );
}

if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener(
        "click",
        () => {
            mostrarMensagem(
                "Em breve",
                "A edição do perfil será implementada na próxima etapa.",
                "sucesso"
            );
        }
    );
}

function mostrarMensagem(
    titulo,
    mensagem,
    tipo = "sucesso"
) {
    const antiga =
        document.querySelector(
            ".toast-sincronizacao"
        );

    if (antiga) {
        antiga.remove();
    }

    const toast =
        document.createElement("div");

    toast.classList.add(
        "toast-sincronizacao",
        tipo
    );

    const icone =
        tipo === "sucesso"
            ? "fa-circle-check"
            : "fa-circle-exclamation";

    toast.innerHTML = `
        <div class="toast-icone">
            <i class="fa-solid ${icone}"></i>
        </div>

        <div class="toast-conteudo">
            <strong>${titulo}</strong>
            <span>${mensagem}</span>
        </div>

        <button
            class="toast-fechar"
            type="button"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("mostrar");
    });

    const fechar =
        toast.querySelector(
            ".toast-fechar"
        );

    if (fechar) {
        fechar.addEventListener(
            "click",
            () => removerToast(toast)
        );
    }

    setTimeout(
        () => removerToast(toast),
        4500
    );
}

function removerToast(toast) {
    if (!toast) {
        return;
    }

    toast.classList.remove("mostrar");

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 300);
}

function sair() {
    localStorage.removeItem("usuarioId");
    localStorage.removeItem("usuarioNome");
    localStorage.removeItem("usuarioUsername");
    localStorage.removeItem("token");

    window.location.replace("index.html");
}

const btnSair =
    document.getElementById("btnSair");

if (btnSair) {
    btnSair.addEventListener(
        "click",
        sair
    );
}

carregarSaldoBancario();
function iniciarEfeitosVisuais() {
    const elementos = document.querySelectorAll(
        ".card, .grafico-card, .home-transacoes"
    );

    elementos.forEach(elemento => {
        elemento.addEventListener("mousemove", evento => {
            const retangulo =
                elemento.getBoundingClientRect();

            const x =
                evento.clientX -
                retangulo.left;

            const y =
                evento.clientY -
                retangulo.top;

            const percentualX =
                (x / retangulo.width) * 100;

            const percentualY =
                (y / retangulo.height) * 100;

            elemento.style.setProperty(
                "--mouse-x",
                `${percentualX}%`
            );

            elemento.style.setProperty(
                "--mouse-y",
                `${percentualY}%`
            );

            if (elemento.classList.contains("card")) {
                const centroX =
                    retangulo.width / 2;

                const centroY =
                    retangulo.height / 2;

                const rotacaoY =
                    ((x - centroX) / centroX) * 1.5;

                const rotacaoX =
                    ((centroY - y) / centroY) * 1.5;

                elemento.style.transform =
                    `perspective(900px)
                    rotateX(${rotacaoX}deg)
                    rotateY(${rotacaoY}deg)
                    translateY(-3px)`;
            }
        });

        elemento.addEventListener("mouseleave", () => {
            elemento.style.setProperty(
                "--mouse-x",
                "50%"
            );

            elemento.style.setProperty(
                "--mouse-y",
                "50%"
            );

            elemento.style.transform = "";
        });
    });
}

function animarEntradaElementos() {
    const elementos = document.querySelectorAll(
        ".boas-vindas, .card, .grafico-card, .home-transacoes"
    );

    elementos.forEach((elemento, indice) => {
        elemento.style.opacity = "0";

        elemento.style.transform =
            "translateY(18px)";

        elemento.style.transition =
            "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)";

        setTimeout(() => {
            elemento.style.opacity = "1";
            elemento.style.transform = "";
        }, 90 * indice);
    });
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        iniciarEfeitosVisuais();
        animarEntradaElementos();
    }
);