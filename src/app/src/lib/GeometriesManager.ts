import { parseOBJ, GeometryObject } from '../lib/parseOBJ';

export class GeometriesManager {
  private isReady = false;
  private startedLoading = false;
  private loadedGeometries: Map<string, GeometryObject> = new Map();

  constructor() {}

  public getGeometry(geometryUrl: string) {
    const geometryObject = this.loadedGeometries.get(geometryUrl);
    if (!this.isReady) return null;
    if (!geometryObject) {
      console.error(`Geometry not found. ${geometryUrl} `);
      return null;
    }
    return geometryObject;
  }

  private async loadGeometry(elUrl: string) {
    const response = await fetch(elUrl);
    const text = await response.text();
    const objData = parseOBJ(text);
    this.loadedGeometries.set(elUrl, objData);
    return Promise.resolve();
  }

  public async addObjectsToLoad(objsToLoad: string[]) {
    if (this.startedLoading) {
      console.error('Cannot add more objects to load. GeometriesManager has already started loading.');
      return;
    }

    this.startedLoading = true;

    const promises = objsToLoad.map((geometryUrl) => {
      return this.loadGeometry(geometryUrl);
    });
    return Promise.allSettled(promises).then(() => {
      this.isReady = true;
      Promise.resolve();
    });
  }

  public destroy() {
    this.loadedGeometries.clear();
  }
}
