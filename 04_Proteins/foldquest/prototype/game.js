let energy = 50;
let sequence = "";
let hBondsOn = false;

// Amino acid categories
const hydrophobic = ["A", "V", "L", "I", "M", "F", "W"];
const charged = ["D", "E", "K", "R", "H"];
const cysteine = "C";

function updateEnergy(amount) {
  energy += amount;
  energy = Math.max(0, Math.min(100, energy));

  document.getElementById("energyValue").innerText = `Energy: ${energy}`;
  document.getElementById("energyFill").style.width = energy + "%";

  if (energy < 30) {
    document.getElementById("stabilityMessage").innerText =
      "✅ Protein is stable.";
  } else if (energy < 70) {
    document.getElementById("stabilityMessage").innerText =
      "⚠️ Protein is partially stable.";
  } else {
    document.getElementById("stabilityMessage").innerText =
      "❌ Protein is unstable.";
  }
}

function buildSequence() {
  sequence = document.getElementById("sequence").value.toUpperCase();
  if (sequence.length < 5) {
    document.getElementById("sequenceFeedback").innerText =
      "Sequence too short to fold meaningfully.";
    return;
  }

  document.getElementById("sequenceFeedback").innerText =
    "Peptide bonds formed via dehydration reactions.";
  updateEnergy(0);
}

function toggleHBonds() {
  if (!sequence) return;

  hBondsOn = !hBondsOn;

  if (hBondsOn) {
    document.getElementById("secondaryFeedback").innerText =
      "Hydrogen bonds stabilize secondary structure (α-helices / β-sheets).";
    updateEnergy(-15);
  } else {
    document.getElementById("secondaryFeedback").innerText =
      "Hydrogen bonds removed. Secondary structure destabilized.";
    updateEnergy(15);
  }
}

function applyHydrophobicCollapse() {
  if (!sequence) return;

  let exposedHydrophobic = 0;
  for (let aa of sequence) {
    if (hydrophobic.includes(aa)) exposedHydrophobic++;
  }

  if (exposedHydrophobic > 2) {
    document.getElementById("tertiaryFeedback").innerText =
      "Hydrophobic residues buried in the core. Energy decreases.";
    updateEnergy(-20);
  } else {
    document.getElementById("tertiaryFeedback").innerText =
      "Few hydrophobic residues present. Minimal stabilization.";
    updateEnergy(-5);
  }
}

function formDisulfide() {
  if (!sequence.includes(cysteine)) {
    document.getElementById("tertiaryFeedback").innerText =
      "No cysteines available for disulfide bonds.";
    return;
  }

  document.getElementById("tertiaryFeedback").innerText =
    "Disulfide bond formed between cysteines. Tertiary structure stabilized.";
  updateEnergy(-10);
}
