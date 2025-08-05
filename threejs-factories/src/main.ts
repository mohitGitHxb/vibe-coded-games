import "./style.css";
import * as THREE from "three";
import { MaterialFactory } from "./materials/index.js";
import { AudioFactory } from "./audios/index.js";
import { WorldManager } from "./world/index.js";
// Uncomment the line below to enable input controls:
// import { DemoInputController, createInputStatusDisplay, updateInputStatusDisplay } from "./input-integration.js";
import {
  materialDefinitions,
  worldLightingPresets,
  worldSkyboxPresets,
  worldCameraPresets,
} from "./ui-demo.js";
import type { MaterialType } from "./materials/types/MaterialTypes.js";
import type { SoundType } from "./audios/types/AudioTypes.js";

console.log("🎮 Three.js Factories Demo - Interactive 3D Showcase");

// Factories
let worldManager: WorldManager;
let materialFactory: MaterialFactory;
let audioFactory: AudioFactory;
let audioListener: THREE.AudioListener;

// 3D Objects
let demoObjects: {
  sphere: THREE.Mesh;
  cube: THREE.Mesh;
  torus: THREE.Mesh;
  plane: THREE.Mesh;
  cylinder: THREE.Mesh;
};

// Camera controls
let cameraRadius = 8;
let cameraAngle = 0;
let cameraHeight = 3;

// Current state
let currentMaterial: MaterialType = "grass";
let activeSounds = new Map<string, THREE.Audio | THREE.PositionalAudio>();
let cameraRotationPaused = false;

// Input controller (uncomment to enable)
// let inputController: DemoInputController;

// Initialize the demo
async function init() {
  // Create world with custom configuration
  worldManager = new WorldManager({
    background: 0x1a1a2e,
    fog: { type: "linear", color: 0x1a1a2e, near: 50, far: 200 },
    shadows: { enabled: true, mapSize: 2048 },
  });

  // Setup camera with initial position
  const camera = worldManager.usePerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  updateCameraPosition();

  // Create and configure renderer
  const renderer = worldManager.createRenderer();
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  // Setup audio
  audioListener = new THREE.AudioListener();
  camera.add(audioListener);

  // Add studio lighting for better visuals
  worldManager.addLight("ambient", {
    type: "ambient",
    color: 0x404040,
    intensity: 0.3,
  });

  worldManager.addLight("main", {
    type: "directional",
    color: 0xffffff,
    intensity: 1.2,
    position: [10, 10, 5],
    castShadow: true,
  });

  worldManager.addLight("accent1", {
    type: "point",
    color: 0x4fc3f7,
    intensity: 0.5,
    position: [-5, 5, 5],
    distance: 20,
  });

  worldManager.addLight("accent2", {
    type: "point",
    color: 0xff6b95,
    intensity: 0.3,
    position: [5, -2, -5],
    distance: 15,
  });

  // Add gradient skybox
  await worldManager.addSkybox({
    type: "gradient",
    colors: ["#1a1a2e", "#16213e", "#0f3460"],
  });

  // Initialize factories
  materialFactory = new MaterialFactory();
  audioFactory = new AudioFactory(audioListener);

  // Setup input controls (uncomment to enable)
  // inputController = new DemoInputController();
  // inputController.enable();
  // setupInputIntegration();

  // Create demo objects
  await createDemoObjects();

  // Setup UI
  setupUI();

  // Start render loop
  animate();

  console.log("✅ 3D Demo initialized successfully with WorldManager");
}

