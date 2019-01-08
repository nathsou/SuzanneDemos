///@ts-ignore
import { PNG } from 'pngjs';
import * as Triangle from "../Demos/triangle";
import * as ModelRenderer from '../Demos/modelRenderer';
import { createWriteStream, readFileSync } from 'fs';
import { Bitmap } from 'suzanne';
const inquirer = require('inquirer');

function saveBitmap(bitmap: Promise<Bitmap>, path: string) {
    return new Promise(async (resolve, reject) => {
        try {
            const bm = await bitmap;

            const img = new PNG({
                width: bm.width,
                height: bm.height
            });

            img.data.set(bm.data);

            img.pack()
                .pipe(createWriteStream(path))
                .on('finish', resolve);

        } catch (err) {
            reject(err);
        }
    });
}

const width = 800;
const height = 600;

const demos: { [key: string]: () => Promise<Bitmap> } = {
    'triangle': () => Triangle.default(width, height),
    'suzanne': () => ModelRenderer.default(readFileSync(`dist/res/models/suzanne.obj`).toString('utf-8'), width, height)
};

inquirer.prompt([{
    type: 'list',
    message: 'Choose a demo to run',
    choices: Object.keys(demos),
    default: 0,
    name: 'demo'
}]).then(async (answers: { [key: string]: string }) => {
    const demo = answers.demo;
    await saveBitmap(demos[demo](), `${demo}.png`);
    console.info(`File saved to ${demo}.png`);
});

// import { writePngFile } from "node-libpng";
// import * as Triangle from "../Demos/triangle";
// import * as ModelRenderer from '../Demos/modelRenderer';
// import { readFileSync } from 'fs';
// import { Bitmap } from 'suzanne';
// const inquirer = require('inquirer');

// function saveBitmap(bitmap: Promise<Bitmap>, path: string) {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const bm = await bitmap;

//             await writePngFile(path, Buffer.from(bm.data), {
//                 width: bm.width,
//                 height: bm.height
//             });

//             resolve();

//         } catch (err) {
//             reject(err);
//         }
//     });
// }