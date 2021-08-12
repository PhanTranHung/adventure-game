import {
  _decorator,
  Component,
  Node,
  Contact2DType,
  CircleCollider2D,
  BoxCollider2D,
  Collider2D,
  IPhysics2DContact,
  Animation,
  CCInteger,
  Vec2,
  RigidBody2D,
  v2,
  Prefab,
  instantiate,
  v3,
  macro,
} from "cc";
import { toV2 } from "../util/math";
import { flip, throttle } from "../util/util";
const { ccclass, property } = _decorator;

@ccclass("BatController")
export class BatController extends Component {
  @property({ type: CCInteger })
  public attackTime: number = 5000;

  @property({ type: CCInteger })
  public alarmSensorRange: number = 400;

  @property({ type: CCInteger })
  public attackRange: number = 900;

  @property({ type: Prefab })
  public bulletPrefab: Prefab = null!;

  private animationNode: Node | null = null;
  private sensor: CircleCollider2D | null = null;
  private flyingBody: BoxCollider2D | null = null;
  private targets: Set<Node> = new Set();
  private shoot: Function = Function;
  private isWokedUp: Boolean = false;

  onLoad() {
    this.animationNode = this.node.children[0];
    this.sensor = this.node.getComponent(CircleCollider2D);
    this.flyingBody = this.node.getComponent(BoxCollider2D);

    if (this.sensor) {
      this.sensor.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.sensor.on(Contact2DType.END_CONTACT, this.onEndContact, this);
      this.sensor.radius = this.alarmSensorRange;
    }

    if (this.flyingBody) {
      this.flyingBody.enabled = false;
    }
  }

  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (this.isWokedUp) {
    } else {
      this.isWokedUp = true;
      if (this.animationNode) this.animationNode.getComponent(Animation)?.play();
      this.scheduleOnce(() => {
        if (this.flyingBody) {
          this.flyingBody.enabled = true;
          this.flyingBody.apply();
        }
        if (this.sensor) {
          this.sensor.radius = this.attackRange;
          this.sensor.apply();
        }
      });
      this.shoot = throttle(this.handleShoot, this.attackTime, 2000);
      this.schedule(this.watchTarget, 0.1, macro.REPEAT_FOREVER);
    }
    if (otherCollider.node.name == "Character" && !this.targets.has(otherCollider.node)) this.targets.add(otherCollider.node);
    // console.log("targets: ", this.targets.size, this.targets);
  }

  onEndContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    this.targets.delete(otherCollider.node);
    // console.log("targets: ", this.targets.size, this.targets);
  }

  handleShoot = (target?: Node) => {
    // console.log("shoooooooooooooooooooooot", this.targets.values());
    if (this.targets.size <= 0) return;

    if (!target) target = <Node>this.targets.values().next().value;

    const targetPosition = toV2(target.position);
    const currentPosition = toV2(this.node.getPosition());
    const targetDirection = targetPosition.subtract(currentPosition).normalize().multiplyScalar(6);

    const bulletNode = instantiate(this.bulletPrefab);
    bulletNode.parent = this.node.parent;
    bulletNode.setPosition(this.node.getPosition());
    const bulletRigidBody = bulletNode.getComponent(RigidBody2D);
    if (bulletRigidBody) bulletRigidBody.linearVelocity = targetDirection;
  };

  watchTarget() {
    if (this.targets.size > 0) {
      const target = <Node>this.targets.values().next().value;
      const targetPosition = target.getPosition();
      const flipDirection = targetPosition.subtract(this.node.getPosition()).x < 0 ? -1 : 1;
      flip(this.node, flipDirection);
    }
  }

  update(dt: number) {
    if (this.targets.size > 0) {
      this.shoot();
    }
  }
}
