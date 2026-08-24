const nomeUsuario = localStorage.getItem("usuarioNome");
const usuarioId = localStorage.getItem("usuarioId");
const usuarioUsername = localStorage.getItem("usuarioUsername");

const API_URL = "https://controlamigo-2.onrender.com";

let saldoBancarioAtual = null;
let transacoesCarregadas = [];
let mostrarTodasTransacoes = false;
let visualizacaoLimpa = false;

if (!usuarioId) {
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

if (nomeUsuario) {
    const nomeCurto = obterNomeCurto(nomeUsuario);

    const tituloUsuario =
        document.getElementById("tituloUsuario");

    if (tituloUsuario) {
        tituloUsuario.textContent =
            "Olá, " + nomeCurto + "!";
    }
}

function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function carregarTransacoes() {
    fetch(
        `${API_URL}/transacoes/usuario/${usuarioId}`
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    "Erro ao buscar transações"
                );
            }

            return response.json();
        })
        .then(transacoes => {
            transacoesCarregadas =
                Array.isArray(transacoes)
                    ? transacoes
                    : [];

            atualizarResumo(
                transacoesCarregadas
            );

            mostrarTransacoes();
        })
        .catch(error => {
            console.error(
                "Erro ao carregar transações:",
                error
            );
        });
}

function atualizarResumo(transacoes) {
    let totalReceitas = 0;
    let totalDespesas = 0;

    let receitasManuais = 0;
    let despesasManuais = 0;

    transacoes.forEach(transacao => {
        const valor =
            Number(transacao.valor);

        if (transacao.tipo === "RECEITA") {
            totalReceitas += valor;

            if (
                transacao.origem ===
                "MANUAL"
            ) {
                receitasManuais += valor;
            }
        }

        if (transacao.tipo === "DESPESA") {
            totalDespesas += valor;

            if (
                transacao.origem ===
                "MANUAL"
            ) {
                despesasManuais += valor;
            }
        }
    });

    const saldoCalculado =
        totalReceitas -
        totalDespesas;

    let saldoAtual;

    if (saldoBancarioAtual !== null) {
        saldoAtual =
            saldoBancarioAtual +
            receitasManuais -
            despesasManuais;
    } else {
        saldoAtual =
            saldoCalculado;
    }

    const receitas =
        document.getElementById(
            "receitas"
        );

    const despesas =
        document.getElementById(
            "despesas"
        );

    const saldo =
        document.getElementById(
            "saldo"
        );

    const totalRecebido =
        document.getElementById(
            "totalRecebido"
        );

    const totalGasto =
        document.getElementById(
            "totalGasto"
        );

    const saldoDisponivel =
        document.getElementById(
            "saldoDisponivel"
        );

    if (receitas) {
        receitas.textContent =
            formatarMoeda(
                totalReceitas
            );
    }

    if (despesas) {
        despesas.textContent =
            formatarMoeda(
                totalDespesas
            );
    }

    if (saldo) {
        saldo.textContent =
            formatarMoeda(
                saldoAtual
            );
    }

    if (totalRecebido) {
        totalRecebido.textContent =
            formatarMoeda(
                totalReceitas
            );
    }

    if (totalGasto) {
        totalGasto.textContent =
            formatarMoeda(
                totalDespesas
            );
    }

    if (saldoDisponivel) {
        saldoDisponivel.textContent =
            formatarMoeda(
                saldoAtual
            );
    }
}

async function carregarSaldoBancario() {
    try {
        const responseContas =
            await fetch(
                `${API_URL}/contas-bancarias/usuario/${usuarioId}`
            );

        if (!responseContas.ok) {
            throw new Error(
                "Não foi possível verificar as contas bancárias."
            );
        }

        const contas =
            await responseContas.json();

        if (
            !Array.isArray(contas) ||
            contas.length === 0
        ) {
            saldoBancarioAtual =
                null;

            carregarTransacoes();

            return;
        }

        const responseSaldo =
            await fetch(
                `${API_URL}/contas-bancarias/usuario/${usuarioId}/saldo`
            );

        if (!responseSaldo.ok) {
            throw new Error(
                "Não foi possível carregar o saldo bancário."
            );
        }

        const dadosSaldo =
            await responseSaldo.json();

        saldoBancarioAtual =
            Number(
                dadosSaldo.saldo
            );

        carregarTransacoes();

    } catch (error) {
        console.error(
            "Erro ao carregar saldo bancário:",
            error
        );

        saldoBancarioAtual =
            null;

        carregarTransacoes();
    }
}

