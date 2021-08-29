import {
  _decorator,
  Component,
  Node,
  CircleCollider2D,
  Contact2DType,
  Animation,
  RigidBody2D,
  v2,
  CCFloat,
  Collider2D,
  IPhysics2DContact,
  NodePool,
  RigidBody,
  Vec2,
  systemEvent,
} from "cc";
import { PhysicGroups } from "../utils/physic";
import { CharacterController } from "./CharacterController";
const { ccclass, property } = _decorator;

@ccclass("MagicBallController")
export class MagicBallController extends Component {
  @property(CCFloat)
  private lifeTime: number = 7;
  @property(Vec2)
  private bulletSpeed: Vec2 = v2(5, 0);

  private rigidBody: RigidBody2D | null = null!;
  private body: CircleCollider2D | null = null!;

  private manager: NodePool | null = null;

  onLoad() {
    this.body = this.node.getComponents(CircleCollider2D).find((collider) => collider.tag === 1) || null;
    this.rigidBody = this.node.getComponent(RigidBody2D);

    if (!this.rigidBody) throw "Cannot find RigidBody component";
    if (!this.body) throw "Cannot find body of this node";

    this.init();
  }

  start() {
    this.scheduleOnce(this.handleExplosion, this.lifeTime);
  }

  init() {
    this.body?.on(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    this.body?.apply();

    if (this.rigidBody) this.rigidBody.linearVelocity = this.bulletSpeed.clone();
    this.getComponent(Animation)?.play();
  }

  onCollision(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    // console.log("MagicBall: other collider group", otherCollider.group);
    this.node.getComponents(Collider2D).forEach((collider) => collider.enabled && (collider.enabled = false));
    if (otherCollider.group == PhysicGroups.ENEMY) {
      // console.log("MagicBall: target is enemy");
      otherCollider.scheduleOnce(() => otherCollider.node.destroy());
    }
    this.handleExplosion();
  }

  stopMoving() {
    if (this.rigidBody) this.rigidBody.linearVelocity = v2(0, 0);
  }

  handleExplosion() {
    this.scheduleOnce(() => {
      this.stopMoving();
      this.getComponent(Animation)?.play("magic_fire_ball_explosion");
    });
    this.scheduleOnce(this.selfDisable, 0.7);
  }

  selfDisable() {
    this.node.active = false;
    this.manager?.put(this.node);
  }

  reuse(args: any[]) {
    this.manager = <NodePool>args[0];
    this.init();
    this.scheduleOnce(this.handleExplosion, this.lifeTime);
    this.node.active = true;
  }

  unuse() {
    this.node.active = false;
    this.body?.off(Contact2DType.BEGIN_CONTACT, this.onCollision, this);
    this.unscheduleAllCallbacks();
    this.getComponent(Animation)?.stop();
  }
}
