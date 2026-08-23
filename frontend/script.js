const login = document.getElementById("login");
const cadastro = document.getElementById("cadastro");
const recuperacaoSenha = document.getElementById("recuperacaoSenha");
const etapaEmailRecuperacao = document.getElementById("etapaEmailRecuperacao");
const etapaNovaSenha = document.getElementById("etapaNovaSenha");
const btnEnviarCodigo = document.getElementById("btnEnviarCodigo");

const API_URL = "https://controlamigo-2.onrender.com";

function mostrarCadastro() {
    login.style.opacity = "0";
    login.style.transform = "translateY(-10px)";

    setTimeout(() => {
        login.style.display = "none";
        cadastro.style.display = "block";

        cadastro.style.opacity = "0";
        cadastro.style.transform = "translateY(10px)";

        setTimeout(() => {
            cadastro.style.opacity = "1";
            cadastro.style.transform = "translateY(0)";
        }, 50);

    }, 250);
}

function mostrarRecuperacaoSenha() {
    login.style.opacity = "0";
    login.style.transform = "translateY(-10px)";

    setTimeout(() => {
        login.style.display = "none";
        cadastro.style.display = "none";

        recuperacaoSenha.style.display = "block";
        recuperacaoSenha.style.opacity = "0";
        recuperacaoSenha.style.transform = "translateY(10px)";

        etapaEmailRecuperacao.style.display = "block";
        etapaNovaSenha.style.display = "none";

        setTimeout(() => {
            recuperacaoSenha.style.opacity = "1";
            recuperacaoSenha.style.transform = "translateY(0)";
        }, 50);
    }, 250);
}

function mostrarLogin() {
    cadastro.style.opacity = "0";
    recuperacaoSenha.style.opacity = "0";

    cadastro.style.transform = "translateY(-10px)";
    recuperacaoSenha.style.transform = "translateY(-10px)";

    setTimeout(() => {
        cadastro.style.display = "none";
        recuperacaoSenha.style.display = "none";

        login.style.display = "block";
        login.style.opacity = "0";
        login.style.transform = "translateY(10px)";

        setTimeout(() => {
            login.style.opacity = "1";
            login.style.transform = "translateY(0)";
        }, 50);
    }, 250);
}

function mostrarMensagem(tipo, titulo, mensagem) {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);

    let icone = "";

    if (tipo === "sucesso") {
        icone = '<i class="fa-solid fa-check"></i>';
    }

    if (tipo === "erro") {
        icone = '<i class="fa-solid fa-exclamation"></i>';
    }

    if (tipo === "info") {
        icone = '<i class="fa-solid fa-info"></i>';
    }

    toast.innerHTML = `
        <div class="toast-icon">
            ${icone}
        </div>

        <div class="toast-content">
            <strong>${titulo}</strong>
            <span>${mensagem}</span>
        </div>

        <button class="toast-fechar" type="button">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    const fechar = toast.querySelector(".toast-fechar");

    function removerToast() {
        if (toast.classList.contains("saindo")) {
            return;
        }

        toast.classList.add("saindo");

        setTimeout(() => {
            toast.remove();
        }, 350);
    }

    fechar.addEventListener("click", removerToast);

    setTimeout(removerToast, 4000);
}

const inputs = document.querySelectorAll("input");

inputs.forEach(input => {
    input.addEventListener("focus", () => {
        input.parentElement.style.transform = "scale(1.01)";
    });

    input.addEventListener("blur", () => {
        input.parentElement.style.transform = "scale(1)";
    });
});

const beneficios = document.querySelectorAll(".beneficio");

beneficios.forEach(beneficio => {
    beneficio.addEventListener("mouseenter", () => {
        beneficio.style.transform = "translateY(-4px)";
    });

    beneficio.addEventListener("mouseleave", () => {
        beneficio.style.transform = "translateY(0)";
    });
});

const botoes = document.querySelectorAll(".btn");

botoes.forEach(botao => {
    botao.addEventListener("mousedown", () => {
        if (!botao.disabled) {
            botao.style.transform = "scale(0.98)";
        }
    });

    botao.addEventListener("mouseup", () => {
        if (!botao.disabled) {
            botao.style.transform = "translateY(-2px)";
        }
    });

    botao.addEventListener("mouseleave", () => {
        if (!botao.disabled) {
            botao.style.transform = "translateY(0)";
        }
    });
});

const phone = document.querySelector(".phone");

if (phone) {
    setInterval(() => {
        phone.animate(
            [
                { transform: "translateY(0px)" },
                { transform: "translateY(-8px)" },
                { transform: "translateY(0px)" }
            ],
            {
                duration: 2600,
                iterations: 1,
                easing: "ease-in-out"
            }
        );
    }, 2800);
}

const botoesMostrarSenha =
    document.querySelectorAll(".mostrar-senha");

botoesMostrarSenha.forEach(botao => {
    botao.addEventListener("click", () => {
        const inputId =
            botao.getAttribute("data-input");

        const input =
            document.getElementById(inputId);

        const icone =
            botao.querySelector("i");

        if (input.type === "password") {
            input.type = "text";

            icone.classList.remove("fa-eye");
            icone.classList.add("fa-eye-slash");
        } else {
            input.type = "password";

            icone.classList.remove("fa-eye-slash");
            icone.classList.add("fa-eye");
        }
    });
});

const btnCadastro =
    document.querySelector("#cadastro .btn");

function ativarLoadingCadastro() {
    btnCadastro.disabled = true;

    btnCadastro.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Criando conta...</span>
    `;
}

