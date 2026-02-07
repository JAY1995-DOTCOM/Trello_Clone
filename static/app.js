document.addEventListener("DOMContentLoaded", () => {

  console.log("APP JS LOADED");

  const columns = document.querySelectorAll(".column");

  let draggedCard = null;

  /* ================= LOAD STATE ================= */

  loadBoard();

  /* ================= DRAG EVENTS ================= */

  document.addEventListener("dragstart", e => {
    if (e.target.classList.contains("card")) {
      draggedCard = e.target;
      draggedCard.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }
  });

  document.addEventListener("dragend", () => {
    if (!draggedCard) return;

    draggedCard.classList.remove("dragging");
    draggedCard = null;

    columns.forEach(col => col.classList.remove("drag-over"));

    saveBoard();
  });

  /* ================= COLUMN EVENTS ================= */

  columns.forEach(column => {

    column.addEventListener("dragover", e => {
      e.preventDefault();
      column.classList.add("drag-over");

      const afterElement = getDragAfterElement(column, e.clientY);
      const dragging = document.querySelector(".dragging");

      if (!dragging) return;

      if (afterElement == null) {
        column.appendChild(dragging);
      } else {
        column.insertBefore(dragging, afterElement);
      }
    });

    column.addEventListener("dragleave", () => {
      column.classList.remove("drag-over");
    });

    column.addEventListener("drop", () => {
      column.classList.remove("drag-over");
      saveBoard();
      flashColumn(column);
    });

  });

  /* ================= HELPERS ================= */

  function getDragAfterElement(column, y) {
    const draggableElements = [
      ...column.querySelectorAll(".card:not(.dragging)")
    ];

    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
          return { offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  /* ================= SAVE / LOAD ================= */

  function saveBoard() {
    const data = {};

    columns.forEach(column => {
      const key = column.dataset.column;
      const cards = [...column.querySelectorAll(".card")].map(
        card => card.textContent
      );

      data[key] = cards;
    });

    localStorage.setItem("trello-board", JSON.stringify(data));
    console.log("Board saved", data);
  }

  function loadBoard() {
    const raw = localStorage.getItem("trello-board");
    if (!raw) return;

    const data = JSON.parse(raw);

    columns.forEach(column => {
      const key = column.dataset.column;
      if (!data[key]) return;

      column.querySelectorAll(".card").forEach(c => c.remove());

      data[key].forEach(text => {
        const card = document.createElement("div");
        card.className = "card";
        card.draggable = true;
        card.textContent = text;

        column.appendChild(card);
      });
    });

    console.log("Board loaded", data);
  }

  /* ================= VISUAL SAVE FEEDBACK ================= */

  function flashColumn(column) {
    column.classList.add("saved");
    setTimeout(() => column.classList.remove("saved"), 350);
  }

});
