const Game = (() => {

  const AminoAcids = {
    Glycine: { r: "H", color: "#FFD54F" },
    Alanine: { r: "CH₃", color: "#FFD54F" },
    Cysteine: { r: "CH₂–SH", color: "#81C784" }
  };

  const state = {
    chain: [],
    selectedOH: null,
    selectedH: null
  };

  function render() {
    const stage = document.getElementById("stage");
    stage.innerHTML = "";

    state.chain.forEach((aa, i) => {
      const reacted = aa.reacted;
      const div = document.createElement("div");
      div.className = "aa";

      div.innerHTML = `
<svg viewBox="0 0 240 260">

<!-- Nitrogen -->
<text x="20" y="140" class="atom">N</text>

<!-- H (always retained) -->
<line x1="32" y1="140" x2="50" y2="155" class="bond"/>
<text x="52" y="168" class="atom">H</text>

<!-- Removable H -->
${!reacted ? `
<line x1="32" y1="136" x2="50" y2="120" class="bond"/>
<text x="52" y="118"
  class="atom clickable ${state.selectedH === i ? 'selected' : ''}"
  onclick="Game.selectH(${i})">H</text>
` : ""}

<!-- N → Cα -->
<line x1="40" y1="142" x2="75" y2="128" class="bond"/>

<!-- Alpha carbon -->
<text x="80" y="145" class="atom">C</text>

<!-- Cα → R -->
<line x1="80" y1="145" x2="80" y2="90" class="bond"/>
<text x="60" y="80" class="atom" fill="${aa.color}">${aa.r}</text>

<!-- Cα → H -->
<line x1="85" y1="150" x2="105" y2="175" class="bond"/>
<text x="108" y="188" class="atom">H</text>

<!-- Cα → C -->
<line x1="95" y1="145" x2="130" y2="145" class="bond"/>
<text x="135" y="160" class="atom">C</text>

<!-- C=O -->
<line x1="140" y1="145" x2="165" y2="120" class="bond"/>
<line x1="144" y1="148" x2="169" y2="123" class="bond"/>
<text x="172" y="120" class="atom">O</text>

<!-- OH -->
${!reacted ? `
<line x1="140" y1="148" x2="165" y2="170" class="bond"/>
<text x="168" y="184"
  class="atom clickable ${state.selectedOH === i ? 'selected' : ''}"
  onclick="Game.selectOH(${i})">OH</text>
` : ""}

<!-- Peptide bond -->
${i > 0 && state.chain[i-1].reacted ? `
<line x1="5" y1="142" x2="20" y2="142" class="peptide"/>
` : ""}

</svg>`;

      stage.appendChild(div);
    });
  }

  function addAA(name) {
    state.chain.push({
      name,
      r: AminoAcids[name].r,
      color: AminoAcids[name].color,
      reacted: false
    });
    document.getElementById("hint").textContent =
      "Select OH on left, H on right, then dehydrate.";
    render();
  }

  function selectOH(i) {
    state.selectedOH = i;
    render();
  }

  function selectH(i) {
    state.selectedH = i;
    document.getElementById("rxnBtn").style.display = "block";
    render();
  }

  function dehydrate() {
    const i = state.selectedOH;
    if (i === null || state.selectedH !== i + 1) return;

    state.chain[i].reacted = true;

    const tray = document.getElementById("waterTray");
    const w = document.createElement("div");
    w.className = "water";
    w.textContent = "H₂O";
    tray.appendChild(w);

    state.selectedOH = null;
    state.selectedH = null;
    document.getElementById("rxnBtn").style.display = "none";

    render();
  }

  return {
    addAA,
    selectOH,
    selectH,
    dehydrate
  };

})();

window.onload = () => {
  Game; // force initialization
};
