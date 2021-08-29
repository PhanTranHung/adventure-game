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
  PhysicsSystem2D,
  ERaycast2DType,
} from "cc";
import { toV2 } from "../util/math";
import { flip, throttle } from "../util/util";
import { PhysicGroups } from "./utils/physic";
const { ccclass, property } = _decorator;

@ccclass("BatController")
export class BatController extends Component {
  @property({ type: CCInteger })
  public attackTime: number = 2;

  @property({ type: CCInteger })
  public alarmSensorRange: number = 400;

  @property({ type: CCInteger })
  public attackRange: number = 900;

  @property({ type: Prefab })
  public bulletPrefab: Prefab = null!;

  private animationNode: Node | null = null;
  private sensor: CircleCollider2D | null = null;
  private flyingBody: BoxCollider2D | null = null;
  private target: Node | null = null;
  private shoot: Function = Function;
  private isWokedUp: Boolean = false;
  private currentRange = 0;

  onLoad() {
    this.animationNode = this.node.children[0];
    this.sensor = this.node.getComponent(CircleCollider2D);
    this.flyingBody = this.node.getComponent(BoxCollider2D);
    this.target = null;

    if (this.sensor) {
      this.sensor.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.sensor.on(Contact2DType.END_CONTACT, this.onEndContact, this);
      this.sensor.radius = this.alarmSensorRange;
      this.currentRange = this.alarmSensorRange;
    }

    if (this.flyingBody) {
      this.flyingBody.enabled = false;
    }
  }

  //Enemy doesn't attack when the character behide barrier or far away
  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    // console.log("BatController: begin contact ");

    if (this.target == null && otherCollider.node.name == "Character") {
      if (!this.detectBarrier(otherCollider.node)) {
        if (!this.isWokedUp) this.wakeup();
        else {
          this.target = otherCollider.node;
        }
      }
    }
  }

  onEndContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (this.target == otherCollider.node && !this.isInRange(otherCollider.node)) {
      // console.log("BatController: remove target ", otherCollider.node.name);
      this.target = null;
    }
    // console.log("targets: ", this.targets.size, this.targets);
  }

  handleShoot = (target?: Node | null) => {
    // console.log("shoooooooooooooooooooooot", this.targets.values());
    if (!this.target) return;
    target = this.target;

    if (this.detectBarrier(target)) return;

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
    if (this.target) {
      const targetPosition = this.target.getPosition();
      const flipDirection = targetPosition.subtract(this.node.getPosition()).x < 0 ? -1 : 1;
      flip(this.node, flipDirection);
    }
  }

  update(dt: number) {
    if (this.target) {
      this.shoot();
    }
  }

  detectBarrier(node: Node, mask: number = PhysicGroups.GROUND | PhysicGroups.STATIC_OBJECT, type: ERaycast2DType = ERaycast2DType.Closest) {
    const startPoint = toV2(this.node.getWorldPosition());
    const endPoint = toV2(node.getWorldPosition());
    // console.log("BatController: start point", startPoint, " end point ", endPoint, node);

    // I'm not using this code, because it doesn't work for me
    // return PhysicsSystem2D.instance.raycast(startPoint, endPoint, ERaycast2DType.Any, mask);

    return PhysicsSystem2D.instance.raycast(startPoint, endPoint, type).some((res, index) => res.collider.group & mask);
  }

  wakeup() {
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
        this.currentRange = this.attackRange;
      }
    });
    // this.shoot = throttle(this.handleShoot, this.attackTime, 2000);
    this.schedule(this.handleShoot, this.attackTime, macro.REPEAT_FOREVER, 2);
    this.schedule(this.watchTarget, 0.4, macro.REPEAT_FOREVER);
  }

  isInRange(node: Node) {
    const startPoint = toV2(this.node.getWorldPosition());
    const endPoint = toV2(node.getWorldPosition());
    // console.log("BatController: distance to target", Vec2.distance(startPoint, endPoint));
    return Vec2.distance(startPoint, endPoint) <= this.currentRange;
  }
}
