import { useEffect, useRef } from 'react';

interface ShadertoyProps {
  fs: string;
}

const Shadertoy: React.FC<ShadertoyProps> = ({ fs }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    glRef.current = gl;

    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Vertex shader source
    const vsSource = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    // Fragment shader source with uniforms
    const fsSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec4 iMouse;
      ${fs}
      
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    // Compile shaders
    gl.shaderSource(vertexShader, vsSource);
    gl.shaderSource(fragmentShader, fsSource);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    programRef.current = program;

    // Set up buffers
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Get attribute location
    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Start animation
    startTimeRef.current = Date.now();
    animate();

    return () => {
      gl.deleteProgram(program);
    };
  }, [fs]);

  const animate = () => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !canvas) return;

    // Update canvas size
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    // Use program
    gl.useProgram(program);

    // Set uniforms
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const mouseLocation = gl.getUniformLocation(program, 'iMouse');

    if (timeLocation) {
      gl.uniform1f(timeLocation, (Date.now() - startTimeRef.current) / 1000);
    }
    if (resolutionLocation) {
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    }
    if (mouseLocation) {
      gl.uniform4f(mouseLocation, 0, 0, 0, 0); // You can update this with actual mouse position
    }

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(animate);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

export default Shadertoy; 