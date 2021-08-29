import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
  @property(Node)
  private target: Node = null!;

  private followTarget: Boolean = true;

  public setFollowTarget(shouldFollow: Boolean = true) {
    this.followTarget = shouldFollow;
  }

  update() {
    if (this.followTarget) {
      const targetPosition = this.target.getWorldPosition();
      const currentPosition = this.node.getPosition();
      targetPosition.z = currentPosition.z; // keep camera do not change z

      const nextPosition = currentPosition.lerp(targetPosition, 0.5);
      this.node.setPosition(nextPosition);
    }
  }
}
