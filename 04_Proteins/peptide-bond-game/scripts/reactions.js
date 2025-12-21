const Reactions = {

  dehydrate() {
    const i = State.selectedOH;
    if (i === null) return;

    State.chain[i].reacted = true;

    // Spawn water near bond
    const tray = document.getElementById("waterStorage");
    const w = document.createElement("div");
    w.className = "water";
    w.textContent = "H₂O";
    tray.appendChild(w);

    State.selectedOH = null;
    Renderer.render();
  }
};
