import { _decorator, Component, Node, Label, systemEvent, SystemEventType, EventMouse } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Mouse")
export class Mouse extends Component {
  @property(Label)
  private label: Label | null = null;
  onLoad() {
    if (this.label) {
      systemEvent.on(SystemEventType.MOUSE_MOVE, this.onMouseMove, this);
    }
  }

  onMouseMove(e: EventMouse) {
    if (this.label) {
      this.label.string = `x: ${e.getLocationX} \ny: ${e.getLocationY}`;
    }
  }

  start() {
    // [3]
  }

  // update (deltaTime: number) {
  //     // [4]
  // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