// Create demo objects with initial materials
async function createDemoObjects() {
  try {
    const grassMaterial = await materialFactory.createMaterial("grass");

    // Create multiple objects with different geometries
    demoObjects = {
      sphere: new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        grassMaterial.clone()
      ),
      cube: new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        grassMaterial.clone()
      ),
      torus: new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.4, 16, 100),
        grassMaterial.clone()
      ),
      plane: new THREE.Mesh(
        new THREE.PlaneGeometry(8, 8),
        grassMaterial.clone()
      ),
      cylinder: new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.8, 2.5, 32),
        grassMaterial.clone()
      ),
    };

    // Position objects
    demoObjects.sphere.position.set(-3, 2, 0);
    demoObjects.cube.position.set(3, 1, 0);
    demoObjects.torus.position.set(0, 2.5, -3);
    demoObjects.plane.position.set(0, -1, 0);
    demoObjects.plane.rotation.x = -Math.PI / 2;
    demoObjects.cylinder.position.set(0, 0.5, 3);

    // Enable shadows and add to world
    Object.values(demoObjects).forEach((obj, index) => {
      obj.castShadow = true;
      obj.receiveShadow = true;
      worldManager.addObject(`demo-object-${index}`, obj);
    });

    console.log("✅ Demo objects created");
  } catch (error) {
    console.error("Failed to create demo objects:", error);
  }
}

// Update camera position in circular motion
function updateCameraPosition() {
  const x = Math.cos(cameraAngle) * cameraRadius;
  const z = Math.sin(cameraAngle) * cameraRadius;
  const camera = worldManager.getCamera();
  camera.position.set(x, cameraHeight, z);
  camera.lookAt(0, 1, 0);
}

// Apply material to all objects
async function applyMaterialToObjects(materialType: MaterialType) {
  try {
    const material = await materialFactory.createMaterial(materialType);

    // Apply to all objects
    Object.values(demoObjects).forEach((obj) => {
      // Dispose old material
      if (obj.material instanceof THREE.Material) {
        obj.material.dispose();
      }
      // Clone material for each object
      obj.material = material.clone();
    });

    currentMaterial = materialType;
    updateInfoPanel(materialType);

    console.log(`✅ Applied material: ${materialType}`);
  } catch (error) {
    console.error(`Failed to apply material ${materialType}:`, error);
  }
}

// Play audio sound
async function playSound(soundType: SoundType) {
  try {
    // Stop previous sounds
    activeSounds.forEach((sound) => {
      if (sound.isPlaying) sound.stop();
    });
    activeSounds.clear();

    // Create and play new sound
    const sound = await audioFactory.createSound(soundType);
    if (sound) {
      activeSounds.set(soundType, sound);
      sound.play();
      console.log(`🔊 Playing sound: ${soundType}`);
    }
  } catch (error) {
    console.error(`Failed to play sound ${soundType}:`, error);
  }
}

// Camera control functions
function toggleCameraRotation() {
  cameraRotationPaused = !cameraRotationPaused;
  const button = document.getElementById("pause-camera");
  if (button) {
    button.textContent = cameraRotationPaused
      ? "▶️ Resume Rotation"
      : "⏸️ Pause Rotation";
  }
}

function resetCamera() {
  cameraAngle = 0;
  cameraRadius = 8;
  cameraHeight = 3;
  updateCameraPosition();
}

// World control functions
async function changeLightingPreset(presetType: string) {
  try {
    worldManager.clearLights();

    switch (presetType) {
      case "default":
        worldManager.addDefaultLighting();
        break;
      case "studio":
        worldManager.addStudioLighting();
        break;
      case "outdoor":
        worldManager.addOutdoorLighting();
        break;
      case "night":
        worldManager.addLight("ambient", {
          type: "ambient",
          color: 0x202040,
          intensity: 0.1,
        });
        worldManager.addLight("moon", {
          type: "directional",
          color: 0xaaaaff,
          intensity: 0.5,
          position: [50, 100, 20],
          castShadow: true,
        });
        break;
    }

    console.log(`✅ Applied lighting preset: ${presetType}`);
  } catch (error) {
    console.error(`Failed to apply lighting preset ${presetType}:`, error);
  }
}

async function changeSkyboxPreset(presetType: string, colors?: string[]) {
  try {
    await worldManager.addSkybox({
      type: presetType as any,
      colors: colors || undefined,
    });

    console.log(`✅ Applied skybox preset: ${presetType}`);
  } catch (error) {
    console.error(`Failed to apply skybox preset ${presetType}:`, error);
  }
}

