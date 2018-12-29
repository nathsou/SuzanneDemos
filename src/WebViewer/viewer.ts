import * as Triangle from "../Demos/triangle";
import { CanvasRenderingTarget } from "../Playground/CanvasRenderingTarget";
import * as ModelRenderer from '../Demos/modelRenderer';
import { Bitmap } from "suzanne";

const width = 800;
const height = 600;

(async () => {
    const suzanne_obj = await (await fetch('./res/models/suzanne.obj')).text();

    const demos: { [key: string]: Promise<Bitmap> } = {
        'triangle': Triangle.default(width, height),
        'suzanne': ModelRenderer.default(suzanne_obj, width, height)
    };

    let hash = location.hash.slice(1);
    if (Object.keys(demos).indexOf(hash) === -1) {
        hash = 'triangle';
    }

    const target = new CanvasRenderingTarget();

    const select_demo = document.createElement('select');
    document.body.appendChild(select_demo);
    document.body.appendChild(document.createElement('br'));

    for (const demo of Object.keys(demos)) {
        const option = document.createElement('option');
        option.value = demo;
        option.text = demo;
        if (demo === hash) {
            option.setAttribute('selected', 'true');
        }
        select_demo.appendChild(option);
    }

    select_demo.addEventListener('change', async () => {
        const demo = select_demo.options[select_demo.selectedIndex].value;
        await runDemo(demos[demo]);
        location.hash = `#${demo}`;
    });

    async function runDemo(bitmap: Promise<Bitmap>) {
        const bm = await bitmap;
        target.init(bm.width, bm.height);
        target.draw(bm);
    }

    await runDemo(demos[hash]);

    document.body.appendChild(target.domElement);
})();