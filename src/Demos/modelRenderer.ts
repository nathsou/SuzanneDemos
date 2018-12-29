import { Bitmap, Color, colors, Context, DrawingMode, Matrix4, ModelLoader, radians, VertexArray, Vec3, vec3, clamp, VaryingList, UniformList, Texture, vec4, Vec4, Vertex, Vec2 } from "suzanne";
import { PhongMaterial, materials } from "../Playground/Materials";

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

export default function (obj_str: string, width = 800, height = 600): Promise<Bitmap> {
    return new Promise<Bitmap>((resolve, reject) => {
        try {

            const sz = new Context(width, height, {
                draw: bitmap => {
                    resolve(bitmap);
                }
            });

            const obj = ModelLoader.parseOBJ(obj_str);

            // create a Vertex Array Object from our triangle
            const VAO = VertexArray.fromModel(obj);


            const model = Matrix4.scale(1);
            model.translate(vec3(0, 0, 5));
            model.rotateY(radians(200));
            const proj = Matrix4.perspective(radians(70), sz.width / sz.height, 0.1, 1000);

            // declare a uniform variable (accessible from both shaders)
            VAO.setUniform('model', model);
            VAO.setUniform('mvp', proj.mul(model));
            VAO.setUniform('material', materials.chrome);
            VAO.setUniform('light_dir', vec3(0, 0.5, -1).normalize());
            VAO.setUniform('view_pos', vec3(0));

            // Attach shaders to our Canvas3D
            sz.useProgram({
                vertex_shader: (v: Vertex): Vec4 => {

                    const model = v.uniforms.model as Matrix4;
                    const normal = model.transform(vec4(v.attributes.normal, 0)).normalize();

                    const pos = vec4(v.position);
                    const world_pos = vec3(model.transform(pos));

                    v.varyings.world_pos = world_pos;
                    v.varyings.normal = normal;

                    return (v.uniforms.mvp as Matrix4).transform(pos);
                },
                fragment_shader: (varyings: Readonly<VaryingList>, uniforms: Readonly<UniformList>): Color => {

                    let color: Vec3;

                    let diffuse = uniforms.material.diffuse;

                    const normal = (varyings.normal as Vec3).normalize();
                    color = compute_lighting(
                        diffuse,
                        uniforms.material,
                        uniforms.light_dir,
                        varyings.world_pos as Vec3,
                        uniforms.view_pos,
                        normal
                    );

                    // return texture(uniforms.tex as Bitmap, varyings.uv as Vec2);

                    return vec4(color);
                }
            });

            // bind our VAO to our Canvas3D
            sz.bindVertexArray(VAO);

            // clear the canvas to black
            sz.clear(colors.black);

            // draw the triangle in indexed mode
            sz.drawElements(DrawingMode.TRIANGLES, 0, obj.indices.length);

            // update the canvas
            sz.draw();
        } catch (err) {
            reject(err);
        }
    });
}
