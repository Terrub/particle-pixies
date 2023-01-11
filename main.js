import { Entity } from "./actors/Entity/entity.js";
import { World } from "./actors/World/world.js";
import { CanvasRenderer } from "./connectors/canvasRenderer.js";

const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const renderer = new CanvasRenderer(canvas);
const world = new World(renderer);
const entity = new Entity(1);
const position = { x: 0.5, y: 0.5 };

world.addEntityAt(entity, position);
world.render();
