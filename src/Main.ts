import * as dat from 'dat.gui';
import { clamp, Clock, Color, colors, Context, DrawingMode, Matrix4, Program, radians, Texture, UniformList, VaryingList, Vec2, Vec3, vec3, Vec4, vec4, Vertex, VertexArray } from "suzanne";
import { CanvasRenderingTarget } from "./CanvasRenderingTarget";
import { materials, PhongMaterial } from "./Materials";
import { models } from "./Models";
import { textures } from "./Textures";
import { loadModel, TextureLoader } from './Utils';

interface ModelPlaygroundParams {
    model: string,
    material: string,
    texture: string,
    z: number,
    show_texture: boolean,
    rotate: boolean,
    per_frag: boolean,
    angle: number
}

export default class Main {

    private cnv: Context;
    private clock: Clock;
    private VAO: VertexArray;
    private prog: Program;
    private proj: Matrix4;
    private animation_frame_handle: number;
    private model_scale = 1;

    private params: ModelPlaygroundParams = {
        model: 'suzanne',
        material: 'red_plastic',
        texture: 'light_wood',
        z: 5,
        show_texture: false,
        rotate: true,
        per_frag: false,
        angle: Math.PI / 2
    };

    constructor() {

        const target = new CanvasRenderingTarget();
        document.body.appendChild(target.domElement);
        this.cnv = new Context(window.innerWidth, window.innerHeight, target);

        window.addEventListener('resize', () => {
            this.cnv.resize(window.innerWidth, window.innerHeight);
            this.proj = Matrix4.perspective(radians(70), this.cnv.width / this.cnv.height, 0.1, 1000);
            this.update();
        });

        this.clock = new Clock();
        this.proj = Matrix4.perspective(radians(70), this.cnv.width / this.cnv.height, 0.1, 1000);

        const compute_lighting = (
            diffuse: Vec3,
            mat: PhongMaterial,
            light_dir: Vec3,
            world_pos: Vec3,
            view_pos: Vec3,
            normal: Vec3
        ): Vec3 => {
            const diff = vec3(clamp(light_dir.dot(normal), 0, 1)).mul(diffuse);
            const view_dir = view_pos.sub(world_pos).normalize();
            const reflect_dir = light_dir.reflect(normal);
            const specular = vec3(Math.max(view_dir.dot(reflect_dir), 0) ** (mat.shininess * 128)).mul(mat.specular);
            return mat.ambient.add(diff.add(specular));
        };

        this.prog = {
            vertex_shader: (v: Vertex): Vec4 => {
                // v.varyings.color = v.attributes.color;

                if (v.uniforms.show_texture) {
                    v.varyings.uv = v.attributes.uv;
                }

                // const rand_colors = v.uniforms.rand_colors;
                // v.varyings.color = rand_colors[v.index % rand_colors.length];

                const model = v.uniforms.model as Matrix4;
                const normal = model.transform(vec4(v.attributes.normal, 0)).normalize();

                const pos = vec4(v.position.times(this.model_scale), 1);
                const world_pos = vec3(model.transform(pos));

                if (this.params.per_frag) {
                    v.varyings.world_pos = world_pos;
                    v.varyings.normal = normal;
                } else {
                    let diffuse = v.uniforms.material.diffuse;
                    if (v.uniforms.show_texture) {
                        diffuse = vec3((v.uniforms.tex as Texture).at(v.varyings.uv as Vec2));
                    }

                    v.varyings.gouraud = compute_lighting(
                        diffuse,
                        v.uniforms.material,
                        v.uniforms.light_dir,
                        world_pos,
                        v.uniforms.view_pos,
                        normal
                    );
                }

                return (v.uniforms.mvp as Matrix4).transform(pos);
            },
            fragment_shader: (varyings: Readonly<VaryingList>, uniforms: Readonly<UniformList>): Color => {

                let color: Vec3;

                if (this.params.per_frag) {
                    let diffuse = uniforms.material.diffuse;
                    if (uniforms.show_texture) {
                        diffuse = vec3((uniforms.tex as Texture).at(varyings.uv as Vec2));
                    }

                    const normal = (varyings.normal as Vec3).normalize();
                    color = compute_lighting(
                        diffuse,
                        uniforms.material,
                        uniforms.light_dir,
                        varyings.world_pos as Vec3,
                        uniforms.view_pos,
                        normal
                    );
                } else {
                    color = varyings.gouraud as Vec3;
                }

                // return varyings.color as Color;
                // return texture(uniforms.tex as Bitmap, varyings.uv as Vec2);

                return vec4(color);
            }
        };

        this.setModel(models.suzanne).then(async () => {
            await this.initUniforms();
            this.initGUI();
            this.start();
        });
    }

