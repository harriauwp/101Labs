const aminoAcids = [
  { code: "A", type: "nonpolar" }, { code: "V", type: "nonpolar" },
  { code: "L", type: "nonpolar" }, { code: "I", type: "nonpolar" },
  { code: "M", type: "nonpolar" }, { code: "F", type: "nonpolar" },
  { code: "W", type: "nonpolar" }, { code: "P", type: "nonpolar" },

  { code: "S", type: "polar" }, { code: "T", type: "polar" },
  { code: "N", type: "polar" }, { code: "Q", type: "polar" },
  { code: "Y", type: "polar" }, { code: "C", type: "polar" },

  { code: "D", type: "acidic" }, { code: "E", type: "acidic" },

  { code: "K", type: "basic" }, { code: "R", type: "basic" },
  { code: "H", type: "basic" }
];

let residueCount = 0;
let waterCount = 0;

function allowDrop(e) { e.preventDefault(); }
function drag(e) { e.dataTransfer.setData("aa", e.target.dataset.code); }

function dropAA(e) {
  e.preventDefault();
  const code = e.dataTransfer.getData("aa");
  const aa = aminoAcids.find(a => a.code === code);

  const chain = document.getElementById("chain");

  if (residueCount > 0) releaseWater();

  const res = document.createElement("div");
  res.className = "residue";

  const nhText = residueCount === 0 ? "NH₂" : "NH";

  res.innerHTML = `
    <div class="atom N">${nhText}</div>
    <div class="atom Ca">Cα</div>
    <div class="atom C">C</div>
    <div class="atom O">O</div>

    <div class="double one"></div>
    <div class="double two"></div>

    <div class="bond v NCa"></div>
    <div class="bond v CaC"></div>
    <div class="bond h R"></div>
    <div class="bond h Ha"></div>

    <div class="atom R ${aa.type}">${aa.code}</div>
    <div class="atom Ha">H</div>
  `;

  chain.appendChild(res);
  residueCount++;
}

function releaseWater() {
  waterCount++;
  document.getElementById("waterCount").innerText = waterCount;

  const water = document.createElement("div");
  water.className = "water";
  water.innerText = "H₂O";
  document.getElementById("waterPool").appendChild(water);
}

function createPool() {
  const pool = document.getElementById("aa-pool");
  aminoAcids.forEach(aa => {
    const d = document.createElement("div");
    d.className = `aa ${aa.type}`;
    d.innerText = aa.code;
    d.dataset.code = aa.code;
    d.draggable = true;
    d.ondragstart = drag;
    pool.appendChild(d);
  });
}

createPool();
