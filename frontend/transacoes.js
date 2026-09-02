const API_URL = "https://controlamigo-2.onrender.com";

const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
    window.location.href = "index.html";
}

const listaTransacoes =
    document.getElementById("listaTransacoes");

const totalMovimentado =
    document.getElementById("totalMovimentado");

const totalReceitas =
    document.getElementById("totalReceitas");

const totalDespesas =
    document.getElementById("totalDespesas");

const contadorTransacoes =
    document.getElementById("contadorTransacoes");

const buscaTransacao =
    document.getElementById("buscaTransacao");

const filtroTipo =
    document.getElementById("filtroTipo");

const filtroCategoria =
    document.getElementById("filtroCategoria");

const btnLimparFiltros =
    document.getElementById("btnLimparFiltros");

const btnNovaTransacao =
    document.getElementById("btnNovaTransacao");

const btnMostrarMais =
    document.getElementById("btnMostrarMais");

const btnOcultarMovimentacoes =
    document.getElementById("btnOcultarMovimentacoes");

const btnMostrarMovimentacoes =
    document.getElementById("btnMostrarMovimentacoes");

const areaMovimentacoes =
    document.getElementById("areaMovimentacoes");

const movimentacoesOcultas =
    document.getElementById("movimentacoesOcultas");

const modalTransacao =
    document.getElementById("modalTransacao");

const fecharModalTransacao =
    document.getElementById("fecharModalTransacao");

const btnCancelarTransacao =
    document.getElementById("btnCancelarTransacao");

const formTransacao =
    document.getElementById("formTransacao");

const tituloModalTransacao =
    document.getElementById("tituloModalTransacao");

const textoBtnSalvar =
    document.getElementById("textoBtnSalvar");

const tipoInput =
    document.getElementById("tipo");

const valorInput =
    document.getElementById("valor");

const dataInput =
    document.getElementById("data");

const destinatarioInput =
    document.getElementById("destinatario");

const descricaoInput =
    document.getElementById("descricao");

const categoriaInput =
    document.getElementById("categoria");

const modalExcluir =
    document.getElementById("modalExcluir");

const btnCancelarExclusao =
    document.getElementById("btnCancelarExclusao");

const btnConfirmarExclusao =
    document.getElementById("btnConfirmarExclusao");

let transacoes = [];
let transacoesFiltradasAtuais = [];
let transacaoEditandoId = null;
let transacaoExcluindoId = null;
let mostrarTodas = false;

let movimentacoesEstaoOcultas =
    localStorage.getItem("movimentacoesOcultas") === "true";

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) {
        return "Data não informada";
    }

    const partes = String(data).substring(0, 10).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterCategoria(transacao) {
    if (
        transacao.categoria &&
        typeof transacao.categoria === "string" &&
        transacao.categoria.trim()
    ) {
        return transacao.categoria.trim();
    }

    return "Sem categoria";
}

function obterDescricao(transacao) {
    if (
        transacao.descricao &&
        String(transacao.descricao).trim()
    ) {
        return String(transacao.descricao).trim();
    }

    return obterCategoria(transacao);
}

async function carregarTransacoes() {
    try {
        const response = await fetch(
            `${API_URL}/transacoes/usuario/${usuarioId}`
        );

        if (!response.ok) {
            throw new Error("Não foi possível carregar as transações.");
        }

        const dados = await response.json();

        transacoes = Array.isArray(dados)
            ? dados
            : [];

        transacoes.sort((a, b) => {
            const dataA = a.data
                ? new Date(String(a.data).substring(0, 10))
                : new Date(0);

            const dataB = b.data
                ? new Date(String(b.data).substring(0, 10))
                : new Date(0);

            return dataB - dataA;
        });

        atualizarResumo();
        carregarCategorias();
        aplicarFiltros();
        atualizarVisibilidadeMovimentacoes();

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            "Erro",
            "Não foi possível carregar suas transações.",
            "erro"
        );
    }
}