const btnMostrarTodas =
    document.getElementById(
        "btnMostrarTodas"
    );

const btnLimparVisualizacao =
    document.getElementById(
        "btnLimparVisualizacao"
    );

function atualizarBotoesVisualizacao() {
    if (btnMostrarTodas) {
        if (visualizacaoLimpa) {
            btnMostrarTodas.style.display =
                "none";
        } else {
            btnMostrarTodas.style.display =
                "flex";

            if (mostrarTodasTransacoes) {
                btnMostrarTodas.innerHTML = `
                    <i class="fa-solid fa-list"></i>
                    Ver menos
                `;
            } else {
                btnMostrarTodas.innerHTML = `
                    <i class="fa-solid fa-list"></i>
                    Ver todas
                `;
            }
        }
    }

    if (btnLimparVisualizacao) {
        if (visualizacaoLimpa) {
            btnLimparVisualizacao.innerHTML = `
                <i class="fa-solid fa-eye"></i>
                Mostrar transações
            `;
        } else {
            btnLimparVisualizacao.innerHTML = `
                <i class="fa-solid fa-broom"></i>
                Limpar visualização
            `;
        }
    }
}

if (btnMostrarTodas) {
    btnMostrarTodas.addEventListener(
        "click",
        () => {
            mostrarTodasTransacoes =
                !mostrarTodasTransacoes;

            mostrarTransacoes();
        }
    );
}

if (btnLimparVisualizacao) {
    btnLimparVisualizacao.addEventListener(
        "click",
        () => {
            visualizacaoLimpa =
                !visualizacaoLimpa;

            mostrarTransacoes();
        }
    );
}

function mostrarTransacoes() {
    const lista =
        document.getElementById(
            "listaTransacoes"
        );

    if (!lista) {
        return;
    }

    atualizarBotoesVisualizacao();

    lista.innerHTML = "";

    if (visualizacaoLimpa) {
        lista.innerHTML = `
            <div class="sem-transacoes">

                <i class="fa-solid fa-eye-slash"></i>

                <h4>
                    Visualização limpa
                </h4>

                <p>
                    Suas transações continuam salvas.
                    Clique em "Mostrar transações"
                    para visualizá-las novamente.
                </p>

            </div>
        `;

        return;
    }

    if (
        transacoesCarregadas.length ===
        0
    ) {
        lista.innerHTML = `
            <div class="sem-transacoes">

                <i class="fa-solid fa-receipt"></i>

                <h4>
                    Nenhuma transação encontrada
                </h4>

                <p>
                    Suas movimentações aparecerão aqui.
                </p>

            </div>
        `;

        return;
    }

    const transacoesOrdenadas =
        [...transacoesCarregadas]
            .sort(
                (a, b) => {
                    const dataA =
                        a.data
                            ? new Date(a.data)
                            : new Date(0);

                    const dataB =
                        b.data
                            ? new Date(b.data)
                            : new Date(0);

                    return (
                        dataB -
                        dataA
                    );
                }
            );

    const transacoesExibidas =
        mostrarTodasTransacoes
            ? transacoesOrdenadas
            : transacoesOrdenadas.slice(
                0,
                5
            );

    transacoesExibidas.forEach(
        transacao => {
            const item =
                document.createElement(
                    "div"
                );

            item.classList.add(
                "transacao-item"
            );

            const sinal =
                transacao.tipo ===
                "RECEITA"
                    ? "+"
                    : "-";

            const botoesAcao =
                transacao.origem ===
                "MANUAL"
                    ? `
                        <button
                            class="btn-editar"
                            title="Editar transação"
                            type="button"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            class="btn-excluir"
                            title="Excluir transação"
                            type="button"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `
                    : "";

            item.innerHTML = `
                <div class="transacao-info">

                    <div class="transacao-icon">

                        <i class="fa-solid ${
                            transacao.tipo ===
                            "RECEITA"
                                ? "fa-arrow-up"
                                : "fa-arrow-down"
                        }"></i>

                    </div>

                    <div>

                        <h4>
                            ${
                                transacao.destinatario ||
                                "Transação"
                            }
                        </h4>

                        <p>
                            ${
                                transacao.descricao ||
                                "Sem descrição"
                            }
                        </p>

                        <small>
                            ${
                                transacao.categoria ||
                                "Sem categoria"
                            }
                            •
                            ${
                                transacao.data ||
                                "Sem data"
                            }
                        </small>

                    </div>

                </div>

                <div class="transacao-direita">

                    <div class="transacao-valor ${
                        transacao.tipo ===
                        "RECEITA"
                            ? "valor-receita"
                            : "valor-despesa"
                    }">

                        ${sinal}${formatarMoeda(
                            transacao.valor
                        )}

                    </div>

                    ${botoesAcao}

                </div>
            `;

            lista.appendChild(
                item
            );

            const btnEditar =
                item.querySelector(
                    ".btn-editar"
                );

            if (btnEditar) {
                btnEditar.addEventListener(
                    "click",
                    () => {
                        abrirEdicao(
                            transacao
                        );
                    }
                );
            }

            const btnExcluir =
                item.querySelector(
                    ".btn-excluir"
                );

            if (btnExcluir) {
                btnExcluir.addEventListener(
                    "click",
                    () => {
                        abrirModalExclusao(
                            transacao
                        );
                    }
                );
            }
        }
    );
}

