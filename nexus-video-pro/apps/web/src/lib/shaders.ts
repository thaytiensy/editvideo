export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;

uniform mat3 u_transform;

out vec2 v_texCoord;

void main() {
  vec3 pos = u_transform * vec3(a_position, 1.0);
  gl_Position = vec4(pos.xy, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_opacity;
uniform float u_brightness;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_glitchStrength;

out vec4 outColor;

void main() {
  vec2 uv = v_texCoord;

  // Glitch chromatic aberration
  if (u_glitchStrength > 0.0) {
    float shift = u_glitchStrength * 0.02;
    float r = texture(u_image, uv + vec2(shift, 0.0)).r;
    float g = texture(u_image, uv).g;
    float b = texture(u_image, uv - vec2(shift, 0.0)).b;
    outColor = vec4(r, g, b, 1.0);
  } else {
    outColor = texture(u_image, uv);
  }

  // Brightness
  outColor.rgb += (u_brightness - 1.0);

  // Contrast
  outColor.rgb = (outColor.rgb - 0.5) * u_contrast + 0.5;

  // Saturation
  float gray = dot(outColor.rgb, vec3(0.299, 0.587, 0.114));
  outColor.rgb = mix(vec3(gray), outColor.rgb, u_saturation);

  // Opacity
  outColor *= u_opacity;
}
`;
