// main.js
// Purpose: application entry point + safe initialization
// This file MUST exist and MUST run after game.js

(function () {
  "use strict";

  // Hard fail if Game is not present
  if (typeof Game === "undefined") {
    console.error("Game object not found. game.js did not load.");
    return;
  }

  // Initialize after DOM is fully ready
  window.addEventListener("DOMContentLoaded", () => {

    // Ensure required DOM nodes exist
    const stage = document.getElementById("stage");
    const rxnBtn = document.getElementById("rxnBtn");

    if (!stage || !rxnBtn) {
      console.error("Required DOM elements missing.");
      return;
    }

    // Hide reaction button initially
    rxnBtn.style.display = "none";

    // Force initial render (empty lab state)
    if (typeof Game.render === "function") {
      Game.render();
    }

    console.log("Peptide Bond Builder initialized successfully.");
  });

})();
