// Main 3D Water Molecule Simulation
class WaterMoleculeSimulation {
    constructor() {
        // Three.js variables
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.molecule = null;
        
        // Simulation state
        this.autoRotate = false;
        this.showCharges = true;
        this.showBondAngle = false;
        this.rotationSpeed = 0.005;
        
        // Bond parameters (in Ångströms)
        this.bondLength = 0.96;
        this.bondAngle = 104.5 * Math.PI / 180; // Convert to radians
        
        // Initialize
        this.init();
        this.createMolecule();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x05050f);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 15;
        this.camera.position.y = 8;
        
        // Create renderer
        const canvas = document.getElementById('molecule-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas,
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lighting
        this.addLighting();
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;
        
        // Hide loading message
        document.querySelector('.loading').style.display = 'none';
    }
    
    addLighting() {
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(10, 10, 10);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Hemisphere light for natural look
        const hemisphereLight = new THREE.HemisphereLight(
            0x4466ff, // Sky color
            0xff9966, // Ground color
            0.3
        );
        this.scene.add(hemisphereLight);
        
        // Point light for specular highlights
        const pointLight = new THREE.PointLight(0x4fc3f7, 0.5, 100);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);
    }
    
    createMolecule() {
        this.molecule = new THREE.Group();
        
        // Create atoms
        const oxygen = this.createAtom('oxygen', 0xff4444, 2.0);
        const hydrogen1 = this.createAtom('hydrogen', 0xffffff, 1.2);
        const hydrogen2 = this.createAtom('hydrogen', 0xffffff, 1.2);
        
        // Position atoms
        // Oxygen at origin
        oxygen.position.set(0, 0, 0);
        
        // Hydrogen positions based on bond angle
        const angleOffset = this.bondAngle / 2;
        hydrogen1.position.set(
            this.bondLength * Math.sin(angleOffset),
            this.bondLength * Math.cos(angleOffset),
            0
        );
        hydrogen2.position.set(
            -this.bondLength * Math.sin(angleOffset),
            this.bondLength * Math.cos(angleOffset),
            0
        );
        
        // Add atoms to molecule group
        this.molecule.add(oxygen);
        this.molecule.add(hydrogen1);
        this.molecule.add(hydrogen2);
        
        // Create bonds
        this.createBond(oxygen.position, hydrogen1.position);
        this.createBond(oxygen.position, hydrogen2.position);
        
        // Add charge indicators
        if (this.showCharges) {
            this.addChargeIndicators();
        }
        
        // Add bond angle indicator
        this.bondAngleIndicator = this.createBondAngleIndicator();
        this.molecule.add(this.bondAngleIndicator);
        this.bondAngleIndicator.visible = this.showBondAngle;
        
        // Add to scene
        this.scene.add(this.molecule);
    }
    
    createAtom(element, color, radius) {
        // Create sphere geometry
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        
        // Create material
        const material = new THREE.MeshPhysicalMaterial({
            color: color,
            metalness: element === 'oxygen' ? 0.1 : 0,
            roughness: element === 'oxygen' ? 0.3 : 0.5,
            clearcoat: element === 'oxygen' ? 1.0 : 0.5,
            clearcoatRoughness: 0.1,
            transmission: element === 'oxygen' ? 0.1 : 0,
            opacity: element === 'oxygen' ? 0.9 : 1.0,
            transparent: element === 'oxygen',
            emissive: element === 'oxygen' ? 0x440000 : 0x000000,
            emissiveIntensity: 0.05
        });
        
        // Create mesh
        const atom = new THREE.Mesh(geometry, material);
        atom.castShadow = true;
        atom.receiveShadow = true;
        
        // Add glow effect for oxygen
        if (element === 'oxygen') {
            const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4444,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            atom.add(glow);
        }
        
        // Add atom label
        this.addAtomLabel(atom, element);
        
        return atom;
    }
    
    addAtomLabel(atom, element) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        // Draw text
        context.fillStyle = element === 'oxygen' ? '#ff4444' : '#ffffff';
        context.font = 'bold 80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(element === 'oxygen' ? 'O' : 'H', 128, 64);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 1, 1);
        sprite.position.y = atom.geometry.parameters.radius + 0.5;
        
        atom.add(sprite);
    }
    
    createBond(startPos, endPos) {
        // Calculate bond direction and length
        const direction = new THREE.Vector3().subVectors(endPos, startPos);
        const length = direction.length();
        
        // Create cylinder for bond
        const geometry = new THREE.CylinderGeometry(0.2, 0.2, length, 8);
        geometry.rotateZ(Math.PI / 2);
        
        // Create material
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xcccccc,
            metalness: 0.3,
            roughness: 0.4,
            transmission: 0.2,
            opacity: 0.9,
            transparent: true
        });
        
        // Create mesh
        const bond = new THREE.Mesh(geometry, material);
        bond.position.copy(startPos).add(direction.multiplyScalar(0.5));
        bond.lookAt(endPos);
        
        this.molecule.add(bond);
        return bond;
    }
    
    addChargeIndicators() {
        // Oxygen negative charge
        this.addChargeSymbol(new THREE.Vector3(0, 3, 0), 'δ⁻', 0xff4444);
        
        // Hydrogen positive charges
        const angleOffset = this.bondAngle / 2;
        const hDistance = this.bondLength + 2;
        
        this.addChargeSymbol(
            new THREE.Vector3(
                hDistance * Math.sin(angleOffset),
                hDistance * Math.cos(angleOffset) + 1.5,
                0
            ),
            'δ⁺',
            0xffffff
        );
        
        this.addChargeSymbol(
            new THREE.Vector3(
                -hDistance * Math.sin(angleOffset),
                hDistance * Math.cos(angleOffset) + 1.5,
                0
            ),
            'δ⁺',
            0xffffff
        );
    }
    
    addChargeSymbol(position, symbol, color) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        
        // Draw circle
        context.fillStyle = `rgb(${color === 0xff4444 ? '255,68,68' : '255,255,255'})`;
        context.beginPath();
        context.arc(64, 64, 60, 0, Math.PI * 2);
        context.fill();
        
        // Draw text
        context.fillStyle = color === 0xff4444 ? '#ffffff' : '#000000';
        context.font = 'bold 60px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(symbol, 64, 64);
        
        // Create texture
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1.5, 1.5, 1);
        sprite.position.copy(position);
        
        this.molecule.add(sprite);
        return sprite;
    }
    
    createBondAngleIndicator() {
        const group = new THREE.Group();
        
        // Create arc
        const arcPoints = [];
        const segments = 32;
        const radius = this.bondLength * 2;
        
        for (let i = 0; i <= segments; i++) {
            const theta = -this.bondAngle / 2 + (this.bondAngle / segments) * i;
            const x = radius * Math.sin(theta);
            const y = radius * Math.cos(theta);
            arcPoints.push(new THREE.Vector3(x, y, 0));
        }
        
        const arcGeometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4CAF50,
            linewidth: 2 
        });
        const arc = new THREE.Line(arcGeometry, arcMaterial);
        group.add(arc);
        
        // Add angle text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = '#4CAF50';
        context.font = 'bold 40px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('104.5°', 128, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true 
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 1, 1);
        sprite.position.set(0, radius * 0.8, 0);
        group.add(sprite);
        
        return group;
    }
    
    setupControls() {
        // Handle window resize
        window.addEventListener('resize', () => {
            const canvas = document.getElementById('molecule-canvas');
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        });
    }
    
    setupEventListeners() {
        // Reset view button
        document.getElementById('reset-view').addEventListener('click', () => {
            this.controls.reset();
            this.camera.position.set(0, 8, 15);
            this.controls.update();
        });
        
        // Toggle auto-rotation
        document.getElementById('toggle-rotation').addEventListener('click', (e) => {
            this.autoRotate = !this.autoRotate;
            e.target.classList.toggle('active', this.autoRotate);
            e.target.innerHTML = this.autoRotate ? 
                '<i class="fas fa-pause"></i> Stop Rotation' : 
                '<i class="fas fa-sync-alt"></i> Auto-Rotate';
        });
        
        // Toggle charges
        document.getElementById('show-charges').addEventListener('click', (e) => {
            this.showCharges = !this.showCharges;
            e.target.classList.toggle('active', this.showCharges);
            
            // Remove existing charge indicators
            this.molecule.children.forEach(child => {
                if (child.type === 'Sprite' && child.material.map) {
                    this.molecule.remove(child);
                }
            });
            
            // Add new charges if enabled
            if (this.showCharges) {
                this.addChargeIndicators();
            }
        });
        
        // Toggle bond angle
        document.getElementById('show-bond-angle').addEventListener('click', (e) => {
            this.showBondAngle = !this.showBondAngle;
            e.target.classList.toggle('active', this.showBondAngle);
            
            if (this.bondAngleIndicator) {
                this.bondAngleIndicator.visible = this.showBondAngle;
            }
        });
        
        // Toggle help modal
        const helpModal = document.getElementById('help-modal');
        document.getElementById('toggle-help').addEventListener('click', () => {
            helpModal.style.display = 'flex';
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            helpModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.style.display = 'none';
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'r':
                    this.controls.reset();
                    this.camera.position.set(0, 8, 15);
                    this.controls.update();
                    break;
                case 'a':
                    this.autoRotate = !this.autoRotate;
                    const rotateBtn = document.getElementById('toggle-rotation');
                    rotateBtn.click();
                    break;
                case 'c':
                    document.getElementById('show-charges').click();
                    break;
                case 'h':
                    document.getElementById('toggle-help').click();
                    break;
            }
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Auto-rotate if enabled
        if (this.autoRotate && this.molecule) {
            this.molecule.rotation.y += this.rotationSpeed;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Add particle background
    createParticleBackground();
    
    // Initialize simulation
    window.simulation = new WaterMoleculeSimulation();
    
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Add fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fact-card, .content-card, .control-item').forEach(el => {
        observer.observe(el);
    });
});

// Create particle background effect
function createParticleBackground() {
    const container = document.body;
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size and position
        const size = Math.random() * 3 + 1;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.top = `${posY}vh`;
        
        // Animation
        particle.style.animation = `float ${Math.random() * 20 + 10}s infinite ease-in-out`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(particle);
    }
}

// Add floating animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
        }
    }
`;
document.head.appendChild(style);
