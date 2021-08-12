import { _decorator, Component, Node, Animation } from "cc";
const { ccclass, property } = _decorator;

import { CharacterEvents, MoveDirection } from "./CharacterController";

enum AnimClips {
  WALK = "walk",
  IDLE = "idle",
  JUMP = "jump",
}

@ccclass("CharacterAnimation")
export class CharacterAnimation extends Component {
  private parent: Node | null = null;
  private animation: Animation | null = null;
  private animationOnGround: AnimClips = AnimClips.IDLE;
  private isJumping: boolean = false;

  onLoad() {
    this.parent = this.node.parent;
    this.animation = this.node.getComponent(Animation);
    if (this.parent && this.animation) {
      this.parent.on(CharacterEvents.START_MOVING, this.onStartMoving, this);
      this.parent.on(CharacterEvents.STOP_MOVING, this.onStopMoving, this);
      this.parent.on(CharacterEvents.START_JUMPING, this.onStartJumping, this);
      this.parent.on(CharacterEvents.END_JUMPING, this.onEndJumping, this);
    }
  }

  start() {}

  onStartJumping() {
    this.isJumping = true;
    if (this.animation) {
      this.animation.play(AnimClips.JUMP);
    }
  }

  onEndJumping() {
    this.isJumping = false;
    if (this.animation) {
      this.animation.play(this.animationOnGround);
    }
  }

  onStartMoving(direction: MoveDirection) {
    if (this.animation) {
      if (!this.isJumping) {
        this.animation.play(AnimClips.WALK);
      }
    }
    this.animationOnGround = AnimClips.WALK;
  }

  onStopMoving() {
    if (this.animation) {
      if (!this.isJumping) {
        this.animation.play(AnimClips.IDLE);
      }
    }
    this.animationOnGround = AnimClips.IDLE;
  }

  // update (deltaTime: number) {
  //     // [4]
  // }
}
