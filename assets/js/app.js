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
const cardPreview = document.getElementById("card");

// -------------------------------
// Inicialização
// -------------------------------
window.addEventListener("DOMContentLoaded", () => {

    configurarPosicoes();

    atualizarNome();

    atualizarCategoria();

});

window.addEventListener("resize", configurarPosicoes);

// -------------------------------
// Escala responsiva (largura real do card)
// -------------------------------
function getEsc() {
    return (cardPreview.offsetWidth || 380) / CARD.width;
}

// -------------------------------
// Configura posições usando config.js
// -------------------------------
function configurarPosicoes() {

    const esc = getEsc();

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
// Observação: o carregamento e recorte da foto é tratado inteiramente
// pelo cropper.js (que assume o listener "change" do input assim que
// é carregado). O fluxo antigo baseado em carregarImagem()/ajustarFoto()
// foi removido daqui por estar morto/nunca executado.

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

    const esc = getEsc();
    const largura = maxWidth * esc;

    elemento.textContent = texto.toUpperCase();
    elemento.style.fontSize = (fontSize * esc) + "px";
    elemento.style.whiteSpace = "nowrap";

    let size = fontSize * esc;
    const tamanhoMinimo = 10 * esc;

    while (elemento.scrollWidth > largura + 1 && size > tamanhoMinimo) {
        size--;
        elemento.style.fontSize = size + "px";
    }

}