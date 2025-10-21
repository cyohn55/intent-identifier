/**
 * GLB Animation Inspector
 *
 * This script inspects GLB files to list all available animations
 * Usage: node inspect-glb-animations.js <path-to-glb-file>
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get file path from command line
const glbPath = process.argv[2];

if (!glbPath) {
    console.error('Usage: node inspect-glb-animations.js <path-to-glb-file>');
    process.exit(1);
}

const fullPath = resolve(glbPath);

console.log(`\n=== Inspecting GLB file: ${fullPath} ===\n`);

const loader = new GLTFLoader();

loader.load(
    fullPath,
    (gltf) => {
        console.log('✓ GLB file loaded successfully\n');

        // List all animations
        console.log(`Found ${gltf.animations.length} animation(s):\n`);

        gltf.animations.forEach((animation, index) => {
            console.log(`Animation ${index + 1}:`);
            console.log(`  Name: "${animation.name}"`);
            console.log(`  Duration: ${animation.duration.toFixed(3)} seconds`);
            console.log(`  Tracks: ${animation.tracks.length}`);
            console.log(`  Tracks details:`);

            animation.tracks.forEach((track, trackIndex) => {
                console.log(`    Track ${trackIndex + 1}: ${track.name}`);
                console.log(`      Type: ${track.ValueTypeName}`);
                console.log(`      Times: ${track.times.length} keyframes`);
            });
            console.log('');
        });

        // List all objects in the scene
        console.log('Objects in scene:');
        let objectCount = 0;
        gltf.scene.traverse((child) => {
            objectCount++;
            console.log(`  ${child.name} (${child.type})`);
        });
        console.log(`\nTotal objects: ${objectCount}\n`);

        process.exit(0);
    },
    (progress) => {
        if (progress.lengthComputable) {
            const percent = (progress.loaded / progress.total) * 100;
            console.log(`Loading: ${percent.toFixed(1)}%`);
        }
    },
    (error) => {
        console.error('✗ Error loading GLB file:', error);
        process.exit(1);
    }
);
