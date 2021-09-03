import {
  _decorator,
  Component,
  Node,
  CircleCollider2D,
  Contact2DType,
  BoxCollider2D,
  Collider2D,
  IPhysics2DContact,
  Animation,
  RigidBody2D,
  v2,
  systemEvent,
} from "cc";
import { CustomEventType } from "../util/systemCustomEvents";
const { ccclass, property } = _decorator;

@ccclass("BulletController")
export class BulletController extends Component {
  onLoad() {
    this.node.getComponent(CircleCollider2D)?.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
  }

  start() {
    this.scheduleOnce(this.handleExplosion, 7);
  }

  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (otherCollider.node.name == "Character") {
      systemEvent.emit(CustomEventType.CHARACTER_TAKE_DAMAGE, { damage: 3 });
    }
    this.handleExplosion();
  }

  handleExplosion() {
    this.scheduleOnce(() => {
      const rigidBody = this.node.getComponent(RigidBody2D);
      if (rigidBody) rigidBody.linearVelocity = v2(0, 0);
      this.node.getComponent(Animation)?.play();
    });
    this.scheduleOnce(() => {
      this.node.destroy();
    }, 1);
  }
}
