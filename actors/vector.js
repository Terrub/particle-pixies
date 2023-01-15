// Thanks https://radzion.com/blog/linear-algebra/vectors

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  static getShortestTorusDeltaVector(v1, v2, w, h) {
    const tV1 = new Vector((v1.x + w * 0.5) % w, (v1.y + h * 0.5) % h);
    const tV2 = new Vector((v2.x + w * 0.5) % w, (v2.y + h * 0.5) % h);

    const cV = Vector.subtract(v2, v1);
    tV2.subtract(tV1);

    return cV.x * cV.x + cV.y * cV.y > tV2.x * tV2.x + tV2.y * tV2.y ? tV2 : cV;
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

  scale(number) {
    this.x *= number;
    this.y *= number;

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
