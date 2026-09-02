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

let contasBancarias = [];

let itemIdParaDesconectar =
    null;

const btnConectarBanco =
    document.getElementById(
        "btnConectarBanco"
    );

const btnSincronizarContas =
    document.getElementById(
        "btnSincronizarContas"
    );

const listaContas =
    document.getElementById(
        "listaContas"
    );

const saldoTotalBancos =
    document.getElementById(
        "saldoTotalBancos"
    );

const quantidadeContas =
    document.getElementById(
        "quantidadeContas"
    );

const textoUltimaSincronizacao =
    document.getElementById(
        "textoUltimaSincronizacao"
    );

const modalDesconectar =
    document.getElementById(
        "modalDesconectar"
    );

const btnCancelarDesconexao =
    document.getElementById(
        "btnCancelarDesconexao"
    );

const btnConfirmarDesconexao =
    document.getElementById(
        "btnConfirmarDesconexao"
    );

function formatarMoeda(
    valor
) {
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

function obterNomeBanco(
    conta
) {
    return (
        conta.instituicao ||
        conta.nomeInstituicao ||
        conta.banco ||
        conta.institutionName ||
        conta.connectorName ||
        "Instituição bancária"
    );
}

function obterNomeConta(
    conta
) {
    return (
        conta.nome ||
        conta.nomeConta ||
        conta.name ||
        conta.type ||
        conta.tipo ||
        "Conta bancária"
    );
}

function obterNumeroConta(
    conta
) {
    const numero =
        conta.numeroConta ||
        conta.numero ||
        conta.number ||
        conta.accountNumber;

    if (!numero) {
        return "Conta conectada";
    }

    const numeroString =
        String(numero);

    if (
        numeroString.length <= 4
    ) {
        return `Conta •••• ${numeroString}`;
    }

    return `Conta •••• ${numeroString.slice(-4)}`;
}

function obterSaldoConta(
    conta
) {
    const possibilidades = [
        conta.saldo,
        conta.balance,
        conta.saldoAtual,
        conta.currentBalance
    ];

    for (
        const valor of
        possibilidades
    ) {
        if (
            valor !== undefined &&
            valor !== null &&
            !Number.isNaN(
                Number(valor)
            )
        ) {
            return Number(
                valor
            );
        }
    }

    return 0;
}

function obterItemId(
    conta
) {
    return (
        conta.itemId ||
        conta.item_id ||
        conta.pluggyItemId ||
        conta.item?.id ||
        null
    );
}

function obterContaId(
    conta
) {
    return (
        conta.id ||
        conta.accountId ||
        conta.contaId ||
        null
    );
}

function exibirCarregamento() {
    if (!listaContas) {
        return;
    }

    listaContas.innerHTML = `
        <div class="estado-carregando">

            <div class="loader-contas"></div>

            <span>
                Carregando suas contas...
            </span>

        </div>
    `;
}

function exibirEstadoVazio() {
    if (!listaContas) {
        return;
    }

    listaContas.innerHTML = `
        <div class="estado-vazio">

            <div class="estado-vazio-icon">

                <i class="fa-solid fa-building-columns"></i>

            </div>

            <h4>
                Nenhuma conta conectada
            </h4>

            <p>
                Conecte sua primeira instituição bancária para acompanhar seus saldos e movimentações automaticamente.
            </p>

            <button
                id="btnConectarVazio"
                class="btn-conectar-vazio"
                type="button"
            >

                <i class="fa-solid fa-plus"></i>

                <span>
                    Conectar minha conta
                </span>

            </button>

        </div>
    `;

    const btnConectarVazio =
        document.getElementById(
            "btnConectarVazio"
        );

    if (btnConectarVazio) {
        btnConectarVazio.addEventListener(
            "click",
            conectarBanco
        );
    }
}

async function carregarContas(
    mostrarLoading = true
) {
    if (mostrarLoading) {
        exibirCarregamento();
    }

    try {
        const response =
            await fetch(
                `${API_URL}/contas-bancarias/usuario/${usuarioId}`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar suas contas bancárias."
            );
        }

        const dados =
            await response.json();

        contasBancarias =
            Array.isArray(dados)
                ? dados
                : [];

        renderizarContas();

        atualizarQuantidadeContas();

        await carregarSaldoTotal();

    } catch (error) {
        console.error(
            "Erro ao carregar contas:",
            error
        );

        contasBancarias = [];

        exibirEstadoVazio();

        atualizarQuantidadeContas();

        atualizarSaldoTotal(
            0
        );

        mostrarToast(
            "Erro ao carregar",
            "Não foi possível buscar suas contas bancárias.",
            "erro"
        );
    }
}