function restaurarBotaoCadastro() {
    btnCadastro.disabled = false;

    btnCadastro.innerHTML = `
        <span>Criar conta</span>
        <i class="fa-solid fa-arrow-right"></i>
    `;
}

if (btnCadastro) {
    btnCadastro.addEventListener("click", () => {
        if (btnCadastro.disabled) {
            return;
        }

        const nome =
            document
                .getElementById("nome")
                .value
                .trim();

        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const senha =
            document
                .getElementById("senha")
                .value;

        const confirmarSenha =
            document
                .getElementById("confirmarSenha")
                .value;

        if (nome === "") {
            mostrarMensagem(
                "erro",
                "Nome obrigatório",
                "Informe seu nome para continuar."
            );
            return;
        }

        if (username === "") {
            mostrarMensagem(
                "erro",
                "Username obrigatório",
                "Escolha um username para sua conta."
            );
            return;
        }

        if (email === "") {
            mostrarMensagem(
                "erro",
                "E-mail obrigatório",
                "Informe seu e-mail para continuar."
            );
            return;
        }

        if (!email.includes("@")) {
            mostrarMensagem(
                "erro",
                "E-mail inválido",
                "Digite um endereço de e-mail válido."
            );
            return;
        }

        if (senha === "") {
            mostrarMensagem(
                "erro",
                "Senha obrigatória",
                "Crie uma senha para sua conta."
            );
            return;
        }

        if (senha.length < 8) {
            mostrarMensagem(
                "erro",
                "Senha muito curta",
                "A senha deve ter pelo menos 8 caracteres."
            );
            return;
        }

        if (!/[A-Z]/.test(senha)) {
            mostrarMensagem(
                "erro",
                "Senha inválida",
                "A senha deve conter pelo menos uma letra maiúscula."
            );
            return;
        }

        if (!/[a-z]/.test(senha)) {
            mostrarMensagem(
                "erro",
                "Senha inválida",
                "A senha deve conter pelo menos uma letra minúscula."
            );
            return;
        }

        if (!/\d/.test(senha)) {
            mostrarMensagem(
                "erro",
                "Senha inválida",
                "A senha deve conter pelo menos um número."
            );
            return;
        }

        if (senha !== confirmarSenha) {
            mostrarMensagem(
                "erro",
                "Senhas diferentes",
                "As duas senhas precisam ser iguais."
            );
            return;
        }

        const usuario = {
            nome,
            username,
            email,
            senha
        };

        ativarLoadingCadastro();

        fetch(`${API_URL}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        })

        .then(async response => {
            if (!response.ok) {
                const mensagemErro =
                    await response.text();

                throw new Error(
                    mensagemErro ||
                    "Não foi possível realizar o cadastro."
                );
            }

            return response.json();
        })

        .then(data => {
            console.log("Usuário cadastrado:");
            console.log(data);

            mostrarMensagem(
                "sucesso",
                "Conta criada!",
                "Seu cadastro foi realizado com sucesso."
            );

            limparCadastro();

            setTimeout(() => {
                restaurarBotaoCadastro();
                mostrarLogin();
            }, 900);
        })

        .catch(error => {
            console.error("Erro no cadastro:");
            console.error(error);

            mostrarMensagem(
                "erro",
                "Erro no cadastro",
                error.message
            );

            restaurarBotaoCadastro();
        });
    });
}

function limparCadastro() {
    document.getElementById("nome").value = "";
    document.getElementById("username").value = "";
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("confirmarSenha").value = "";
}

const btnLogin =
    document.getElementById("btnLogin");

function ativarLoadingLogin() {
    btnLogin.disabled = true;

    btnLogin.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Entrando...</span>
    `;
}

function restaurarBotaoLogin() {
    btnLogin.disabled = false;

    btnLogin.innerHTML = `
        <span>Entrar</span>
        <i class="fa-solid fa-arrow-right"></i>
    `;
}

if (btnLogin) {
    btnLogin.addEventListener("click", () => {
        if (btnLogin.disabled) {
            return;
        }

        const loginUsuario =
            document
                .getElementById("loginUsuario")
                .value
                .trim();

        const loginSenha =
            document
                .getElementById("loginSenha")
                .value;

        if (loginUsuario === "") {
            mostrarMensagem(
                "erro",
                "Login obrigatório",
                "Informe seu e-mail ou username."
            );
            return;
        }

        if (loginSenha === "") {
            mostrarMensagem(
                "erro",
                "Senha obrigatória",
                "Informe sua senha para entrar."
            );
            return;
        }

        const dadosLogin = {
            username: loginUsuario,
            senha: loginSenha
        };

        ativarLoadingLogin();

        fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dadosLogin)
        })

        .then(async response => {
            if (!response.ok) {
                const mensagemErro =
                    await response.text();

                throw new Error(
                    mensagemErro ||
                    "Usuário ou senha inválidos."
                );
            }

            return response.json();
        })

        .then(data => {
            localStorage.setItem(
                "usuarioId",
                data.id
            );

            localStorage.setItem(
                "usuarioNome",
                data.nome
            );

            localStorage.setItem(
                "usuarioUsername",
                data.username
            );

            mostrarMensagem(
                "sucesso",
                "Login realizado!",
                "Acessando sua conta..."
            );

            setTimeout(() => {
                window.location.href =
                    "dashboard.html";
            }, 1200);
        })

        .catch(error => {
            console.error("Erro no login:");
            console.error(error);

            mostrarMensagem(
                "erro",
                "Não foi possível entrar",
                error.message
            );

            restaurarBotaoLogin();
        });
    });
}

