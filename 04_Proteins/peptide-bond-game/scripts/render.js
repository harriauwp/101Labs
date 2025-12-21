const Renderer = {

  draw() {
    const stage = document.getElementById("stage");
    stage.innerHTML = "";

    State.chain.forEach((aa, i) => {
      const div = document.createElement("div");
      div.className = "aa";

      const reacted = aa.reacted;

      div.innerHTML = `
<svg viewBox="0 0 220 240">

<!-- Nitrogen -->
<text x="20" y="140" class="atom">N</text>

<!-- H always retained -->
<line x1="32" y1="140" x2="50" y2="155" class="bond"/>
<text x="52" y="168" class="atom">H</text>

<!-- Removable H -->
${!reacted ? `
<line x1="32" y1="136" x2="50" y2="120" class="bond"/>
<text x="52" y="118"
  class="atom clickable ${State.selectedH === i ? 'selected' : ''}"
  onclick="Game.selectH(${i})">H</text>
` : ""}

<!-- N → Cα -->
<line x1="40" y1="142" x2="70" y2="128" class="bond"/>

<!-- Alpha carbon -->
<text x="75" y="145" class="atom">C</text>

<!-- Cα → R -->
<line x1="75" y1="145" x2="75" y2="95" class="bond"/>
<text x="60" y="85" class="atom" fill="${aa.color}">${aa.r}</text>

<!-- Cα → H -->
<line x1="80" y1="148" x2="100" y2="170" class="bond"/>
<text x="102" y="182" class="atom">H</text>

<!-- Cα → C -->
<line x1="90" y1="145" x2="120" y2="145" class="bond"/>
<text x="125" y="160" class="atom">C</text>

<!-- C=O -->
<line x1="130" y1="145" x2="150" y2="125" class="bond"/>
<line x1="134" y1="148" x2="154" y2="128" class="bond"/>
<text x="156" y="124" class="atom">O</text>

<!-- OH (removed on reaction) -->
${!reacted ? `
<line x1="130" y1="148" x2="150" y2="165" class="bond"/>
<text x="152" y="178"
  class="atom clickable ${State.selectedOH === i ? 'selected' : ''}"
  onclick="Game.selectOH(${i})">OH</text>
` : ""}

<!-- Peptide bond -->
${i > 0 && State.chain[i-1].reacted ? `
<line x1="5" y1="142" x2="20" y2="142" class="peptide"/>
` : ""}

</svg>`;
      stage.appendChild(div);
    });
  }
};