function atualizarResumo() {
    let receitas = 0;
    let despesas = 0;

    transacoes.forEach(transacao => {
        const valor = Number(transacao.valor || 0);

        if (transacao.tipo === "RECEITA") {
            receitas += valor;
        }

        if (transacao.tipo === "DESPESA") {
            despesas += valor;
        }
    });

    if (totalReceitas) {
        totalReceitas.textContent =
            formatarMoeda(receitas);
    }

    if (totalDespesas) {
        totalDespesas.textContent =
            formatarMoeda(despesas);
    }

    if (totalMovimentado) {
        totalMovimentado.textContent =
            formatarMoeda(receitas + despesas);
    }
}

function carregarCategorias() {
    if (!filtroCategoria) {
        return;
    }

    const categoriaAtual =
        filtroCategoria.value;

    const categorias = [
        ...new Set(
            transacoes
                .map(obterCategoria)
                .filter(
                    categoria =>
                        categoria !== "Sem categoria"
                )
        )
    ].sort((a, b) =>
        a.localeCompare(b, "pt-BR")
    );

    filtroCategoria.innerHTML = `
        <option value="">
            Todas as categorias
        </option>
    `;

    categorias.forEach(categoria => {
        const option =
            document.createElement("option");

        option.value = categoria;
        option.textContent = categoria;

        filtroCategoria.appendChild(option);
    });

    if (categorias.includes(categoriaAtual)) {
        filtroCategoria.value =
            categoriaAtual;
    }
}

function aplicarFiltros() {
    const busca =
        buscaTransacao
            ? buscaTransacao.value
                .trim()
                .toLowerCase()
            : "";

    const tipo =
        filtroTipo
            ? filtroTipo.value
            : "";

    const categoria =
        filtroCategoria
            ? filtroCategoria.value
            : "";

    transacoesFiltradasAtuais =
        transacoes.filter(transacao => {
            const destinatario =
                String(
                    transacao.destinatario || ""
                ).toLowerCase();

            const descricao =
                String(
                    transacao.descricao || ""
                ).toLowerCase();

            const categoriaTransacao =
                obterCategoria(transacao);

            const correspondeBusca =
                !busca ||
                destinatario.includes(busca) ||
                descricao.includes(busca) ||
                categoriaTransacao
                    .toLowerCase()
                    .includes(busca);

            const correspondeTipo =
                !tipo ||
                transacao.tipo === tipo;

            const correspondeCategoria =
                !categoria ||
                categoriaTransacao === categoria;

            return (
                correspondeBusca &&
                correspondeTipo &&
                correspondeCategoria
            );
        });

    mostrarTodas = false;

    renderizarTransacoes(
        transacoesFiltradasAtuais
    );
}

function renderizarTransacoes(lista) {
    if (!listaTransacoes) {
        return;
    }

    listaTransacoes.innerHTML = "";

    if (!lista.length) {
        listaTransacoes.innerHTML = `
            <div class="estado-vazio">

                <div class="estado-vazio-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>

                <h4>
                    Nenhuma transação encontrada
                </h4>

                <p>
                    Suas movimentações aparecerão aqui.
                </p>

            </div>
        `;

        atualizarContador(0);
        atualizarBotaoMostrarMais(lista);

        return;
    }

    const limite =
        mostrarTodas
            ? lista.length
            : 5;

    const listaVisivel =
        lista.slice(0, limite);

    listaVisivel.forEach(transacao => {
        const item =
            criarElementoTransacao(
                transacao
            );

        listaTransacoes.appendChild(item);
    });

    atualizarContador(lista.length);
    atualizarBotaoMostrarMais(lista);
}

