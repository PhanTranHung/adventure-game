export enum PhysicGroups {
  DEFAULT = 0b1,
  CHARACTER = 0b10,
  GROUND = 0b100,
  STATIC_OBJECT = 0b1000,
  DYNAMIC_OBJECT = 0b10000,
  ENMENY_SENSOR = 0b100000,
  CHARACTER_FOOTER = 0b1000000,
  ENEMY_BULLET = 0b10000000,
  CHARACTER_BULLET = 0b100000000,
  ENEMY = 0b1000000000,
  CHARACTER_BULLET_SENSOR = 0b10000000000,
}
