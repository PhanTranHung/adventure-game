import { _decorator, Component, Node, Vec2, v2, Vec3, v3, Animation } from "cc";
import { CharacterEvents, MoveDirection } from "./Character/CharacterController";
const { ccclass, property } = _decorator;

@ccclass("PetController")
export class PetController extends Component {
  @property(Node)
  public target: Node | null = null;
  @property(Vec3)
  public distance: Vec3 = v3(-70, 0, 0);

  private currentDirection: Vec3 = v3(1, 1, 1);
  private originScale: Vec3 = v3(1, 1, 1);
  private animation: Animation | null = null;

  onLoad() {
    if (this.target) {
      this.target.on(CharacterEvents.START_MOVING, this.onTargetMoving, this);
      this.target.on(CharacterEvents.STOP_MOVING, this.onTargetStop, this);
    }
    this.originScale = this.node.getScale();
    this.animation = this.getComponent(Animation);
  }

  onTargetMoving(moveDirection: MoveDirection) {
    if (this.currentDirection.x !== moveDirection) {
      this.currentDirection = v3(moveDirection, 1, 1);
      this.scheduleOnce(() => {
        this.node.setScale(this.originScale.clone().multiply(this.currentDirection));
      }, 0.05);
    }
    this.animation?.play("pet_beholder_moving");
  }

  onTargetStop() {
    if (this.animation) {
      this.animation.play("pet_beholder_idle");
    }
  }

  update(dt: number) {
    if (this.target) {
      const targetPosition = this.target.getPosition().add(this.distance.clone().multiply(this.currentDirection));
      const currentPosition = this.node.getPosition();

      currentPosition.lerp(targetPosition, 0.2);
      this.node.setPosition(currentPosition);
    }
  }
}