function criarElementoTransacao(transacao) {
    const item =
        document.createElement("div");

    item.className =
        "transacao-item";

    const receita =
        transacao.tipo === "RECEITA";

    const categoria =
        obterCategoria(transacao);

    const descricao =
        obterDescricao(transacao);

    const origem =
        transacao.origem || "MANUAL";

    const podeAlterar =
        origem === "MANUAL" ||
        !transacao.origem;

    item.innerHTML = `
        <div class="transacao-esquerda">

            <div class="transacao-icon ${
                receita
                    ? "icone-receita"
                    : "icone-despesa"
            }">
                <i class="fa-solid ${
                    receita
                        ? "fa-arrow-down"
                        : "fa-arrow-up"
                }"></i>
            </div>

            <div class="transacao-dados">

                <div class="transacao-nome">
                    ${
                        transacao.destinatario ||
                        "Transação"
                    }
                </div>

                <div class="transacao-descricao">
                    ${descricao}
                </div>

                <div class="transacao-meta">

                    <span>
                        <i class="fa-regular fa-calendar"></i>
                        ${formatarData(transacao.data)}
                    </span>

                    <span>
                        <i class="fa-solid fa-tag"></i>
                        ${categoria}
                    </span>

                </div>

            </div>

        </div>

        <div class="transacao-direita">

            <div class="transacao-valor-area">

                <span class="transacao-tipo">
                    ${
                        receita
                            ? "Receita"
                            : "Despesa"
                    }
                </span>

                <strong class="transacao-valor ${
                    receita
                        ? "valor-receita"
                        : "valor-despesa"
                }">
                    ${
                        receita
                            ? "+"
                            : "-"
                    }${formatarMoeda(transacao.valor)}
                </strong>

            </div>

            ${
                podeAlterar
                    ? `
                        <div class="transacao-acoes">

                            <button
                                class="btn-acao btn-editar"
                                type="button"
                                title="Editar"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                class="btn-acao btn-excluir"
                                type="button"
                                title="Excluir"
                            >
                                <i class="fa-regular fa-trash-can"></i>
                            </button>

                        </div>
                    `
                    : ""
            }

        </div>
    `;

    if (podeAlterar) {
        const btnEditar =
            item.querySelector(
                ".btn-editar"
            );

        const btnExcluir =
            item.querySelector(
                ".btn-excluir"
            );

        btnEditar.addEventListener(
            "click",
            () => abrirEdicao(transacao)
        );

        btnExcluir.addEventListener(
            "click",
            () => abrirExclusao(transacao.id)
        );
    }

    return item;
}

function atualizarContador(total) {
    if (!contadorTransacoes) {
        return;
    }

    contadorTransacoes.textContent =
        total === 1
            ? "1 transação"
            : `${total} transações`;
}

function atualizarBotaoMostrarMais(lista) {
    if (!btnMostrarMais) {
        return;
    }

    if (
        lista.length <= 5 ||
        movimentacoesEstaoOcultas
    ) {
        btnMostrarMais.style.display =
            "none";

        return;
    }

    btnMostrarMais.style.display =
        "flex";

    const texto =
        btnMostrarMais.querySelector(
            "span"
        );

    if (mostrarTodas) {
        btnMostrarMais.classList.add(
            "expandido"
        );

        if (texto) {
            texto.textContent =
                "Mostrar menos";
        }

    } else {
        btnMostrarMais.classList.remove(
            "expandido"
        );

        if (texto) {
            texto.textContent =
                "Mostrar mais";
        }
    }
}

