import { _decorator, Component, Node, EventMouse, Vec2, v2, EventTouch, CCBoolean, Camera } from "cc";
import { CameraController } from "./CameraController";

const { ccclass, property } = _decorator;

@ccclass("SwipeCamera")
export class SwipeCamera extends Component {
  @property({ type: Node })
  public baseCamera: Node | null = null;

  @property({ tooltip: "Zoom on mouse wheel" })
  public zoomOnWheel: boolean = true;
  @property({ tooltip: "Mouse wheel sensity" })
  public mouseWheelSensity: number = 1.2;

  touchMoved: boolean = false;
  posOffset: Vec2 = v2();
  cameraComponent: Camera | null = null;

  onLoad() {
    if (this.baseCamera) {
      this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
      this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
      this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

      if (this.zoomOnWheel) {
        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
      }
    }
  }

  start() {
    // [3]
  }

  onMouseWheel(event: EventMouse) {
    // console.log("Mouse Wheel", event, event.getScrollY());
    this.cameraComponent = this.baseCamera?.getComponent(Camera) || null;
    if (this.cameraComponent) {
      this.cameraComponent.orthoHeight -= (event.getScrollY() / 50) * this.mouseWheelSensity;
    }
  }

  onTouchBegan(event: EventTouch) {
    this.touchMoved = false;
    this.baseCamera?.getComponent(CameraController)?.setFollowTarget(false);
  }

  onTouchMove(event: EventTouch) {
    const touches = event.getTouches();
    const touch1 = touches[0];

    const delta = touch1.getDelta();

    // console.log("delta", delta);

    const camPos = this.baseCamera!.getPosition();

    camPos.subtract3f(delta.x, delta.y, 0);

    this.baseCamera?.setPosition(camPos);
  }

  onTouchEnd(event: EventTouch) {
    // if (this.touchMoved)
    // event.
    this.baseCamera?.getComponent(CameraController)?.setFollowTarget(true);
  }

  onTouchCancel(event: EventTouch) {
    this.baseCamera?.getComponent(CameraController)?.setFollowTarget(true);
  }
}
