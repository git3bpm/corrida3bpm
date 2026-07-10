// ===============================
// RECORTE + AJUSTE DA FOTO
// cropper.js
// ===============================

const photoTransform = { scale: 1, tx: 0, ty: 0, initialScale: 1 };
let cropper = null;

// Remove handler antigo do app.js
photoInput.removeEventListener("change", carregarImagem);

// ---- MODAL DO CROPPER ----
function criarModalCropper() {
    const modal = document.createElement("div");
    modal.id = "cropperModal";
    modal.innerHTML = `
        <div class="cropper-overlay">
            <div class="cropper-box">
                <h3>Recortar Foto</h3>
                <div class="cropper-container">
                    <img id="cropperImage">
                </div>
                <div class="cropper-buttons">
                    <button id="cropperCancel" class="btn-cancel">Cancelar</button>
                    <button id="cropperConfirm" class="btn-confirm">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const style = document.createElement("style");
    style.textContent = `
        #cropperModal { display: none; position: fixed; inset: 0; z-index: 1000; }
        .cropper-overlay { width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; }
        .cropper-box { background: #1a2235; border-radius: 16px; padding: 24px; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; }
        .cropper-box h3 { text-align: center; margin-bottom: 16px; color: white; }
        .cropper-container { width: 500px; max-width: 80vw; height: 400px; max-height: 60vh; overflow: hidden; background: #000; }
        .cropper-container img { max-width: 100%; display: block; }
        .cropper-buttons { display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end; }
        .cropper-buttons button { padding: 10px 24px; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 600; }
        .btn-cancel { background: #555; color: white; }
        .btn-confirm { background: #156dff; color: white; }
    `;
    document.head.appendChild(style);

    document.getElementById("cropperCancel").addEventListener("click", fecharCropper);
    document.getElementById("cropperConfirm").addEventListener("click", confirmarRecorte);
}

criarModalCropper();

function abrirCropper(dataURL) {
    const modal = document.getElementById("cropperModal");
    const img = document.getElementById("cropperImage");
    modal.style.display = "block";
    img.src = dataURL;

    if (cropper) cropper.destroy();

    cropper = new Cropper(img, {
        aspectRatio: CARD.photo.width / CARD.photo.height,
        viewMode: 1,
        dragMode: "move",
        background: false,
        responsive: true,
        autoCropArea: 1,
        guides: false,
        highlight: false,
        cropBoxResizable: true,
    });
}

function fecharCropper() {
    document.getElementById("cropperModal").style.display = "none";
    if (cropper) { cropper.destroy(); cropper = null; }
}

function confirmarRecorte() {
    if (!cropper) return;

    const canvasRecorte = cropper.getCroppedCanvas({
        width: CARD.photo.width * 2,
        height: CARD.photo.height * 2,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
    });

    fecharCropper();

    // Carrega a imagem recortada no card e ativa ajuste
    photo.onload = iniciarAjuste;
    photo.src = canvasRecorte.toDataURL("image/png");
}

// ---- UPLOAD ----
photoInput.addEventListener("change", function (event) {
    const arquivo = event.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        abrirCropper(e.target.result);
    };
    reader.readAsDataURL(arquivo);
});

// ---- AJUSTE NO QUADRO ----
function iniciarAjuste() {
    const frameW = CARD.photo.width;
    const frameH = CARD.photo.height;
    const natW = photo.naturalWidth;
    const natH = photo.naturalHeight;

    photoTransform.initialScale = Math.max(frameW / natW, frameH / natH);
    photoTransform.scale = photoTransform.initialScale;
    photoTransform.tx = 0;
    photoTransform.ty = 0;

    // object-fit cobre o quadro perfeitamente
    photo.style.objectFit = "cover";
    photo.style.width = "100%";
    photo.style.height = "100%";
    photo.style.left = "0px";
    photo.style.top = "0px";
    photo.style.transform = "none";

    ativarControles();
}

function aplicarTransform() {
    const esc = 380 / CARD.width;
    const s = photoTransform.scale * esc; // escala no espaço do preview
    const tx = photoTransform.tx * esc;
    const ty = photoTransform.ty * esc;

    const frameW = CARD.photo.width * esc;
    const frameH = CARD.photo.height * esc;

    photo.style.objectFit = "none";
    photo.style.width = photo.naturalWidth + "px";
    photo.style.height = photo.naturalHeight + "px";
    photo.style.left = "0px";
    photo.style.top = "0px";
    photo.style.transformOrigin = "0 0";

    const scaledW = photo.naturalWidth * s;
    const scaledH = photo.naturalHeight * s;
    const x = (frameW - scaledW) / 2 + tx;
    const y = (frameH - scaledH) / 2 + ty;

    photo.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}

// ---- CONTROLES ----
let isDragging = false;
let lastX = 0, lastY = 0;
let lastTouchDist = 0, lastScale = 1;

function ativarControles() {
    const el = photoFrame;

    el.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);

    el.style.cursor = "grab";
}

function onMouseDown(e) {
    isDragging = true;
    lastX = e.clientX; lastY = e.clientY;
    photoFrame.style.cursor = "grabbing";
}

function onMouseMove(e) {
    if (!isDragging) return;
    const esc = 380 / CARD.width;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // Zona morta: ignorar movimentos abaixo de 4px (evita zoom ao clicar)
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;

    photoTransform.tx += dx / esc;
    photoTransform.ty += dy / esc;
    lastX = e.clientX; lastY = e.clientY;
    aplicarTransform();
}

function onMouseUp() {
    isDragging = false;
    photoFrame.style.cursor = "grab";
}

function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        isDragging = false;
        lastTouchDist = dist(e.touches[0], e.touches[1]);
        lastScale = photoTransform.scale;
    }
}

function onTouchMove(e) {
    e.preventDefault();
    const esc = 380 / CARD.width;
    if (e.touches.length === 1 && isDragging) {
        photoTransform.tx += (e.touches[0].clientX - lastX) / esc;
        photoTransform.ty += (e.touches[0].clientY - lastY) / esc;
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY;
        aplicarTransform();
    } else if (e.touches.length === 2) {
        const distAtual = dist(e.touches[0], e.touches[1]);
        const fator = distAtual / lastTouchDist;
        photoTransform.scale = lastScale * fator;
        // tx/ty mantidos — centralização é recalculada em aplicarTransform
        aplicarTransform();
    }
}

function onTouchEnd(e) {
    if (e.touches.length === 0) isDragging = false;
}

function dist(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function aplicarZoom(fator) {
    photoTransform.scale *= fator;
    aplicarTransform();
}
