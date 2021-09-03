import { _decorator, Component, Node, UITransform, v2, Vec2 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("CameraController")
export class CameraController extends Component {
  @property(Node)
  private target: Node = null!;
  @property(UITransform)
  private mapSize: UITransform = null!;

  private followTarget: Boolean = true;
  private limitBoxHalfSize: Vec2 = v2(1, 1);

  public setFollowTarget(shouldFollow: Boolean = true) {
    this.followTarget = shouldFollow;
  }

  onLoad() {
    this.calculateLimitBox();
  }

  calculateLimitBox() {}

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
