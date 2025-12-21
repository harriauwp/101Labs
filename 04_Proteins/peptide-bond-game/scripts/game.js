const Game = {

  addAA(name) {
    State.chain.push({
      name,
      r: AminoAcids[name].r,
      color: AminoAcids[name].color,
      reacted: false
    });
    Renderer.draw();
    document.getElementById("hint").textContent =
      "Select OH on left, H on right, then dehydrate.";
  },

  selectOH(i) {
    State.selectedOH = i;
    Renderer.draw();
  },

  selectH(i) {
    State.selectedH = i;
    document.getElementById("rxnBtn").style.display = "block";
    Renderer.draw();
  },

  dehydrate() {
    Reaction.dehydrate();
    document.getElementById("rxnBtn").style.display = "none";
  }
};
