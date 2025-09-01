// app.js (versión final con diseño reactivo y UX extra)
(function () {
  const $ = (sel) => document.querySelector(sel);

  // Sliders y numéricos
  const r = $("#r"), g = $("#g"), b = $("#b");
  const rNum = $("#r-num"), gNum = $("#g-num"), bNum = $("#b-num");

  // Otros controles
  const colorPicker = $("#color-picker");
  const hexInput = $("#hex-input");
  const copyBtn = $("#copy-btn");
  const copyFeedback = $("#copy-feedback");
  const randomBtn = $("#random-btn");
  const resetBtn = $("#reset-btn");

  // UI
  const preview = $("#preview");
  const hexEl = $("#hex-code");
  const rBadge = $("#r-badge"), gBadge = $("#g-badge"), bBadge = $("#b-badge");
  const contrastInfo = $("#contrastInfo");

  // Utilidades
  const clamp255 = (v) => Math.min(255, Math.max(0, Number.isFinite(+v) ? +v : 0));
  const toHex = (v) => Number(v).toString(16).padStart(2, "0").toUpperCase();
  const rgbToHex = (r, g, b) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  const isValidHex6 = (txt) => /^[0-9A-Fa-f]{6}$/.test(txt);
  const hexToRgb = (hex) => {
    if (!hex) return null;
    const clean = hex.startsWith("#") ? hex.slice(1) : hex;
    if (!isValidHex6(clean)) return null;
    return {
      r: parseInt(clean.slice(0,2), 16),
      g: parseInt(clean.slice(2,4), 16),
      b: parseInt(clean.slice(4,6), 16),
    };
  };

  // Actualiza toda la UI y el tema
  function setUI(rv, gv, bv) {
    // Sincroniza sliders
    if (+r.value !== rv) r.value = rv;
    if (+g.value !== gv) g.value = gv;
    if (+b.value !== bv) b.value = bv;

    // Sincroniza numéricos
    if (+rNum.value !== rv) rNum.value = rv;
    if (+gNum.value !== gv) gNum.value = gv;
    if (+bNum.value !== bv) bNum.value = bv;

    // Badges
    rBadge.textContent = rv;
    gBadge.textContent = gv;
    bBadge.textContent = bv;

    // HEX y preview
    const hex = rgbToHex(rv, gv, bv);
    hexEl.textContent = hex;

    // Campo HEX (sin #)
    const hexNoHash = hex.slice(1);
    if (hexInput.value.toUpperCase() !== hexNoHash) {
      hexInput.value = hexNoHash;
      hexInput.classList.remove("is-invalid");
    }

    // Color picker
    if (colorPicker.value.toUpperCase() !== hex) {
      colorPicker.value = hex;
    }

    // Vista previa
    preview.style.background = `rgb(${rv}, ${gv}, ${bv})`;

    // Actualiza acento del tema para que combine
    document.documentElement.style.setProperty("--accent", hex);

    // Contraste (luminancia relativa)
    const luminance = (v) => {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const L = 0.2126*luminance(rv) + 0.7152*luminance(gv) + 0.0722*luminance(bv);
    const contrastWithWhite = 1.05 / (L + 0.05);
    const contrastWithBlack = (L + 0.05) / 0.05;
    const bestText = contrastWithWhite >= contrastWithBlack ? "blanco" : "negro";
    contrastInfo.textContent =
      `Contraste — blanco: ${contrastWithWhite.toFixed(2)}:1 | negro: ${contrastWithBlack.toFixed(2)}:1. Sugerencia: texto ${bestText}.`;
  }

  // Orígenes de cambios
  function fromSliders(){ setUI(clamp255(r.value), clamp255(g.value), clamp255(b.value)); }
  function fromNumbers(){ setUI(clamp255(rNum.value), clamp255(gNum.value), clamp255(bNum.value)); }
  function fromHexInput(){
    const cleaned = (hexInput.value || "").trim().replace(/^#/, "").toUpperCase();
    hexInput.value = cleaned;
    const parsed = hexToRgb(cleaned);
    if (!parsed){
      if (cleaned.length > 0) hexInput.classList.add("is-invalid");
      else hexInput.classList.remove("is-invalid");
      return;
    }
    hexInput.classList.remove("is-invalid");
    setUI(parsed.r, parsed.g, parsed.b);
  }
  function fromColorPicker(){
    const parsed = hexToRgb(colorPicker.value);
    if (parsed) setUI(parsed.r, parsed.g, parsed.b);
  }

  // Extras UX
  function randomColor(){
    const rv = Math.floor(Math.random()*256);
    const gv = Math.floor(Math.random()*256);
    const bv = Math.floor(Math.random()*256);
    setUI(rv, gv, bv);
  }
  function resetColor(){ setUI(0,0,0); }

  // Eventos
  ["input","change"].forEach(e=>{
    r.addEventListener(e, fromSliders);
    g.addEventListener(e, fromSliders);
    b.addEventListener(e, fromSliders);
    colorPicker.addEventListener(e, fromColorPicker);
  });
  ["input","change","blur","keyup","paste"].forEach(e=>{
    rNum.addEventListener(e, fromNumbers);
    gNum.addEventListener(e, fromNumbers);
    bNum.addEventListener(e, fromNumbers);
    hexInput.addEventListener(e, fromHexInput);
  });
  randomBtn.addEventListener("click", randomColor);
  resetBtn.addEventListener("click", resetColor);

  // Copiar HEX mostrado
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(hexEl.textContent.trim());
      copyFeedback.classList.remove("d-none");
      setTimeout(()=>copyFeedback.classList.add("d-none"), 1100);
    } catch {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(hexEl);
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("copy");
      sel.removeAllRanges();
      copyFeedback.classList.remove("d-none");
      setTimeout(()=>copyFeedback.classList.add("d-none"), 1100);
    }
  });

  // Estado inicial
  setUI(0,0,0);
})();
