const API_URL =
    "https://controlamigo-2.onrender.com";

const usuarioId =
    localStorage.getItem(
        "usuarioId"
    );

const token =
    localStorage.getItem(
        "token"
    );

if (!usuarioId || !token) {
    localStorage.removeItem(
        "usuarioId"
    );

    localStorage.removeItem(
        "usuarioNome"
    );

    localStorage.removeItem(
        "usuarioUsername"
    );

    localStorage.removeItem(
        "token"
    );

    window.location.href =
        "index.html";
}

let movimentacoesRelatorio = [];
let movimentacoesExpandidas = false;
let graficoCategorias = null;

const mesRelatorio =
    document.getElementById(
        "mesRelatorio"
    );

const anoRelatorio =
    document.getElementById(
        "anoRelatorio"
    );

const btnAplicarPeriodo =
    document.getElementById(
        "btnAplicarPeriodo"
    );

const textoPeriodoSelecionado =
    document.getElementById(
        "textoPeriodoSelecionado"
    );

const relatorioReceitas =
    document.getElementById(
        "relatorioReceitas"
    );

const relatorioDespesas =
    document.getElementById(
        "relatorioDespesas"
    );

const relatorioResultado =
    document.getElementById(
        "relatorioResultado"
    );

const relatorioQuantidade =
    document.getElementById(
        "relatorioQuantidade"
    );

const maiorReceita =
    document.getElementById(
        "maiorReceita"
    );

const maiorDespesa =
    document.getElementById(
        "maiorDespesa"
    );

const categoriaMaiorGasto =
    document.getElementById(
        "categoriaMaiorGasto"
    );

const mediaMovimentacoes =
    document.getElementById(
        "mediaMovimentacoes"
    );

const listaMovimentacoesRelatorio =
    document.getElementById(
        "listaMovimentacoesRelatorio"
    );

const contadorMovimentacoesRelatorio =
    document.getElementById(
        "contadorMovimentacoesRelatorio"
    );

const btnMostrarMaisRelatorio =
    document.getElementById(
        "btnMostrarMaisRelatorio"
    );

const btnGerarPdf =
    document.getElementById(
        "btnGerarPdf"
    );

const btnGerarPdfTopo =
    document.getElementById(
        "btnGerarPdfTopo"
    );

const semDadosGrafico =
    document.getElementById(
        "semDadosGrafico"
    );

const graficoCanvas =
    document.getElementById(
        "graficoCategoriasRelatorio"
    );

