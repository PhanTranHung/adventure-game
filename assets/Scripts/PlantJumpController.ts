import {
  _decorator,
  Component,
  Node,
  BoxCollider2D,
  Contact2DType,
  Collider2D,
  IPhysics2DContact,
  RigidBody2D,
  v2,
  CCInteger,
  Vec2,
  Animation,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("PlantJumpControl")
export class PlantJumpControl extends Component {
  @property({ type: Vec2 })
  public force = v2(0, 1000);
  @property({ type: CCInteger, tooltip: "Unit: s" })
  public waitTime = 0.5;

  private pedal: BoxCollider2D | null = null;
  private animation: Animation | null = null;
  private otherBodiesTouchMeNow: { uuid: string; body: RigidBody2D | null }[] = [];
  private isPreparing = false;

  onLoad() {
    this.pedal = this.node.getComponent(BoxCollider2D);
    this.animation = this.node.getComponent(Animation);
    if (this.animation) {
    }

    if (this.pedal) {
      this.pedal.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.pedal.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  onBeginContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    if (!this.isPreparing) {
      this.isPreparing = true;
      this.scheduleOnce(() => {
        if (this.animation) {
          this.animation.play("JumpPlantPrepare");
          this.animation.getState("JumpPlantPrepare").speed = 1 / this.waitTime;
          // console.log("Play animation: JumpPlantPrepare");
        }
      });
      this.scheduleOnce(this.pushOtherBodies, this.waitTime);
    }
    const otherBodyUuid = otherCollider.node.uuid;
    const otherBodyIndex = this.otherBodiesTouchMeNow.findIndex((value) => value.uuid === otherBodyUuid);

    if (otherBodyIndex >= 0) return;
    this.otherBodiesTouchMeNow.push({ uuid: otherBodyUuid, body: otherCollider.node.getComponent(RigidBody2D) });
    // console.log("addddddddddd", otherBodyUuid, this.otherBodiesTouchMeNow);
  }

  onEndContact(selfCollider: BoxCollider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    const otherBodyUuid = otherCollider.node.uuid;
    const otherBodyIndex = this.otherBodiesTouchMeNow.findIndex((value) => value.uuid === otherBodyUuid);

    if (otherBodyIndex >= 0) {
      this.otherBodiesTouchMeNow.splice(otherBodyIndex, 1);
      //   console.log("removeeeeeeeeeee", otherBodyUuid, this.otherBodiesTouchMeNow);
    }
  }

  pushOtherBodies = () => {
    // console.log("pussssssssssssssssh", this.otherBodiesTouchMeNow);
    if (this.animation) {
      this.animation.play("JumpPlantPush");
    }
    this.otherBodiesTouchMeNow.map((body) => {
      body.body?.applyLinearImpulseToCenter(this.force, true);
    });
    this.scheduleOnce(() => (this.isPreparing = false), 0.1);
  };

  returnIdleState() {
    // console.log("back to Idle");
    this.animation?.play("JumpPlantIdle");
  }
}
