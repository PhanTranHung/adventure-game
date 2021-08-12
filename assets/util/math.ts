import { v2, Vec2, Vec3 as V3, Vec4 } from "cc";

export class Vec3 extends V3 {
  toV2(): Vec2 {
    return v2(this.x, this.y);
  }
}

export const toV2 = (vec: any) => {
  return v2(vec.x, vec.y);
};