function changeCameraPreset(presetType: string) {
  try {
    const camera = worldManager.getCamera();

    switch (presetType) {
      case "3d-orbital":
        // Reset to current orbital camera
        cameraRadius = 8;
        cameraHeight = 3;
        cameraAngle = 0;
        cameraRotationPaused = false;
        updateCameraPosition();
        break;

      case "3d-firstperson":
        cameraRotationPaused = true;
        camera.position.set(0, 1.7, 0); // Eye level
        camera.lookAt(0, 1.7, -5); // Looking forward
        break;

      case "2d-topdown":
        cameraRotationPaused = true;
        camera.position.set(0, 15, 0); // High above
        camera.lookAt(0, 0, 0); // Looking down
        break;

      case "2d-sidescroll":
        cameraRotationPaused = true;
        camera.position.set(0, 2, 10); // Side view
        camera.lookAt(0, 2, 0); // Looking at center
        break;

      case "isometric":
        cameraRotationPaused = true;
        camera.position.set(10, 10, 10); // Isometric angle
        camera.lookAt(0, 0, 0);
        break;
    }

    console.log(`✅ Applied camera preset: ${presetType}`);
  } catch (error) {
    console.error(`Failed to apply camera preset ${presetType}:`, error);
  }
}

// Setup UI controls
function setupUI() {
  // Group materials by category
  const materialsByCategory = materialDefinitions.reduce((acc, mat) => {
    if (!acc[mat.category]) acc[mat.category] = [];
    acc[mat.category].push(mat);
    return acc;
  }, {} as Record<string, typeof materialDefinitions>);

  // Create category panels
  const rightPanel = document.getElementById("material-categories");
  if (rightPanel) {
    rightPanel.innerHTML = "";

    Object.entries(materialsByCategory).forEach(([category, materials]) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category-section";

      const categoryTitle = document.createElement("h4");
      categoryTitle.textContent = category;
      categoryTitle.style.color = "#4fc3f7";
      categoryTitle.style.margin = "15px 0 8px 0";
      categoryTitle.style.fontSize = "14px";
      categoryDiv.appendChild(categoryTitle);

      const buttonsContainer = document.createElement("div");
      buttonsContainer.style.display = "flex";
      buttonsContainer.style.flexWrap = "wrap";
      buttonsContainer.style.gap = "5px";

      materials.forEach((material) => {
        const button = document.createElement("button");
        button.textContent = material.name;
        button.title = material.description;
        button.className = `material-btn ${
          currentMaterial === material.type ? "active" : ""
        }`;
        button.style.cssText = `
          background: ${
            currentMaterial === material.type
              ? "#4fc3f7"
              : "rgba(79, 195, 247, 0.1)"
          };
          color: white;
          border: 1px solid rgba(79, 195, 247, 0.3);
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 11px;
          cursor: pointer;
          flex: 1;
          min-width: 80px;
          transition: all 0.2s;
        `;

        button.addEventListener("click", () => {
          // Update active button
          document.querySelectorAll(".material-btn").forEach((btn) => {
            btn.classList.remove("active");
            (btn as HTMLElement).style.background = "rgba(79, 195, 247, 0.1)";
          });
          button.classList.add("active");
          button.style.background = "#4fc3f7";

          // Apply material to all objects
          applyMaterialToObjects(material.type);
        });

        button.addEventListener("mouseenter", () => {
          if (!button.classList.contains("active")) {
            button.style.background = "rgba(79, 195, 247, 0.2)";
          }
        });

        button.addEventListener("mouseleave", () => {
          if (!button.classList.contains("active")) {
            button.style.background = "rgba(79, 195, 247, 0.1)";
          }
        });

        buttonsContainer.appendChild(button);
      });

      categoryDiv.appendChild(buttonsContainer);
      rightPanel.appendChild(categoryDiv);
    });
  }

  // Setup audio controls
  setupAudioControls();

  // Setup world controls
  setupWorldControls();

  // Setup camera controls
  setupCameraControls();
}