const modalExcluir =
    document.getElementById(
        "modalExcluir"
    );

const fecharModalExcluir =
    document.getElementById(
        "fecharModalExcluir"
    );

const cancelarExclusao =
    document.getElementById(
        "cancelarExclusao"
    );

const confirmarExclusao =
    document.getElementById(
        "confirmarExclusao"
    );

const nomeTransacaoExcluir =
    document.getElementById(
        "nomeTransacaoExcluir"
    );

const descricaoTransacaoExcluir =
    document.getElementById(
        "descricaoTransacaoExcluir"
    );

const valorTransacaoExcluir =
    document.getElementById(
        "valorTransacaoExcluir"
    );

let transacaoParaExcluir = null;

function abrirModalExclusao(
    transacao
) {
    if (
        transacao.origem !==
        "MANUAL"
    ) {
        return;
    }

    transacaoParaExcluir =
        transacao;

    if (nomeTransacaoExcluir) {
        nomeTransacaoExcluir.textContent =
            transacao.destinatario;
    }

    if (
        descricaoTransacaoExcluir
    ) {
        descricaoTransacaoExcluir.textContent =
            transacao.descricao ||
            "Sem descrição";
    }

    if (valorTransacaoExcluir) {
        const sinal =
            transacao.tipo ===
            "RECEITA"
                ? "+"
                : "-";

        valorTransacaoExcluir.textContent =
            sinal +
            formatarMoeda(
                transacao.valor
            );

        valorTransacaoExcluir
            .classList
            .remove(
                "valor-receita",
                "valor-despesa"
            );

        valorTransacaoExcluir
            .classList
            .add(
                transacao.tipo ===
                "RECEITA"
                    ? "valor-receita"
                    : "valor-despesa"
            );
    }

    if (modalExcluir) {
        modalExcluir.classList.add(
            "ativo"
        );
    }
}

function fecharModalExclusao() {
    if (modalExcluir) {
        modalExcluir.classList.remove(
            "ativo"
        );
    }

    transacaoParaExcluir = null;
}

if (fecharModalExcluir) {
    fecharModalExcluir.addEventListener(
        "click",
        fecharModalExclusao
    );
}

if (cancelarExclusao) {
    cancelarExclusao.addEventListener(
        "click",
        fecharModalExclusao
    );
}

if (modalExcluir) {
    modalExcluir.addEventListener(
        "click",
        event => {
            if (
                event.target ===
                modalExcluir
            ) {
                fecharModalExclusao();
            }
        }
    );
}