function formatarMoeda(valor) {
    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function formatarData(data) {
    if (!data) {
        return "Data não informada";
    }

    const partes =
        String(data)
            .substring(0, 10)
            .split("-");

    if (
        partes.length !== 3
    ) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterCategoria(transacao) {
    if (
        transacao.categoria &&
        typeof transacao.categoria === "string"
    ) {
        const categoria =
            transacao.categoria.trim();

        if (categoria) {
            return categoria;
        }
    }

    return "Sem categoria";
}

function obterDescricao(transacao) {
    if (
        transacao.descricao &&
        String(
            transacao.descricao
        ).trim()
    ) {
        return String(
            transacao.descricao
        ).trim();
    }

    return obterCategoria(
        transacao
    );
}

function preencherAnos() {
    if (!anoRelatorio) {
        return;
    }

    const anoAtual =
        new Date().getFullYear();

    anoRelatorio.innerHTML =
        "";

    for (
        let ano = anoAtual;
        ano >= anoAtual - 8;
        ano--
    ) {
        const option =
            document.createElement(
                "option"
            );

        option.value =
            ano;

        option.textContent =
            ano;

        anoRelatorio.appendChild(
            option
        );
    }
}

function selecionarPeriodoAtual() {
    const hoje =
        new Date();

    const mesAtual =
        hoje.getMonth() + 1;

    const anoAtual =
        hoje.getFullYear();

    if (mesRelatorio) {
        mesRelatorio.value =
            String(
                mesAtual
            );
    }

    if (anoRelatorio) {
        anoRelatorio.value =
            String(
                anoAtual
            );
    }

    atualizarTextoPeriodo();
}

function obterNomeMes(
    mes
) {
    const meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    return (
        meses[
            Number(mes) - 1
        ] ||
        "Mês"
    );
}

function atualizarTextoPeriodo() {
    if (
        !textoPeriodoSelecionado ||
        !mesRelatorio ||
        !anoRelatorio
    ) {
        return;
    }

    const mes =
        mesRelatorio.value;

    const ano =
        anoRelatorio.value;

    textoPeriodoSelecionado.textContent =
        `${obterNomeMes(mes)} de ${ano}`;
}

function exibirCarregamento() {
    if (
        !listaMovimentacoesRelatorio
    ) {
        return;
    }

    listaMovimentacoesRelatorio.innerHTML = `
        <div class="estado-carregando">

            <div class="loader-relatorio"></div>

            <span>
                Carregando relatório...
            </span>

        </div>
    `;
}

function exibirEstadoVazio() {
    if (
        !listaMovimentacoesRelatorio
    ) {
        return;
    }

    listaMovimentacoesRelatorio.innerHTML = `
        <div class="estado-vazio">

            <div class="estado-vazio-icon">

                <i class="fa-solid fa-receipt"></i>

            </div>

            <h4>
                Nenhuma movimentação neste período
            </h4>

            <p>
                Não encontramos receitas ou despesas para o mês selecionado.
            </p>

        </div>
    `;
}

async function carregarRelatorio() {
    if (
        !mesRelatorio ||
        !anoRelatorio
    ) {
        return;
    }

    const mes =
        mesRelatorio.value;

    const ano =
        anoRelatorio.value;

    movimentacoesExpandidas =
        false;

    exibirCarregamento();

    definirCarregamentoPeriodo(
        true
    );

    try {
        const response =
    await fetch(
        `${API_URL}/transacoes/usuario/${usuarioId}/periodo?mes=${mes}&ano=${ano}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );

        if (!response.ok) {
            const mensagem =
                await response.text();

            throw new Error(
                mensagem ||
                "Não foi possível carregar o relatório."
            );
        }

        const dados =
            await response.json();

        movimentacoesRelatorio =
            Array.isArray(dados)
                ? dados
                : [];

        ordenarMovimentacoes();

        atualizarTextoPeriodo();

        atualizarResumo();

        atualizarAnalise();

        atualizarGraficoCategorias();

        renderizarMovimentacoes();

    } catch (error) {
        console.error(
            "Erro ao carregar relatório:",
            error
        );

        movimentacoesRelatorio =
            [];

        atualizarResumo();

        atualizarAnalise();

        atualizarGraficoCategorias();

        exibirEstadoVazio();

        atualizarContador(
            0
        );

        atualizarBotaoMostrarMais();

        mostrarToast(
            "Erro ao carregar",
            error.message ||
            "Não foi possível buscar os dados do período.",
            "erro"
        );

    } finally {
        definirCarregamentoPeriodo(
            false
        );
    }
}

function ordenarMovimentacoes() {
    movimentacoesRelatorio.sort(
        (
            a,
            b
        ) => {
            const dataA =
                a.data
                    ? new Date(
                        `${String(a.data).substring(0, 10)}T00:00:00`
                    )
                    : new Date(0);

            const dataB =
                b.data
                    ? new Date(
                        `${String(b.data).substring(0, 10)}T00:00:00`
                    )
                    : new Date(0);

            if (
                dataB - dataA !==
                0
            ) {
                return dataB - dataA;
            }

            return (
                Number(
                    b.id || 0
                ) -
                Number(
                    a.id || 0
                )
            );
        }
    );
}
    function atualizarResumo() {
    let receitas = 0;
    let despesas = 0;

    movimentacoesRelatorio.forEach(
        transacao => {
            const valor =
                Number(
                    transacao.valor ||
                    0
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

    const resultado =
        receitas - despesas;

    if (relatorioReceitas) {
        relatorioReceitas.textContent =
            formatarMoeda(
                receitas
            );
    }

    if (relatorioDespesas) {
        relatorioDespesas.textContent =
            formatarMoeda(
                despesas
            );
    }

    if (relatorioResultado) {
        relatorioResultado.textContent =
            formatarMoeda(
                resultado
            );

        relatorioResultado.classList.remove(
            "valor-receita",
            "valor-despesa"
        );

        if (resultado > 0) {
            relatorioResultado.classList.add(
                "valor-receita"
            );
        }

        if (resultado < 0) {
            relatorioResultado.classList.add(
                "valor-despesa"
            );
        }
    }

    if (relatorioQuantidade) {
        relatorioQuantidade.textContent =
            movimentacoesRelatorio.length;
    }
}

function atualizarAnalise() {
    const receitas =
        movimentacoesRelatorio.filter(
            transacao =>
                transacao.tipo ===
                "RECEITA"
        );

    const despesas =
        movimentacoesRelatorio.filter(
            transacao =>
                transacao.tipo ===
                "DESPESA"
        );

    const maiorValorReceita =
        receitas.length
            ? Math.max(
                ...receitas.map(
                    transacao =>
                        Number(
                            transacao.valor ||
                            0
                        )
                )
            )
            : 0;

    const maiorValorDespesa =
        despesas.length
            ? Math.max(
                ...despesas.map(
                    transacao =>
                        Number(
                            transacao.valor ||
                            0
                        )
                )
            )
            : 0;

    if (maiorReceita) {
        maiorReceita.textContent =
            formatarMoeda(
                maiorValorReceita
            );
    }

    if (maiorDespesa) {
        maiorDespesa.textContent =
            formatarMoeda(
                maiorValorDespesa
            );
    }

    const categorias =
        {};

    despesas.forEach(
        transacao => {
            const categoria =
                obterCategoria(
                    transacao
                );

            if (
                !categorias[
                    categoria
                ]
            ) {
                categorias[
                    categoria
                ] = 0;
            }

            categorias[
                categoria
            ] +=
                Number(
                    transacao.valor ||
                    0
                );
        }
    );

    let categoriaPrincipal =
        "Sem dados";

    let maiorValorCategoria =
        0;

    Object.entries(
        categorias
    ).forEach(
        (
            [
                categoria,
                valor
            ]
        ) => {
            if (
                valor >
                maiorValorCategoria
            ) {
                maiorValorCategoria =
                    valor;

                categoriaPrincipal =
                    categoria;
            }
        }
    );

    if (
        categoriaMaiorGasto
    ) {
        categoriaMaiorGasto.textContent =
            categoriaPrincipal;
    }

    const totalMovimentado =
        movimentacoesRelatorio.reduce(
            (
                total,
                transacao
            ) => {
                return (
                    total +
                    Number(
                        transacao.valor ||
                        0
                    )
                );
            },
            0
        );

    const media =
        movimentacoesRelatorio.length
            ? totalMovimentado /
                movimentacoesRelatorio.length
            : 0;

    if (
        mediaMovimentacoes
    ) {
        mediaMovimentacoes.textContent =
            formatarMoeda(
                media
            );
    }
}

function atualizarGraficoCategorias() {
    const categorias =
        {};

    movimentacoesRelatorio
        .filter(
            transacao =>
                transacao.tipo ===
                "DESPESA"
        )
        .forEach(
            transacao => {
                const categoria =
                    obterCategoria(
                        transacao
                    );

                if (
                    !categorias[
                        categoria
                    ]
                ) {
                    categorias[
                        categoria
                    ] = 0;
                }

                categorias[
                    categoria
                ] +=
                    Number(
                        transacao.valor ||
                        0
                    );
            }
        );

    const labels =
        Object.keys(
            categorias
        );

    const valores =
        Object.values(
            categorias
        );

    if (
        graficoCategorias
    ) {
        graficoCategorias.destroy();

        graficoCategorias =
            null;
    }

    if (
        labels.length === 0
    ) {
        if (
            graficoCanvas
        ) {
            graficoCanvas.style.display =
                "none";
        }

        if (
            semDadosGrafico
        ) {
            semDadosGrafico.classList.add(
                "ativo"
            );
        }

        return;
    }

    if (
        graficoCanvas
    ) {
        graficoCanvas.style.display =
            "block";
    }

    if (
        semDadosGrafico
    ) {
        semDadosGrafico.classList.remove(
            "ativo"
        );
    }

    if (
        typeof Chart ===
        "undefined"
    ) {
        return;
    }

    graficoCategorias =
        new Chart(
            graficoCanvas,
            {
                type:
                    "doughnut",

                data: {
                    labels,

                    datasets: [
                        {
                            data:
                                valores,

                            backgroundColor: [
                                "#2388d1",
                                "#26c985",
                                "#7055c7",
                                "#ef626a",
                                "#f4a261",
                                "#37b7c3",
                                "#8896a5",
                                "#d76cc5"
                            ],

                            borderWidth:
                                0,

                            hoverOffset:
                                8
                        }
                    ]
                },

                options: {
                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "68%",

                    animation: {
                        duration:
                            700
                    },

                    plugins: {
                        legend: {
                            position:
                                "bottom",

                            labels: {
                                usePointStyle:
                                    true,

                                pointStyle:
                                    "circle",

                                padding:
                                    18,

                                color:
                                    "#6f8497",

                                font: {
                                    family:
                                        "Poppins",

                                    size:
                                        10
                                }
                            }
                        },

                        tooltip: {
                            callbacks: {
                                label:
                                    contexto => {
                                        const valor =
                                            contexto.raw ||
                                            0;

                                        return (
                                            `${contexto.label}: ` +
                                            formatarMoeda(
                                                valor
                                            )
                                        );
                                    }
                            }
                        }
                    }
                }
            }
        );
}

    function renderizarMovimentacoes() {
    if (
        !listaMovimentacoesRelatorio
    ) {
        return;
    }

    listaMovimentacoesRelatorio.innerHTML =
        "";

    if (
        movimentacoesRelatorio.length ===
        0
    ) {
        exibirEstadoVazio();

        atualizarContador(
            0
        );

        atualizarBotaoMostrarMais();

        return;
    }

    const limite =
        movimentacoesExpandidas
            ? movimentacoesRelatorio.length
            : 6;

    const listaVisivel =
        movimentacoesRelatorio.slice(
            0,
            limite
        );

    listaVisivel.forEach(
        (
            transacao,
            indice
        ) => {
            const item =
                criarMovimentacao(
                    transacao
                );

            item.style.opacity =
                "0";

            item.style.transform =
                "translateY(12px)";

            listaMovimentacoesRelatorio.appendChild(
                item
            );

            setTimeout(
                () => {
                    item.style.transition =
                        "opacity 0.4s ease, transform 0.4s ease";

                    item.style.opacity =
                        "1";

                    item.style.transform =
                        "translateY(0)";
                },
                indice * 45
            );
        }
    );

    atualizarContador(
        movimentacoesRelatorio.length
    );

    atualizarBotaoMostrarMais();
}

function criarMovimentacao(
    transacao
) {
    const item =
        document.createElement(
            "article"
        );

    item.classList.add(
        "movimentacao-relatorio-item"
    );

    const receita =
        transacao.tipo ===
        "RECEITA";

    const sinal =
        receita
            ? "+"
            : "-";

    const categoria =
        obterCategoria(
            transacao
        );

    const descricao =
        obterDescricao(
            transacao
        );

    item.innerHTML = `
        <div class="movimentacao-esquerda">

            <div class="movimentacao-icon ${
                receita
                    ? "receita"
                    : "despesa"
            }">

                <i class="fa-solid ${
                    receita
                        ? "fa-arrow-down"
                        : "fa-arrow-up"
                }"></i>

            </div>

            <div class="movimentacao-dados">

                <h4>
                    ${
                        transacao.destinatario ||
                        "Transação"
                    }
                </h4>

                <p>
                    ${descricao}
                </p>

                <div class="movimentacao-meta">

                    <span>

                        <i class="fa-regular fa-calendar"></i>

                        ${formatarData(
                            transacao.data
                        )}

                    </span>

                    <span>

                        <i class="fa-solid fa-tag"></i>

                        ${categoria}

                    </span>

                </div>

            </div>

        </div>

        <strong class="movimentacao-valor ${
            receita
                ? "valor-receita"
                : "valor-despesa"
        }">

            ${sinal}${formatarMoeda(
                transacao.valor
            )}

        </strong>
    `;

    return item;
}

function atualizarContador(
    quantidade
) {
    if (
        !contadorMovimentacoesRelatorio
    ) {
        return;
    }

    contadorMovimentacoesRelatorio.textContent =
        quantidade === 1
            ? "1 movimentação"
            : `${quantidade} movimentações`;
}

function atualizarBotaoMostrarMais() {
    if (
        !btnMostrarMaisRelatorio
    ) {
        return;
    }

    if (
        movimentacoesRelatorio.length <=
        6
    ) {
        btnMostrarMaisRelatorio.style.display =
            "none";

        btnMostrarMaisRelatorio.classList.remove(
            "expandido"
        );

        movimentacoesExpandidas =
            false;

        return;
    }

    btnMostrarMaisRelatorio.style.display =
        "flex";

    const texto =
        btnMostrarMaisRelatorio.querySelector(
            "span"
        );

    if (
        movimentacoesExpandidas
    ) {
        if (texto) {
            texto.textContent =
                "Mostrar menos";
        }

        btnMostrarMaisRelatorio.classList.add(
            "expandido"
        );

    } else {
        if (texto) {
            texto.textContent =
                `Mostrar mais (${movimentacoesRelatorio.length - 6})`;
        }

        btnMostrarMaisRelatorio.classList.remove(
            "expandido"
        );
    }
}

function alternarMovimentacoes() {
    movimentacoesExpandidas =
        !movimentacoesExpandidas;

    renderizarMovimentacoes();

    if (
        !movimentacoesExpandidas
    ) {
        const secao =
            document.querySelector(
                ".movimentacoes-relatorio"
            );

        if (secao) {
            secao.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "start"
            });
        }
    }
}

async function gerarPdf() {
    if (
        !mesRelatorio ||
        !anoRelatorio
    ) {
        mostrarToast(
            "Erro ao gerar PDF",
            "Não foi possível identificar o período selecionado.",
            "erro"
        );

        return;
    }

    if (!usuarioId) {
        mostrarToast(
            "Erro ao gerar PDF",
            "Não foi possível identificar o usuário.",
            "erro"
        );

        return;
    }

    const mes =
        mesRelatorio.value;

    const ano =
        anoRelatorio.value;

    if (
        !mes ||
        !ano
    ) {
        mostrarToast(
            "Período inválido",
            "Selecione um mês e um ano para gerar o relatório.",
            "erro"
        );

        return;
    }

    definirCarregamentoPdf(
        true
    );

    try {
        const urlRelatorio =
            `${API_URL}/relatorios/usuario/${usuarioId}?mes=${encodeURIComponent(mes)}&ano=${encodeURIComponent(ano)}`;

        const response =
            await fetch(
                 urlRelatorio,
            {
                method:
                    "GET",

            headers: {
                Accept:
                    "application/pdf",

                "Authorization":
                    `Bearer ${token}`
            }
        }
    );

        if (!response.ok) {
            let mensagemErro =
                `Não foi possível gerar o relatório. Erro ${response.status}.`;

            const tipoConteudoErro =
                response.headers.get(
                    "content-type"
                ) || "";

            try {
                if (
                    tipoConteudoErro.includes(
                        "application/json"
                    )
                ) {
                    const dadosErro =
                        await response.json();

                    mensagemErro =
                        dadosErro.message ||
                        dadosErro.mensagem ||
                        dadosErro.error ||
                        mensagemErro;

                } else {
                    const textoErro =
                        await response.text();

                    if (
                        textoErro &&
                        textoErro.trim()
                    ) {
                        mensagemErro =
                            textoErro;
                    }
                }

            } catch (erroLeitura) {
                console.error(
                    "Erro ao ler resposta do servidor:",
                    erroLeitura
                );
            }

            throw new Error(
                mensagemErro
            );
        }

        const tipoConteudo =
            response.headers.get(
                "content-type"
            ) || "";

        const blob =
            await response.blob();

        if (
            !blob ||
            blob.size === 0
        ) {
            throw new Error(
                "O servidor retornou um arquivo vazio."
            );
        }

        const parecePdf =
            tipoConteudo
                .toLowerCase()
                .includes(
                    "application/pdf"
                ) ||
            blob.type
                .toLowerCase()
                .includes(
                    "application/pdf"
                );

        if (!parecePdf) {
            let mensagem =
                "O servidor respondeu, mas não retornou um arquivo PDF.";

            try {
                const textoResposta =
                    await blob.text();

                if (
                    textoResposta &&
                    textoResposta.trim()
                ) {
                    try {
                        const dados =
                            JSON.parse(
                                textoResposta
                            );

                        mensagem =
                            dados.message ||
                            dados.mensagem ||
                            dados.error ||
                            mensagem;

                    } catch {
                        if (
                            textoResposta.length <
                            500
                        ) {
                            mensagem =
                                textoResposta;
                        }
                    }
                }

            } catch (erroLeitura) {
                console.error(
                    "Erro ao analisar resposta:",
                    erroLeitura
                );
            }

            throw new Error(
                mensagem
            );
        }

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        const mesFormatado =
            String(
                mes
            ).padStart(
                2,
                "0"
            );

        link.href =
            url;

        link.download =
            `relatorio_controlamigo_${mesFormatado}_${ano}.pdf`;

        link.style.display =
            "none";

        document.body.appendChild(
            link
        );

        link.click();

        setTimeout(
            () => {
                link.remove();

                URL.revokeObjectURL(
                    url
                );
            },
            1000
        );

        mostrarToast(
            "Relatório gerado",
            "O arquivo PDF foi baixado com sucesso.",
            "sucesso"
        );

    } catch (error) {
        console.error(
            "Erro ao gerar PDF:",
            error
        );

        mostrarToast(
            "Erro ao gerar PDF",
            error.message ||
            "Não foi possível baixar o relatório.",
            "erro"
        );

    } finally {
        definirCarregamentoPdf(
            false
        );
    }
}

function definirCarregamentoPeriodo(
    carregando
) {
    if (!btnAplicarPeriodo) {
        return;
    }

    btnAplicarPeriodo.disabled =
        carregando;

    const texto =
        btnAplicarPeriodo.querySelector(
            "span"
        );

    const icone =
        btnAplicarPeriodo.querySelector(
            "i"
        );

    if (carregando) {
        if (texto) {
            texto.textContent =
                "Atualizando...";
        }

        if (icone) {
            icone.className =
                "fa-solid fa-spinner fa-spin";
        }

    } else {
        if (texto) {
            texto.textContent =
                "Atualizar relatório";
        }

        if (icone) {
            icone.className =
                "fa-solid fa-chart-simple";
        }
    }
}
function definirCarregamentoPdf(
    carregando
) {
    const botoes = [
        btnGerarPdf,
        btnGerarPdfTopo
    ];

    botoes.forEach(
        botao => {
            if (!botao) {
                return;
            }

            botao.disabled =
                carregando;

            if (
                carregando
            ) {
                if (
                    !botao.dataset
                        .conteudoOriginal
                ) {
                    botao.dataset.conteudoOriginal =
                        botao.innerHTML;
                }

                botao.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <span>
                        Gerando...
                    </span>
                `;

            } else if (
                botao.dataset
                    .conteudoOriginal
            ) {
                botao.innerHTML =
                    botao.dataset.conteudoOriginal;

                delete botao.dataset
                    .conteudoOriginal;
            }
        }
    );
}