const loginSenha =
    document.getElementById("loginSenha");

if (loginSenha) {
    loginSenha.addEventListener("keydown", event => {
        if (event.key === "Enter" && !btnLogin.disabled) {
            btnLogin.click();
        }
    });
}

const confirmarSenha =
    document.getElementById("confirmarSenha");

if (confirmarSenha) {
    confirmarSenha.addEventListener("keydown", event => {
        if (event.key === "Enter" && !btnCadastro.disabled) {
            btnCadastro.click();
        }
    });
}

if (btnEnviarCodigo) {
    btnEnviarCodigo.addEventListener("click", async () => {

        const email = document
            .getElementById("emailRecuperacao")
            .value
            .trim();

        if (email === "") {
            mostrarMensagem(
                "erro",
                "E-mail obrigatório",
                "Informe seu e-mail para recuperar a senha."
            );
            return;
        }

        if (!email.includes("@")) {
            mostrarMensagem(
                "erro",
                "E-mail inválido",
                "Digite um endereço de e-mail válido."
            );
            return;
        }

        btnEnviarCodigo.disabled = true;

        btnEnviarCodigo.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Enviando...</span>
        `;

        try {
            const response = await fetch(
                `${API_URL}/senha/recuperar`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            if (!response.ok) {
                const mensagemErro =
                    await response.text();

                throw new Error(
                    mensagemErro ||
                    "Não foi possível enviar o código."
                );
            }

            const data =
                await response.json();

            mostrarMensagem(
                "sucesso",
                "Código enviado!",
                data.mensagem
            );

            etapaEmailRecuperacao.style.display =
                "none";

            etapaNovaSenha.style.display =
                "block";

        } catch (error) {

            console.error(
                "Erro ao enviar código:",
                error
            );

            mostrarMensagem(
                "erro",
                "Erro ao enviar código",
                error.message
            );

        } finally {

            btnEnviarCodigo.disabled = false;

            btnEnviarCodigo.innerHTML = `
                <span>Enviar código</span>
                <i class="fa-solid fa-paper-plane"></i>
            `;
        }
    });
}

const btnRedefinirSenha =
    document.getElementById("btnRedefinirSenha");

if (btnRedefinirSenha) {
    btnRedefinirSenha.addEventListener(
        "click",
        async () => {

            const email = document
                .getElementById("emailRecuperacao")
                .value
                .trim();

            const codigo = document
                .getElementById("codigoRecuperacao")
                .value
                .trim();

            const novaSenha = document
                .getElementById("novaSenhaRecuperacao")
                .value;

            const confirmarNovaSenha = document
                .getElementById(
                    "confirmarNovaSenhaRecuperacao"
                )
                .value;

            if (codigo === "") {
                mostrarMensagem(
                    "erro",
                    "Código obrigatório",
                    "Informe o código enviado para seu e-mail."
                );
                return;
            }

            if (!/^\d{6}$/.test(codigo)) {
                mostrarMensagem(
                    "erro",
                    "Código inválido",
                    "O código deve possuir 6 dígitos."
                );
                return;
            }

            if (novaSenha === "") {
                mostrarMensagem(
                    "erro",
                    "Nova senha obrigatória",
                    "Digite sua nova senha."
                );
                return;
            }

            if (novaSenha.length < 8) {
                mostrarMensagem(
                    "erro",
                    "Senha muito curta",
                    "A senha deve ter pelo menos 8 caracteres."
                );
                return;
            }

            if (!/[A-Z]/.test(novaSenha)) {
                mostrarMensagem(
                    "erro",
                    "Senha inválida",
                    "A senha deve conter pelo menos uma letra maiúscula."
                );
                return;
            }

            if (!/[a-z]/.test(novaSenha)) {
                mostrarMensagem(
                    "erro",
                    "Senha inválida",
                    "A senha deve conter pelo menos uma letra minúscula."
                );
                return;
            }

            if (!/\d/.test(novaSenha)) {
                mostrarMensagem(
                    "erro",
                    "Senha inválida",
                    "A senha deve conter pelo menos um número."
                );
                return;
            }

            if (
                novaSenha !== confirmarNovaSenha
            ) {
                mostrarMensagem(
                    "erro",
                    "Senhas diferentes",
                    "As duas senhas precisam ser iguais."
                );
                return;
            }

            btnRedefinirSenha.disabled = true;

            btnRedefinirSenha.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                <span>Redefinindo...</span>
            `;

            try {
                const response =
                    await fetch(
                        `${API_URL}/senha/redefinir`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                email: email,
                                codigo: codigo,
                                novaSenha: novaSenha
                            })
                        }
                    );

                if (!response.ok) {
                    const mensagemErro =
                        await response.text();

                    throw new Error(
                        mensagemErro ||
                        "Não foi possível redefinir a senha."
                    );
                }

                const data =
                    await response.json();

                mostrarMensagem(
                    "sucesso",
                    "Senha redefinida!",
                    data.mensagem
                );

                document.getElementById(
                    "codigoRecuperacao"
                ).value = "";

                document.getElementById(
                    "novaSenhaRecuperacao"
                ).value = "";

                document.getElementById(
                    "confirmarNovaSenhaRecuperacao"
                ).value = "";

                setTimeout(() => {
                    mostrarLogin();
                }, 1200);

            } catch (error) {

                console.error(
                    "Erro ao redefinir senha:",
                    error
                );

                mostrarMensagem(
                    "erro",
                    "Erro ao redefinir senha",
                    error.message
                );

            } finally {

                btnRedefinirSenha.disabled =
                    false;

                btnRedefinirSenha.innerHTML = `
                    <span>Redefinir senha</span>
                    <i class="fa-solid fa-check"></i>
                `;
            }
        }
    );
}

const codigoRecuperacao =
    document.getElementById("codigoRecuperacao");

if (codigoRecuperacao) {
    codigoRecuperacao.addEventListener(
        "input",
        () => {
            codigoRecuperacao.value =
                codigoRecuperacao.value
                    .replace(/\D/g, "")
                    .slice(0, 6);
        }
    );
}

const confirmarNovaSenhaRecuperacao =
    document.getElementById(
        "confirmarNovaSenhaRecuperacao"
    );

if (confirmarNovaSenhaRecuperacao) {
    confirmarNovaSenhaRecuperacao.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "Enter" &&
                btnRedefinirSenha &&
                !btnRedefinirSenha.disabled
            ) {
                btnRedefinirSenha.click();
            }
        }
    );
}