if (confirmarExclusao) {
    confirmarExclusao.addEventListener(
        "click",
        () => {
            if (
                !transacaoParaExcluir
            ) {
                return;
            }

            const id =
                transacaoParaExcluir.id;

            confirmarExclusao.disabled =
                true;

            confirmarExclusao.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Excluindo...
            `;

            excluirTransacao(
                id
            );
        }
    );
}

function excluirTransacao(id) {
    fetch(
        `${API_URL}/transacoes/${id}`,
        {
            method: "DELETE"
        }
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    "Erro ao excluir transação"
                );
            }

            return response.text();
        })
        .then(() => {
            fecharModalExclusao();

            carregarTransacoes();

            mostrarMensagemSincronizacao(
                "Transação excluída!",
                "A movimentação foi removida com sucesso.",
                "sucesso"
            );
        })
        .catch(error => {
            console.error(
                "Erro ao excluir:",
                error
            );

            mostrarMensagemSincronizacao(
                "Erro ao excluir",
                "Não foi possível excluir a transação.",
                "erro"
            );
        })
                .finally(() => {
            if (confirmarExclusao) {
                confirmarExclusao.disabled =
                    false;

                confirmarExclusao.innerHTML = `
                    <i class="fa-solid fa-trash-can"></i>
                    Sim, excluir
                `;
            }
        });
}

const modal =
    document.getElementById(
        "modalTransacao"
    );

const btnNovaTransacao =
    document.querySelector(
        ".btn-transacao"
    );

const fecharModal =
    document.getElementById(
        "fecharModal"
    );

const cancelarTransacao =
    document.getElementById(
        "cancelarTransacao"
    );

const salvarTransacao =
    document.getElementById(
        "salvarTransacao"
    );

const botoesTipo =
    document.querySelectorAll(
        ".tipo-btn"
    );

const campoValor =
    document.getElementById(
        "transacaoValor"
    );

let tipoSelecionado =
    "DESPESA";

let transacaoEditandoId =
    null;

if (btnNovaTransacao) {
    btnNovaTransacao.addEventListener(
        "click",
        () => {
            transacaoEditandoId =
                null;

            limparFormulario();

            const tituloModal =
                document.querySelector(
                    ".modal-topo h2"
                );

            if (tituloModal) {
                tituloModal.textContent =
                    "Nova transação";
            }

            if (salvarTransacao) {
                salvarTransacao.textContent =
                    "Salvar transação";
            }

            if (modal) {
                modal.classList.add(
                    "ativo"
                );
            }

            const campoData =
                document.getElementById(
                    "transacaoData"
                );

            if (campoData) {
                campoData.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];
            }
        }
    );
}

if (fecharModal) {
    fecharModal.addEventListener(
        "click",
        fecharModalTransacao
    );
}

if (cancelarTransacao) {
    cancelarTransacao.addEventListener(
        "click",
        fecharModalTransacao
    );
}

botoesTipo.forEach(botao => {
    botao.addEventListener(
        "click",
        () => {
            botoesTipo.forEach(btn => {
                btn.classList.remove(
                    "ativo"
                );
            });

            botao.classList.add(
                "ativo"
            );

            tipoSelecionado =
                botao.dataset.tipo;
        }
    );
});

if (campoValor) {
    campoValor.addEventListener(
        "input",
        () => {
            let numeros =
                campoValor.value
                    .replace(
                        /\D/g,
                        ""
                    );

            if (
                numeros === ""
            ) {
                campoValor.value = "";
                return;
            }

            const valor =
                Number(
                    numeros
                ) / 100;

            campoValor.value =
                valor.toLocaleString(
                    "pt-BR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );
        }
    );
}

function abrirEdicao(transacao) {
    if (
        transacao.origem !==
        "MANUAL"
    ) {
        return;
    }

    transacaoEditandoId =
        transacao.id;

    const tituloModal =
        document.querySelector(
            ".modal-topo h2"
        );

    if (tituloModal) {
        tituloModal.textContent =
            "Editar transação";
    }

    if (salvarTransacao) {
        salvarTransacao.textContent =
            "Salvar alterações";
    }

    document
        .getElementById(
            "transacaoValor"
        )
        .value =
            Number(
                transacao.valor
            ).toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    document
        .getElementById(
            "transacaoDestinatario"
        )
        .value =
            transacao.destinatario;

    document
        .getElementById(
            "transacaoDescricao"
        )
        .value =
            transacao.descricao || "";

    document
        .getElementById(
            "transacaoCategoria"
        )
        .value =
            transacao.categoria || "";

    document
        .getElementById(
            "transacaoData"
        )
        .value =
            transacao.data;

    tipoSelecionado =
        transacao.tipo;

    botoesTipo.forEach(botao => {
        botao.classList.remove(
            "ativo"
        );

        if (
            botao.dataset.tipo ===
            transacao.tipo
        ) {
            botao.classList.add(
                "ativo"
            );
        }
    });

    if (modal) {
        modal.classList.add(
            "ativo"
        );
    }
}

if (salvarTransacao) {
    salvarTransacao.addEventListener(
        "click",
        () => {
            const valorTexto =
                document
                    .getElementById(
                        "transacaoValor"
                    )
                    .value;

            const valor =
                Number(
                    valorTexto
                        .replace(
                            /\./g,
                            ""
                        )
                        .replace(
                            ",",
                            "."
                        )
                );

            const destinatario =
                document
                    .getElementById(
                        "transacaoDestinatario"
                    )
                    .value
                    .trim();

            const descricao =
                document
                    .getElementById(
                        "transacaoDescricao"
                    )
                    .value
                    .trim();

            const categoria =
                document
                    .getElementById(
                        "transacaoCategoria"
                    )
                    .value;

            const data =
                document
                    .getElementById(
                        "transacaoData"
                    )
                    .value;

            if (
                !valor ||
                valor <= 0
            ) {
                mostrarMensagemSincronizacao(
                    "Valor inválido",
                    "Informe um valor maior que zero.",
                    "erro"
                );

                return;
            }

            if (
                destinatario === ""
            ) {
                mostrarMensagemSincronizacao(
                    "Destinatário obrigatório",
                    "Informe o destinatário ou origem.",
                    "erro"
                );

                return;
            }

            if (
                data === ""
            ) {
                mostrarMensagemSincronizacao(
                    "Data obrigatória",
                    "Informe a data da transação.",
                    "erro"
                );

                return;
            }

            const editando =
                transacaoEditandoId !==
                null;

            const transacao = {
                valor,
                destinatario,
                descricao,
                categoria,
                data,
                tipo:
                    tipoSelecionado
            };

            const url =
                editando
                    ? `${API_URL}/transacoes/${transacaoEditandoId}`
                    : `${API_URL}/transacoes/usuario/${usuarioId}`;

            const metodo =
                editando
                    ? "PUT"
                    : "POST";

            salvarTransacao.disabled =
                true;

            salvarTransacao.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Salvando...
            `;

            fetch(
                url,
                {
                    method:
                        metodo,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            transacao
                        )
                }
            )
                .then(response => {
                    if (!response.ok) {
                        throw new Error(
                            "Erro ao salvar transação"
                        );
                    }

                    return response.json();
                })
                .then(() => {
                    fecharModalTransacao();

                    carregarTransacoes();

                    mostrarMensagemSincronizacao(
                        editando
                            ? "Transação atualizada!"
                            : "Transação adicionada!",
                        editando
                            ? "As alterações foram salvas com sucesso."
                            : "A movimentação foi registrada com sucesso.",
                        "sucesso"
                    );
                })
                .catch(error => {
                    console.error(
                        error
                    );

                    mostrarMensagemSincronizacao(
                        "Erro",
                        "Não foi possível salvar a transação.",
                        "erro"
                    );
                })
                .finally(() => {
                    salvarTransacao.disabled =
                        false;

                    salvarTransacao.textContent =
                        editando
                            ? "Salvar alterações"
                            : "Salvar transação";
                });
        }
    );
}

