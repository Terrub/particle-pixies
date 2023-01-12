export class Vector2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static add(v1, v2) {
    return new Vector2d(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1, v2) {
    return new Vector2d(v1.x - v2.x, v1.y - v2.y);
  }

  static distance(v1, v2) {
    return Math.hypot(v2.x - v1.x, v2.y - v1.y);
  }

  scale(modifier) {
    this.x *= modifier;
    this.y *= modifier;
  }
}