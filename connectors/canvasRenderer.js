export class CanvasRenderer {
  canvas;

  glib;

  width;

  height;

  constructor(canvas) {
    this.canvas = canvas;
    this.glib = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
  }

  // drawPixel(x, y, color) {
  //   this.glib.fillStyle = color;
  //   this.glib.fillRect(x, y, 1, 1);
  // }

  // drawRect(x, y, x2, y2, color) {
  //   this.glib.fillStyle = color;
  //   this.glib.fillRect(x, y, x2, y2);
  // }

  drawCircle = function (x, y, r, color) {
    this.glib.fillStyle = color;
    this.glib.beginPath();
    this.glib.arc(x, y, r, 0, 2 * Math.PI);
    this.glib.fill();
  };

  clear() {
    this.glib.clearRect(0, 0, this.width, this.height);
  }
}