function alternarMostrarMais() {
    mostrarTodas = !mostrarTodas;

    renderizarTransacoes(
        transacoesFiltradasAtuais
    );

    if (!mostrarTodas) {
        document
            .querySelector(
                ".painel-transacoes"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
    }
}

function atualizarVisibilidadeMovimentacoes() {
    if (
        !areaMovimentacoes ||
        !movimentacoesOcultas ||
        !btnOcultarMovimentacoes
    ) {
        return;
    }

    const texto =
        btnOcultarMovimentacoes
            .querySelector("span");

    const icone =
        btnOcultarMovimentacoes
            .querySelector("i");

    if (movimentacoesEstaoOcultas) {
        areaMovimentacoes.classList.add(
            "oculta"
        );

        movimentacoesOcultas.classList.add(
            "ativo"
        );

        btnOcultarMovimentacoes.classList.add(
            "ativo"
        );

        btnOcultarMovimentacoes.title =
            "Mostrar movimentações";

        if (texto) {
            texto.textContent =
                "Mostrar";
        }

        if (icone) {
            icone.className =
                "fa-regular fa-eye-slash";
        }

    } else {
        areaMovimentacoes.classList.remove(
            "oculta"
        );

        movimentacoesOcultas.classList.remove(
            "ativo"
        );

        btnOcultarMovimentacoes.classList.remove(
            "ativo"
        );

        btnOcultarMovimentacoes.title =
            "Ocultar movimentações";

        if (texto) {
            texto.textContent =
                "Ocultar";
        }

        if (icone) {
            icone.className =
                "fa-regular fa-eye";
        }

        renderizarTransacoes(
            transacoesFiltradasAtuais
        );
    }
}

function alternarVisibilidadeMovimentacoes() {
    movimentacoesEstaoOcultas =
        !movimentacoesEstaoOcultas;

    localStorage.setItem(
        "movimentacoesOcultas",
        movimentacoesEstaoOcultas
    );

    atualizarVisibilidadeMovimentacoes();
}

function abrirNovaTransacao() {
    transacaoEditandoId = null;

    formTransacao.reset();

    tipoInput.value =
        "DESPESA";

    document
        .querySelectorAll(
            ".tipo-opcao"
        )
        .forEach(botao => {
            botao.classList.remove(
                "ativo"
            );
        });

    document
        .querySelector(
            '.tipo-opcao[data-tipo="DESPESA"]'
        )
        ?.classList.add("ativo");

    tituloModalTransacao.textContent =
        "Nova transação";

    textoBtnSalvar.textContent =
        "Salvar transação";

    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    dataInput.value =
        `${ano}-${mes}-${dia}`;

    modalTransacao.classList.add(
        "ativo"
    );
}

function abrirEdicao(transacao) {
    transacaoEditandoId =
        transacao.id;

    tituloModalTransacao.textContent =
        "Editar transação";

    textoBtnSalvar.textContent =
        "Salvar alterações";

    tipoInput.value =
        transacao.tipo || "DESPESA";

    valorInput.value =
        Number(
            transacao.valor || 0
        ).toLocaleString(
            "pt-BR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    dataInput.value =
        transacao.data
            ? String(transacao.data)
                .substring(0, 10)
            : "";

    destinatarioInput.value =
        transacao.destinatario || "";

    descricaoInput.value =
        transacao.descricao || "";

    categoriaInput.value =
        obterCategoria(transacao) ===
        "Sem categoria"
            ? ""
            : obterCategoria(transacao);

    document
        .querySelectorAll(
            ".tipo-opcao"
        )
        .forEach(botao => {
            botao.classList.toggle(
                "ativo",
                botao.dataset.tipo ===
                    tipoInput.value
            );
        });

    modalTransacao.classList.add(
        "ativo"
    );
}

function fecharModal() {
    modalTransacao.classList.remove(
        "ativo"
    );

    transacaoEditandoId = null;
}

function converterValor(valor) {
    const texto =
        String(valor || "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

    return Number(texto);
}

async function salvarTransacao(evento) {
    evento.preventDefault();

    const valor =
        converterValor(
            valorInput.value
        );

    if (
        !valor ||
        valor <= 0
    ) {
        mostrarMensagem(
            "Valor inválido",
            "Informe um valor maior que zero.",
            "erro"
        );

        return;
    }

    const dados = {
        tipo: tipoInput.value,
        valor,
        data: dataInput.value,
        destinatario:
            destinatarioInput.value.trim(),
        descricao:
            descricaoInput.value.trim(),
        categoria:
            categoriaInput.value.trim()
    };

    try {
        let response;

        if (transacaoEditandoId) {
            response = await fetch(
                `${API_URL}/transacoes/${transacaoEditandoId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        dados
                    )
                }
            );

        } else {
            response = await fetch(
                `${API_URL}/transacoes/usuario/${usuarioId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        dados
                    )
                }
            );
        }

        if (!response.ok) {
            const mensagem =
                await response.text();

            throw new Error(
                mensagem ||
                "Não foi possível salvar a transação."
            );
        }

        const editando =
            Boolean(
                transacaoEditandoId
            );

        fecharModal();

        await carregarTransacoes();

        mostrarMensagem(
            editando
                ? "Transação atualizada"
                : "Transação adicionada",
            editando
                ? "As alterações foram salvas."
                : "Sua nova movimentação foi registrada."
        );

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            "Erro",
            erro.message ||
            "Não foi possível salvar a transação.",
            "erro"
        );
    }
}

function abrirExclusao(id) {
    transacaoExcluindoId = id;

    modalExcluir.classList.add(
        "ativo"
    );
}

function fecharExclusao() {
    transacaoExcluindoId = null;

    modalExcluir.classList.remove(
        "ativo"
    );
}

async function confirmarExclusao() {
    if (!transacaoExcluindoId) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/transacoes/${transacaoExcluindoId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            const mensagem =
                await response.text();

            throw new Error(
                mensagem ||
                "Não foi possível excluir a transação."
            );
        }

        fecharExclusao();

        await carregarTransacoes();

        mostrarMensagem(
            "Transação excluída",
            "A movimentação foi removida."
        );

    } catch (erro) {
        console.error(erro);

        mostrarMensagem(
            "Erro",
            erro.message ||
            "Não foi possível excluir a transação.",
            "erro"
        );
    }
}