// Setup audio control buttons
function setupAudioControls() {
  const audioContainer = document.getElementById("audio-buttons");
  if (audioContainer) {
    audioContainer.innerHTML = "";

    const audioButtons = [
      {
        type: "uiClick",
        name: "🔘 UI Click",
        description: "Button click sound",
      },
      {
        type: "powerUpChime",
        name: "🎨 Power Up",
        description: "Material change sound",
      },
      {
        type: "backgroundMusic",
        name: "🎵 Background Music",
        description: "Ambient music",
      },
    ];

    audioButtons.forEach((audio) => {
      const button = document.createElement("button");
      button.textContent = audio.name;
      button.title = audio.description;
      button.className = "demo-button audio-btn";
      button.style.cssText = `
        background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        margin: 2px;
      `;

      button.addEventListener("click", () => {
        playSound(audio.type as SoundType);
      });

      button.addEventListener("mouseenter", () => {
        button.style.transform = "translateY(-2px)";
        button.style.boxShadow = "0 4px 12px rgba(78, 205, 196, 0.4)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "none";
      });

      audioContainer.appendChild(button);
    });
  }
}

// Setup world control buttons
function setupWorldControls() {
  // Setup lighting preset buttons
  const lightingContainer = document.getElementById("lighting-presets");
  if (lightingContainer) {
    lightingContainer.innerHTML =
      "<h4 style='color: #4fc3f7; margin: 10px 0 5px 0; font-size: 12px;'>💡 Lighting Presets</h4>";

    worldLightingPresets.forEach((preset) => {
      const button = document.createElement("button");
      button.textContent = preset.name;
      button.title = preset.description;
      button.className = "world-btn";
      button.style.cssText = `
        background: rgba(255, 193, 7, 0.1);
        color: white;
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 10px;
        cursor: pointer;
        margin: 2px;
        transition: all 0.2s;
      `;

      button.addEventListener("click", () => {
        changeLightingPreset(preset.type);
      });

      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(255, 193, 7, 0.2)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(255, 193, 7, 0.1)";
      });

      lightingContainer.appendChild(button);
    });
  }

  // Setup skybox preset buttons
  const skyboxContainer = document.getElementById("skybox-presets");
  if (skyboxContainer) {
    skyboxContainer.innerHTML =
      "<h4 style='color: #4fc3f7; margin: 10px 0 5px 0; font-size: 12px;'>🌅 Skybox Presets</h4>";

    worldSkyboxPresets.forEach((preset) => {
      const button = document.createElement("button");
      button.textContent = preset.name;
      button.title = preset.description;
      button.className = "world-btn";
      button.style.cssText = `
        background: rgba(156, 39, 176, 0.1);
        color: white;
        border: 1px solid rgba(156, 39, 176, 0.3);
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 10px;
        cursor: pointer;
        margin: 2px;
        transition: all 0.2s;
      `;

      button.addEventListener("click", () => {
        changeSkyboxPreset(preset.type, (preset as any).colors);
      });

      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(156, 39, 176, 0.2)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(156, 39, 176, 0.1)";
      });

      skyboxContainer.appendChild(button);
    });
  }

  // Setup camera preset buttons
  const cameraPresetsContainer = document.getElementById("camera-presets");
  if (cameraPresetsContainer) {
    cameraPresetsContainer.innerHTML =
      "<h4 style='color: #4fc3f7; margin: 10px 0 5px 0; font-size: 12px;'>🎥 Camera Presets</h4>";

    worldCameraPresets.forEach((preset) => {
      const button = document.createElement("button");
      button.textContent = preset.name;
      button.title = preset.description;
      button.className = "world-btn";
      button.style.cssText = `
        background: rgba(233, 30, 99, 0.1);
        color: white;
        border: 1px solid rgba(233, 30, 99, 0.3);
        border-radius: 4px;
        padding: 6px 10px;
        font-size: 10px;
        cursor: pointer;
        margin: 2px;
        transition: all 0.2s;
      `;

      button.addEventListener("click", () => {
        changeCameraPreset(preset.type);
      });

      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(233, 30, 99, 0.2)";
      });

      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(233, 30, 99, 0.1)";
      });

      cameraPresetsContainer.appendChild(button);
    });
  }
}