function fecharModalTransacao() {
    if (!modal) {
        return;
    }

    modal.classList.remove(
        "ativo"
    );

    limparFormulario();

    transacaoEditandoId =
        null;

    const tituloModal =
        document.querySelector(
            ".modal-topo h2"
        );

    if (tituloModal) {
        tituloModal.textContent =
            "Nova transação";
    }

    if (salvarTransacao) {
        salvarTransacao.textContent =
            "Salvar transação";
    }
}

function limparFormulario() {
    const valor =
        document.getElementById(
            "transacaoValor"
        );

    const destinatario =
        document.getElementById(
            "transacaoDestinatario"
        );

    const descricao =
        document.getElementById(
            "transacaoDescricao"
        );

    const categoria =
        document.getElementById(
            "transacaoCategoria"
        );

    const data =
        document.getElementById(
            "transacaoData"
        );

    if (valor) {
        valor.value = "";
    }

    if (destinatario) {
        destinatario.value = "";
    }

    if (descricao) {
        descricao.value = "";
    }

    if (categoria) {
        categoria.value = "";
    }

    if (data) {
        data.value = "";
    }

    tipoSelecionado =
        "DESPESA";

    botoesTipo.forEach(botao => {
        botao.classList.remove(
            "ativo"
        );

        if (
            botao.dataset.tipo ===
            "DESPESA"
        ) {
            botao.classList.add(
                "ativo"
            );
        }
    });
}
const btnPerfil =
    document.getElementById(
        "btnPerfil"
    );

