import { _decorator, Component, Node, CCInteger, systemEvent, Prefab, instantiate, Layout } from "cc";
import { CustomEventType } from "../util/systemCustomEvents";
import { Heart } from "./Heart";
const { ccclass, property } = _decorator;

@ccclass("HealthManager")
export class HealthManager extends Component {
  @property({ type: CCInteger, readonly: true, serializable: false })
  private maxBlood: number = 200;
  @property({ type: CCInteger })
  private maxBloodEachHeart = 20;
  @property({ type: Prefab })
  private heartPiece: Prefab = null!;

  private _currentBlood: number = 100;
  private _heartPieces: (Heart | null)[] = [];

  onLoad() {
    this.loadHeartPiece();

    this._currentBlood = this._heartPieces.length * this.maxBloodEachHeart;
    //@ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_TAKE_DAMAGE, this.onTakeDamage, this);
    //@ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_REVIVLE, this.onCharacterRevivle, this);
    //@ts-ignore
    systemEvent.on(CustomEventType.CHARACTER_BUFF_HP, this.onCharacterBuffHp, this);
  }

  onTakeDamage({ damage }: { damage: number } = { damage: 1 }) {
    this._currentBlood -= damage;

    if (this._currentBlood <= 0) {
      this._currentBlood = 0;
      systemEvent.emit(CustomEventType.CHARACTER_DIE);
    }

    this.renderHeart();
  }

  renderHeart() {
    let index = 0;

    const heartsFullBlood = Math.floor(this._currentBlood / this.maxBloodEachHeart);

    // heart with full blood
    for (; index < heartsFullBlood; index++) {
      this._heartPieces[index]?.setBloodFull();
    }

    // heart with not full blood
    if (this._currentBlood % this.maxBloodEachHeart > 0) {
      this._heartPieces[index]?.setBlood(this._currentBlood % this.maxBloodEachHeart);
      index++;
    }

    // heart has no blood
    for (; index < this._heartPieces.length; index++) {
      this._heartPieces[index]?.setBlood(0);
    }

    console.log("HealthManager:", this._currentBlood);
  }

  onCharacterRevivle({ blood }: { blood: number }) {
    blood = blood || 100;
    this._currentBlood = blood > this.maxBlood ? this.maxBlood : blood;
    this.renderHeart();
  }

  onCharacterBuffHp({ blood } = { blood: 15 }) {
    blood = blood || 15;

    this._currentBlood += blood;
    this._currentBlood = this._currentBlood > this.maxBlood ? this.maxBlood : this._currentBlood;

    this.shouldSpawNewHeart();
    this.renderHeart();
  }

  shouldSpawNewHeart() {
    const numOfHeartShouldToSpaw = Math.ceil(this._currentBlood / this.maxBloodEachHeart) - this._heartPieces.length;
    if (numOfHeartShouldToSpaw > 0) {
      for (let i = 0; i < numOfHeartShouldToSpaw; i++) {
        this.spawNewHeart();
      }
      this.node.getComponent(Layout)?.updateLayout();
      this.loadHeartPiece();
    }
  }

  spawNewHeart() {
    const heart = instantiate(this.heartPiece);
    this.node.addChild(heart);
  }

  loadHeartPiece(maxBloodEachHeart = this.maxBloodEachHeart) {
    this._heartPieces = this.node.children.map((node) => {
      const heart = node.getComponent(Heart);
      heart?.setMaxBlood(maxBloodEachHeart);
      return heart;
    });
  }
}
