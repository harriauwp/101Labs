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

let chainLength = 0;

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dropAA(ev) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text");
  const aa = document.getElementById(id);

  if (chainLength > 0) {
    const bond = document.createElement("div");
    bond.className = "bond";
    ev.target.appendChild(bond);

    const water = document.createElement("div");
    water.className = "water";
    water.innerText = "H₂O released";
    document.getElementById("reactionFeedback").innerHTML = "";
    document.getElementById("reactionFeedback").appendChild(water);
  }

  ev.target.appendChild(aa);
  aa.setAttribute("draggable", "false");
  chainLength++;

  document.getElementById("reactionFeedback").innerText =
    "Peptide bond formed via dehydration reaction.";
}

function createPool() {
  const pool = document.getElementById("aa-pool");

  aminoAcids.forEach((aa, index) => {
    const div = document.createElement("div");
    div.className = `aa ${aa.type}`;
    div.innerText = aa.code;
    div.id = `aa-${index}`;
    div.draggable = true;
    div.ondragstart = drag;
    pool.appendChild(div);
  });
}

createPool();
