const Renderer = {

  render() {
    const stage = document.getElementById("stage");
    stage.innerHTML = "";

    State.chain.forEach((aa, i) => {
      const div = document.createElement("div");
      div.className = "aa";

      const reacted = aa.reacted;

      div.innerHTML = `
      <svg viewBox="0 0 200 240">

        <!-- Nitrogen -->
        <text x="30" y="140" class="atom">N</text>
        ${reacted && i > 0 ? "" : `<text x="30" y="120" class="atom">H</text>`}

        <!-- Alpha carbon -->
        <line x1="45" y1="140" x2="75" y2="125" class="bond"/>
        <text x="80" y="140" class="atom">C</text>

        <!-- R group -->
        <line x1="80" y1="140" x2="80" y2="90" class="bond"/>
        <text x="70" y="80" class="atom">${aa.r}</text>

        <!-- Carbonyl -->
        <line x1="95" y1="140" x2="125" y2="140" class="bond"/>
        <text x="130" y="140" class="atom">C</text>
        <line x1="135" y1="135" x2="150" y2="120" class="bond"/>
        <line x1="138" y1="140" x2="153" y2="125" class="bond"/>
        <text x="155" y="120" class="atom">O</text>

        ${reacted ? "" : `
          <text x="155" y="165" class="atom clickable"
            onclick="Game.selectOH(${i})">OH</text>
        `}

        ${i > 0 && State.chain[i-1].reacted ? `
          <line x1="15" y1="140" x2="30" y2="140" class="peptide"/>
        ` : ""}

      </svg>
      `;
      stage.appendChild(div);
    });
  }
};
