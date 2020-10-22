import {OrgbColor} from "core";

export abstract class Asset<T> {
  isLoading (): boolean {
    return false;
  }
  data?: T;
  abstract load: () => void;
}

export interface Sprite {
  width: number,
  height: number,
  data: Array<number>,
}

export class SpriteAsset extends Asset<Sprite> {
  private _isLoading = false;
  public isLoading() {
    return this._isLoading;
  }
  constructor (public src: string) {
    super();
    this._isLoading = false;
  }

  load = () => {
    this._isLoading = true;
    const image = new Image();
    const sprite = this;
    image.onload = function () {
      sprite._isLoading = false;
      sprite.data = sprite.constructSprite(this as HTMLImageElement);
    };
    image.src = this.src;
  };

  constructSprite = (img: HTMLImageElement) => {
    const canvas = SpriteAsset.createCanvas(img);
    const imageData = SpriteAsset.createImageData(canvas, img);
    return SpriteAsset.createSprite(imageData);
  };

  private static createSprite(imageData: ImageData) {
    const sprite = {
      width: imageData.width,
      height: imageData.height,
      data: Array<number>()
    };
    for (let i = 0; i < imageData.data.length; i += 4) {
      sprite.data[this.calcIndex(i, sprite)] = this.getColor(imageData, i);
    }
    return sprite;
  }

  private static getColor(imageData: ImageData, i: number) {
    return OrgbColor.fromRgba(
      imageData.data[i],
      imageData.data[i + 1],
      imageData.data[i + 2],
      imageData.data[i + 3]
    ).value;
  }

  private static calcIndex(i: number, sprite: Sprite) {
    const realIndex = i / 4;
    const row = Math.floor(realIndex / sprite.width);
    const col = realIndex - row * sprite.width;
    return (sprite.height - 1 - row) * sprite.width + col;
  }

  private static createImageData(canvas: HTMLCanvasElement, img: HTMLImageElement) {
    let context = canvas.getContext("2d");
    context!.drawImage(img, 0, 0);
    return context!.getImageData(0, 0, img.width, img.height);
  }

  private static createCanvas(img: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    return canvas;
  }
}

interface PackType {
  [index: string]: SpriteAsset
}

export class PackAsset<T extends PackType> extends Asset<T> {
  constructor(public data: T) {
    super();
  }
  public isLoading() {
    for(const asset in this.data) {
      if (this.data.hasOwnProperty(asset) && this.data[asset].isLoading) {
        return true;
      }
    }
    return false;
  }
  load = () => {
    for(const asset in this.data) {
      if (this.data.hasOwnProperty(asset)) {
        this.data[asset].load();
      }
    }
  }
}