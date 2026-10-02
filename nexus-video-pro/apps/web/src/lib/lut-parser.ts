export interface LUT3D {
  title: string;
  size: number;
  data: Float32Array;
}

/**
 * Parses Adobe .CUBE 3D LUT files into a typed Float32Array buffer
 */
export function parseCubeLUT(cubeContent: string): LUT3D {
  const lines = cubeContent.split('\n');
  let title = 'Default LUT';
  let size = 32;
  const values: number[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('TITLE')) {
      title = line.replace('TITLE', '').replace(/"/g, '').trim();
    } else if (line.startsWith('LUT_3D_SIZE')) {
      size = parseInt(line.replace('LUT_3D_SIZE', '').trim(), 10);
    } else {
      const parts = line.split(/\s+/).map(Number);
      if (parts.length === 3) {
        values.push(parts[0], parts[1], parts[2]);
      }
    }
  }

  return {
    title,
    size,
    data: new Float32Array(values),
  };
}
