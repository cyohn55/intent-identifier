/**
 * Soul Buddy Animation Component
 *
 * This component loads and animates a GLB model by showing/hiding frame collections
 * in sequence to create a frame-by-frame animation effect.
 *
 * Dependencies: Three.js, GLTFLoader
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SoulBuddyAnimator {
    constructor(waveModelPath, idleModelPath, sleepingModelPath, heartModelPath, thinkingModelPath, containerId) {
        this.waveModelPath = waveModelPath;
        this.idleModelPath = idleModelPath;
        this.sleepingModelPath = sleepingModelPath;
        this.heartModelPath = heartModelPath;
        this.thinkingModelPath = thinkingModelPath;
        this.containerId = containerId;
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Store loaded models
        this.models = {
            wave: null,
            idle: null,
            sleeping: null,
            heart: null,
            thinking: null
        };
        // Store full GLTF objects with animations
        this.gltfObjects = {
            wave: null,
            idle: null,
            sleeping: null,
            heart: null,
            thinking: null
        };
        this.currentModel = null;
        this.currentModelName = null;

        // Animation state
        this.frames = [];
        this.currentFrame = 0;
        this.animationRunning = false;
        this.frameDelay = 180; // milliseconds between frames
        this.animationTimeout = null; // Track main animation timeout for cleanup

        // State machine
        this.animationState = 'wave'; // wave, idle, sleeping
        this.idleLoopCount = 0;
        this.maxIdleLoops = 5;
        this.sendButtonPressed = false;
        this.sleepingLoopCount = 0; // Track sleeping animation loops

        // Heart animation state
        this.heartAnimationPlaying = false;
        this.savedAnimationState = null;
        this.heartAnimationTimeout = null; // Track heart animation timeout for cleanup

        // Thinking animation state
        this.thinkingAnimationPlaying = false;
        this.thinkingAnimationTimeout = null; // Track thinking animation timeout for cleanup
        this.thinkingLoopCount = 0; // Track loops of frames 3-4

        // Unified scale factor for all models
        this.uniformScale = null;

        // Cache positions and scales for each model to maintain consistency
        this.modelPositionCache = {};
        this.modelScaleCache = {};

        // Store skybox separately to persist across animations
        this.skybox = null;
        this.skyboxContainer = null; // Container for the skybox clone

        // Animation mixer for continuous background animations
        this.animationMixer = null;
        this.backgroundAnimationAction = null;
        this.clock = new THREE.Clock();

        // Raycaster for click detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Floating animation for Frame objects
        this.floatStartTime = Date.now();
        this.floatAmplitude = 0.1; // How far up/down to float (0.1 units)
        this.floatSpeed = 0.00125; // Speed of floating (25% faster than 0.001)

        this.init();
    }

    /**
     * Initialize the Three.js scene, camera, and renderer
     */
    init() {
        const container = document.getElementById(this.containerId);

        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent background

        // Create camera
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // Add lighting
        this.addLighting();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Setup click detection for heart animation
        this.setupClickDetection();

        // Load the model
        this.loadModel();
    }

    /**
     * Add lighting to the scene
     */
    addLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.04);
        this.scene.add(ambientLight);

        // Main directional light for definition
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.3);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Fill light from the left
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.65);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);

        // Back light for depth
        const backLight = new THREE.DirectionalLight(0xffffff, 0.39);
        backLight.position.set(0, -5, -5);
        this.scene.add(backLight);

        // Point light from above for highlights
        const pointLight = new THREE.PointLight(0xffffff, 0.65, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }

    /**
     * Load all GLB models
     */
    loadModel() {
        const loader = new GLTFLoader();
        let loadedCount = 0;
        const totalModels = 5;

        // Load wave model
        loader.load(
            this.waveModelPath,
            (gltf) => {
                this.models.wave = gltf.scene;
                this.gltfObjects.wave = gltf;
                console.log('Wave model loaded');
                console.log(`Wave model has ${gltf.animations.length} animation(s)`);
                gltf.animations.forEach((anim, i) => {
                    console.log(`  Animation ${i}: "${anim.name}" (${anim.duration.toFixed(2)}s)`);
                });
                loadedCount++;
                if (loadedCount === totalModels) this.onAllModelsLoaded();
            },
            (progress) => this.onLoadProgress(progress, 'wave'),
            (error) => this.onLoadError(error, 'wave')
        );

        // Load idle model
        loader.load(
            this.idleModelPath,
            (gltf) => {
                this.models.idle = gltf.scene;
                this.gltfObjects.idle = gltf;
                console.log('Idle model loaded');
                console.log(`Idle model has ${gltf.animations.length} animation(s)`);
                loadedCount++;
                if (loadedCount === totalModels) this.onAllModelsLoaded();
            },
            (progress) => this.onLoadProgress(progress, 'idle'),
            (error) => this.onLoadError(error, 'idle')
        );

        // Load sleeping model
        loader.load(
            this.sleepingModelPath,
            (gltf) => {
                this.models.sleeping = gltf.scene;
                this.gltfObjects.sleeping = gltf;
                console.log('Sleeping model loaded');
                console.log(`Sleeping model has ${gltf.animations.length} animation(s)`);
                loadedCount++;
                if (loadedCount === totalModels) this.onAllModelsLoaded();
            },
            (progress) => this.onLoadProgress(progress, 'sleeping'),
            (error) => this.onLoadError(error, 'sleeping')
        );

        // Load heart model
        loader.load(
            this.heartModelPath,
            (gltf) => {
                this.models.heart = gltf.scene;
                this.gltfObjects.heart = gltf;
                console.log('Heart model loaded');
                console.log(`Heart model has ${gltf.animations.length} animation(s)`);
                loadedCount++;
                if (loadedCount === totalModels) this.onAllModelsLoaded();
            },
            (progress) => this.onLoadProgress(progress, 'heart'),
            (error) => this.onLoadError(error, 'heart')
        );

        // Load thinking model
        loader.load(
            this.thinkingModelPath,
            (gltf) => {
                this.models.thinking = gltf.scene;
                this.gltfObjects.thinking = gltf;
                console.log('Thinking model loaded');
                console.log(`Thinking model has ${gltf.animations.length} animation(s)`);
                loadedCount++;
                if (loadedCount === totalModels) this.onAllModelsLoaded();
            },
            (progress) => this.onLoadProgress(progress, 'thinking'),
            (error) => this.onLoadError(error, 'thinking')
        );
    }

    /**
     * Handle all models loaded event
     */
    onAllModelsLoaded() {
        console.log('All Soul Buddy models loaded successfully');

        // Extract skybox from wave model to use for all animations
        this.extractSkybox();

        // Setup background animation from wave model
        this.setupBackgroundAnimation();

        // Calculate uniform scale factor based on all models
        this.calculateUniformScale();

        // Start with wave animation
        this.switchToModel('wave');

        // Setup send button listener
        this.setupSendButtonListener();

        // Start render loop
        this.animate();
    }

    /**
     * Extract skybox from wave model to persist across all animations
     */
    extractSkybox() {
        if (!this.models.wave) {
            console.warn('Wave model not loaded, cannot extract skybox');
            return;
        }

        console.log('=== Extracting skybox from wave model ===');

        // Log all objects to help debug
        console.log('All objects in wave model:');
        this.models.wave.traverse((child) => {
            console.log(`  - ${child.name} (type: ${child.type}, isMesh: ${child.isMesh})`);
        });

        // Find the skybox mesh in the wave model
        let skyboxMesh = null;
        let skyboxParent = null;

        this.models.wave.traverse((child) => {
            if (child.name && (
                child.name.toLowerCase().includes('skybox') ||
                child.name.toLowerCase().includes('nebula') ||
                child.name.toLowerCase().includes('sketchfab')
            )) {
                console.log(`Found skybox object: ${child.name}, type: ${child.type}, isMesh: ${child.isMesh}`);

                if (child.isMesh) {
                    skyboxMesh = child;
                    skyboxParent = child.parent;
                }
            }
        });

        if (!skyboxMesh) {
            console.warn('⚠️ No skybox mesh found in wave model - background will not be visible');
            console.log('Tried searching for names containing: skybox, nebula, sketchfab');
            return;
        }

        console.log(`Skybox mesh found: ${skyboxMesh.name}`);
        console.log(`Skybox parent: ${skyboxParent ? skyboxParent.name : 'none'}`);
        console.log(`Skybox material:`, skyboxMesh.material);
        console.log(`Skybox visible: ${skyboxMesh.visible}`);

        // Create a dedicated container for the cloned skybox
        this.skyboxContainer = new THREE.Group();
        this.skyboxContainer.name = 'PersistentSkyboxContainer';

        // Clone the entire parent hierarchy to preserve transforms
        const skyboxClone = skyboxParent.clone(true);

        // Store original world scale/position/rotation of skybox before any transformations
        const originalWorldScale = new THREE.Vector3();
        const originalWorldPosition = new THREE.Vector3();
        const originalWorldQuaternion = new THREE.Quaternion();

        skyboxParent.getWorldScale(originalWorldScale);
        skyboxParent.getWorldPosition(originalWorldPosition);
        skyboxParent.getWorldQuaternion(originalWorldQuaternion);

        console.log(`Original skybox world scale: ${originalWorldScale.x.toFixed(3)}, ${originalWorldScale.y.toFixed(3)}, ${originalWorldScale.z.toFixed(3)}`);
        console.log(`Original skybox world position: ${originalWorldPosition.x.toFixed(3)}, ${originalWorldPosition.y.toFixed(3)}, ${originalWorldPosition.z.toFixed(3)}`);

        // Store these for later use
        this.originalSkyboxScale = originalWorldScale;
        this.originalSkyboxPosition = originalWorldPosition;
        this.originalSkyboxRotation = originalWorldQuaternion;

        // Apply the same transforms as the wave model will have
        // Get the wave model's bounding box for centering
        const box = new THREE.Box3();
        let frameCount = 0;

        this.models.wave.traverse((child) => {
            // Skip skybox when calculating center
            if (child.name && (
                child.name.toLowerCase().includes('sketchfab') ||
                child.name.toLowerCase().includes('nebula') ||
                child.name.toLowerCase().includes('skybox')
            )) {
                return;
            }

            if (child.isMesh && child.parent && child.parent.name && child.parent.name.startsWith('Frame_')) {
                box.expandByObject(child);
                frameCount++;
            }
        });

        if (frameCount === 0) {
            box.setFromObject(this.models.wave);
        }

        const center = box.getCenter(new THREE.Vector3());
        this.characterCenter = center; // Store for reference

        // Position the skybox clone to match where it would be in the wave model
        skyboxClone.position.copy(skyboxParent.position);
        skyboxClone.scale.copy(skyboxParent.scale);
        skyboxClone.rotation.copy(skyboxParent.rotation);

        // Apply initial 90-degree rotation on X-axis before animation starts
        skyboxClone.rotation.x += Math.PI / 2; // 90 degrees in radians
        console.log(`Applied initial 90° X-axis rotation to skybox`);

        this.skyboxContainer.add(skyboxClone);

        // Position the container relative to character center, but don't scale it
        this.skyboxContainer.position.x = -center.x - 0.07;
        this.skyboxContainer.position.y = -center.y;
        this.skyboxContainer.position.z = -center.z;

        // Preserve original scale (do NOT apply character scale to skybox)
        // The skybox in the GLB file is already sized correctly
        this.skyboxContainer.scale.copy(originalWorldScale);

        console.log(`Skybox container positioned at: x=${this.skyboxContainer.position.x.toFixed(3)}, y=${this.skyboxContainer.position.y.toFixed(3)}, z=${this.skyboxContainer.position.z.toFixed(3)}`);
        console.log(`Skybox container scale preserved: ${this.skyboxContainer.scale.x.toFixed(3)}, ${this.skyboxContainer.scale.y.toFixed(3)}, ${this.skyboxContainer.scale.z.toFixed(3)}`);

        // Add the container to the scene (this persists across model switches)
        this.scene.add(this.skyboxContainer);

        // Find and store reference to the cloned skybox mesh for rotation
        this.skyboxContainer.traverse((child) => {
            if (child.isMesh && child.name && (
                child.name.toLowerCase().includes('skybox') ||
                child.name.toLowerCase().includes('nebula')
            )) {
                this.skybox = child;
                console.log(`Stored reference to cloned skybox mesh: ${child.name}`);
                console.log(`  - Skybox clone visible: ${child.visible}`);
                console.log(`  - Skybox clone material:`, child.material);

                // Ensure the skybox is visible
                child.visible = true;
                if (child.material) {
                    // Make the material render on both sides
                    child.material.side = THREE.DoubleSide;
                    child.material.depthWrite = false; // Render skybox in background
                    child.material.needsUpdate = true;

                    console.log(`  - Set skybox material: side=DoubleSide, depthWrite=false`);
                    console.log(`  - Material has map: ${child.material.map !== null}`);
                    console.log(`  - Material has emissiveMap: ${child.material.emissiveMap !== null}`);
                }
            }
        });

        console.log('Persistent skybox container added to scene');
        console.log(`Skybox container has ${this.skyboxContainer.children.length} children`);

        // IMPORTANT: Remove the original skybox from the wave model
        // Otherwise it will overlap with our persistent rotating skybox
        if (skyboxParent && skyboxParent.parent) {
            console.log(`Removing original skybox parent "${skyboxParent.name}" from wave model`);
            skyboxParent.parent.remove(skyboxParent);
            console.log('Original skybox removed - only persistent skybox will be visible');
        }
    }

    /**
     * Setup background animation from wave model (plays continuously across all animations)
     */
    setupBackgroundAnimation() {
        console.log('=== Setting up background animation ===');

        if (!this.gltfObjects.wave) {
            console.warn('Wave GLTF object not loaded, cannot setup background animation');
            return;
        }

        const gltf = this.gltfObjects.wave;

        if (!gltf.animations || gltf.animations.length === 0) {
            console.warn('No animations found in wave model');
            return;
        }

        // Find the sketchfab_model animation
        const sketchfabAnimation = gltf.animations.find(anim =>
            anim.name.toLowerCase().includes('sketchfab')
        );

        if (!sketchfabAnimation) {
            console.warn('No sketchfab_model animation found');
            console.log('Available animations:', gltf.animations.map(a => a.name));
            return;
        }

        console.log(`Found sketchfab animation: "${sketchfabAnimation.name}" (${sketchfabAnimation.duration.toFixed(2)}s)`);

        // Create AnimationMixer for the skybox container (which holds the persistent skybox/sketchfab model)
        if (this.skyboxContainer) {
            this.animationMixer = new THREE.AnimationMixer(this.skyboxContainer);

            // Create and play the animation action
            this.backgroundAnimationAction = this.animationMixer.clipAction(sketchfabAnimation);
            this.backgroundAnimationAction.setLoop(THREE.LoopRepeat);
            this.backgroundAnimationAction.play();

            console.log('✓ Background animation started and will loop continuously');
        } else {
            console.warn('Skybox container not available for animation mixer');
        }
    }

    /**
     * Calculate uniform scale factor for all models
     */
    calculateUniformScale() {
        let maxModelSize = 0;

        // Iterate through all models to find the largest dimension
        Object.keys(this.models).forEach(modelName => {
            const model = this.models[modelName];
            const box = new THREE.Box3();
            let frameCount = 0;

            model.traverse((child) => {
                // Exclude skybox objects
                if (child.name && (
                    child.name.toLowerCase().includes('sketchfab') ||
                    child.name.toLowerCase().includes('nebula') ||
                    child.name.toLowerCase().includes('skybox')
                )) {
                    return;
                }

                // Only include meshes that are children of Frame groups
                if (child.isMesh && child.parent && child.parent.name && child.parent.name.startsWith('Frame_')) {
                    box.expandByObject(child);
                    frameCount++;
                }
            });

            // If no frame meshes found, use entire model
            if (frameCount === 0) {
                box.setFromObject(model);
            }

            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            if (maxDim > maxModelSize) {
                maxModelSize = maxDim;
            }

            console.log(`${modelName} model size: ${maxDim.toFixed(3)}`);
        });

        // Calculate uniform scale based on largest model
        this.uniformScale = maxModelSize > 0 ? 2.5 / maxModelSize : 1;
        console.log(`Uniform scale factor: ${this.uniformScale.toFixed(3)}`);

        // Do NOT scale the skybox container - it already has the correct scale from the GLB file
        // The skybox was designed at the correct size in the original 3D model
        if (this.skyboxContainer && this.originalSkyboxScale) {
            console.log(`Skybox scale preserved from GLB file: ${this.originalSkyboxScale.x.toFixed(3)}, ${this.originalSkyboxScale.y.toFixed(3)}, ${this.originalSkyboxScale.z.toFixed(3)}`);
        }
    }

    /**
     * Switch to a different model animation
     */
    switchToModel(modelName) {
        console.log(`Switching to ${modelName} model`);

        // Remove current model from scene if exists
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Set new current model
        this.currentModel = this.models[modelName];
        this.currentModelName = modelName;

        // Find the largest object for rotation (applies to all animations)
        this.findLargestObject();

        // Extract frames from the new model
        this.extractFrames();

        // Add model to scene
        this.scene.add(this.currentModel);

        // Check if we have cached position and scale for this model
        if (this.modelPositionCache[modelName] && this.modelScaleCache[modelName]) {
            // Use cached values to maintain consistent positioning
            const cachedPos = this.modelPositionCache[modelName];
            const cachedScale = this.modelScaleCache[modelName];

            this.currentModel.position.set(cachedPos.x, cachedPos.y, cachedPos.z);
            this.currentModel.scale.set(cachedScale.x, cachedScale.y, cachedScale.z);

            console.log(`Using cached position for ${modelName}: (${cachedPos.x.toFixed(3)}, ${cachedPos.y.toFixed(3)}, ${cachedPos.z.toFixed(3)})`);
        } else {
            // First time showing this model, center it and cache the result
            this.centerModel();

            // Cache the position and scale
            this.modelPositionCache[modelName] = {
                x: this.currentModel.position.x,
                y: this.currentModel.position.y,
                z: this.currentModel.position.z
            };
            this.modelScaleCache[modelName] = {
                x: this.currentModel.scale.x,
                y: this.currentModel.scale.y,
                z: this.currentModel.scale.z
            };

            console.log(`Cached position for ${modelName}: (${this.currentModel.position.x.toFixed(3)}, ${this.currentModel.position.y.toFixed(3)}, ${this.currentModel.position.z.toFixed(3)})`);
        }

        // Reset animation and start
        this.currentFrame = 0;
        this.animationRunning = false;
        this.startAnimation();
    }

    /**
     * Setup send button listener
     */
    setupSendButtonListener() {
        const sendButton = document.getElementById('sendMessage');
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                console.log('Send button pressed - triggering thinking animation');
                this.playThinkingAnimation();
            });
        } else {
            console.warn('Send button not found');
        }
    }

    /**
     * Setup click detection for heart animation
     */
    setupClickDetection() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn('Container not found for click detection');
            return;
        }

        container.addEventListener('click', (event) => this.onModelClick(event));
        console.log('Click detection setup - heart animation will play when Frame objects are clicked');
    }

    /**
     * Handle click on Frame objects
     */
    onModelClick(event) {
        // Don't trigger if heart animation is already playing
        if (this.heartAnimationPlaying) {
            console.log('Heart animation already playing, ignoring click');
            return;
        }

        // Get container bounds for mouse position calculation
        const container = document.getElementById(this.containerId);
        const rect = container.getBoundingClientRect();

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update the raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections with Frame objects only
        const intersects = [];
        if (this.currentModel) {
            this.currentModel.traverse((child) => {
                // Only check meshes that have "Frame" in their parent's name
                if (child.isMesh && child.parent && child.parent.name &&
                    child.parent.name.includes('Frame')) {
                    intersects.push(...this.raycaster.intersectObject(child, false));
                }
            });
        }

        if (intersects.length > 0) {
            console.log(`Frame object clicked (${intersects[0].object.parent.name})! Playing heart animation`);
            this.playHeartAnimation();
        }
    }

    /**
     * Play heart animation when Frame object is clicked
     * Plays once, then returns to idle animation while preserving model position
     */
    playHeartAnimation() {
        if (this.heartAnimationPlaying || !this.models.heart) {
            console.log('Heart animation cannot play:', {
                heartAnimationPlaying: this.heartAnimationPlaying,
                heartModelLoaded: !!this.models.heart
            });
            return;
        }

        console.log('Starting heart animation');
        console.log(`Current animation state when heart starts: ${this.animationState}`);
        console.log(`Current model when heart starts: ${this.currentModelName}`);

        // Clear any pending heart animation timeout from previous play
        if (this.heartAnimationTimeout) {
            clearTimeout(this.heartAnimationTimeout);
            this.heartAnimationTimeout = null;
            console.log('Cleared previous heart animation timeout');
        }

        // CRITICAL: Clear any pending main animation timeouts
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
            console.log('Cleared main animation timeout');
        }

        this.heartAnimationPlaying = true;

        // Save current animation state, model name, position and scale before switching
        this.savedAnimationState = this.animationState;
        this.savedModelName = this.currentModelName;

        this.savedModelPosition = {
            x: this.currentModel.position.x,
            y: this.currentModel.position.y,
            z: this.currentModel.position.z
        };

        this.savedModelScale = {
            x: this.currentModel.scale.x,
            y: this.currentModel.scale.y,
            z: this.currentModel.scale.z
        };

        console.log(`[Heart] Saved animation state: ${this.savedAnimationState}`);
        console.log(`[Heart] Saved model name: ${this.savedModelName}`);
        console.log(`[Heart] Saved ${this.currentModelName} position: (${this.savedModelPosition.x.toFixed(3)}, ${this.savedModelPosition.y.toFixed(3)}, ${this.savedModelPosition.z.toFixed(3)})`);
        console.log(`[Heart] Saved ${this.currentModelName} scale: ${this.savedModelScale.x.toFixed(3)}`);

        // DON'T save skybox position - skybox should remain fixed throughout all animations

        // Stop current animation
        this.animationRunning = false;

        // Remove current model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Set heart as current model
        this.currentModel = this.models.heart;
        this.currentModelName = 'heart';

        // Extract frames and setup heart model
        this.extractFrames();
        console.log(`Heart model has ${this.frames.length} frames extracted`);

        this.scene.add(this.currentModel);

        // Use the saved position and scale instead of centering
        // This preserves the model location and size
        this.currentModel.position.set(
            this.savedModelPosition.x,
            this.savedModelPosition.y,
            this.savedModelPosition.z
        );

        this.currentModel.scale.set(
            this.savedModelScale.x,
            this.savedModelScale.y,
            this.savedModelScale.z
        );

        console.log(`Applied saved position: (${this.savedModelPosition.x.toFixed(3)}, ${this.savedModelPosition.y.toFixed(3)}, ${this.savedModelPosition.z.toFixed(3)})`);
        console.log(`Applied saved scale to heart: ${this.savedModelScale.x.toFixed(3)}`);

        // Start heart animation (Frames 1-3: 100ms, Frames 4-5: 1200ms, Frame 6: 2000ms)
        this.currentFrame = 0;
        console.log('Starting heart frame playback from frame 0');
        this.playHeartFrames();
    }

    /**
     * Play heart animation frames with variable delays
     * Frames 1-3: 100ms, Frames 4-5: 1200ms, Frame 6: 2000ms
     */
    playHeartFrames() {
        // Clear any existing timeout
        if (this.heartAnimationTimeout) {
            clearTimeout(this.heartAnimationTimeout);
            this.heartAnimationTimeout = null;
        }

        if (this.currentFrame >= this.frames.length) {
            // Animation complete, restore previous state
            console.log(`Heart animation complete (played ${this.frames.length} frames), restoring previous state`);
            this.restoreAnimationState();
            return;
        }

        // Show current frame
        console.log(`[Heart] Playing frame ${this.currentFrame + 1}/${this.frames.length}`);
        this.showFrame(this.currentFrame);

        // Determine delay based on frame number
        // Frame 1-3 (indices 0-2): 100ms
        // Frame 4-5 (indices 3-4): 1200ms
        // Frame 6 (index 5, last frame): 2000ms
        let delay;
        const frameNumber = this.currentFrame + 1;
        const isLastFrame = (this.currentFrame === this.frames.length - 1);

        if (isLastFrame) {
            delay = 2000;
            console.log(`[Heart] Frame ${frameNumber} (last frame) - using 2000ms delay`);
        } else if (frameNumber >= 4 && frameNumber <= 5) {
            delay = 1200;
            console.log(`[Heart] Frame ${frameNumber} - using 1200ms delay`);
        } else {
            delay = 100;
            console.log(`[Heart] Frame ${frameNumber} - using 100ms delay`);
        }

        // Schedule next frame and store timeout ID
        this.currentFrame++;
        this.heartAnimationTimeout = setTimeout(() => this.playHeartFrames(), delay);
    }

    /**
     * Restore animation state after heart animation
     * Always returns to idle animation after heart completes
     */
    restoreAnimationState() {
        // Clear heart animation timeout
        if (this.heartAnimationTimeout) {
            clearTimeout(this.heartAnimationTimeout);
            this.heartAnimationTimeout = null;
        }

        // Remove heart model
        this.scene.remove(this.currentModel);

        // Always switch to idle after heart animation completes
        console.log(`Heart animation complete, switching to idle (was: ${this.savedAnimationState})`);

        this.animationState = 'idle';
        this.idleLoopCount = 1;

        // Set flag to transition to sleeping after idle completes one cycle
        this.transitionToSleepingAfterIdle = true;

        // Set model to idle
        this.currentModel = this.models['idle'];
        this.currentModelName = 'idle';

        // Find the largest object for rotation
        this.findLargestObject();

        // Extract frames from the new model
        this.extractFrames();

        // Add model to scene
        this.scene.add(this.currentModel);

        // Always use centerModel() for idle to position it correctly
        this.centerModel();
        console.log('Idle model positioned using centerModel() after heart animation');

        // Clean up saved state
        this.savedAnimationState = null;
        this.savedModelName = null;
        this.savedModelPosition = null;
        this.savedModelScale = null;

        // Reset animation and start idle
        this.currentFrame = 0;
        this.animationRunning = false;
        this.heartAnimationPlaying = false;
        this.startAnimation();

        console.log('Started idle animation after heart (will transition to sleeping after one cycle)');
    }

    /**
     * Find the skybox object for rotation (if it exists)
     */
    findLargestObject() {
        // Use the persistent skybox that was extracted from the wave model
        this.largestObject = this.skybox;

        if (this.largestObject) {
            console.log(`Using persistent skybox for rotation: ${this.largestObject.name}`);
        } else {
            console.log('No skybox available (rotation disabled)');
        }
    }

    /**
     * Play thinking animation when send button is pressed
     */
    playThinkingAnimation() {
        if (this.thinkingAnimationPlaying || !this.models.thinking) {
            console.log('Thinking animation cannot play:', {
                thinkingAnimationPlaying: this.thinkingAnimationPlaying,
                thinkingModelLoaded: !!this.models.thinking
            });
            return;
        }

        console.log('Starting thinking animation');
        console.log(`Current animation state when thinking starts: ${this.animationState}`);
        console.log(`Current model when thinking starts: ${this.currentModelName}`);

        // Clear any pending thinking animation timeout from previous play
        if (this.thinkingAnimationTimeout) {
            clearTimeout(this.thinkingAnimationTimeout);
            this.thinkingAnimationTimeout = null;
            console.log('Cleared previous thinking animation timeout');
        }

        // CRITICAL: Clear any pending main animation timeouts
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
            console.log('Cleared main animation timeout');
        }

        this.thinkingAnimationPlaying = true;
        this.thinkingLoopCount = 0; // Reset loop counter for frames 3-4

        // Save current model position and scale before switching
        this.savedModelPosition = {
            x: this.currentModel.position.x,
            y: this.currentModel.position.y,
            z: this.currentModel.position.z
        };

        this.savedModelScale = {
            x: this.currentModel.scale.x,
            y: this.currentModel.scale.y,
            z: this.currentModel.scale.z
        };

        console.log(`[Thinking] Saved ${this.currentModelName} position: (${this.savedModelPosition.x.toFixed(3)}, ${this.savedModelPosition.y.toFixed(3)}, ${this.savedModelPosition.z.toFixed(3)})`);
        console.log(`[Thinking] Saved ${this.currentModelName} scale: ${this.savedModelScale.x.toFixed(3)}`);

        // Stop current animation
        this.animationRunning = false;

        // Remove current model
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }

        // Set thinking as current model
        this.currentModel = this.models.thinking;
        this.currentModelName = 'thinking';

        // Extract frames and setup thinking model
        this.extractFrames();
        console.log(`Thinking model has ${this.frames.length} frames extracted`);

        this.scene.add(this.currentModel);

        // Use the saved position and scale instead of centering
        // This preserves the model location and size
        this.currentModel.position.set(
            this.savedModelPosition.x,
            this.savedModelPosition.y,
            this.savedModelPosition.z
        );

        this.currentModel.scale.set(
            this.savedModelScale.x,
            this.savedModelScale.y,
            this.savedModelScale.z
        );

        console.log(`Applied saved position: (${this.savedModelPosition.x.toFixed(3)}, ${this.savedModelPosition.y.toFixed(3)}, ${this.savedModelPosition.z.toFixed(3)})`);
        console.log(`Applied saved scale to thinking: ${this.savedModelScale.x.toFixed(3)}`);

        // Start thinking animation (Frames 1-3: 150ms, Frames 4+: 500ms)
        this.currentFrame = 0;
        console.log('Starting thinking frame playback from frame 0');
        this.playThinkingFrames();
    }

    /**
     * Play thinking animation frames with variable delays
     * Frames 1-2: 150ms, Frames 3-4: loop 4 times (Frame 3: 150ms, Frame 4: 500ms), Frames 5+: 1000ms, Last frame: 2500ms
     */
    playThinkingFrames() {
        // Clear any existing timeout
        if (this.thinkingAnimationTimeout) {
            clearTimeout(this.thinkingAnimationTimeout);
            this.thinkingAnimationTimeout = null;
        }

        if (this.currentFrame >= this.frames.length) {
            // Animation complete, restore idle state
            console.log(`Thinking animation complete (played ${this.frames.length} frames), restoring idle state`);
            this.restoreAfterThinking();
            return;
        }

        // Show current frame
        console.log(`[Thinking] Playing frame ${this.currentFrame + 1}/${this.frames.length}`);
        this.showFrame(this.currentFrame);

        // Determine delay based on frame number
        // Frames 1-2 (indices 0-1): 150ms
        // Frame 3 (index 2): 150ms (part of loop)
        // Frame 4 (index 3): 500ms (part of loop, loops back to frame 3 four times)
        // Frames 5+ (indices 4+): 1000ms
        // Last frame: 2500ms
        let delay;
        const frameNumber = this.currentFrame + 1;
        const isLastFrame = frameNumber === this.frames.length;

        if (frameNumber <= 2) {
            delay = 150;
            console.log(`[Thinking] Frame ${frameNumber} - using 150ms delay`);
            this.currentFrame++;
        } else if (frameNumber === 3) {
            delay = 150;
            console.log(`[Thinking] Frame ${frameNumber} (loop ${this.thinkingLoopCount + 1}/4) - using 150ms delay`);
            this.currentFrame++;
        } else if (frameNumber === 4) {
            delay = 500;
            this.thinkingLoopCount++;
            console.log(`[Thinking] Frame ${frameNumber} (loop ${this.thinkingLoopCount}/4) - using 500ms delay`);

            if (this.thinkingLoopCount < 4) {
                // Loop back to frame 3 (index 2)
                this.currentFrame = 2;
                console.log(`[Thinking] Looping back to frame 3`);
            } else {
                // Completed 4 loops, continue to next frame
                this.currentFrame++;
                console.log(`[Thinking] Completed 4 loops, continuing to frame 5`);
            }
        } else if (isLastFrame) {
            delay = 2500;
            console.log(`[Thinking] Frame ${frameNumber} (last frame) - using 2500ms delay`);
            this.currentFrame++;
        } else {
            delay = 1000;
            console.log(`[Thinking] Frame ${frameNumber} - using 1000ms delay`);
            this.currentFrame++;
        }

        // Schedule next frame and store timeout ID
        this.thinkingAnimationTimeout = setTimeout(() => this.playThinkingFrames(), delay);
    }

    /**
     * Restore animation state after thinking animation
     * Always returns to idle animation after thinking completes
     */
    restoreAfterThinking() {
        // Clear thinking animation timeout
        if (this.thinkingAnimationTimeout) {
            clearTimeout(this.thinkingAnimationTimeout);
            this.thinkingAnimationTimeout = null;
        }

        // Remove thinking model
        this.scene.remove(this.currentModel);

        // Always switch to idle animation after thinking completes
        console.log('Thinking animation complete, switching to idle');
        this.animationState = 'idle';
        this.idleLoopCount = 1;
        this.sendButtonPressed = false; // Reset the send button flag

        // Set new current model
        this.currentModel = this.models['idle'];
        this.currentModelName = 'idle';

        // Find the largest object for rotation
        this.findLargestObject();

        // Extract frames from the new model
        this.extractFrames();

        // Add model to scene
        this.scene.add(this.currentModel);

        // Always center the idle model correctly instead of restoring saved position
        // This ensures idle is always positioned correctly
        this.centerModel();
        console.log('Idle model repositioned using centerModel() after thinking animation');

        // Clean up saved position/scale
        this.savedModelPosition = null;
        this.savedModelScale = null;

        // Reset animation and start idle
        this.currentFrame = 0;
        this.animationRunning = false;
        this.thinkingAnimationPlaying = false;
        this.startAnimation();

        console.log('Switched to idle animation after thinking');
    }

    /**
     * Extract frame collections from the model
     */
    extractFrames() {
        this.frames = [];
        const allObjects = [];

        // First, log all object names to debug
        console.log('=== All objects in model ===');
        this.currentModel.traverse((child) => {
            console.log(`Object: "${child.name}", Type: ${child.type}`);
            allObjects.push(child);
        });

        // Map Plane and Frame groups to frame numbers
        const frameMapping = {
            'Plane022': 14,
            'Plane021': 15,
            'Plane019': 16,
            'Plane017': 17,
            'Plane015': 18,
            'Plane014': 19,
            'Plane013': 20,
            'Plane012': 21
        };

        // Traverse the model to find frame collections
        this.currentModel.traverse((child) => {
            if (child.type === 'Group') {
                let frameNumber = null;

                // Check for Frame_ groups (Frame_1 -> 1, Frame_10 -> 10, Frame_11 -> 11, etc.)
                if (child.name && child.name.startsWith('Frame_')) {
                    const frameMatch = child.name.match(/^Frame_(\d+)/i);
                    if (frameMatch) {
                        frameNumber = parseInt(frameMatch[1]);
                    }
                }
                // Check for Plane groups (Plane022 -> 14, Plane021 -> 15, etc.)
                else if (child.name && frameMapping[child.name]) {
                    frameNumber = frameMapping[child.name];
                }

                // If we found a frame number, add it to our frames array
                if (frameNumber !== null) {
                    console.log(`Found frame: "${child.name}" -> Frame ${frameNumber}, Type: ${child.type}`);
                    this.frames.push({
                        number: frameNumber,
                        object: child,
                        name: child.name,
                        originalY: child.position.y // Store original Y position for floating animation
                    });
                }
            }

            // Hide the "Collection" collection
            if (child.name && child.name.toLowerCase() === 'collection') {
                console.log(`Hiding "Collection" object: ${child.name}`);
                child.visible = false;
            }
        });

        // Sort frames by number in ascending order (1 to 21) to play backwards
        this.frames.sort((a, b) => a.number - b.number);

        console.log(`=== Found ${this.frames.length} frames ===`);
        this.frames.forEach(frame => {
            console.log(`Frame ${frame.number}: ${frame.name}`);
        });

        // Initially hide all frames
        this.hideAllFrames();
    }

    /**
     * Hide all frames
     */
    hideAllFrames() {
        this.frames.forEach(frame => {
            this.setFrameVisibility(frame.object, false);
        });
    }

    /**
     * Set visibility for a frame and all its children
     */
    setFrameVisibility(object, visible) {
        object.visible = visible;
        // Also set visibility for all children
        object.traverse((child) => {
            child.visible = visible;
        });
    }

    /**
     * Show a specific frame
     */
    showFrame(frameIndex) {
        this.hideAllFrames();

        if (frameIndex >= 0 && frameIndex < this.frames.length) {
            const frame = this.frames[frameIndex];
            console.log(`[${this.currentModelName}] Showing frame ${frame.number}: ${frame.name} (index: ${frameIndex})`);

            this.setFrameVisibility(frame.object, true);

            // Verify visibility was set
            let visibleMeshCount = 0;
            let hiddenMeshCount = 0;
            frame.object.traverse((child) => {
                if (child.isMesh) {
                    if (child.visible) {
                        visibleMeshCount++;
                    } else {
                        hiddenMeshCount++;
                    }
                }
            });
            console.log(`  └─ Visible meshes in ${frame.name}: ${visibleMeshCount}, Hidden: ${hiddenMeshCount}`);
        }
    }

    /**
     * Center and scale the model to fit the view
     */
    centerModel() {
        // Calculate bounding box only from Frame objects, excluding skybox
        const box = new THREE.Box3();
        let frameCount = 0;

        this.currentModel.traverse((child) => {
            // Exclude skybox objects (Sketchfab_model, Nebula_Skybox, etc.)
            if (child.name && (
                child.name.toLowerCase().includes('sketchfab') ||
                child.name.toLowerCase().includes('nebula') ||
                child.name.toLowerCase().includes('skybox')
            )) {
                return; // Skip skybox objects
            }

            // Only include meshes that are children of Frame groups
            if (child.isMesh && child.parent && child.parent.name && child.parent.name.startsWith('Frame_')) {
                box.expandByObject(child);
                frameCount++;
            }
        });

        console.log(`Centering on ${frameCount} Frame meshes`);

        // If no frame meshes found, use the entire model for bounding box
        if (frameCount === 0) {
            console.log('No Frame meshes found, using entire model for centering');
            box.setFromObject(this.currentModel);
        }

        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model with model-specific horizontal offset
        let horizontalOffset = -0.07; // Default offset (moves left)
        let verticalOffset = 0; // Default vertical offset
        let depthOffset = 0; // Default depth offset (Z-axis, towards/away from camera)

        // Apply specific offsets for each model
        if (this.currentModelName === 'wave') {
            depthOffset = 0.01; // Move wave model 0.01 units closer to screen (towards camera)
        } else if (this.currentModelName === 'idle') {
            horizontalOffset = 0.00; // Move idle model 0.07 units to the right (from -0.07 to 0.00)
            verticalOffset = -0.03; // Move idle model 0.03 units down
        } else if (this.currentModelName === 'sleeping') {
            verticalOffset = -0.13; // Move sleeping model 0.13 units down
        }

        this.currentModel.position.x = -center.x + horizontalOffset;
        this.currentModel.position.y = -center.y + verticalOffset;
        this.currentModel.position.z = -center.z + depthOffset;

        // DON'T update skybox position when switching models - keep it fixed
        // The skybox was positioned once during initialization and should remain stable
        // Only the character models should move, not the background

        // Use uniform scale for all models, with model-specific adjustments
        let scale = this.uniformScale || 1;

        // Apply model-specific scale adjustments
        if (this.currentModelName === 'wave') {
            scale *= 1.03; // Make wave model 3% bigger
        }

        this.currentModel.scale.set(scale, scale, scale);
        console.log(`Applied scale for ${this.currentModelName}: ${scale.toFixed(3)}`);
    }

    /**
     * Start the frame-by-frame animation
     */
    startAnimation() {
        if (this.frames.length === 0) {
            console.warn('No frames found to animate');
            return;
        }

        console.log(`Starting animation with ${this.frames.length} frames`);
        this.animationRunning = true;

        // For sleeping animation on subsequent loops, start at frame 1 (skip Frame_1)
        if (this.currentModelName === 'sleeping' && this.sleepingLoopCount > 0) {
            this.currentFrame = 1;
            console.log(`Sleeping loop ${this.sleepingLoopCount + 1}: Starting at Frame_2 (skipping Frame_1)`);
        } else {
            this.currentFrame = 0;
        }

        this.playNextFrame();
    }

    /**
     * Play the next frame in sequence
     */
    playNextFrame() {
        // Clear any existing timeout
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }

        if (!this.animationRunning || this.frames.length === 0) {
            return;
        }

        // Show current frame
        this.showFrame(this.currentFrame);

        // Use different delays based on animation state
        let delay = 180; // Default for wave

        if (this.currentModelName === 'idle') {
            // Check if this is the last frame (Frame_3, index 2)
            if (this.currentFrame === this.frames.length - 1) {
                delay = 4000; // Frame_3 uses 4000ms delay
            } else {
                delay = 120; // Frame_1 and Frame_2 use 120ms delay
            }
        } else if (this.currentModelName === 'sleeping') {
            // Frame_1 (index 0) uses 500ms, Frame_2/3/4 (indices 1-3) use 900ms
            if (this.currentFrame === 0) {
                delay = 500; // Frame_1 delay
            } else {
                delay = 900; // Frame_2, Frame_3, Frame_4 delay
            }
        }

        // Debug logging for sleeping and idle animations
        if (this.currentModelName === 'sleeping') {
            console.log(`Sleeping frame ${this.currentFrame}, loop count: ${this.sleepingLoopCount}, delay: ${delay}ms`);
        } else if (this.currentModelName === 'idle') {
            console.log(`Idle frame ${this.currentFrame}, loop count: ${this.idleLoopCount}, delay: ${delay}ms`);
        }

        // Move to next frame (forwards)
        this.currentFrame++;

        // Check if animation completed
        if (this.currentFrame >= this.frames.length) {
            this.currentFrame = 0;
            console.log(`${this.currentModelName} animation loop complete`);
            // Schedule completion callback after the delay so the last frame is visible
            this.animationTimeout = setTimeout(() => this.onAnimationComplete(), delay);
            return;
        }

        // Schedule next frame and store timeout ID
        this.animationTimeout = setTimeout(() => this.playNextFrame(), delay);
    }

    /**
     * Handle animation completion and state transitions
     */
    onAnimationComplete() {
        if (this.animationState === 'wave') {
            // Wave complete, switch to idle
            console.log('Wave animation complete, switching to idle');
            this.animationState = 'idle';
            this.idleLoopCount = 1;
            this.switchToModel('idle');
        } else if (this.animationState === 'idle') {
            this.idleLoopCount++;
            console.log(`Idle loop ${this.idleLoopCount} of ${this.maxIdleLoops} complete`);

            // Check if we need to transition to sleeping after heart animation
            if (this.transitionToSleepingAfterIdle) {
                // One idle cycle complete after heart, switch to sleeping
                console.log('Idle cycle after heart complete, transitioning to sleeping');
                this.transitionToSleepingAfterIdle = false; // Clear the flag
                this.animationState = 'sleeping';
                this.sleepingLoopCount = 0; // Reset sleeping loop counter
                this.switchToModel('sleeping');
            } else if (this.idleLoopCount < this.maxIdleLoops) {
                // Continue idle loop (normal behavior)
                this.currentFrame = 0;
                this.startAnimation();
            } else {
                // Idle loops complete, switch to sleeping (normal behavior)
                console.log('Idle loops complete, switching to sleeping');
                this.animationState = 'sleeping';
                this.sleepingLoopCount = 0; // Reset sleeping loop counter
                this.switchToModel('sleeping');
            }
        } else if (this.animationState === 'sleeping') {
            // Increment sleeping loop count
            this.sleepingLoopCount++;
            console.log(`Sleeping loop ${this.sleepingLoopCount} complete`);

            // Check if send button was pressed
            if (this.sendButtonPressed) {
                console.log('Send button pressed, switching to idle');
                this.sendButtonPressed = false;
                this.animationState = 'idle';
                this.idleLoopCount = 1;
                this.sleepingLoopCount = 0; // Reset sleeping loop counter
                this.switchToModel('idle');
            } else {
                // Continue sleeping loop
                console.log('Still sleeping, looping...');
                this.currentFrame = 0;
                this.startAnimation();
            }
        }
    }

    /**
     * Stop the animation
     */
    stopAnimation() {
        this.animationRunning = false;
    }

    /**
     * Handle load progress
     */
    onLoadProgress(progress, modelName) {
        if (progress.lengthComputable) {
            const percentComplete = (progress.loaded / progress.total) * 100;
            console.log(`Loading ${modelName} model: ${percentComplete.toFixed(2)}%`);
        }
    }

    /**
     * Handle load error
     */
    onLoadError(error, modelName) {
        console.error(`Error loading ${modelName} model:`, error);
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const container = document.getElementById(this.containerId);

        if (!container) {
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // Update animation mixer for background animation
        if (this.animationMixer) {
            const delta = this.clock.getDelta();
            this.animationMixer.update(delta);
        }

        // Rotate the persistent skybox continuously for all animations
        // This rotation is never reset, ensuring smooth continuous rotation across animation switches
        if (this.largestObject) {
            this.largestObject.rotation.y += 0.0005; // Rotating on Y-axis (spinning effect)
        }

        // Apply floating animation to all Frame objects
        const elapsedTime = Date.now() - this.floatStartTime;
        const floatOffset = Math.sin(elapsedTime * this.floatSpeed) * this.floatAmplitude;

        this.frames.forEach(frame => {
            if (frame.object && frame.originalY !== undefined) {
                frame.object.position.y = frame.originalY + floatOffset;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.stopAnimation();

        // Stop animation mixer
        if (this.animationMixer) {
            this.animationMixer.stopAllAction();
            this.animationMixer = null;
        }

        if (this.renderer) {
            this.renderer.dispose();
        }

        // Remove all models from scene
        if (this.models.wave) this.scene.remove(this.models.wave);
        if (this.models.idle) this.scene.remove(this.models.idle);
        if (this.models.sleeping) this.scene.remove(this.models.sleeping);
        if (this.models.heart) this.scene.remove(this.models.heart);
        if (this.models.thinking) this.scene.remove(this.models.thinking);

        // Remove persistent skybox container
        if (this.skyboxContainer) this.scene.remove(this.skyboxContainer);

        window.removeEventListener('resize', this.onWindowResize);
    }
}