function renderizarContas() {
    if (!listaContas) {
        return;
    }

    listaContas.innerHTML =
        "";

    if (
        contasBancarias.length === 0
    ) {
        exibirEstadoVazio();

        return;
    }

    contasBancarias.forEach(
        (
            conta,
            indice
        ) => {
            const card =
                criarCardConta(
                    conta,
                    indice
                );

            listaContas.appendChild(
                card
            );
        }
    );
}

function criarCardConta(
    conta,
    indice
) {
    const card =
        document.createElement(
            "article"
        );

    card.classList.add(
        "conta-bancaria-card"
    );

    const nomeBanco =
        obterNomeBanco(
            conta
        );

    const nomeConta =
        obterNomeConta(
            conta
        );

    const numeroConta =
        obterNumeroConta(
            conta
        );

    const saldo =
        obterSaldoConta(
            conta
        );

    const itemId =
        obterItemId(
            conta
        );

    card.innerHTML = `
        <div class="conta-card-topo">

            <div class="conta-info">

                <div class="banco-icon">

                    <i class="fa-solid fa-building-columns"></i>

                </div>

                <div class="banco-dados">

                    <h4>
                        ${nomeBanco}
                    </h4>

                    <span>
                        ${nomeConta}
                    </span>

                </div>

            </div>

            <div class="conta-status">
                Conectada
            </div>

        </div>

        <div class="conta-saldo-area">

            <span class="conta-saldo-label">
                Saldo disponível
            </span>

            <strong class="conta-saldo">
                ${formatarMoeda(saldo)}
            </strong>

        </div>

        <div class="conta-card-rodape">

            <span>
                ${numeroConta}
            </span>

            ${
                itemId
                    ? `
                        <button
                            class="btn-desconectar-conta"
                            type="button"
                            title="Desconectar conta"
                            data-item-id="${itemId}"
                        >

                            <i class="fa-solid fa-link-slash"></i>

                        </button>
                    `
                    : ""
            }

        </div>
    `;

    const btnDesconectar =
        card.querySelector(
            ".btn-desconectar-conta"
        );

    if (btnDesconectar) {
        btnDesconectar.addEventListener(
            "click",
            () => {
                abrirModalDesconectar(
                    itemId
                );
            }
        );
    }

    card.style.opacity =
        "0";

    card.style.transform =
        "translateY(18px)";

    setTimeout(
        () => {
            card.style.transition =
                "opacity 0.5s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";

            card.style.opacity =
                "1";

            card.style.transform =
                "translateY(0)";

            setTimeout(
                () => {
                    card.style.transition =
                        "";
                },
                550
            );
        },
        indice * 80
    );

    return card;
}

function atualizarQuantidadeContas() {
    if (!quantidadeContas) {
        return;
    }

    quantidadeContas.textContent =
        contasBancarias.length;
}

