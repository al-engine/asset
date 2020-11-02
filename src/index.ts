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
  pixels: Array<number>,
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
      pixels: Array<number>()
    };
    for (let i = 0; i < imageData.data.length; i += 4) {
      sprite.pixels[this.calcIndex(i, sprite)] = this.getColor(imageData, i);
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

export interface SpriteMap {
  sprites: Array<Sprite>,
}

export class SpriteMapAsset extends Asset<SpriteMap> {
  private _isLoading = false;
  private spriteWidth = 0;
  private spriteHeight = 0;
  public isLoading() {
    return this._isLoading;
  }
  constructor (public src: string, public spritesNumber: number) {
    super();
    this._isLoading = false;
  }

  load = () => {
    this._isLoading = true;
    const image = new Image();
    const spriteMap = this;
    image.onload = function () {
      spriteMap._isLoading = false;
      spriteMap.data = spriteMap.constructMap(this as HTMLImageElement);
    };
    image.src = this.src;
  };

  private constructMap = (img: HTMLImageElement) => {
    this.spriteWidth = img.width;
    this.spriteHeight = Math.floor(img.height / this.spritesNumber);
    const canvas = SpriteMapAsset.createCanvas(img);
    const imageData = SpriteMapAsset.createImageData(canvas, img);
    return this.createMap(imageData);
  };

  private createMap(imageData: ImageData) {
    const spriteMap = {
      sprites: Array<Sprite>()
    };
    const imageDataSpriteSize = this.spriteWidth * this.spriteHeight * 4;
    for(let spriteIndex = 0; spriteIndex < this.spritesNumber; spriteIndex++) {
      const sprite = {
        width: this.spriteWidth,
        height: this.spriteHeight,
        pixels: Array<number>()
      };
      const start = spriteIndex * imageDataSpriteSize;
      for (let i = start; i < start + imageDataSpriteSize; i += 4) {
        sprite.pixels[SpriteMapAsset.calcIndex(i - start, sprite)] = SpriteMapAsset.getColor(imageData, i);
      }
      spriteMap.sprites.push(sprite);
    }
    return spriteMap;
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
  [index: string]: Asset<any>
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