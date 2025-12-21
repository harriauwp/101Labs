const Reaction = {

  dehydrate() {
    const i = State.selectedOH;
    if (i === null || State.selectedH !== i + 1) return;

    State.chain[i].reacted = true;

    const tray = document.getElementById("waterTray");
    const w = document.createElement("div");
    w.className = "water";
    w.textContent = "H₂O";
    tray.appendChild(w);

    State.selectedOH = null;
    State.selectedH = null;

    Renderer.draw();
  }
};
