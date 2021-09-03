import { _decorator, Component, Node, Event, systemEvent, Enum, Sprite, v3, Vec3 } from "cc";
import { CustomDpadEventStatus, CustomEventTypeEnum } from "../util/systemCustomEvents";
const { ccclass, property } = _decorator;

Enum(CustomEventTypeEnum);

@ccclass("Dispatcher")
export class Dispatcher extends Component {
  @property({ type: CustomEventTypeEnum })
  event: CustomEventTypeEnum = CustomEventTypeEnum.NONE;

  onLoad() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
  }

  onTouchStart(e: TouchEvent) {
    systemEvent.emit(CustomEventTypeEnum[this.event], { type: CustomDpadEventStatus.START });
    // this.node.setScale(v3(0.9, 0.9));
  }
  onTouchMove(e: TouchEvent) {
    systemEvent.emit(CustomEventTypeEnum[this.event], { type: CustomDpadEventStatus.MOVE });
  }
  onTouchEnd(e: TouchEvent) {
    systemEvent.emit(CustomEventTypeEnum[this.event], { type: CustomDpadEventStatus.END });
    // this.node.setScale(v3(1, 1));
  }
  onTouchCancel(e: TouchEvent) {
    systemEvent.emit(CustomEventTypeEnum[this.event], { type: CustomDpadEventStatus.CANCEL });
    // this.node.setScale(v3(1, 1));
  }
}
