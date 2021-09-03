import { _decorator, Component, Node, SpriteAtlas, CCInteger, Sprite, SpriteFrame } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Heart")
export class Heart extends Component {
  @property(SpriteAtlas)
  private heartPieces: SpriteAtlas = null!;

  private _maxBlood: number = 30;
  private _bloob = 20;
  private _sprite: Sprite | null = null!;
  private _heartPieces: (SpriteFrame | null)[] = [];

  onLoad() {
    this._heartPieces = this.heartPieces.getSpriteFrames();
    this._sprite = this.getComponent(Sprite);
  }

  setBloodFull() {
    this.setBlood(this._maxBlood);
  }

  setBlood(blood: number) {
    if (this._bloob == blood) return;

    this._bloob = blood > this._maxBlood ? this._maxBlood : blood;

    if (this._bloob <= 0) return (this._sprite!.enabled = false);
    else this._sprite!.enabled = true;

    const heartPieceIndex = Math.floor(this._bloob / this._heartPieces.length);
    this._sprite!.spriteFrame = this._heartPieces[heartPieceIndex];
  }

  getBlood() {
    return this._bloob;
  }

  getMaxBlood() {
    return this._maxBlood;
  }
  setMaxBlood(blood: number) {
    this._maxBlood = blood;
  }
}
