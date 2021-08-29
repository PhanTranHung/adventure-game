import { _decorator, Component, Node, Event, systemEvent, Enum, Sprite, v3, Vec3 } from "cc";
import { CustomEventStatus, CustomEventTypes } from "../util/systemCustomEvents";
const { ccclass, property } = _decorator;

Enum(CustomEventTypes);

@ccclass("Dispatcher")
export class Dispatcher extends Component {
  @property({ type: CustomEventTypes })
  event: CustomEventTypes = CustomEventTypes.NONE;

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
  }

  onTouchStart(e: TouchEvent) {
    systemEvent.emit(CustomEventTypes[this.event], { type: CustomEventStatus.START });
    // this.node.setScale(v3(0.9, 0.9));
  }
  onTouchMove(e: TouchEvent) {
    systemEvent.emit(CustomEventTypes[this.event], { type: CustomEventStatus.MOVE });
  }
  onTouchEnd(e: TouchEvent) {
    systemEvent.emit(CustomEventTypes[this.event], { type: CustomEventStatus.END });
    // this.node.setScale(v3(1, 1));
  }
  onTouchCancel(e: TouchEvent) {
    systemEvent.emit(CustomEventTypes[this.event], { type: CustomEventStatus.CANCEL });
    // this.node.setScale(v3(1, 1));
  }
}
