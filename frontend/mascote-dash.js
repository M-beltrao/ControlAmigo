async function carregarMascote() {
    const container =
        document.getElementById("mascote-container");

    if (!container) {
        return;
    }

    try {
        const response =
            await fetch("mascote-dash.html");

        if (!response.ok) {
            throw new Error(
                "Não foi possível carregar o mascote."
            );
        }

        const html =
            await response.text();

        container.innerHTML = html;

        iniciarMascote();

    } catch (error) {
        console.error(
            "Erro ao carregar mascote:",
            error
        );
    }
}

function iniciarMascote() {
    const mascoteCarteira =
        document.getElementById("mascoteCarteira");

    const mascoteBalao =
        document.getElementById("mascoteBalao");

    const mascoteFechar =
        document.getElementById("mascoteFechar");

    const mascoteTitulo =
        document.getElementById("mascoteTitulo");

    const mascoteMensagem =
        document.getElementById("mascoteMensagem");

    if (
        !mascoteCarteira ||
        !mascoteBalao ||
        !mascoteTitulo ||
        !mascoteMensagem
    ) {
        return;
    }

    function abrirMascote(
        titulo,
        mensagem
    ) {
        mascoteTitulo.textContent =
            titulo;

        mascoteMensagem.textContent =
            mensagem;

        mascoteBalao.classList.add(
            "ativo"
        );
    }

    function fecharMascote() {
        mascoteBalao.classList.remove(
            "ativo"
        );
    }

    mascoteCarteira.addEventListener(
        "click",
        () => {
            if (
                mascoteBalao.classList.contains(
                    "ativo"
                )
            ) {
                fecharMascote();
            } else {
                abrirMascote(
                    "ControlAmigo 💙",
                    "Estou aqui para te ajudar a acompanhar suas finanças."
                );
            }
        }
    );

    if (mascoteFechar) {
        mascoteFechar.addEventListener(
            "click",
            event => {
                event.stopPropagation();

                fecharMascote();
            }
        );
    }

    setTimeout(
        () => {
            analisarFinancasMascote(
                abrirMascote
            );
        },
        1800
    );
}

function analisarFinancasMascote(
    abrirMascote
) {
    if (
        typeof transacoesCarregadas ===
        "undefined"
    ) {
        abrirMascote(
            "Oi! 👋",
            "Estou aqui para te ajudar a organizar melhor sua vida financeira."
        );

        return;
    }

    if (
        !Array.isArray(
            transacoesCarregadas
        ) ||
        transacoesCarregadas.length === 0
    ) {
        abrirMascote(
            "Vamos começar? ✨",
            "Você ainda não tem movimentações. Que tal registrar sua primeira transação?"
        );

        return;
    }

    let receitas = 0;
    let despesas = 0;

    transacoesCarregadas.forEach(
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

    if (
        despesas >
        receitas
    ) {
        abrirMascote(
            "Atenção 👀",
            "Suas despesas estão maiores que suas receitas. Talvez seja uma boa hora para revisar seus gastos."
        );

        return;
    }

    if (
        receitas >
        despesas
    ) {
        const diferenca =
            receitas -
            despesas;

        const valorFormatado =
            diferenca.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        abrirMascote(
            "Boa! ✨",
            `Você está com ${valorFormatado} a mais em receitas do que em despesas.`
        );

        return;
    }

    abrirMascote(
        "Tudo equilibrado ⚖️",
        "Suas receitas e despesas estão no mesmo nível neste momento."
    );
}

carregarMascote();