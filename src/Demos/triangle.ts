import { Bitmap, Color, colors, Context, DrawingMode, Matrix4, radians, vec3, VertexArray } from "suzanne";

export default function (width: number, height: number) {

    return new Promise<Bitmap>((resolve, reject) => {
        try {

            const sz = new Context(width, height, {
                draw: bitmap => {
                    resolve(bitmap);
                }
            });

            const triangle = {
                vertices: [
                    vec3(-1, -1, 2),
                    vec3(1, -1, 2),
                    vec3(0, 1, 2)
                ],
                indices: new Uint8Array([0, 1, 2]),
                attributes: {
                    color: [ //colors are just vec4 instances
                        colors.red,
                        colors.green,
                        colors.blue
                    ]
                }
            };

            // create a Vertex Array Object from our triangle
            const VAO = VertexArray.fromModel(triangle);

            // Use a perspective projection matrix to transform the triangle's vertices
            const proj = Matrix4.perspective(radians(70), sz.width / sz.height, 0.1, 1000);

            // declare a uniform variable (accessible from both shaders)
            VAO.setUniform('mvp', proj);

            // Attach shaders to our Canvas3D
            sz.useProgram({
                vertex_shader: vertex => {
                    // interpolate the color attribute
                    vertex.varyings.color = vertex.attributes.color;

                    // return our transformed vertex position
                    return vertex.uniforms.mvp.transform(vertex.position);
                },
                fragment_shader: (varyings, uniforms) => {
                    return varyings.color as Color;
                }
            });

            // bind our VAO to our Canvas3D
            sz.bindVertexArray(VAO);

            // clear the canvas to black
            sz.clear(colors.black);

            // draw the triangle in indexed mode
            sz.drawElements(DrawingMode.TRIANGLES, 0, triangle.indices.length);

            // update the canvas
            sz.draw();
        } catch (err) {
            reject(err);
        }
    });
}