async function carregarMenu() {
    const containerMenu = document.getElementById("menuContainer");

    if (!containerMenu) {
        return;
    }

    try {
        const resposta = await fetch("menu.html");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o menu.");
        }

        containerMenu.innerHTML = await resposta.text();

        configurarMenu();
        marcarPaginaAtual();

    } catch (erro) {
        console.error("Erro ao carregar menu:", erro);
    }
}

function configurarMenu() {
    const btnSairMenu = document.getElementById("menuBtnSair");

    if (btnSairMenu) {
        btnSairMenu.addEventListener("click", () => {
            const btnSairOriginal = document.getElementById("btnSair");

            if (btnSairOriginal) {
                btnSairOriginal.click();
                return;
            }

            localStorage.clear();
            window.location.href = "index.html";
        });
    }
}

function marcarPaginaAtual() {
    const paginaAtual = window.location.pathname.split("/").pop();

    document.querySelectorAll(".menu-item").forEach((item) => {
        const destino = item.getAttribute("href");

        if (destino === paginaAtual) {
            item.classList.add("ativo");
        }
    });
}

document.addEventListener("DOMContentLoaded", carregarMenu);