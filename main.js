import { Entity } from "./actors/Entity/entity.js";
import { createMainloop } from "./actors/mainLoop.js";
import { Vector2d } from "./actors/vector2d.js";
import { World } from "./actors/World/world.js";
import { CanvasRenderer } from "./connectors/canvasRenderer.js";
import { Utils } from "./utils.js";

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new CanvasRenderer(canvas);
const attractionMods = [[], [], [], [], [], []];
for (let i = 0; i < 36; i += 1) {
  const vert = Math.floor(i / 6);
  const hor = i % 6;
  attractionMods[vert][hor] = Math.random() * 2 - 1;
  // attractionMods[vert][hor] = -1;
}
const config = { attractionMods: attractionMods };
const world = new World(renderer, config);

for (let i = 0; i < 999; i += 1) {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const position = new Vector2d(x, y);
  const entity = new Entity(i, Math.floor((x + 1) * 3));
  world.addEntityAt(entity, position);
}

const mainLoop = createMainloop(() => {
  world.resolveTic();
  world.render();
});

const startBtn = document.createElement("button");
startBtn.innerText = "start";
startBtn.onclick = () => {
  mainLoop.start();
};

const stopBtn = document.createElement("button");
stopBtn.innerText = "stop";
stopBtn.onclick = () => {
  mainLoop.stop();
};

const nextBtn = document.createElement("button");
nextBtn.innerText = "next";
nextBtn.onclick = () => {
  world.resolveTic();
  world.render();
};

const uiPanel = document.createElement("div");
uiPanel.style.position = "absolute";

uiPanel.appendChild(startBtn);
uiPanel.appendChild(stopBtn);
uiPanel.appendChild(nextBtn);

document.body.appendChild(uiPanel);
document.body.appendChild(canvas);

mainLoop.start();
