import {
  _decorator,
  Component,
  EventKeyboard,
  CCInteger,
  systemEvent,
  SystemEventType,
  macro,
  Node,
  EventTouch,
  Enum,
  RigidBody2D,
  Vec2,
  BoxCollider2D,
  Contact2DType,
  Collider2D,
  IPhysics2DContact,
  v2,
  PolygonCollider2D,
  Vec3,
  CircleCollider2D,
  Prefab,
  v3,
  instantiate,
} from "cc";
const { ccclass, property } = _decorator;

import * as ccc from "cc";
import { flip } from "../../util/util";

// window.ccc = ccc;

export enum MoveDirection {
  LEFT = -1,
  RIGHT = 1,
  UP = 1,
  DOWN = -1,

  STOP = 0,
  START = 1,
}

export enum CharacterEvents {
  START_MOVING = "startmoving",
  STOP_MOVING = "stopmoving",
  START_JUMPING = "startjumping",
  END_JUMPING = "endjumping",
}

@ccclass("CharacterController")
export class CharacterController extends Component {
  static CharacterEvents = CharacterEvents;
  static XDirection = MoveDirection;

  @property({ type: CCInteger, tooltip: "Distance moved per second" })
  public moveXSpeed: number = 10;
  @property({ type: CCInteger })
  public jumpHeight: number = 10;
  @property(Prefab)
  private bullet: Prefab | null = null;

  private moveDirection = v2(1, 0);
  private movingState = v2(0, 0);
  private rigidBody: RigidBody2D | null = null;
  private footCollider: CircleCollider2D | null = null;

  onLoad() {
    this.moveDirection = v2(1, 0);
    this.movingState = v2(0, 0);
    this.rigidBody = this.node.getComponent(RigidBody2D);
    this.footCollider = this.node.getComponent(CircleCollider2D);

    if (this.footCollider) {
      this.footCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
  }

  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    // console.log("Other collider group", otherCollider.group);

    this.endJumping();
  }

  onKeyDown(e: EventKeyboard) {
    // console.log("keydown", e.keyCode);

    switch (e.keyCode) {
      case macro.KEY.a:
      case macro.KEY.left:
        this.startMoving(MoveDirection.LEFT);
        break;
      case macro.KEY.d:
      case macro.KEY.right:
        this.startMoving(MoveDirection.RIGHT);
        break;

      case macro.KEY.f:
        this.scheduleOnce(() => this.handleAttack());
        break;

      case macro.KEY.w:
      case macro.KEY.up:
        this.startJumping();
        break;
    }
  }

  onKeyUp(e: EventKeyboard) {
    // console.log("keyup", e.keyCode);

    switch (e.keyCode) {
      case macro.KEY.a:
      case macro.KEY.left:
      case macro.KEY.d:
      case macro.KEY.right:
        if (this.movingState.x) this.stopMoving();
        break;

      case macro.KEY.w:
      case macro.KEY.up:
        break;
    }
  }

  startJumping(force: number = this.jumpHeight) {
    if (!this.moveDirection.y) {
      this.moveDirection.y = MoveDirection.UP;
      this.movingState.y = MoveDirection.UP;

      if (this.rigidBody) {
        const linearVelocity = this.rigidBody.linearVelocity;
        linearVelocity.y = force;
        this.rigidBody.linearVelocity = linearVelocity;
      }
      this.node.emit(CharacterEvents.START_JUMPING);
    }
  }

  endJumping() {
    this.moveDirection.y = MoveDirection.STOP;
    this.movingState.y = MoveDirection.STOP;
    this.node.emit(CharacterEvents.END_JUMPING);
  }

  stopMoving() {
    // this.moveDirection.x = MoveDirection.STOP;
    this.movingState.x = MoveDirection.STOP;
    this.node.emit(CharacterEvents.STOP_MOVING);
  }

  startMoving(direction: MoveDirection.LEFT | MoveDirection.RIGHT) {
    if (!this.movingState.x) {
      this.node.emit(CharacterEvents.START_MOVING, direction);

      this.movingState.x = MoveDirection.START;

      if (this.moveDirection.x !== direction) {
        this.moveDirection.x = direction;
        flip(this.node, direction);
      }
    }
  }

  update(dt: number) {
    this.handleMove(dt);
  }

  handleMove(dt: number) {
    if (this.movingState.x) {
      if (this.rigidBody) {
        const linearVelocity = this.rigidBody.linearVelocity;
        linearVelocity.x = this.moveXSpeed * this.moveDirection.x;
        this.rigidBody.linearVelocity = linearVelocity;
      }
    }

    // console.log(position, this.node.getComponent(UITransform)?.contentSize);
  }

  handleAttack() {
    if (this.bullet) {
      const bullet = ccc.instantiate(this.bullet);
      bullet.parent = this.node.parent;
      bullet.setPosition(this.node.getPosition());

      const bulletRigidBody = bullet.getComponent(RigidBody2D);
      if (bulletRigidBody) {
        bulletRigidBody.linearVelocity = bulletRigidBody.linearVelocity.multiply(this.moveDirection);
      }
    }
  }
}