function selecionarTipo(evento) {
    const botao =
        evento.currentTarget;

    const tipo =
        botao.dataset.tipo;

    tipoInput.value = tipo;

    document
        .querySelectorAll(
            ".tipo-opcao"
        )
        .forEach(item => {
            item.classList.remove(
                "ativo"
            );
        });

    botao.classList.add(
        "ativo"
    );
}

function limparFiltros() {
    buscaTransacao.value = "";
    filtroTipo.value = "";
    filtroCategoria.value = "";

    aplicarFiltros();
}

function mostrarMensagem(
    titulo,
    mensagem,
    tipo = "sucesso"
) {
    document
        .querySelector(".toast")
        ?.remove();

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${tipo}`;

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${
                tipo === "erro"
                    ? "fa-circle-exclamation"
                    : "fa-circle-check"
            }"></i>
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

    document.body.appendChild(
        toast
    );

    requestAnimationFrame(() => {
        toast.classList.add(
            "mostrar"
        );
    });

    toast
        .querySelector(
            ".toast-fechar"
        )
        .addEventListener(
            "click",
            () => toast.remove()
        );

    setTimeout(() => {
        toast.classList.remove(
            "mostrar"
        );

        setTimeout(
            () => toast.remove(),
            300
        );
    }, 4000);
}

valorInput.addEventListener(
    "input",
    () => {
        let valor =
            valorInput.value
                .replace(/\D/g, "");

        if (!valor) {
            valorInput.value = "";
            return;
        }

        valor =
            Number(valor) / 100;

        valorInput.value =
            valor.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
    }
);

document
    .querySelectorAll(
        ".tipo-opcao"
    )
    .forEach(botao => {
        botao.addEventListener(
            "click",
            selecionarTipo
        );
    });

btnNovaTransacao.addEventListener(
    "click",
    abrirNovaTransacao
);

fecharModalTransacao.addEventListener(
    "click",
    fecharModal
);

btnCancelarTransacao.addEventListener(
    "click",
    fecharModal
);

formTransacao.addEventListener(
    "submit",
    salvarTransacao
);

btnCancelarExclusao.addEventListener(
    "click",
    fecharExclusao
);

btnConfirmarExclusao.addEventListener(
    "click",
    confirmarExclusao
);

buscaTransacao.addEventListener(
    "input",
    aplicarFiltros
);

filtroTipo.addEventListener(
    "change",
    aplicarFiltros
);

filtroCategoria.addEventListener(
    "change",
    aplicarFiltros
);

btnLimparFiltros.addEventListener(
    "click",
    limparFiltros
);

btnMostrarMais.addEventListener(
    "click",
    alternarMostrarMais
);

btnOcultarMovimentacoes.addEventListener(
    "click",
    alternarVisibilidadeMovimentacoes
);

btnMostrarMovimentacoes.addEventListener(
    "click",
    alternarVisibilidadeMovimentacoes
);

modalTransacao.addEventListener(
    "click",
    evento => {
        if (
            evento.target ===
            modalTransacao
        ) {
            fecharModal();
        }
    }
);

modalExcluir.addEventListener(
    "click",
    evento => {
        if (
            evento.target ===
            modalExcluir
        ) {
            fecharExclusao();
        }
    }
);

document.addEventListener(
    "keydown",
    evento => {
        if (evento.key === "Escape") {
            fecharModal();
            fecharExclusao();
        }
    }
);

const btnSair =
    document.getElementById(
        "btnSair"
    );

if (btnSair) {
    btnSair.addEventListener(
        "click",
        () => {
            localStorage.removeItem(
                "usuarioId"
            );

            localStorage.removeItem(
                "usuarioNome"
            );

            localStorage.removeItem(
                "usuarioUsername"
            );

            window.location.replace(
                "index.html"
            );
        }
    );
}

atualizarVisibilidadeMovimentacoes();
carregarTransacoes();