async function carregarSaldoTotal() {
    try {
        const response =
            await fetch(
                `${API_URL}/contas-bancarias/usuario/${usuarioId}/saldo`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

        if (!response.ok) {
            calcularSaldoPelasContas();

            return;
        }

        const dados =
            await response.json();

        let saldo = 0;

        if (
            typeof dados ===
            "number"
        ) {
            saldo =
                dados;

        } else if (
            dados &&
            typeof dados ===
            "object"
        ) {
            saldo =
                dados.saldo ??
                dados.saldoTotal ??
                dados.total ??
                dados.balance ??
                0;
        }

        atualizarSaldoTotal(
            saldo
        );

    } catch (error) {
        console.error(
            "Erro ao carregar saldo total:",
            error
        );

        calcularSaldoPelasContas();
    }
}

function calcularSaldoPelasContas() {
    const saldo =
        contasBancarias.reduce(
            (
                total,
                conta
            ) => {
                return (
                    total +
                    obterSaldoConta(
                        conta
                    )
                );
            },
            0
        );

    atualizarSaldoTotal(
        saldo
    );
}

function atualizarSaldoTotal(
    saldo
) {
    if (!saldoTotalBancos) {
        return;
    }

    saldoTotalBancos.textContent =
        formatarMoeda(
            saldo
        );
}

async function conectarBanco() {
    if (!btnConectarBanco) {
        return;
    }

    definirCarregamentoBotao(
        btnConectarBanco,
        true,
        "Conectando..."
    );

    try {
        const response =
            await fetch(
                `${API_URL}/pluggy/connect-token/${usuarioId}`,
                {
                    method: "POST",
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
                "Não foi possível iniciar a conexão bancária."
            );
        }

        const dados =
            await response.json();

        const connectToken =
            dados.connectToken ||
            dados.accessToken ||
            dados.token ||
            (
                typeof dados ===
                "string"
                    ? dados
                    : null
            );

        if (!connectToken) {
            throw new Error(
                "O servidor não retornou o token de conexão."
            );
        }

        abrirPluggyConnect(
            connectToken
        );

    } catch (error) {
        console.error(
            "Erro ao conectar banco:",
            error
        );

        mostrarToast(
            "Erro na conexão",
            error.message ||
            "Não foi possível iniciar a conexão bancária.",
            "erro"
        );

        definirCarregamentoBotao(
            btnConectarBanco,
            false
        );
    }
}

function abrirPluggyConnect(
    connectToken
) {
    if (
        typeof PluggyConnect ===
        "undefined"
    ) {
        mostrarToast(
            "Integração indisponível",
            "O Pluggy Connect não foi carregado corretamente.",
            "erro"
        );

        definirCarregamentoBotao(
            btnConectarBanco,
            false
        );

        return;
    }

    try {
        const pluggyConnect =
            new PluggyConnect({
                connectToken,

                includeSandbox:
                    false,

                onSuccess:
                    async itemData => {
                        definirCarregamentoBotao(
                            btnConectarBanco,
                            false
                        );

                        const itemId =
                            itemData?.item?.id ||
                            itemData?.id ||
                            itemData?.itemId;

                        if (!itemId) {
                            mostrarToast(
                                "Conta conectada",
                                "A conexão foi concluída. Atualizando suas contas."
                            );

                            await carregarContas();

                            return;
                        }

                        await sincronizarNovaConta(
                            itemId
                        );
                    },

                onError:
                    error => {
                        console.error(
                            "Erro no Pluggy Connect:",
                            error
                        );

                        definirCarregamentoBotao(
                            btnConectarBanco,
                            false
                        );

                        mostrarToast(
                            "Conexão interrompida",
                            "Não foi possível concluir a conexão com o banco.",
                            "erro"
                        );
                    },

                onClose:
                    () => {
                        definirCarregamentoBotao(
                            btnConectarBanco,
                            false
                        );
                    }
            });

        pluggyConnect.init();

    } catch (error) {
        console.error(
            "Erro ao abrir Pluggy:",
            error
        );

        definirCarregamentoBotao(
            btnConectarBanco,
            false
        );

        mostrarToast(
            "Erro",
            "Não foi possível abrir a conexão bancária.",
            "erro"
        );
    }
}

async function sincronizarNovaConta(
    itemId
) {
    try {
        mostrarToast(
            "Conta conectada",
            "Estamos sincronizando suas informações."
        );

        const response =
            await fetch(
                `${API_URL}/pluggy/contas/sincronizar/${usuarioId}/${encodeURIComponent(itemId)}`,
                {
                    method: "POST",
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
                "A conta foi conectada, mas não foi possível sincronizá-la."
            );
        }

        await carregarContas();

        atualizarTextoSincronizacao();

        mostrarToast(
            "Tudo pronto",
            "Sua conta bancária foi conectada e sincronizada."
        );

    } catch (error) {
        console.error(
            "Erro ao sincronizar nova conta:",
            error
        );

        mostrarToast(
            "Sincronização pendente",
            error.message ||
            "A conta foi conectada, mas ocorreu um problema ao sincronizar.",
            "erro"
        );

        await carregarContas(
            false
        );
    }
}

async function sincronizarTodasContas() {
    if (!btnSincronizarContas) {
        return;
    }

    definirCarregamentoSincronizacao(
        true
    );

    try {
        const response =
            await fetch(
                `${API_URL}/pluggy/sincronizar/usuario/${usuarioId}`,
                {
                    method: "POST",
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
                "Não foi possível sincronizar suas contas."
            );
        }

        await carregarContas(
            false
        );

        atualizarTextoSincronizacao();

        mostrarToast(
            "Contas atualizadas",
            "Seus dados bancários foram sincronizados."
        );

    } catch (error) {
        console.error(
            "Erro ao sincronizar contas:",
            error
        );

        mostrarToast(
            "Erro na sincronização",
            error.message ||
            "Não foi possível atualizar suas contas.",
            "erro"
        );

    } finally {
        definirCarregamentoSincronizacao(
            false
        );
    }
}

function atualizarTextoSincronizacao() {
    if (
        !textoUltimaSincronizacao
    ) {
        return;
    }

    const agora =
        new Date();

    const horario =
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    textoUltimaSincronizacao.textContent =
        `Atualizado hoje às ${horario}`;
}

function abrirModalDesconectar(
    itemId
) {
    if (
        !itemId ||
        !modalDesconectar
    ) {
        return;
    }

    itemIdParaDesconectar =
        itemId;

    modalDesconectar.classList.add(
        "ativo"
    );

    document.body.style.overflow =
        "hidden";
}

function fecharModalDesconectar() {
    if (!modalDesconectar) {
        return;
    }

    modalDesconectar.classList.remove(
        "ativo"
    );

    itemIdParaDesconectar =
        null;

    document.body.style.overflow =
        "";
}

async function desconectarConta() {
    if (!itemIdParaDesconectar) {
        return;
    }

    const itemId =
        itemIdParaDesconectar;

    if (btnConfirmarDesconexao) {
        btnConfirmarDesconexao.disabled =
            true;

        btnConfirmarDesconexao.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Desconectando...
            </span>
        `;
    }

    try {
        const response =
            await fetch(
                `${API_URL}/pluggy/desconectar/${usuarioId}/${encodeURIComponent(itemId)}`,
                {
                    method: "DELETE",
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
                "Não foi possível desconectar a conta."
            );
        }

        fecharModalDesconectar();

        await carregarContas();

        mostrarToast(
            "Conta desconectada",
            "A instituição foi removida do ControlAmigo."
        );

    } catch (error) {
        console.error(
            "Erro ao desconectar conta:",
            error
        );

        mostrarToast(
            "Erro ao desconectar",
            error.message ||
            "Não foi possível remover a conta bancária.",
            "erro"
        );

    } finally {
        if (
            btnConfirmarDesconexao
        ) {
            btnConfirmarDesconexao.disabled =
                false;

            btnConfirmarDesconexao.innerHTML = `
                <i class="fa-solid fa-link-slash"></i>

                <span>
                    Desconectar
                </span>
            `;
        }
    }
}

function definirCarregamentoBotao(
    botao,
    carregando,
    texto = ""
) {
    if (!botao) {
        return;
    }

    botao.disabled =
        carregando;

    if (carregando) {
        botao.dataset.textoOriginal =
            botao.innerHTML;

        botao.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                ${texto}
            </span>
        `;

        return;
    }

    if (
        botao.dataset.textoOriginal
    ) {
        botao.innerHTML =
            botao.dataset.textoOriginal;

        delete botao.dataset
            .textoOriginal;
    }
}

function definirCarregamentoSincronizacao(
    carregando
) {
    if (!btnSincronizarContas) {
        return;
    }

    const texto =
        btnSincronizarContas.querySelector(
            "span"
        );

    btnSincronizarContas.disabled =
        carregando;

    if (carregando) {
        btnSincronizarContas.classList.add(
            "carregando"
        );

        if (texto) {
            texto.textContent =
                "Sincronizando...";
        }

    } else {
        btnSincronizarContas.classList.remove(
            "carregando"
        );

        if (texto) {
            texto.textContent =
                "Sincronizar";
        }
    }
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

    if (toastAnterior) {
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
            aria-label="Fechar"
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

    const btnFechar =
        toast.querySelector(
            ".toast-fechar"
        );

    if (btnFechar) {
        btnFechar.addEventListener(
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

                    const porcentagemX =
                        (
                            x /
                            rect.width
                        ) * 100;

                    const porcentagemY =
                        (
                            y /
                            rect.height
                        ) * 100;

                    card.style.setProperty(
                        "--mouse-x",
                        `${porcentagemX}%`
                    );

                    card.style.setProperty(
                        "--mouse-y",
                        `${porcentagemY}%`
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
            ".hero-contas, .resumo-card, .painel-contas, .seguranca-contas"
        );

    elementos.forEach(
        (
            elemento,
            indice
        ) => {
            elemento.style.opacity =
                "0";

            elemento.style.transform =
                "translateY(20px)";

            elemento.style.transition =
                "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)";

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
                        600
                    );
                },
                indice * 85
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

if (btnConectarBanco) {
    btnConectarBanco.addEventListener(
        "click",
        conectarBanco
    );
}

if (btnSincronizarContas) {
    btnSincronizarContas.addEventListener(
        "click",
        sincronizarTodasContas
    );
}

if (btnCancelarDesconexao) {
    btnCancelarDesconexao.addEventListener(
        "click",
        fecharModalDesconectar
    );
}

if (btnConfirmarDesconexao) {
    btnConfirmarDesconexao.addEventListener(
        "click",
        desconectarConta
    );
}

if (modalDesconectar) {
    modalDesconectar.addEventListener(
        "click",
        evento => {
            if (
                evento.target ===
                modalDesconectar
            ) {
                fecharModalDesconectar();
            }
        }
    );
}

document.addEventListener(
    "keydown",
    evento => {
        if (
            evento.key ===
            "Escape" &&
            modalDesconectar &&
            modalDesconectar.classList.contains(
                "ativo"
            )
        ) {
            fecharModalDesconectar();
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
        sair
    );
}

document.addEventListener(
    "DOMContentLoaded",
    () => {
        iniciarEfeitosCards();

        animarEntrada();
    }
);

carregarContas();