# Adding Heart Animation to Soul Buddy

This guide explains how to add the heart animation to the Soul Buddy animator system.

## Background

The Soul Buddy animator now supports continuous background animation playback. The `sketchfab_model` animation from `soul-buddy-wave-2.glb` plays continuously in the background across all frame-based animations (wave, idle, sleeping, and the upcoming heart animation).

## Steps to Add Heart Animation

### 1. Prepare the Heart GLB Model

Create or obtain a GLB file for the heart animation:
- File name: `soul-buddy-heart-1.glb`
- Location: `/Models/soul-buddy-heart-1.glb`
- Should follow the same structure as other animations:
  - Frame groups named `Frame_1`, `Frame_2`, etc.
  - Each frame contains meshes to display for that frame
  - Can include the skybox/sketchfab model (it will be automatically excluded from frame display)

### 2. Update the Constructor

In `soul-buddy-animator.js`, update the constructor to accept a heart model path:

```javascript
constructor(waveModelPath, idleModelPath, sleepingModelPath, heartModelPath, containerId) {
    this.waveModelPath = waveModelPath;
    this.idleModelPath = idleModelPath;
    this.sleepingModelPath = sleepingModelPath;
    this.heartModelPath = heartModelPath;  // Add this line
    this.containerId = containerId;
    // ... rest of constructor
}
```

### 3. Add Heart to Models Object

Update the models and gltfObjects initialization:

```javascript
// Store loaded models
this.models = {
    wave: null,
    idle: null,
    sleeping: null,
    heart: null  // Add this
};
// Store full GLTF objects with animations
this.gltfObjects = {
    wave: null,
    idle: null,
    sleeping: null,
    heart: null  // Add this
};
```

### 4. Update Total Models Count

In the `loadModel()` method, update the total models count:

```javascript
const totalModels = 4;  // Change from 3 to 4
```

### 5. Add Heart Model Loading

Add the heart model loader in the `loadModel()` method:

```javascript
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
```

### 6. Add Heart Animation State

Update the state machine in `onAnimationComplete()` to include heart animation transitions. Example:

```javascript
// Add heart state handling
else if (this.animationState === 'heart') {
    console.log('Heart animation complete, switching to idle');
    this.animationState = 'idle';
    this.idleLoopCount = 1;
    this.switchToModel('idle');
}
```

### 7. Trigger Heart Animation

Add a method to trigger the heart animation (e.g., when user sends a specific message type):

```javascript
/**
 * Trigger heart animation
 */
triggerHeartAnimation() {
    if (this.models.heart) {
        console.log('Triggering heart animation');
        this.animationState = 'heart';
        this.switchToModel('heart');
    } else {
        console.warn('Heart model not loaded');
    }
}
```

### 8. Update HTML Initialization

In `index.html`, update the animator initialization to include the heart model:

```javascript
const animator = new SoulBuddyAnimator(
    '/Models/soul-buddy-wave-2.glb?v=1760953584',
    '/Models/soul-buddy-idle-1.glb?v=1760953584',
    '/Models/soul-buddy-sleeping-1.glb?v=1760953584',
    '/Models/soul-buddy-heart-1.glb?v=1760953584',  // Add this
    'soulBuddyContainer'
);
```

### 9. Optional: Adjust Frame Timing

In the `playNextFrame()` method, add specific timing for heart animation frames:

```javascript
else if (this.currentModelName === 'heart') {
    // Set appropriate delays for heart animation frames
    delay = 150; // or whatever timing works best
}
```

### 10. Optional: Add Positioning Offsets

If the heart animation needs specific positioning, add it in the `centerModel()` method:

```javascript
else if (this.currentModelName === 'heart') {
    horizontalOffset = 0.00;  // Adjust as needed
    verticalOffset = 0.00;    // Adjust as needed
}
```

## Important Notes

1. **Background Animation**: The `sketchfab_model` animation will automatically play in the background during the heart animation, just like it does for wave, idle, and sleeping animations.

2. **Uniform Scaling**: The heart model will automatically use the same uniform scale factor calculated across all models to ensure consistent sizing.

3. **Frame Structure**: Make sure your heart GLB file follows the same frame naming convention (`Frame_1`, `Frame_2`, etc.) as the other animations.

4. **Testing**: After adding the heart animation, test that:
   - The model loads correctly
   - Frames animate in sequence
   - Background animation continues playing
   - Transitions to/from other animations work smoothly

## Architecture Benefits

The current architecture provides:
- **Modularity**: Easy to add new animations by following the established pattern
- **Consistency**: Uniform scaling and background animation across all states
- **Persistence**: Skybox and background animations persist across model switches
- **Flexibility**: Each animation can have custom frame timings and positioning offsets
