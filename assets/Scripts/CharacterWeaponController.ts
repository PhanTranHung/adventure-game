import { _decorator, Component, Node, Vec3, v3 } from "cc";
import { CharacterEvents, MoveDirection } from "./Character/CharacterController";
const { ccclass, property } = _decorator;

@ccclass("CharacterWeaponController")
export class CharacterWeaponController extends Component {
  private originScale = v3(1, 1, 1);
  onLoad() {
    this.node.parent?.on(CharacterEvents.START_MOVING, this.onMoving, this);
    this.originScale = this.node.getScale();
  }

  onMoving(moveDirection: MoveDirection) {
    this.scheduleOnce(() => {
      this.node.setScale(v3(moveDirection, 1, 1).multiply(this.originScale));
    });
  }
}
