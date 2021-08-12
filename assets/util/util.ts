import { Node } from "cc";

export const throttle = (callback: Function, wait: number, delay: number = 0): Function => {
  let lastTime = 0;
  if (delay > 0) lastTime = Date.now() + delay - wait;
  return function (...params: any[]) {
    let now = Date.now();
    if (now - lastTime >= wait) {
      callback(...params);
      lastTime = now;
    }
  };
};

export const flip = (node: Node, x = 1, y = 1, z = 1): void => {
  const scale = node.getScale();
  scale.x = Math.abs(scale.x);
  scale.y = Math.abs(scale.y);
  scale.z = Math.abs(scale.z);
  scale.multiply3f(x, y, z);
  // math
  node.setScale(scale);
};
