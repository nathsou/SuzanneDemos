import { Vec3, vec3 } from "suzanne";

export interface PhongMaterial {
    ambient: Vec3,
    diffuse: Vec3,
    specular: Vec3,
    shininess: number
}

export const materials: { [index: string]: PhongMaterial } = {
    emerald: {
        ambient: vec3(0.0215, 0.1745, 0.0215),
        diffuse: vec3(0.07568, 0.61424, 0.07568),
        specular: vec3(0.633, 0.727811, 0.633),
        shininess: 0.6
    },

    red_plastic: {
        ambient: vec3(0),
        diffuse: vec3(0.5, 0, 0),
        specular: vec3(0.7, 0.6, 0.6),
        shininess: 0.25
    },

    ruby: {
        ambient: vec3(0.1745, 0.01175, 0.01175),
        diffuse: vec3(0.61424, 0.04136, 0.04136),
        specular: vec3(0.727811, 0.626959, 0.626959),
        shininess: 0.6
    },

    gold: {
        ambient: vec3(0.24725, 0.1995, 0.0745),
        diffuse: vec3(0.75164, 0.60648, 0.22648),
        specular: vec3(0.628281, 0.555802, 0.366065),
        shininess: 0.4
    },

    obsidian: {
        ambient: vec3(0.05375, 0.05, 0.06625),
        diffuse: vec3(0.18275, 0.17, 0.22525),
        specular: vec3(0.332741, 0.328634, 0.346435),
        shininess: 0.3
    },

    shiny_wood: {
        ambient: vec3(0.2),
        diffuse: vec3(1),
        specular: vec3(0.3),
        shininess: 0.4
    },

    green_rubber: {
        ambient: vec3(0.0, 0.05, 0.0),
        diffuse: vec3(0.4, 0.5, 0.4),
        specular: vec3(0.04, 0.7, 0.04),
        shininess: 0.078125
    },

    chrome: {
        ambient: vec3(0.25, 0.25, 0.25),
        diffuse: vec3(0.4, 0.4, 0.4),
        specular: vec3(0.774597, 0.774597, 0.774597),
        shininess: 0.6
    },

    copper: {
        ambient: vec3(0.19125, 0.0735, 0.0225),
        diffuse: vec3(0.7038, 0.27048, 0.0828),
        specular: vec3(0.256777, 0.137622, 0.086014),
        shininess: 0.1
    },

    bronze: {
        ambient: vec3(0.2125, 0.1275, 0.054),
        diffuse: vec3(0.714, 0.4284, 0.18144),
        specular: vec3(0.393548, 0.271906, 0.166721),
        shininess: 0.2
    }
};