const modalPerfil =
    document.getElementById(
        "modalPerfil"
    );

const fecharModalPerfil =
    document.getElementById(
        "fecharModalPerfil"
    );

const perfilNomeExibicao =
    document.getElementById(
        "perfilNomeExibicao"
    );

const perfilUsernameExibicao =
    document.getElementById(
        "perfilUsernameExibicao"
    );

const perfilNome =
    document.getElementById(
        "perfilNome"
    );

const perfilUsername =
    document.getElementById(
        "perfilUsername"
    );

const perfilEmail =
    document.getElementById(
        "perfilEmail"
    );

const perfilTelefone =
    document.getElementById(
        "perfilTelefone"
    );

const statusEmail =
    document.getElementById(
        "statusEmail"
    );

const statusTelefone =
    document.getElementById(
        "statusTelefone"
    );

const btnEditarPerfil =
    document.getElementById(
        "btnEditarPerfil"
    );

function atualizarStatusVerificacao(
    elemento,
    verificado
) {
    if (!elemento) {
        return;
    }

    if (verificado) {
        elemento.textContent =
            "Verificado";

        elemento.classList.add(
            "verificado"
        );

    } else {
        elemento.textContent =
            "Não verificado";

        elemento.classList.remove(
            "verificado"
        );
    }
}

function preencherPerfil(usuario) {
    if (perfilNomeExibicao) {
        perfilNomeExibicao.textContent =
            usuario.nome ||
            "Usuário";
    }

    if (perfilUsernameExibicao) {
        perfilUsernameExibicao.textContent =
            usuario.username
                ? "@" +
                  usuario.username
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

        const nomeCurto =
            obterNomeCurto(
                usuario.nome
            );

        const tituloUsuario =
            document.getElementById(
                "tituloUsuario"
            );

        if (tituloUsuario) {
            tituloUsuario.textContent =
                "Olá, " +
                nomeCurto +
                "!";
        }
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
        const response =
            await fetch(
                `${API_URL}/usuarios/${usuarioId}`
            );

        if (!response.ok) {
            const mensagemErro =
                await response.text();

            throw new Error(
                mensagemErro ||
                "Não foi possível carregar o perfil."
            );
        }

        const usuario =
            await response.json();

        preencherPerfil(
            usuario
        );

    } catch (error) {
        console.error(
            "Erro ao carregar perfil:",
            error
        );

        mostrarMensagemSincronizacao(
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

    modalPerfil.classList.add(
        "ativo"
    );

    carregarPerfil();
}

function fecharPerfil() {
    if (!modalPerfil) {
        return;
    }

    modalPerfil.classList.remove(
        "ativo"
    );
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
            if (
                event.target ===
                modalPerfil
            ) {
                fecharPerfil();
            }
        }
    );
}

if (btnEditarPerfil) {
    btnEditarPerfil.addEventListener(
        "click",
        () => {
            mostrarMensagemSincronizacao(
                "Em breve",
                "A edição do perfil será implementada na próxima etapa.",
                "sucesso"
            );
        }
    );
}

function mostrarMensagemSincronizacao(
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
        document.createElement(
            "div"
        );

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

            <strong>
                ${titulo}
            </strong>

            <span>
                ${mensagem}
            </span>

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

    requestAnimationFrame(
        () => {
            toast.classList.add(
                "mostrar"
            );
        }
    );

    const fechar =
        toast.querySelector(
            ".toast-fechar"
        );

    fechar.addEventListener(
        "click",
        () => {
            removerToast(
                toast
            );
        }
    );

    setTimeout(
        () => {
            removerToast(
                toast
            );
        },
        4500
    );
}