function mostrarToast(
    titulo,
    mensagem,
    tipo = "sucesso"
) {
    const toastAnterior =
        document.querySelector(
            ".toast"
        );

    if (
        toastAnterior
    ) {
        toastAnterior.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.classList.add(
        "toast",
        tipo
    );

    const icone =
        tipo === "erro"
            ? "fa-circle-exclamation"
            : "fa-circle-check";

    toast.innerHTML = `
        <div class="toast-icon">

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

    const botaoFechar =
        toast.querySelector(
            ".toast-fechar"
        );

    if (
        botaoFechar
    ) {
        botaoFechar.addEventListener(
            "click",
            () => {
                removerToast(
                    toast
                );
            }
        );
    }

    setTimeout(
        () => {
            removerToast(
                toast
            );
        },
        4500
    );
}

function removerToast(
    toast
) {
    if (
        !toast ||
        !toast.parentNode
    ) {
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

function iniciarEfeitosCards() {
    const cards =
        document.querySelectorAll(
            ".resumo-card"
        );

    cards.forEach(
        card => {
            card.addEventListener(
                "mousemove",
                evento => {
                    const rect =
                        card.getBoundingClientRect();

                    const x =
                        evento.clientX -
                        rect.left;

                    const y =
                        evento.clientY -
                        rect.top;

                    const percentualX =
                        (
                            x /
                            rect.width
                        ) * 100;

                    const percentualY =
                        (
                            y /
                            rect.height
                        ) * 100;

                    card.style.setProperty(
                        "--mouse-x",
                        `${percentualX}%`
                    );

                    card.style.setProperty(
                        "--mouse-y",
                        `${percentualY}%`
                    );
                }
            );

            card.addEventListener(
                "mouseleave",
                () => {
                    card.style.setProperty(
                        "--mouse-x",
                        "50%"
                    );

                    card.style.setProperty(
                        "--mouse-y",
                        "50%"
                    );
                }
            );
        }
    );
}

function animarEntrada() {
    const elementos =
        document.querySelectorAll(
            ".hero-relatorios, .painel-periodo, .resumo-card, .grafico-card, .analise-card, .movimentacoes-relatorio, .exportar-relatorio"
        );

    elementos.forEach(
        (
            elemento,
            indice
        ) => {
            elemento.style.opacity =
                "0";

            elemento.style.transform =
                "translateY(18px)";

            elemento.style.transition =
                "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";

            setTimeout(
                () => {
                    elemento.style.opacity =
                        "1";

                    elemento.style.transform =
                        "";

                    setTimeout(
                        () => {
                            elemento.style.transition =
                                "";
                        },
                        550
                    );
                },
                indice * 65
            );
        }
    );
}

function sair() {
    localStorage.removeItem(
        "usuarioId"
    );

    localStorage.removeItem(
        "usuarioNome"
    );

    localStorage.removeItem(
        "usuarioUsername"
    );

    localStorage.removeItem(
        "token"
    );

    window.location.replace(
        "index.html"
    );
}

if (
    btnAplicarPeriodo
) {
    btnAplicarPeriodo.addEventListener(
        "click",
        carregarRelatorio
    );
}

if (
    mesRelatorio
) {
    mesRelatorio.addEventListener(
        "change",
        atualizarTextoPeriodo
    );
}

if (
    anoRelatorio
) {
    anoRelatorio.addEventListener(
        "change",
        atualizarTextoPeriodo
    );
}

if (
    btnMostrarMaisRelatorio
) {
    btnMostrarMaisRelatorio.addEventListener(
        "click",
        alternarMovimentacoes
    );
}

if (
    btnGerarPdf
) {
    btnGerarPdf.addEventListener(
        "click",
        gerarPdf
    );
}

if (
    btnGerarPdfTopo
) {
    btnGerarPdfTopo.addEventListener(
        "click",
        gerarPdf
    );
}

const btnSair =
    document.getElementById(
        "btnSair"
    );

if (
    btnSair
) {
    btnSair.addEventListener(
        "click",
        sair
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        preencherAnos();

        selecionarPeriodoAtual();

        iniciarEfeitosCards();

        animarEntrada();

        carregarRelatorio();
    }
);
