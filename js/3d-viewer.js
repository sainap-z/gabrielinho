// 3D Viewer Application
class ThreeJSViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.models = [];
        this.currentCategory = 'all';
        this.wireframeEnabled = false;
        this.gridEnabled = true;
        this.axesEnabled = true;
        this.lightsEnabled = true;
        
        // Model configurations
        this.modelConfigs = {
            'b': { name: 'Building', icon: 'fa-building', color: '#6366f1' },
            'c': { name: 'Character', icon: 'fa-user', color: '#10b981' },
            'p': { name: 'Prop', icon: 'fa-cube', color: '#f59e0b' },
            'w': { name: 'Weapon', icon: 'fa-gun', color: '#ef4444' }
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initControls();
        this.initLights();
        this.initHelpers();
        this.initEventListeners();
        this.loadModelList();
        this.animate();
    }
    
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x05050a);
        this.scene.fog = new THREE.Fog(0x05050a, 10, 50);
    }
    
    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    initRenderer() {
        const canvas = document.getElementById('modelCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1;
    }
    
    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 100;
        this.controls.maxPolarAngle = Math.PI;
    }
    
    initLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(this.ambientLight);
        
        // Directional light
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(10, 10, 10);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(this.directionalLight);
        
        // Hemisphere light
        this.hemisphereLight = new THREE.HemisphereLight(0x4444ff, 0xff4444, 0.3);
        this.scene.add(this.hemisphereLight);
    }
    
    initHelpers() {
        // Grid helper
        this.gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
        this.gridHelper.position.y = -0.01;
        this.scene.add(this.gridHelper);
        
        // Axes helper
        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);
    }
    
    initEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Control buttons
        document.getElementById('resetView').addEventListener('click', () => this.resetView());
        document.getElementById('toggleWireframe').addEventListener('click', () => this.toggleWireframe());
        document.getElementById('toggleLights').addEventListener('click', () => this.toggleLights());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        document.getElementById('toggleAxes').addEventListener('click', () => this.toggleAxes());
        
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoomOut').addEventListener('click', () => this.zoom(1.2));
        
        // Rotation controls
        document.getElementById('rotateLeft').addEventListener('click', () => this.rotateModel(Math.PI / 8));
        document.getElementById('rotateRight').addEventListener('click', () => this.rotateModel(-Math.PI / 8));
        
        // Category filters
        document.querySelectorAll('.category').forEach(category => {
            category.addEventListener('click', (e) => {
                const categoryEl = e.currentTarget;
                const category = categoryEl.dataset.category;
                this.filterModels(category);
                
                // Update active category
                document.querySelectorAll('.category').forEach(c => c.classList.remove('active'));
                categoryEl.classList.add('active');
            });
        });
        
        // Close notification
        document.getElementById('closeNotification').addEventListener('click', () => {
            this.hideNotification();
        });
    }
    
    async loadModelList() {
        try {
            // In a real implementation, you would fetch this from a server
            // For now, we'll simulate loading with setTimeout
            setTimeout(() => {
                // Simulated model data - in reality, you would scan your static/models folder
                this.models = [
                    { id: 'b1', name: 'Modern Building', category: 'b', size: '2.4 MB', format: 'glb' },
                    { id: 'b2', name: 'Medieval Castle', category: 'b', size: '3.1 MB', format: 'glb' },
                    { id: 'c1', name: 'Robot Character', category: 'c', size: '1.8 MB', format: 'glb' },
                    { id: 'c2', name: 'Fantasy Warrior', category: 'c', size: '2.2 MB', format: 'glb' },
                    { id: 'p1', name: 'Sci-fi Crate', category: 'p', size: '0.8 MB', format: 'glb' },
                    { id: 'p2', name: 'Barrel Prop', category: 'p', size: '0.6 MB', format: 'glb' },
                    { id: 'w1', name: 'Laser Rifle', category: 'w', size: '1.2 MB', format: 'glb' },
                    { id: 'w2', name: 'Sword', category: 'w', size: '0.9 MB', format: 'glb' }
                ];
                
                this.updateModelList();
                this.showNotification('Models loaded successfully', 'success');
            }, 1000);
            
        } catch (error) {
            console.error('Error loading model list:', error);
            this.showNotification('Error loading models', 'error');
        }
    }
    
    updateModelList() {
        const modelList = document.getElementById('modelList');
        const filteredModels = this.currentCategory === 'all' 
            ? this.models 
            : this.models.filter(model => model.category === this.currentCategory);
        
        // Update counts
        Object.keys(this.modelConfigs).forEach(category => {
            const count = this.models.filter(m => m.category === category).length;
            document.getElementById(`count-${category}`).textContent = count;
        });
        document.getElementById('count-all').textContent = this.models.length;
        
        // Clear list
        modelList.innerHTML = '';
        
        if (filteredModels.length === 0) {
            modelList.innerHTML = `
                <div class="no-models">
                    <i class="fas fa-box-open"></i>
                    <span>No models found in this category</span>
                </div>
            `;
            return;
        }
        
        // Add models to list
        filteredModels.forEach(model => {
            const config = this.modelConfigs[model.category];
            const modelEl = document.createElement('div');
            modelEl.className = 'model-item';
            modelEl.dataset.modelId = model.id;
            modelEl.dataset.category = model.category;
            
            modelEl.innerHTML = `
                <div class="model-icon" style="background: rgba(${this.hexToRgb(config.color)}, 0.1);">
                    <i class="fas ${config.icon}" style="color: ${config.color};"></i>
                </div>
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-category">${config.name}</div>
                </div>
                <div class="model-size">${model.size}</div>
            `;
            
            modelEl.addEventListener('click', () => this.loadModel(model.id));
            modelList.appendChild(modelEl);
        });
    }
    
    filterModels(category) {
        this.currentCategory = category;
        this.updateModelList();
    }
    
    async loadModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            this.showNotification('Model not found', 'error');
            return;
        }
        
        // Show loading overlay
        this.showLoading(true);
        
        try {
            // Remove current model
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
                this.currentModel = null;
            }
            
            // In a real implementation, you would load the actual model file
            // For demo purposes, we'll create a placeholder mesh
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const geometry = this.createDemoGeometry(model.category);
            const material = new THREE.MeshStandardMaterial({ 
                color: this.hexToRgb(this.modelConfigs[model.category].color),
                metalness: 0.3,
                roughness: 0.7
            });
            
            this.currentModel = new THREE.Mesh(geometry, material);
            this.currentModel.castShadow = true;
            this.currentModel.receiveShadow = true;
            
            // Scale based on category
            let scale = 1;
            switch(model.category) {
                case 'b': scale = 0.5; break;
                case 'c': scale = 1; break;
                case 'p': scale = 2; break;
                case 'w': scale = 3; break;
            }
            this.currentModel.scale.set(scale, scale, scale);
            
            this.scene.add(this.currentModel);
            
            // Update UI
            this.updateModelDetails(model);
            
            // Highlight selected model in list
            document.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.modelId === modelId) {
                    item.classList.add('active');
                }
            });
            
            // Reset camera to focus on model
            this.resetView();
            
            this.showNotification(`Model "${model.name}" loaded`, 'success');
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.showNotification('Error loading model', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    createDemoGeometry(category) {
        switch(category) {
            case 'b':
                return new THREE.BoxGeometry(2, 3, 2);
            case 'c':
                const body = new THREE.CylinderGeometry(0.5, 0.3, 2, 8);
                const head = new THREE.SphereGeometry(0.4, 16, 16);
                head.translate(0, 1.5, 0);
                return new THREE.BufferGeometry().fromGeometry(body);
            case 'p':
                return new THREE.CylinderGeometry(0.8, 0.8, 1, 16);
            case 'w':
                const handle = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
                const barrel = new THREE.CylinderGeometry(0.15, 0.15, 2, 8);
                barrel.translate(0, 0, 1);
                return new THREE.BufferGeometry().fromGeometry(handle);
            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }
    
    updateModelDetails(model) {
        document.getElementById('modelTitle').textContent = model.name;
        document.getElementById('modelDescription').textContent = `3D Model - ${this.modelConfigs[model.category].name}`;
        
        document.getElementById('detailFileName').textContent = `${model.id}.${model.format}`;
        document.getElementById('detailCategory').textContent = this.modelConfigs[model.category].name;
        document.getElementById('detailFormat').textContent = model.format.toUpperCase();
        document.getElementById('detailTextures').textContent = 'Yes';
        document.getElementById('detailAnimations').textContent = 'No';
        document.getElementById('detailLoaded').textContent = new Date().toLocaleTimeString();
        
        // Update stats (simulated)
        const vertices = Math.floor(Math.random() * 5000) + 1000;
        const faces = Math.floor(vertices / 3);
        document.getElementById('vertexCount').textContent = vertices.toLocaleString();
        document.getElementById('faceCount').textContent = faces.toLocaleString();
        document.getElementById('modelScale').textContent = '1.0x';
    }
    
    resetView() {
        if (this.currentModel) {
            this.controls.reset();
            this.camera.position.set(5, 5, 5);
            this.camera.lookAt(0, 0, 0);
            
            // Center model
            const box = new THREE.Box3().setFromObject(this.currentModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = this.camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / Math.tan(fov / 2));
            
            this.camera.position.copy(center);
            this.camera.position.z += cameraZ * 1.5;
            this.controls.target.copy(center);
            this.controls.update();
        }
    }
    
    toggleWireframe() {
        if (this.currentModel) {
            this.wireframeEnabled = !this.wireframeEnabled;
            this.currentModel.material.wireframe = this.wireframeEnabled;
            
            const btn = document.getElementById('toggleWireframe');
            btn.classList.toggle('active', this.wireframeEnabled);
            btn.innerHTML = this.wireframeEnabled 
                ? '<i class="fas fa-th"></i> Solid' 
                : '<i class="fas fa-th"></i> Wireframe';
        }
    }
    
    toggleLights() {
        this.lightsEnabled = !this.lightsEnabled;
        this.ambientLight.visible = this.lightsEnabled;
        this.directionalLight.visible = this.lightsEnabled;
        this.hemisphereLight.visible = this.lightsEnabled;
        
        const btn = document.getElementById('toggleLights');
        btn.classList.toggle('active', this.lightsEnabled);
    }
    
    toggleGrid() {
        this.gridEnabled = !this.gridEnabled;
        this.gridHelper.visible = this.gridEnabled;
        
        const btn = document.getElementById('toggleGrid');
        btn.classList.toggle('active', this.gridEnabled);
    }
    
    toggleAxes() {
        this.axesEnabled = !this.axesEnabled;
        this.axesHelper.visible = this.axesEnabled;
        
        const btn = document.getElementById('toggleAxes');
        btn.classList.toggle('active', this.axesEnabled);
    }
    
    zoom(factor) {
        this.camera.position.multiplyScalar(factor);
        this.controls.update();
    }
    
    rotateModel(angle) {
        if (this.currentModel) {
            this.currentModel.rotation.y += angle;
        }
    }
    
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const text = document.getElementById('notificationText');
        
        text.textContent = message;
        notification.className = `notification show ${type}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => this.hideNotification(), 5000);
    }
    
    hideNotification() {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    onWindowResize() {
        const canvas = document.getElementById('modelCanvas');
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate model slowly if auto-rotate is enabled
        if (this.currentModel) {
            this.currentModel.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the 3D viewer
function init3DViewer() {
    window.viewer = new ThreeJSViewer();
}

// Handle window resize
window.addEventListener('resize', function() {
    if (window.viewer) {
        window.viewer.onWindowResize();
    }
});