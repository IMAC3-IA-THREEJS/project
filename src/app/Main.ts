import * as THREE from 'three';

import 'three/examples/js/postprocessing/EffectComposer';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/shaders/CopyShader';
import 'three/examples/js/postprocessing/RenderPass';
import 'three/examples/js/postprocessing/MaskPass';
import 'three/examples/js/postprocessing/ShaderPass';

import 'seedrandom';

import './vergil_water_shader';

import statsJs from 'stats.js';
import World from '@world/World';
import Terrain from '@world/Terrain';

class Main {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private composer: THREE.EffectComposer;
  private camera: THREE.PerspectiveCamera;
  private controls: THREE.PointerLockControls;
  private containerElement: HTMLElement;

  private world: World;

  private lastTime: number;

  private stats: statsJs;
  constructor() {
    this.containerElement = document.body;
    this.lastTime = window.performance.now();

    this.stats = new statsJs();
    this.stats.showPanel(1);
    document.body.appendChild(this.stats.dom);

    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, World.VIEW_DISTANCE);

    // this.scene.add(new THREE.CameraHelper(this.camera));

    /*
    const d = 15000;
    this.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.01, World.VIEW_DISTANCE);
    this.camera.position.set(0, 15000, 0);
    this.camera.lookAt(new THREE.Vector3(Terrain.SIZE_X / 2, 0, Terrain.SIZE_Z / 2));
    */
  }

  async init() {
    this.initControls();
    this.initRenderer();
    this.initPointerLock();

    this.world = new World(this.scene, this.camera, this.controls);
    await this.world.init();
  }

  private initControls() {
    this.controls = new THREE.PointerLockControls(this.camera);

    const spawn = new THREE.Vector3(-24000, Terrain.SIZE_Y, Terrain.SIZE_Z + 24000);
    const target = new THREE.Vector3(Terrain.SIZE_X / 2, 0, Terrain.SIZE_Z / 2);

    const angle = -Math.cos(target.dot(spawn) / (target.length() * spawn.length()));

    this.controls.getObject().rotateY(-45 * Math.PI / 180);
    this.controls.getObject().rotateX(angle);
    this.controls.getObject().position.set(spawn.x, spawn.y, spawn.z);

    // crosshair temp
    const crosshair = document.createElement('div');
    crosshair.classList.add('crosshair');
    crosshair.appendChild(document.createElement('span'));
    crosshair.appendChild(document.createElement('span'));
    crosshair.appendChild(document.createElement('span'));
    crosshair.appendChild(document.createElement('span'));
    crosshair.appendChild(document.createElement('span'));
    document.body.appendChild(crosshair);
  }

  private initRenderer() {
    // renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100vw';
    this.renderer.domElement.style.height = '100vh';

    this.renderer.setClearColor(new THREE.Color(World.FOG_COLOR));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      // const size = this.renderer.getSize();
      // this.composer.setSize(size.width * 2 * window.devicePixelRatio, size.height * 2 * window.devicePixelRatio);
    });

    this.containerElement.append(this.renderer.domElement);

    // composser
    // const size = this.renderer.getSize();
    // this.composer = new THREE.EffectComposer(this.renderer);
    // this.composer.setSize(size.width * 2 * window.devicePixelRatio, size.height * 2 * window.devicePixelRatio);

    /*
    const pass = new THREE.RenderPass(this.scene, this.camera);
    // pass.renderToScreen = true;
    this.composer.addPass(pass);

    this.effect = new THREE.ShaderPass(THREE.VergilWaterShader);
    this.effect.uniforms['centerX'].value = 0.8;
    this.effect.uniforms['centerY'].value = 0.8;
    this.composer.addPass(this.effect);

    this.effect2 = new THREE.ShaderPass(THREE.VergilWaterShader);
    this.effect2.uniforms['centerX'].value = 0.2;
    this.effect2.uniforms['centerY'].value = 0.2;
    this.composer.addPass(this.effect2);

    this.effect3 = new THREE.ShaderPass(THREE.VergilWaterShader);
    this.effect3.uniforms['centerX'].value = 0.2;
    this.effect3.uniforms['centerY'].value = 0.8;
    this.composer.addPass(this.effect3);

    this.effect4 = new THREE.ShaderPass(THREE.VergilWaterShader);
    this.effect4.uniforms['centerX'].value = 0.8;
    this.effect4.uniforms['centerY'].value = 0.2;
    this.effect4.renderToScreen = true;
    this.composer.addPass(this.effect4);
    */
  }

  private initPointerLock() {
    // handle pointer lock authorization
    if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {

      const pointerlockchange = (e) => {
        this.controls.enabled = document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body;
      };

      const pointerlockerror = (e) => { };

      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      document.body.addEventListener('click', () => {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.body.requestPointerLock();

        if (!this.controls.enabled) { return; }

        // mouse position always in the center of the screen
        const raw = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
        this.world.handleMouseClick(raw);
      });

      document.body.addEventListener('keydown', e => this.world.handleKeyboard(e.key, true && this.controls.enabled));
      document.body.addEventListener('keyup', e => this.world.handleKeyboard(e.key, false));
    }
  }

  private render() {
    this.stats.begin();

    const time = window.performance.now();
    const elapsed = time - this.lastTime;
    this.lastTime = time;

    const delta = elapsed / 1000;

    // updated every time
    this.world.update(delta);

    /*
    this.effect.uniforms['time'].value += Math.random();
    this.effect2.uniforms['time'].value += Math.random();
    this.effect3.uniforms['time'].value += Math.random();
    this.effect4.uniforms['time'].value += Math.random();
    */

    this.renderer.render(this.scene, this.getActiveCamera());
    // this.composer.render(delta);
    this.stats.end();

    window.requestAnimationFrame(this.render.bind(this));
  }

  getActiveCamera()  {
    return this.camera;
  }

  public run() {
    window.requestAnimationFrame(this.render.bind(this));
  }
}

export default Main;
