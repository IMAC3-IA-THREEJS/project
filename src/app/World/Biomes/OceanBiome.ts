import * as THREE from 'three';
import poissonDiskSampling from 'poisson-disk-sampling';

import Terrain from '@world/Terrain';
import Biome from '@world/Biome';
import Chunk from '@world/Chunk';
import MathUtils from '@shared/utils/Math.utils';
import Boids from '@boids/Boids';
import DiscusFish from '@boids/Creatures/DiscusFish';
import SalmonFish from '@boids/Creatures/SalmonFish';

import { IBiome } from '@world/models/biome.model';

import { SUB_BIOMES } from '@world/constants/subBiomes.constants';
import { PROGRESSION_BIOME_STORAGE_KEYS } from '@achievements/constants/progressionBiomesStorageKeys.constants';
import { PROGRESSION_EXTRAS_STORAGE_KEYS } from '@achievements/constants/progressionExtrasStorageKeys.constants';

class OceanBiome extends Biome {
  private spike: number;
  private depth: number;

  private boids: Boids[];

  private chest: THREE.Object3D;

  constructor(terrain: Terrain) {
    super('OCEAN', terrain);

    this.boids = [];

    this.spike = MathUtils.randomFloat(0.025, 0.125);
    this.depth = 1.425;

    this.waterDistortion = true;
    this.waterDistortionFreq = 3.0;
    this.waterDistortionAmp = 720.0;

    this.progressionSvc.increment(PROGRESSION_BIOME_STORAGE_KEYS.ocean_visited);
  }

  init() {
    const minSize = 90000;
    const maxSize = 150000;
    const size = MathUtils.randomFloat(minSize, maxSize);

    const pds = new poissonDiskSampling([Terrain.SIZE_X - size, Terrain.SIZE_Z - size], size, size, 30, MathUtils.rng);
    const points = pds.fill();

    points.forEach((point: number[]) => {
      const nbMax = (size * 14 / maxSize) || 0; // maximum nb based on boids size
      const n = MathUtils.randomInt(2, nbMax);
      const px = size / 2 + point.shift();
      const pz = size / 2 + point.shift();

      const ySize = MathUtils.randomFloat(Chunk.HEIGHT / 3.75, Chunk.HEIGHT / 3) - 4096;
      const py = Chunk.SEA_LEVEL - 4096 - ySize / 2;

      const fishClass = n > 3 ? DiscusFish : SalmonFish;

      // fishs
      const boids: Boids = new Boids(this.terrain.getScene(), new THREE.Vector3(size, ySize, size), new THREE.Vector3(px, py, pz));
      for (let i = 0; i < n; i++) {
        boids.addCreature(new fishClass());
      }

      this.boids.push(boids);
    });

    // chest
    const centerX = Terrain.SIZE_X / 2;
    const centerZ = Terrain.SIZE_Z / 2;

    const sizeX = 8192;
    const sizeZ = 8192;

    this.chest = this.terrain.placeSpecialObject({ stackReference: 'chest', float: false, underwater: true }, centerX - sizeX / 2, centerZ - sizeZ / 2, sizeX, sizeZ);
  }

  update(delta: number) {
    this.boids.forEach(boids => boids.update(this.generator, delta));
  }

  handleClick(raycaster: THREE.Raycaster) {
    const intersections: THREE.Intersection[] = raycaster.intersectObjects([this.chest], true);

    if (intersections.length) {
      this.progressionSvc.increment(PROGRESSION_EXTRAS_STORAGE_KEYS.find_captain_treasure);
    }
  }

  /**
   * Compute elevation
   * @param {number} x coord component
   * @param {number} z coord component
   * @return {number} elevation value
   */
  computeElevationAt(x: number, z: number): number {
    const nx = (x - Terrain.SIZE_X / 2) / (1024 * 128);
    const nz = (z - Terrain.SIZE_Z / 2) / (1024 * 128);

    let e = 0.2 * this.generator.noise(1 * nx, 1 * nz);
    e += 0.0035 * this.generator.noise(8 * nx, 8 * nz);
    e += 0.015 * this.generator.noise(32 * nx, 32 * nz);
    e += 0.025 * this.generator.ridgeNoise2(8 * nx, 8 * nz);
    e += 0.25 * this.generator.noise(4 * nx, 4 * nz) * this.generator.noise3(nx, nz);

    e /= (0.25 + 0.0035 + 0.015 + 0.025 + 0.25) - this.spike;

    e **= 2.25;
    return e - this.depth;
  }

  computeMoistureAt(x: number, z: number): number {
    const nx = x / (1024 * 192);
    const nz = z / (1024 * 192);

    let e = 0.2 * this.generator.noise(1 * nx, 1 * nz);
    e += 0.25 * this.generator.noise(4 * nx, 4 * nz);
    e += 0.0035 * this.generator.noise2(8 * nx, 8 * nz);
    e += 0.05 * this.generator.noise3(16 * nx, 16 * nz);

    e /= 0.2 + 0.25 + 0.0035 + 0.05;

    return Math.round(e * 100) / 100;
  }

  computeWaterMoistureAt(x: number, z: number): number {
    const nx = x / (1024 * 192);
    const nz = z / (1024 * 192);

    return Math.round(this.generator.noise2(nx, nz) * 100) / 100;
  }

  getParametersAt(e: number, m: number): IBiome {
    if (m < 0.4) {
      return SUB_BIOMES.CORAL_REEF;
    }

    return SUB_BIOMES.OCEAN;
  }
}

export default OceanBiome;
