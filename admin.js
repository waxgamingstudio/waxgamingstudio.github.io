let gamesData = {
  games: []
};

document.addEventListener("DOMContentLoaded", () => {
  loadGames();

  document
    .getElementById("addGameBtn")
    .addEventListener("click", addGame);

  document
    .getElementById("exportBtn")
    .addEventListener("click", exportJson);
});

async function loadGames() {
  try {
    const response = await fetch("data/games.json");
    gamesData = await response.json();
    renderGames();
  } catch (error) {
    console.error(error);
    alert("Unable to load data/games.json");
  }
}

function renderGames() {
  const container = document.getElementById("gamesList");
  container.innerHTML = "";

  gamesData.games.forEach((game, index) => {
    const div = document.createElement("div");
    div.className = "admin-game";

    div.innerHTML = `
      <h3>Game ${index + 1}</h3>

      <label>Game Title</label>
      <input
        type="text"
        value="${escapeHtml(game.name || "")}"
        onchange="updateField(${index}, 'name', this.value)"
        placeholder="Game Title"
      >

      <label>Game Description</label>
      <textarea
        onchange="updateField(${index}, 'description', this.value)"
        placeholder="Game Description"
      >${escapeHtml(game.description || "")}</textarea>

      <label>App Store Link</label>
      <input
        type="url"
        value="${escapeHtml(game.appStoreUrl || "")}"
        onchange="updateField(${index}, 'appStoreUrl', this.value)"
        placeholder="https://apps.apple.com/..."
      >

      <label>Google Play Link</label>
      <input
        type="url"
        value="${escapeHtml(game.playStoreUrl || "")}"
        onchange="updateField(${index}, 'playStoreUrl', this.value)"
        placeholder="https://play.google.com/..."
      >

      <label>Select Icon</label>

      ${
        game.icon
          ? `<img class="admin-preview" src="${game.icon}" alt="icon">`
          : `<div class="admin-preview"></div>`
      }

      <input
        type="file"
        accept="image/*"
        onchange="uploadIcon(event, ${index})"
      >

      <div class="admin-buttons">
        <button class="btn btn-green" onclick="moveUp(${index})">↑ Move Up</button>
        <button class="btn btn-green" onclick="moveDown(${index})">↓ Move Down</button>
        <button class="btn btn-primary" onclick="duplicateGame(${index})">Duplicate</button>
        <button class="btn btn-primary" onclick="deleteGame(${index})">Delete</button>
      </div>
    `;

    container.appendChild(div);
  });
}

function updateField(index, key, value) {
  gamesData.games[index][key] = value;
}

function addGame() {
  gamesData.games.push({
    id: Date.now().toString(),
    name: "",
    description: "",
    appStoreUrl: "",
    playStoreUrl: "",
    icon: ""
  });

  renderGames();
}

function deleteGame(index) {
  if (!confirm("Delete this game?")) return;

  gamesData.games.splice(index, 1);
  renderGames();
}

function duplicateGame(index) {
  const copy = JSON.parse(JSON.stringify(gamesData.games[index]));
  copy.id = Date.now().toString();

  gamesData.games.push(copy);
  renderGames();
}

function moveUp(index) {
  if (index === 0) return;

  [gamesData.games[index - 1], gamesData.games[index]] =
    [gamesData.games[index], gamesData.games[index - 1]];

  renderGames();
}

function moveDown(index) {
  if (index === gamesData.games.length - 1) return;

  [gamesData.games[index + 1], gamesData.games[index]] =
    [gamesData.games[index], gamesData.games[index + 1]];

  renderGames();
}

function uploadIcon(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    gamesData.games[index].icon = reader.result;
    renderGames();
  };

  reader.readAsDataURL(file);
}

function exportJson() {
  const json = JSON.stringify(gamesData, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "games.json";
  a.click();

  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
