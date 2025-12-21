/* =========================
   Amino Acid Definitions
   ========================= */

const aminoAcids = [
  { code: "A", type: "nonpolar" },
  { code: "V", type: "nonpolar" },
  { code: "L", type: "nonpolar" },
  { code: "I", type: "nonpolar" },
  { code: "M", type: "nonpolar" },
  { code: "F", type: "nonpolar" },
  { code: "W", type: "nonpolar" },
  { code: "P", type: "nonpolar" },

  { code: "S", type: "polar" },
  { code: "T", type: "polar" },
  { code: "N", type: "polar" },
  { code: "Q", type: "polar" },
  { code: "Y", type: "polar" },
  { code: "C", type: "polar" },

  { code: "D", type: "acidic" },
  { code: "E", type: "acidic" },

  { code: "K", type: "basic" },
  { code: "R", type: "basic" },
  { code: "H", type: "basic" }
];

let residueCount = 0;
let waterReleased = 0;

/* =========================
   Drag & Drop Helpers
   ========================= */

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.dataset.aa);
}

/* =========================
   Core Drop Logic
   ========================= */

function dropAA(ev) {
  ev.preventDefault();
  const aaCode = ev.dataTransfer.getData("text");
  const aa = aminoAcids.find(a => a.code === aaCode);

  const chain = document.getElementById("chain");

  // Add peptide bond if not first residue
  if (residueCount > 0) {
    const bond = document.createElement("div");
    bond.className = "bond";
    chain.appendChild(bond);

    releaseWater();
  }

  // Create backbone unit
  const residue = document.createElement("div");
  residue.className = "residue";

  residue.innerHTML = `
    <div class="backbone">N—Cα—C</div>
    <div class="r-group ${aa.type}">${aa.code}</div>
  `;

  chain.appendChild(residue);
  residueCount++;

  document.getElementById("reactionFeedback").innerText =
    "Peptide bond formed via dehydration reaction.";
}

/* =========================
   Water Animation & Counter
   ========================= */

function releaseWater() {
  waterReleased++;
  document.getElementById("waterCount").innerText = waterReleased;

  const water = document.createElement("div");
  water.className = "water";
  water.innerText = "H₂O";

  document.body.appendChild(water);

  setTimeout(() => water.remove(), 1500);
}

/* =========================
   Pool Creation (Infinite)
   ========================= */

function createPool() {
  const pool = document.getElementById("aa-pool");

  aminoAcids.forEach(aa => {
    const tile = document.createElement("div");
    tile.className = `aa ${aa.type}`;
    tile.innerText = aa.code;
    tile.dataset.aa = aa.code;
    tile.draggable = true;
    tile.ondragstart = drag;
    pool.appendChild(tile);
  });
}

createPool();
