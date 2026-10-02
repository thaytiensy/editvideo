import { VERTEX_SHADER, FRAGMENT_SHADER } from './shaders';
import { Clip } from '../types/timeline';

export class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private positionBuffer: WebGLBuffer;
  private texCoordBuffer: WebGLBuffer;

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false });
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    // Compile shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error('Shader link failed: ' + gl.getProgramInfoLog(program));
    }
    this.program = program;

    // Set up quad buffers
    this.positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    this.texCoordBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
      gl.STATIC_DRAW
    );
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error('Shader compile error: ' + this.gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  public render(imageSource: TexImageSource, clip: Clip) {
    const gl = this.gl;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    // Uniforms
    const uOpacity = gl.getUniformLocation(this.program, 'u_opacity');
    const uBrightness = gl.getUniformLocation(this.program, 'u_brightness');
    const uContrast = gl.getUniformLocation(this.program, 'u_contrast');
    const uSaturation = gl.getUniformLocation(this.program, 'u_saturation');

    gl.uniform1f(uOpacity, clip.opacity ?? 1.0);
    gl.uniform1f(uBrightness, (clip.filters.brightness ?? 100) / 100);
    gl.uniform1f(uContrast, (clip.filters.contrast ?? 100) / 100);
    gl.uniform1f(uSaturation, (clip.filters.saturation ?? 100) / 100);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