    private initGUI(): void {
        const gui = new dat.GUI();

        const model_controller = gui.add(this.params, 'model', Object.keys(models));
        model_controller.onChange(async (model_name: string) => {
            this.stop();
            await this.setModel(models[model_name]);
            await this.initUniforms();
            if (this.params.rotate) {
                this.start();
            } else {
                this.update();
            }
        });

        const material_controller = gui.add(this.params, 'material', Object.keys(materials));
        material_controller.onChange((material_name: string) => {
            this.VAO.setUniform('material', materials[material_name]);
            this.update();
        });

        const texture_controller = gui.add(this.params, 'texture', Object.keys(textures));
        texture_controller.onChange(async (tex_name: string) => {
            this.VAO.setUniform('tex', await TextureLoader.fromFile(textures[tex_name]));
            this.update();
        });

        const rotate_controller = gui.add(this.params, 'rotate');
        rotate_controller.onChange((rotate: boolean) => {
            if (rotate) {
                this.clock.getDelta();
                this.start();
            } else {
                this.stop();
            }
        });

        const show_texture_controller = gui.add(this.params, 'show_texture');

        show_texture_controller.onChange(() => this.update());

        const per_frag_controller = gui.add(this.params, 'per_frag');
        per_frag_controller.onChange(() => this.update());

        const z_controller = gui.add(this.params, 'z', 1.5, 15, 0.01);
        z_controller.onChange(() => this.update());

        const angle_controller = gui.add(this.params, 'angle', 0, 2 * Math.PI, 0.01);
        angle_controller.onChange(() => this.update());
    }

    public async initUniforms() {
        this.VAO.setUniform('tex', await TextureLoader.fromFile(textures[this.params.texture]));
        this.VAO.setUniform('light_dir', vec3(0, 0.5, -1).normalize());
        this.VAO.setUniform('view_pos', vec3(0));
        this.VAO.setUniform('material', materials[this.params.material]);
    }

    public async setModel(source: string) {
        const model = await loadModel(source);

        this.model_scale = 1 / Math.max(
            Math.abs(model.bounding_box.min.x),
            Math.abs(model.bounding_box.min.y),
            Math.abs(model.bounding_box.min.z),
            model.bounding_box.max.x,
            model.bounding_box.max.y,
            model.bounding_box.max.z
        );
        this.VAO = VertexArray.fromModel(model);
    }

    public start(): void {
        this.update();
        this.animation_frame_handle = requestAnimationFrame(() => this.start());
    }

    public stop(): void {
        if (this.animation_frame_handle === undefined) return;
        cancelAnimationFrame(this.animation_frame_handle);
    }

    public update(): void {
        this.cnv.useProgram(this.prog);
        const model = Matrix4.scale(1);
        // this.angle = 0;
        if (this.params.rotate) {
            this.params.angle = (this.params.angle + this.clock.getDelta() * 0.001) % (2 * Math.PI);
            // this.VAO.setUniform('light_dir', vec3(0, Math.sin(Date.now() / 1000), -1).normalize());
        }
        // model.translate(vec3(0, 0, Math.abs(Math.sin(this.angle)) * 10 + 5));
        model.translate(vec3(0, 0, this.params.z));
        // m.rotateX(this.angle / 2);
        model.rotateY(this.params.angle);
        // m.rotateZ(this.angle);

        // const inv_model = model.invert();

        this.VAO.setUniform('model', model);
        this.VAO.setUniform('mvp', this.proj.mul(model));
        this.VAO.setUniform('show_texture', this.params.show_texture);

        this.cnv.clear(colors.black);

        this.cnv.bindVertexArray(this.VAO);
        this.cnv.drawElements(DrawingMode.TRIANGLES, 0, this.VAO.indices.length);

        this.cnv.clearBuffers();
    }
}

new Main();