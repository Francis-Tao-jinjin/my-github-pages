import * as WebGL from './webgl';

export class GL {
    constructor (canvas, options, vert, frag) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        // this.gl is actual WebGL context
        this.gl = WebGL.getContext(canvas, options);
        this.program = this.createProgram(vert, frag);
        this.useProgram(this.program);
    }

    createProgram = (vert, frag) => {
        let program = WebGL.createProgram(this.gl, vert, frag);
        return program;
    }

    useProgram = (program) => {
        this.program = program;
        this.gl.useProgram(program);
    }

    createTexture = (source, i) => {
        return WebGL.createTexture(this.gl, source, i);
    }

    createUniform = (type,name,...v) => {
        return WebGL.createUniform(this.gl, this.program, type, name, ...v);
    }

    activeTexture = (i) => {
        WebGL.activeTexture(this.gl, i);
    }

    updateTexture = (source) => {
        WebGL.updateTexture(this.gl, source);
    }

    draw = () => {
        const gl = this.gl;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -4, 0,
            4, -4,
            4,  4,
        ]), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // WebGL.setRectangle(this.gl, -1, -1, 2, 2);
        // this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}