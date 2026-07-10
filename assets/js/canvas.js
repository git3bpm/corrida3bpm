// ===============================
// CANVAS - Renderização do Card
// canvas.js
// ===============================

const downloadButton = document.getElementById("downloadButton");
const bgImage = document.getElementById("background");

// -------------------------------
// Gerar Card via Canvas
// -------------------------------
downloadButton.addEventListener("click", gerarCard);

async function gerarCard() {
    try {
        const nome = nameInput.value.trim();
        const categoria = categoryInput.value;

        if (!nome) {
            nameInput.focus();
            nameInput.style.outline = "2px solid #ff4444";
            setTimeout(() => { nameInput.style.outline = ""; }, 2000);
            return;
        }

        if (!photo.src || photo.naturalWidth === 0) {
            uploadArea.style.outline = "2px solid #ff4444";
            uploadArea.style.boxShadow = "0 0 10px rgba(255,68,68,0.5)";
            setTimeout(() => {
                uploadArea.style.outline = "";
                uploadArea.style.boxShadow = "";
            }, 2000);
            return;
        }

        if (window.location.protocol === "file:") {
            alert("O gerador de cards não funciona abrindo o arquivo diretamente no navegador.\n\nUse um servidor local (ex: npx serve) ou faça deploy no GitHub Pages.");
            return;
        }

        if (!bgImage.complete || bgImage.naturalWidth === 0) {
            alert("Imagem de fundo não carregada.");
            return;
        }

        downloadButton.disabled = true;
        downloadButton.textContent = "Gerando...";

        // Aguarda a fonte carregar (com timeout)
        if (document.fonts && document.fonts.ready) {
            await Promise.race([
                document.fonts.ready,
                new Promise(r => setTimeout(r, 3000))
            ]);
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = bgImage.naturalWidth;
        canvas.height = bgImage.naturalHeight;

        // 1) Desenha foto (por trás) com ajuste do usuário
        const frameX = CARD.photo.left;
        const frameY = CARD.photo.top;
        const frameW = CARD.photo.width;
        const frameH = CARD.photo.height;

        const temAjuste = photoTransform && photoTransform.initialScale > 0;

        if (photo.src && photo.complete && photo.naturalWidth > 0 && temAjuste) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(frameX, frameY, frameW, frameH);
            ctx.clip();

            const s = photoTransform.scale;
            const srcX = -photoTransform.tx / s;
            const srcY = -photoTransform.ty / s;
            const srcW = frameW / s;
            const srcH = frameH / s;

            ctx.drawImage(photo, srcX, srcY, srcW, srcH, frameX, frameY, frameW, frameH);
            ctx.restore();
        }

        // 2) Preenche área de recorte antiga do card (para não vazar transparência)
        const oldPhotoLeft = 71, oldPhotoTop = 381, oldPhotoW = 938, oldPhotoH = 1194;
        ctx.fillStyle = "#14101a";
        ctx.fillRect(oldPhotoLeft, oldPhotoTop, oldPhotoW, oldPhotoH);

        // 3) Desenha moldura por cima
        ctx.drawImage(bgImage, 0, 0);

        // 3) Desenha nome
        desenharTextoAuto(ctx, nome.toUpperCase(), CARD.name.left, CARD.name.top, CARD.name.width, CARD.name.size, "white", `italic bold`, `HemiHead, "Segoe UI", Arial, sans-serif`);

        // 4) Desenha categoria
        desenharTextoAuto(ctx, categoria.toUpperCase(), CARD.category.left, CARD.category.top, CARD.category.width, CARD.category.size, "#ffd54a", `bold`, `HemiHead, "Segoe UI", Arial, sans-serif`);

        // 5) Download
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const nomeArquivo = nome.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-");
        link.download = "card-" + nomeArquivo + ".png";
        link.href = dataURL;
        link.click();

        downloadButton.disabled = false;
        downloadButton.textContent = "Gerar Card";
    } catch (err) {
        console.error("Erro ao gerar card:", err);
        alert("Erro ao gerar card: " + err.message);
        downloadButton.disabled = false;
        downloadButton.textContent = "Gerar Card";
    }
}

// -------------------------------
// Auto-fit: centraliza e ajusta tamanho no canvas
// -------------------------------
function desenharTextoAuto(ctx, texto, centerX, top, maxWidth, fontSize, cor, weight, fontFamily) {

    let size = fontSize;
    ctx.save();
    ctx.fillStyle = cor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.font = `${weight} ${size}px ${fontFamily}`;
    let largura = ctx.measureText(texto).width;

    while (largura > maxWidth && size > 10) {
        size--;
        ctx.font = `${weight} ${size}px ${fontFamily}`;
        largura = ctx.measureText(texto).width;
    }

    ctx.fillText(texto, centerX, top);
    ctx.restore();

}
