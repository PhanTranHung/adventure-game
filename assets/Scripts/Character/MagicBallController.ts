import { _decorator, Component, Node, CircleCollider2D, Contact2DType, Animation, RigidBody2D, v2, CCFloat } from "cc";
const { ccclass, property } = _decorator;

@ccclass("MagicBallController")
export class MagicBallController extends Component {
  @property(CCFloat)
  private lifeTime: number = 7;

  onLoad() {
    this.node
      .getComponents(CircleCollider2D)
      .find((collider) => collider.tag === 1)
      ?.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
  }

  start() {
    this.scheduleOnce(this.handleExplosion, this.lifeTime);
  }

  onCollision() {
    this.handleExplosion();
  }

  stopMoving() {
    const rigidBody = this.node.getComponent(RigidBody2D);
    if (rigidBody) rigidBody.linearVelocity = v2(0, 0);
  }

  handleExplosion() {
    this.scheduleOnce(() => {
      this.stopMoving();
      this.getComponent(Animation)?.play("magic_fire_ball_explosion");
    });
    this.scheduleOnce(this.destroyAll, 0.7);
  }

  destroyAll() {
    this.node.destroy();
  }
}
