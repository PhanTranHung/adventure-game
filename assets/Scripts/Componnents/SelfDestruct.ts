import { _decorator, Component, Node, CCInteger } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SelfDestruct")
export class SelfDestruct extends Component {
  @property({ type: CCInteger, unit: "s" })
  private delay: number = 1;

  start() {
    this.scheduleOnce(() => {
      this.node.destroy();
    }, this.delay);
  }
}
