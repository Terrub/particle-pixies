export class CanvasRenderer {
  canvas;

  glib;

  constructor(canvas) {
    this.canvas = canvas;
    this.glib = canvas.getContext("2d");
  }

  get width() {
    return this.canvas.clientWidth;
  }

  get height() {
    return this.canvas.clientHeight;
  }

  get halfWidth() {
    return this.canvas.clientWidth * 0.5;
  }

  get halfHeight() {
    return this.canvas.clientHeight * 0.5;
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
    this.glib.arc(
      this.halfWidth + x * this.halfWidth,
      this.halfHeight + y * this.halfHeight,
      r,
      0,
      2 * Math.PI
    );
    this.glib.fill();
  };

  clear() {
    this.glib.clearRect(0, 0, this.width, this.height);
  }
}
