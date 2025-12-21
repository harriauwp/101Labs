const Game = {

  addAA(name) {
    if (State.chain.length >= 5) return;
    State.chain.push({
      name,
      r: AminoAcids[name].r,
      reacted: false
    });
    document.getElementById("hint").textContent =
      "Select OH, then dehydrate.";
    Renderer.render();
  },

  selectOH(i) {
    State.selectedOH = i;
    document.getElementById("rxnBtn").style.display = "block";
  },

  dehydrate() {
    Reactions.dehydrate();
    document.getElementById("rxnBtn").style.display = "none";
  }
};
