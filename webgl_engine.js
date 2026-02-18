class WebGLEngine {
    constructor() {
        this.container = document.body;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            100
        );
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Style the canvas to sit behind everything
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.zIndex = '-1';
        this.renderer.domElement.style.pointerEvents = 'none';

        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.mouse = new THREE.Vector2();
        this.images = [];

        this.init();
    }

    init() {
        this.addEvents();
        this.createPlanes();
        this.render();
    }

    addEvents() {
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Re-calculate plane positions on resize if needed
    }

    onMouseMove(e) {
        // Normalized mouse coordinates (-1 to 1)
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    createPlanes() {
        // Select all images we want to "liquidify"
        const images = [...document.querySelectorAll('.parallax-img, .project-card img, .photo-item img')];

        images.forEach((img, index) => {
            // 1. Get image bounds
            const bounds = img.getBoundingClientRect();

            // 2. Create Geometry & Material
            const geometry = new THREE.PlaneGeometry(bounds.width, bounds.height, 16, 16);

            // Basic Shader Material (will upgrade to Liquid later)
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: { value: 0 },
                    uTexture: { value: new THREE.TextureLoader().load(img.src) },
                    uMouse: { value: new THREE.Vector2(0, 0) },
                    uHover: { value: 0 }
                },
                vertexShader: `
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uHover;
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            vec3 pos = position;
            
            // LIQUID DISTORTION LOGIC
            float dist = distance(uv, uMouse);
            float wave = sin(uv.y * 10.0 + uTime) * 0.05 * uHover;
            
            pos.z += wave * 100.0; // Exaggerated for visibility
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
                fragmentShader: `
          uniform sampler2D uTexture;
          varying vec2 vUv;
          uniform float uHover;

          void main() {
            vec2 uv = vUv;
            
            // Chromatic Aberration on Hover
            float r = texture2D(uTexture, uv + vec2(0.01 * uHover, 0.0)).r;
            float g = texture2D(uTexture, uv).g;
            float b = texture2D(uTexture, uv - vec2(0.01 * uHover, 0.0)).b;
            
            vec3 color = vec3(r, g, b);
            
            // B&W to Color Logic (Ported from CSS)
            vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
            vec3 finalColor = mix(gray, color, uHover);
            
            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
                transparent: true
            });

            const mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);

            this.images.push({
                mesh: mesh,
                img: img,
                bounds: bounds
            });

            // Hide original image but keep it for layout/click
            img.style.opacity = '0';

            // Hover listeners
            img.addEventListener('mouseenter', () => {
                gsap.to(material.uniforms.uHover, { value: 1, duration: 0.5 });
            });
            img.addEventListener('mouseleave', () => {
                gsap.to(material.uniforms.uHover, { value: 0, duration: 0.5 });
            });
        });
    }

    updatePlanes() {
        // Sync 3D planes with HTML DOM positions
        this.images.forEach(item => {
            const bounds = item.img.getBoundingClientRect();

            // Convert HTML coordinates to Three.js coordinates
            // Y-axis is inverted in WebGL
            item.mesh.position.x = bounds.left - window.innerWidth / 2 + bounds.width / 2;
            item.mesh.position.y = -bounds.top + window.innerHeight / 2 - bounds.height / 2;

            // Update uniforms
            item.mesh.material.uniforms.uTime.value = this.clock.getElapsedTime();
        });
    }

    render() {
        this.updatePlanes();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init if desktop (for performance)
    if (window.innerWidth > 768) {
        new WebGLEngine();
    }
});
