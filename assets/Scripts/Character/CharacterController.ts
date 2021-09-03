import {
  _decorator,
  Component,
  EventKeyboard,
  CCInteger,
  systemEvent,
  SystemEventType,
  macro,
  Node,
  RigidBody2D,
  BoxCollider2D,
  Contact2DType,
  Collider2D,
  IPhysics2DContact,
  v2,
  Vec3,
  CircleCollider2D,
  Prefab,
  v3,
  instantiate,
  CCFloat,
  NodePool,
} from "cc";
import { CustomDpadEventStatus, CustomEventType } from "../../util/systemCustomEvents";
const { ccclass, property } = _decorator;

// import * as ccc from "cc";
import { flip } from "../../util/util";
import { MagicBallController } from "./MagicBallController";

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
  private bullet: Prefab = null!;
  @property({ type: CCFloat })
  private attackSpeed: number = 1;
  @property(Vec3)
  private revivlePosition: Vec3 = v3(720.137, -19.032, 0);

  private moveDirection = v2(1, 0);
  private movingState = v2(0, 0);
  private rigidBody: RigidBody2D | null = null;
  private footCollider: CircleCollider2D | null = null;
  private isShootable = false;
  private numOfBulletToGenerate = 7;
  private bulletPool = new NodePool(MagicBallController);

  onLoad() {
    this.moveDirection = v2(1, 0);
    this.movingState = v2(0, 0);
    this.rigidBody = this.node.getComponent(RigidBody2D);
    this.footCollider = this.node.getComponent(CircleCollider2D);

    if (!this.bullet) throw "Bullet is null";
    if (!this.footCollider) throw "Cannot find footer collider component";

    this.footCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

    systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
    systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_JUMP, this.onJumpDpad, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_ATTACK, this.onAttackDpad, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_MOVE_LEFT, this.onLeftDpad, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_MOVE_RIGHT, this.onRightDpad, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_REVIVLE, this.onRevivleDpad, this);
    // @ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_DIE, this.onDie, this);

    for (let i = 0; i < this.numOfBulletToGenerate; i++) this.bulletPool.put(instantiate(this.bullet));
  }

  start() {
    this.isShootable = true;
  }

  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    // console.log("Other collider group", otherCollider.group);
    this.endJumping();
  }

  onJumpDpad(e: any) {
    switch (e.type) {
      case CustomDpadEventStatus.START:
        this.startJumping();
        break;
    }
  }
  onAttackDpad(e: any) {
    switch (e.type) {
      case CustomDpadEventStatus.START:
        this.scheduleOnce(() => this.handleAttack());
        break;
    }
  }
  onLeftDpad(e: any) {
    switch (e.type) {
      case CustomDpadEventStatus.START:
        this.startMoving(MoveDirection.LEFT);
        break;

      case CustomDpadEventStatus.END:
        if (this.movingState.x) this.stopMoving();
        break;
    }
  }
  onRightDpad(e: any) {
    switch (e.type) {
      case CustomDpadEventStatus.START:
        this.startMoving(MoveDirection.RIGHT);
        break;
      case CustomDpadEventStatus.END:
        if (this.movingState.x) this.stopMoving();
        break;
    }
  }
  onRevivleDpad(e: any) {
    switch (e.type) {
      case CustomDpadEventStatus.START:
        this.revivle();
        break;
    }
  }
  onDie() {
    //@ts-ignore
    systemEvent.emit(CustomEventType.CHARACTER_REVIVLE, { blood: 50, type: CustomDpadEventStatus.START });
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
      case macro.KEY.space:
        this.startJumping();
        break;

      case macro.KEY.r:
        this.revivle();
        break;

      case macro.KEY.b:
        systemEvent.emit(CustomEventType.CHARACTER_BUFF_HP, { blood: 5 });
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

  archive(node: Node) {
    this.bulletPool.put(node);
  }

  handleAttack() {
    if (this.isShootable) {
      this.isShootable = false;
      if (this.bulletPool.size() <= 0) {
        this.bulletPool.put(instantiate(this.bullet));
      }
      let bulletNode = this.bulletPool.get(this.bulletPool)!;

      bulletNode.parent = this.node.parent;
      bulletNode.setPosition(this.node.getPosition());

      const bulletRigidBody = bulletNode.getComponent(RigidBody2D)!;

      bulletRigidBody.linearVelocity = bulletRigidBody.linearVelocity.multiply(this.moveDirection);
      // bulletNode.active = true;

      this.scheduleOnce(() => {
        this.isShootable = true;
      }, this.attackSpeed);
    }
  }

  revivle() {
    this.node.setPosition(this.revivlePosition);
    if (this.rigidBody) this.rigidBody.linearVelocity = v2(0, 0);
  }
}
