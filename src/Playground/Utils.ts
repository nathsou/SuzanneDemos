import { VertexData, ModelLoader, Texture } from "suzanne";

export async function loadModel(source: string): Promise<VertexData> {
    return new Promise<VertexData>(async (resolve, reject) => {
        try {
            const obj_data = await (await fetch(source)).text();
            resolve(await ModelLoader.parseOBJ(obj_data));
        } catch (e) {
            reject(e);
        }
    });
}

export namespace TextureLoader {
    export function fromImageData(img: ImageData): Texture {
        const bm = new Texture(img.width, img.height);
        bm.data.set(img.data);

        return bm;
    }

    export function fromImage(img: HTMLImageElement): Texture {
        const ctx = document.createElement('canvas').getContext('2d');
        ctx.canvas.width = img.width;
        ctx.canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        return fromImageData(ctx.getImageData(0, 0, img.width, img.height));
    }

    export function fromFile(source: string): Promise<Texture> {
        return new Promise<Texture>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(fromImage(img));
            };

            img.onerror = () => {
                reject(source);
            }

            img.src = source;
        });
    }
}