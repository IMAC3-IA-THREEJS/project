import * as THREE from 'three';
import 'three/examples/js/controls/PointerLockControls';
import 'three/examples/js/loaders/OBJLoader';
import 'three/examples/js/loaders/MTLLoader';

import Terrain from './Terrain';
import Chunk from './Chunk';
import Player from '../Player';

import { OBJECTS } from '@shared/constants/object.constants';

import MathUtils from '@utils/Math.utils';

class World {
  static SEED: string | null = null; // '789005037'

  static readonly SEA_LEVEL: number = 290;
  static readonly CLOUD_LEVEL: number = 7500;

  static readonly OBJ_INITIAL_SCALE: number = 360;

  static readonly CHUNK_RENDER_LIMIT: number = 48;
  static readonly CHUNK_RENDER_DISTANCE: number = World.CHUNK_RENDER_LIMIT * Chunk.WIDTH;
  static readonly VIEW_DISTANCE: number = 128 * Chunk.WIDTH;

  static readonly SHOW_FOG: boolean = true;
  static readonly FOG_NEAR: number = World.CHUNK_RENDER_DISTANCE / 3;
  static readonly FOG_FAR: number = World.CHUNK_RENDER_DISTANCE;

  static LOADED_MODELS = new Map<string, THREE.Object3D>();

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: THREE.PointerLockControls;

  private player: Player;

  private terrain: Terrain;
  private frustum: THREE.Frustum;
  private seed: string;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, controls: THREE.PointerLockControls) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    this.frustum = new THREE.Frustum();
  }

  async init() {
    this.initSeed();
    this.initFog();
    this.initSkybox();
    this.initLights();
    await this.initObjects();

    const spawn = new THREE.Vector3(Terrain.SIZE_X / 2, 4000, Terrain.SIZE_Z / 2);

    // stuff
    this.terrain = new Terrain();
    this.terrain.init(this.scene);

    // preload terrain
    this.terrain.update(this.scene, this.frustum, spawn);

    this.player = new Player(this.controls);
    this.player.init(spawn.x, spawn.y, spawn.z);

    this.scene.add(this.controls.getObject());

    this.showAxesHelper();
  }

  private initSeed() {
    this.seed = World.SEED ? World.SEED : MathUtils.randomUint32().toString();
    MathUtils.rng = new Math.seedrandom(this.seed);
    console.info(`SEED : ${this.seed}`);
  }

  private showAxesHelper() {
    const gizmo = new THREE.AxesHelper();
    gizmo.position.set(0, 0, 0);
    gizmo.scale.set(250, 250, 250);
    this.scene.add(gizmo);
  }

  private initFog() {
    if (World.SHOW_FOG) {
      this.scene.fog = new THREE.Fog(0xb1d8ff, World.FOG_NEAR, World.FOG_FAR);
    }
  }

  private initSkybox() {

  }

  private initLights() {
    const light = new THREE.HemisphereLight(0x3a6aa0, 0xffffff, 0.25);
    light.position.set(0, World.SEA_LEVEL, 0);
    light.castShadow = true;
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    ambient.position.set(0, 20000, 1500);
    ambient.castShadow = true;
    this.scene.add(ambient);

    const sunlight = new THREE.DirectionalLight(0xffffff, 0.45);
    sunlight.position.set(0, 20000, 1500);
    sunlight.castShadow = true;
    sunlight.target.position.set(0, 0, 0);
    this.scene.add(sunlight);
  }

  private async initObjects(): Promise<any> {
    // load all models
    const stack = OBJECTS.map(element => {
      const p = World.loadObjModel(element);

      return p.then((object) => {
        object.scale.set(World.OBJ_INITIAL_SCALE, World.OBJ_INITIAL_SCALE, World.OBJ_INITIAL_SCALE); // scale from maya size to a decent world size
      });
    });

    await Promise.all(stack);
  }

  public update() {
    this.frustum.setFromMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      )
    );
    const position = this.player.getPosition();
    this.terrain.update(this.scene, this.frustum, position);
  }

  public updateMvts(delta) {
    this.player.updateMvts(delta);
    this.player.updatePosition(this.terrain);
  }

  public handleKeyboard(key: string, active: boolean) {
    this.player.handleKeyboard(key, active);
  }

  /**
   * Load an obj file
   * @param name Name of the object
   * @param objSrc obj source file path
   * @param mtlSrc mtl source file path
   * @return THREE.Object3D
   */
  static async loadObjModel(element): Promise<THREE.Object3D> {
    return new Promise<THREE.Object3D>((resolve, reject) => {
      if (World.LOADED_MODELS.has(element.name)) {
        resolve(World.LOADED_MODELS.get(element.name));
      }

      const objLoader = new THREE.OBJLoader();
      const mtlLoader = new THREE.MTLLoader();

      mtlLoader.load(element.mtl, (materials) => {
        materials.preload();

        objLoader.setMaterials(materials);

        objLoader.load(element.obj, (object) => {
          object.castShadow = true;
          object.receiveShadow = true;

          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              (<THREE.Geometry>child.geometry).computeFaceNormals();
              child.geometry.computeVertexNormals();
              (<THREE.Geometry>child.geometry).normalsNeedUpdate = true;
              (<THREE.Material>child.material).flatShading = true;
              if (element.doubleSide === true) {
                (<THREE.Material>child.material).side = THREE.DoubleSide;
              }
            }
          });

          World.LOADED_MODELS.set(element.name, object);
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3(0, 0, 0));

          resolve(object);
        }, null, () => reject());
      }, null, () => reject());
    });
  }
}

export default World;