// Setup camera control buttons
function setupCameraControls() {
  const pauseButton = document.getElementById("pause-camera");
  const resetButton = document.getElementById("reset-camera");

  if (pauseButton) {
    pauseButton.addEventListener("click", toggleCameraRotation);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetCamera);
  }
}

// Update info panel
function updateInfoPanel(materialType: MaterialType) {
  const materialDef = materialDefinitions.find((m) => m.type === materialType);
  const infoElement = document.getElementById("info");
  if (infoElement && materialDef) {
    infoElement.innerHTML = `
      <h3>Current Material</h3>
      <p><strong>Name:</strong> ${materialDef.name}</p>
      <p><strong>Type:</strong> ${materialType}</p>
      <p><strong>Category:</strong> ${materialDef.category}</p>
      <p><strong>Description:</strong> ${materialDef.description}</p>
    `;
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera rotation (if not paused)
  if (!cameraRotationPaused) {
    cameraAngle += 0.005;
    updateCameraPosition();
  }

  // Rotate objects
  if (demoObjects) {
    demoObjects.sphere.rotation.x += 0.01;
    demoObjects.sphere.rotation.y += 0.01;

    demoObjects.cube.rotation.x += 0.008;
    demoObjects.cube.rotation.y += 0.012;
    demoObjects.cube.rotation.z += 0.005;

    demoObjects.torus.rotation.x += 0.01;
    demoObjects.torus.rotation.y += 0.015;

    demoObjects.cylinder.rotation.y += 0.02;

    // Add floating animation to some objects
    const time = Date.now() * 0.001;
    demoObjects.sphere.position.y = 2 + Math.sin(time * 2) * 0.3;
    demoObjects.torus.position.y = 2.5 + Math.cos(time * 1.5) * 0.2;
  }

  worldManager.render();
}

// Handle window resize
function onWindowResize() {
  worldManager.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

// === INPUT INTEGRATION (Uncomment to enable) ===
/* 
function setupInputIntegration() {
  // Add input status display
  const inputDisplay = createInputStatusDisplay();
  document.body.appendChild(inputDisplay);
  inputDisplay.style.display = 'block';

  // Listen for input events
  window.addEventListener('demoCameraAction', (event) => {
    const { action, deltaX, deltaY, delta } = event.detail;
    
    switch (action) {
      case 'togglePause':
        toggleCameraRotation();
        break;
      case 'reset':
        resetCamera();
        break;
      case 'rotate':
        if (deltaX) cameraAngle += deltaX;
        if (deltaY) cameraHeight += deltaY;
        updateCameraPosition();
        break;
      case 'zoom':
        if (delta) {
          cameraRadius += delta;
          cameraRadius = Math.max(2, Math.min(20, cameraRadius));
          updateCameraPosition();
        }
        break;
    }
  });

  window.addEventListener('demoMaterialAction', (event) => {
    const { materialType } = event.detail;
    applyMaterialToObjects(materialType);
  });

  // Update input display in animation loop
  const originalAnimate = animate;
  animate = function() {
    originalAnimate();
    if (inputController) {
      updateInputStatusDisplay(inputController);
    }
  };

  console.log('🎮 Input integration enabled!');
  console.log('  - Mouse drag to rotate camera');
  console.log('  - Mouse wheel to zoom');
  console.log('  - WASD to move camera');
  console.log('  - Space to pause rotation');
  console.log('  - R to reset camera');
  console.log('  - 1-5 for quick material selection');
}
*/

// Initialize when page loads
init().catch(console.error);