function removerToast(toast) {
    if (!toast) {
        return;
    }

    toast.classList.remove(
        "mostrar"
    );

    setTimeout(
        () => {
            if (
                toast.parentNode
            ) {
                toast.remove();
            }
        },
        300
    );
}

const btnConectarBanco =
    document.getElementById(
        "btnConectarBanco"
    );

async function conectarBanco() {
    if (!btnConectarBanco) {
        return;
    }

    const conteudoOriginal =
        btnConectarBanco.innerHTML;

    btnConectarBanco.disabled =
        true;

    btnConectarBanco.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Abrindo...
    `;

    try {
        const response =
            await fetch(
                `${API_URL}/pluggy/connect-token/${usuarioId}`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Não foi possível gerar o token de conexão."
            );
        }

        const dados =
            await response.json();

        if (!dados.accessToken) {
            throw new Error(
                "Connect Token não recebido."
            );
        }

        if (
            typeof PluggyConnect ===
            "undefined"
        ) {
            throw new Error(
                "Pluggy Connect não foi carregado."
            );
        }

        const pluggyConnect =
            new PluggyConnect({
                connectToken:
                    dados.accessToken,

                includeSandbox:
                    true,

                onSuccess:
                    async itemData => {
                        console.log(
                            "Banco conectado:",
                            itemData
                        );

                        const itemId =
                            itemData?.item?.id ||
                            itemData?.id;

                        if (itemId) {
                            try {
                                const responseSincronizacao =
                                    await fetch(
                                        `${API_URL}/pluggy/contas/sincronizar/${usuarioId}/${itemId}`,
                                        {
                                            method: "POST"
                                        }
                                    );

                                if (
                                    !responseSincronizacao.ok
                                ) {
                                    throw new Error(
                                        "Erro ao salvar as contas conectadas."
                                    );
                                }

                                await carregarSaldoBancario();

                                mostrarMensagemSincronizacao(
                                    "Banco conectado!",
                                    "Sua conta foi conectada e salva com sucesso.",
                                    "sucesso"
                                );

                            } catch (error) {
                                console.error(
                                    "Erro ao salvar conexão:",
                                    error
                                );

                                mostrarMensagemSincronizacao(
                                    "Banco conectado",
                                    "A conexão foi criada, mas houve um erro ao salvar os dados da conta.",
                                    "erro"
                                );
                            }

                        } else {
                            mostrarMensagemSincronizacao(
                                "Banco conectado!",
                                "A instituição foi conectada com sucesso.",
                                "sucesso"
                            );
                        }
                    },

                onError:
                    error => {
                        console.error(
                            "Erro no Pluggy Connect:",
                            error
                        );

                        mostrarMensagemSincronizacao(
                            "Erro na conexão",
                            "Não foi possível conectar a instituição.",
                            "erro"
                        );
                    },

                onClose:
                    () => {
                        btnConectarBanco.disabled =
                            false;

                        btnConectarBanco.innerHTML =
                            conteudoOriginal;
                    }
            });

        pluggyConnect.init();

    } catch (error) {
        console.error(
            "Erro ao conectar banco:",
            error
        );

        mostrarMensagemSincronizacao(
            "Erro ao conectar banco",
            "Não foi possível iniciar a conexão bancária.",
            "erro"
        );

        btnConectarBanco.disabled =
            false;

        btnConectarBanco.innerHTML =
            conteudoOriginal;
    }
}

if (btnConectarBanco) {
    btnConectarBanco.addEventListener(
        "click",
        conectarBanco
    );
}

const btnSincronizarBanco =
    document.getElementById(
        "btnSincronizarBanco"
    );

async function sincronizarBanco() {
    if (!btnSincronizarBanco) {
        return;
    }

    const conteudoOriginal =
        btnSincronizarBanco.innerHTML;

    btnSincronizarBanco.disabled =
        true;

    btnSincronizarBanco.innerHTML = `
        <i class="fa-solid fa-rotate fa-spin"></i>
        Sincronizando...
    `;

    try {
        const response =
            await fetch(
                `${API_URL}/pluggy/sincronizar/usuario/${usuarioId}`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Erro ao sincronizar banco."
            );
        }

        const dados =
            await response.json();

        await carregarSaldoBancario();

        mostrarMensagemSincronizacao(
            "Banco sincronizado!",
            `Novas transações: ${dados.transacoesImportadas ?? 0} • Já existentes: ${dados.transacoesIgnoradas ?? 0}`,
            "sucesso"
        );

    } catch (error) {
        console.error(
            "Erro ao sincronizar banco:",
            error
        );

        mostrarMensagemSincronizacao(
            "Erro na sincronização",
            "Não foi possível atualizar os dados bancários.",
            "erro"
        );

    } finally {
        btnSincronizarBanco.disabled =
            false;

        btnSincronizarBanco.innerHTML =
            conteudoOriginal;
    }
}

if (btnSincronizarBanco) {
    btnSincronizarBanco.addEventListener(
        "click",
        sincronizarBanco
    );
}

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

    const relatorioMes =
        document.getElementById(
            "relatorioMes"
        );

    const relatorioAno =
        document.getElementById(
            "relatorioAno"
        );

    const btnGerarRelatorio =
        document.getElementById(
            "btnGerarRelatorio"
        );

    function carregarOpcoesRelatorio() {
        if (
            !relatorioMes ||
            !relatorioAno
        ) {
            return;
        }

        const hoje =
            new Date();

        const mesAtual =
            hoje.getMonth() + 1;

        const anoAtual =
            hoje.getFullYear();

        relatorioMes.value =
            String(mesAtual);

        relatorioAno.innerHTML = "";

        for (
            let ano = anoAtual;
            ano >= anoAtual - 10;
            ano--
        ) {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(ano);

            option.textContent =
                String(ano);

            relatorioAno.appendChild(
                option
            );
        }

        relatorioAno.value =
            String(anoAtual);
    }

    async function buscarTransacoesRelatorio(
        mes,
        ano
    ) {
        const response =
            await fetch(
                `${API_URL}/transacoes/usuario/${usuarioId}/periodo?mes=${mes}&ano=${ano}`
            );

        if (!response.ok) {
            throw new Error(
                "Não foi possível buscar as transações do período."
            );
        }

        return await response.json();
    }

    function calcularResumoRelatorio(
        transacoes
    ) {
        let receitas = 0;
        let despesas = 0;

        transacoes.forEach(
            transacao => {
                const valor =
                    Number(
                        transacao.valor || 0
                    );

                if (
                    transacao.tipo ===
                    "RECEITA"
                ) {
                    receitas += valor;
                }

                if (
                    transacao.tipo ===
                    "DESPESA"
                ) {
                    despesas += valor;
                }
            }
        );

        return {
            receitas,
            despesas,
            saldo:
                receitas - despesas
        };
    }

    async function gerarRelatorio() {
        if (
            !relatorioMes ||
            !relatorioAno ||
            !btnGerarRelatorio
        ) {
            return;
        }

        const mes =
            Number(relatorioMes.value);

        const ano =
            Number(relatorioAno.value);

        const conteudoOriginal =
            btnGerarRelatorio.innerHTML;

        btnGerarRelatorio.disabled =
            true;

        btnGerarRelatorio.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Gerando PDF...
        `;

        try {
            const response =
                await fetch(
                    `${API_URL}/relatorios/usuario/${usuarioId}?mes=${mes}&ano=${ano}`
                );

            if (!response.ok) {
                throw new Error(
                    "Não foi possível gerar o relatório."
                );
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                `relatorio_controlamigo_${String(mes).padStart(2, "0")}_${ano}.pdf`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

            mostrarMensagemSincronizacao(
                "Relatório gerado!",
                "O PDF do período foi baixado com sucesso.",
                "sucesso"
            );

        } catch (error) {
            console.error(
                "Erro ao gerar relatório:",
                error
            );

            mostrarMensagemSincronizacao(
                "Erro no relatório",
                "Não foi possível gerar o PDF.",
                "erro"
            );

        } finally {
            btnGerarRelatorio.disabled =
                false;

            btnGerarRelatorio.innerHTML =
                conteudoOriginal;
        }
    }

    if (btnGerarRelatorio) {
        btnGerarRelatorio.addEventListener(
            "click",
            gerarRelatorio
        );
    }

    carregarOpcoesRelatorio();

carregarSaldoBancario();