// Thanks https://radzion.com/blog/linear-algebra/vectors

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static getShortestTorusDeltaVector(v1, v2, w, h) {
    const cvx = v2.x - v1.x;
    const cvy = v2.y - v1.y;
    const tvx = ((v2.x + w * 0.5) % w) - ((v1.x + w * 0.5) % w);
    const tvy = ((v2.y + h * 0.5) % h) - ((v1.y + h * 0.5) % h);

    if (cvx * cvx + cvy * cvy > tvx * tvx + tvy * tvy) {
      return new Vector(tvx, tvy);
    }

    return new Vector(cvx, cvy);
  }

  static getWrappedDistance(v1, v2, w, h) {
    const dX = Math.abs(v1.x - v2.x);
    const dY = Math.abs(v1.y - v2.y);
    const lH = Math.min(dX, w - dX);
    const lV = Math.min(dY, h - dY);

    return Math.hypot(lH, lV);
  }

  static add(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  }

  static subtract(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  }

  static scale(vector, value) {
    return new Vector(vector.x * value, vector.y * value);
  }

  add(v2) {
    this.x += v2.x;
    this.y += v2.y;

    return this;
  }

  subtract(v2) {
    this.x -= v2.x;
    this.y -= v2.y;

    return this;
  }

  scale(value) {
    this.x *= value;
    this.y *= value;

    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalise() {
    // Cannot devide by 0
    if (this.x === 0 && this.y === 0) {
      return this;
    }

    return this.scale(1 / this.length());
  }

  limit(value) {
    if (value * value < this.x * this.x + this.y * this.y) {
      this.normalise().scale(value);
    }

    return this;
  }
}
