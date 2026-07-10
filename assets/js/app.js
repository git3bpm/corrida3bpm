// ===============================
// GERADOR DE CARD - 3º BPM
// app.js
// ===============================

// ELEMENTOS
const uploadArea = document.getElementById("uploadArea");
const photoInput = document.getElementById("photoInput");

const photo = document.getElementById("photo");

const nameInput = document.getElementById("nameInput");
const categoryInput = document.getElementById("categoryInput");

const namePreview = document.getElementById("namePreview");
const categoryPreview = document.getElementById("categoryPreview");

const photoFrame = document.getElementById("photoFrame");

// -------------------------------
// Inicialização
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {

    configurarPosicoes();

    atualizarNome();

    atualizarCategoria();

});

// -------------------------------
// Configura posições usando config.js
// -------------------------------
function configurarPosicoes() {

    const esc = 380 / CARD.width;

    // FOTO
    photoFrame.style.left = CARD.photo.left * esc + "px";
    photoFrame.style.top = CARD.photo.top * esc + "px";
    photoFrame.style.width = CARD.photo.width * esc + "px";
    photoFrame.style.height = CARD.photo.height * esc + "px";

    // NOME (centrado)
    const nameCenterX = CARD.name.left * esc;
    const nameW = CARD.name.width * esc;
    namePreview.style.left = (nameCenterX - nameW / 2) + "px";
    namePreview.style.top = CARD.name.top * esc + "px";
    namePreview.style.width = nameW + "px";
    namePreview.style.fontSize = CARD.name.size * esc + "px";

    // CATEGORIA (centrado)
    const catCenterX = CARD.category.left * esc;
    const catW = CARD.category.width * esc;
    categoryPreview.style.left = (catCenterX - catW / 2) + "px";
    categoryPreview.style.top = CARD.category.top * esc + "px";
    categoryPreview.style.width = catW + "px";
    categoryPreview.style.fontSize = CARD.category.size * esc + "px";

}

// -------------------------------
// Clique na área de upload
// -------------------------------
uploadArea.addEventListener("click", () => {

    photoInput.click();

});

// -------------------------------
// Upload da foto
// -------------------------------
photoInput.addEventListener("change", carregarImagem);

function carregarImagem(event) {

    const arquivo = event.target.files[0];

    if (!arquivo)
        return;

    const reader = new FileReader();

    reader.onload = function (e) {

        photo.src = e.target.result;

        ajustarFoto();

    };

    reader.readAsDataURL(arquivo);

}

// -------------------------------
// Ajusta foto dentro da moldura
// -------------------------------
function ajustarFoto() {

    photo.onload = function () {

        const esc = 380 / CARD.width;
        const frameW = CARD.photo.width * esc;
        const frameH = CARD.photo.height * esc;

        const imgW = photo.naturalWidth;
        const imgH = photo.naturalHeight;

        const escala = Math.max(frameW / imgW, frameH / imgH);

        const novaLargura = imgW * escala;
        const novaAltura = imgH * escala;

        photo.style.width = novaLargura + "px";
        photo.style.height = novaAltura + "px";

        photo.style.left = ((frameW - novaLargura) / 2) + "px";
        photo.style.top = ((frameH - novaAltura) / 2) + "px";

    };

}

// -------------------------------
// Nome
// -------------------------------
nameInput.addEventListener("input", atualizarNome);

function atualizarNome() {

    let nome = nameInput.value.trim();

    if (nome === "")
        nome = "NOME DO ATLETA";

    ajustarFontePreview(namePreview, nome, CARD.name.size, CARD.name.width, "italic bold");

}

// -------------------------------
// Categoria
// -------------------------------
categoryInput.addEventListener("change", atualizarCategoria);

function atualizarCategoria() {

    ajustarFontePreview(categoryPreview, categoryInput.value, CARD.category.size, CARD.category.width, "bold");

}

// -------------------------------
// Auto-fit: centraliza e ajusta tamanho no preview
// -------------------------------
function ajustarFontePreview(elemento, texto, fontSize, maxWidth, weight) {

    const esc = 380 / CARD.width;
    const largura = maxWidth * esc;

    elemento.textContent = texto.toUpperCase();
    elemento.style.fontSize = (fontSize * esc) + "px";

    let size = fontSize * esc;
    const wsOriginal = elemento.style.whiteSpace;
    elemento.style.whiteSpace = "nowrap";

    while (elemento.scrollWidth > largura + 1 && size > 6) {
        size--;
        elemento.style.fontSize = size + "px";
    }

    elemento.style.whiteSpace = wsOriginal;

}