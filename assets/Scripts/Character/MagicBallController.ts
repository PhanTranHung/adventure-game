import { _decorator, Component, Node, CircleCollider2D, Contact2DType, Animation } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MagicBallController")
export class MagicBallController extends Component {
  onLoad() {
    this.node
      .getComponents(CircleCollider2D)
      .find((collider) => (collider.tag = 1))
      ?.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
  }

  onCollision() {
    this.scheduleOnce(() => {
      this.getComponent(Animation)?.play("magic_fire_ball_explosion");
    });
    this.scheduleOnce(this.destroyAll, 1);
  }

  destroyAll() {
    this.node.destroy();
  }
}
