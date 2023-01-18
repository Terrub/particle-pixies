import { Entity } from "./actors/Entity/entity.js";
import { createMainloop } from "./actors/mainLoop.js";
import { Vector } from "./actors/vector.js";
import { World } from "./actors/World/world.js";
import { CanvasRenderer } from "./connectors/canvasRenderer.js";
import { Utils } from "./utils.js";

////
// Attraction modifier table stuff
//
function randomAttractionMod(oneType, otherType) {
  return Math.random() * 2 - 1;
}

function staticAttractionMod(value) {
  return (oneType, otherType) => {
    return value;
  };
}

function scenarioOneMod(oneType, otherType) {
  const modTable = [
    [
      -0.27292145102543675, 0.21946531638905142, -0.7960980281984935,
      -0.14297534922391897, 0.35281201686035635, 0.29512939356446255,
    ],
    [
      -0.9622027760171474, 0.3141408051808736, -0.4187519787617817,
      0.27374416715583116, -0.8026816992293648, -0.9479532866876181,
    ],
    [
      0.6259383707892843, -0.6104898681630253, -0.1615577837522486,
      0.8673273823728338, 0.16619803111550313, -0.5653042067813372,
    ],
    [
      -0.25640988555002453, 0.4087185532307349, -0.3513956736130037,
      0.6262739221432567, -0.1304133121081268, 0.19826940263590576,
    ],
    [
      0.5705483547998376, 0.736585272647448, -0.9098264903111217,
      0.8533602291431874, -0.673646733668126, 0.5910308504012036,
    ],
    [
      -0.5424609547925856, -0.36037453924287677, 0.817668083964012,
      0.3766806211830387, -0.46632382569840614, 0.8843410064400534,
    ],
  ];

  return modTable[otherType][oneType];
}

function predatorPrayMod(oneType, otherType) {
  const modTable = [
    [
      0.19912726057895025, -0.05876324885275075, -0.46848901634963,
      0.8878650198146096, 0.8427971287660299, 0.3528637210252912,
    ],
    [
      -0.3692536144879641, 0.34210427697876167, 0.36875684957089616,
      0.5904781366033061, 0.025737978448753918, -0.5977357666600809,
    ],
    [
      0.48193789788082864, -0.4382024322185858, -0.9589283474725891,
      -0.9151782314784263, -0.9846825465235907, 0.3459037909343907,
    ],
    [
      -0.6524020416645921, 0.7541395134735551, 0.20432647212344301,
      0.001571888639871677, 0.013647462866646975, -0.019669177971865626,
    ],
    [
      -0.5542567318401237, 0.23626586262504556, -0.1010361126299677,
      0.9438107217518836, -0.9427167060394015, -0.36593087138829183,
    ],
    [
      0.054729418353741455, -0.5862958702624606, -0.7670930193466634,
      -0.12355152416866577, 0.9492625187914734, 0.9661751855382699,
    ],
  ];

  return modTable[otherType][oneType];
}

function populateAttractionModTable(calcMod) {
  for (let i = 0; i < 36; i += 1) {
    const vert = Math.floor(i / 6);
    const hor = i % 6;
    attractionMods[vert][hor] = calcMod(hor, vert);
  }
}

////
// Entity creation stuff
//
function randomEntityPopulator(world, i, w, h) {
  return [
    Math.random() * w,
    Math.random() * h,
    i,
    Math.floor(Math.random() * 6),
  ];
}

function typedLanesFullScreenPopulator(world, i, w, h) {
  const wRandom = Math.random();
  return [wRandom * w, Math.random() * h, i, Math.floor(wRandom * 6)];
}

function typedLanesHalfScreenPopulator(world, i, w, h) {
  const wRandom = Math.random();
  return [
    wRandom * (w * 0.5) + w * 0.25,
    Math.random() * h * 0.5 + h * 0.25,
    i,
    Math.floor(wRandom * 6),
  ];
}

function typedClumpsPopulator(world, i, w, h) {
  const twelfth = w / 12;
  const wRandom = Math.random();

  return [
    wRandom * w * 0.5 + Math.floor(wRandom * 6) * twelfth + twelfth * 0.5,
    Math.random() * h * 0.5 + h * 0.25,
    i,
    Math.floor(wRandom * 6),
  ];
}

function scenarioOnePopulator(world, i, w, h) {
  numParticles = 4;
  attractionMods[Entity.TYPE_ZERO][Entity.TYPE_ZERO] = 1;

  const particleX = [
    100 + world.particleSize * 2,
    100 + world.particleSize * 4,
    100 + world.particleSize * 6,
    100 + world.particleSize * 6,
  ];
  const particleY = [
    100 + world.particleSize * 2,
    100 + world.particleSize * 2,
    100 + world.particleSize,
    100 + world.particleSize * 3,
  ];
  const particleIds = ["A", "B", "C", "D"];

  return [particleX[i], particleY[i], particleIds[i], Entity.TYPE_ZERO];
}

function populateWorldWithParticles(world, populator) {
  for (let i = 0; i < numParticles; i += 1) {
    const [x, y, id, type] = populator(world, i, actualWidth, actualHeight);
    const position = new Vector(x, y);
    const entity = new Entity(id, type);
    world.addEntityAt(entity, position);
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// World configuration
//

const canvas = document.createElement("canvas");
const actualWidth = window.innerWidth;
const actualHeight = window.innerHeight;
canvas.width = actualWidth;
canvas.height = actualHeight;

const renderer = new CanvasRenderer(canvas);
const attractionMods = [
  [1, 0, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1],
];
let numParticles = 512;
let config;

config = { attractionMods: attractionMods, particleSize: 2 };

const world = new World(renderer, config);

/***************************************************************************************************
  Populate Attraction Modifier Table
  -> Pick one
*/
populateAttractionModTable(randomAttractionMod);
// populateAttractionModTable(staticAttractionMod(1));
// populateAttractionModTable(scenarioOneMod);
// populateAttractionModTable(predatorPrayMod);

console.log("Current attraction mods:");
console.table(world.attractionMods);

/***************************************************************************************************
  Populate World entities
  -> Pick one
*/
populateWorldWithParticles(world, randomEntityPopulator);
// populateWorldWithParticles(world, typedLanesFullScreenPopulator);
// populateWorldWithParticles(world, typedLanesHalfScreenPopulator);
// populateWorldWithParticles(world, typedClumpsPopulator);
// populateWorldWithParticles(world, scenarioOnePopulator);

function worldTic(msSinceLastTic) {
  world.resolveTic(msSinceLastTic);
  world.render();
}

const mainLoop = createMainloop(worldTic);

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
  worldTic();
};

const uiPanel = document.createElement("div");
uiPanel.style.position = "absolute";

uiPanel.appendChild(startBtn);
uiPanel.appendChild(stopBtn);
uiPanel.appendChild(nextBtn);

document.body.appendChild(uiPanel);
document.body.appendChild(canvas);

worldTic();

mainLoop.start();
