import { _decorator, Component, TiledLayer, TiledMap, Enum, PolygonCollider2D, Collider2D, Vec2, Size, BoxCollider2D, v2 } from "cc";
const { ccclass, property } = _decorator;
import fxp from "fast-xml-parser";

const groups = Enum({
  GROUND: 4,
});

const TileObjectGroup = Enum({
  RECTANGLE: "reactangle",
  POLYGON: "polygon",
});

const listToMatrix = (arr: Array<number> = [], chunk: number) => {
  var res = [];
  for (var i = 0; i < arr.length; i = i + chunk) res.push(arr.slice(i, i + chunk));
  return res;
};

@ccclass("TiledCollision")
export class TiledCollision extends Component {
  private tileLayer: TiledLayer | null = null;
  private tileMap: TiledMap | null = null;
  private tileColliders: any = {};
  private tileSize: Size = null!;

  onLoad() {
    this.tileMap = this.node.getComponent(TiledMap);
    if (this.tileMap) {
      this.tileLayer = this.tileMap.getLayer("Map");
      console.log(this.tileLayer);
      this.tileSize = this.tileMap.getTileSize();

      if (this.tileLayer) {
        const tsxObject = this.gettsxObject();
        this.tileColliders = getTileColliders(tsxObject, this.tileSize);
        this.initTerrain();
      }
    }
  }

  getTiles(tileLayer: TiledLayer) {
    const layerSize = tileLayer.getLayerSize();
    const tiles = tileLayer.tiles;
    return listToMatrix(tiles, layerSize.width);
  }

  initTerrain() {
    const tiles2d = this.getTiles(this.tileLayer!);

    console.log("----------------------------", tiles2d, this.tileColliders);

    tiles2d.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value <= 0) return;
        const tilePosition = this.tileLayer?.getPositionAt(x, y);
        const tileCollidersAtThisPoint = this.tileColliders[value - 1];

        if (!tilePosition || !tileCollidersAtThisPoint) return;
        this.createCollider2D(tileCollidersAtThisPoint, tilePosition);
      });
    });
  }

  createCollider2D(tileCollider: any[], tilePosition: Vec2) {
    tileCollider.forEach((object) => {
      switch (object.type) {
        case TileObjectGroup.POLYGON:
          let pcollider = this.node.addComponent(PolygonCollider2D)!;
          pcollider.group = groups.GROUND;
          pcollider.points = object.points;
          pcollider.offset = tilePosition.add(object.position);
          break;

        case TileObjectGroup.RECTANGLE:
          const objectHaftSize = v2().add(object.size).multiplyScalar(0.5);
          let bcollider = this.node.addComponent(BoxCollider2D)!;
          bcollider.group = groups.GROUND;
          bcollider.offset = tilePosition.add(object.position).add(objectHaftSize);
          bcollider.size = object.size;
          break;

        default:
          break;
      }
    });
  }

  start() {
    this.node.getComponents(Collider2D)?.map((c) => c.apply());
  }

  gettsxObject() {
    if (!this.tileMap) return [];

    const tsxMapAsset = this.tileMap._tmxFile;

    let tsxString = "";
    tsxMapAsset?.tsxFileNames.forEach((v, index) => {
      if (v === "BackgroundTiledSet.tsx") tsxString = tsxMapAsset?.tsxFiles[index]?.text;
    });

    if (!tsxString) return;
    const tsxJson: any = fxp.parse(tsxString, { ignoreAttributes: false, attributeNamePrefix: "_", allowBooleanAttributes: true });
    // console.log("tsxJson", tsxJson);
    return tsxJson;
  }
}

const getTileColliders = (tsxObject: any, tileSize: Size) => {
  const tiles: [] = tsxObject?.tileset?.tile;
  if (!tiles) return [];

  const tileColliders: any = {};

  tiles.forEach((tile: any) => {
    let objects: any = tile.objectgroup.object;
    if (!Array.isArray(objects)) {
      objects = [objects];
    }
    const objectInfo = objects.map((object: any) => getObjectInfo(object, tileSize));

    tileColliders[tile._id] = objectInfo;

    // console.log("objectInfo------------------", objectInfo, tile.objectgroup._id);
  });
  // console.log("tileColliders", tileColliders);
  return tileColliders;
};

const getObjectInfo = (object: any, tileSize: Size) => {
  let objectInfo: any;
  const tileHaftSize = v2()
    .add(<any>tileSize)
    .multiplyScalar(0.5);

  if (object.polygon != undefined) {
    objectInfo = {
      type: TileObjectGroup.POLYGON,
      points: object.polygon._points
        .split(" ")
        .map((cor: any) => {
          const cors = cor.trim().split(",");
          return new Vec2(parseInt(cors[0]), parseInt(cors[1]));
        })
        .map((point: Vec2) => point.subtract(tileHaftSize).multiply2f(1, -1).add(tileHaftSize)),
      position: new Vec2(parseInt(object._x), -parseInt(object._y)),
    };
  } else if (object.eclipse != undefined) {
  } else if (object.point != undefined) {
  } else {
    const size = new Size(parseInt(object._width), parseInt(object._height));
    const { x, y } = new Vec2(parseInt(object._x), parseInt(object._y));
    objectInfo = {
      type: TileObjectGroup.RECTANGLE,
      size: size,
      position: v2(x, tileSize.height - y - size.height),
    };
  }

  return objectInfo;
};
