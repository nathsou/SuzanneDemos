import { RenderingTarget, Bitmap } from "suzanne";

export class CanvasRenderingTarget implements RenderingTarget {

    private _img: ImageData;
    private _ctx: CanvasRenderingContext2D;

    constructor() {
        this._ctx = document.createElement('canvas').getContext('2d');
    }

    public init(width: number, height: number): void {
        this.resize(width, height);
    }

    public resize(width: number, height: number): void {
        this._ctx.canvas.width = width;
        this._ctx.canvas.height = height;
        this._img = new ImageData(width, height);
    }

    public draw(bitmap: Bitmap): void {
        if (bitmap.width !== this._ctx.canvas.width || bitmap.height !== this._ctx.canvas.height) {
            throw new Error(
                `Cannot draw a ${bitmap.width} by ${bitmap.height} bitmap` +
                `on a ${this._ctx.canvas.width} by ${this._ctx.canvas.height} canvas, ` +
                `consider resize the CanvasRenderingTarget before drawing`
            );
        }
        this._img.data.set(bitmap.data);
        this._ctx.putImageData(this._img, 0, 0);
    }

    public get domElement(): HTMLCanvasElement {
        return this._ctx.canvas;
    }
}