import * as THREE from 'three';

export class Dots {
  public dots: any[];
  public dotsScene: THREE.Scene;
  public geometry: THREE.Geometry;
  public pointsInstance: THREE.Points | THREE.Line | undefined;
  public material: THREE.PointsMaterial | THREE.LineBasicMaterial | undefined;
  public projections: Array<{x: number, y: number, z: number}> | undefined;

  public constructor() {
    this.dots = [];
    this.dotsScene = new THREE.Scene();
    this.geometry = new THREE.Geometry();
  }

  public updateInstance() {}


  public setDots(dots: any[]) {
    this.dots = dots;

    this.geometry.dispose();
    this.dotsScene.remove(this.pointsInstance as THREE.Object3D);

    this.geometry = new THREE.Geometry();

    this.dots.map((val) => {
      this.geometry.vertices.push(new THREE.Vector3(val.x, val.y, val.z));
    });
    // apply new geometry
    this.updateInstance();
  }

  public updatePoint(index: number, pos: {x: number, y: number}) {
    this.dots[index] = pos;
    this.geometry.vertices[index] = new THREE.Vector3(pos.x, pos.y, 0);
    this.geometry.verticesNeedUpdate = true;
  }

  public deletePoint(index: number) {
    this.dots.splice(index, 1);
    this.geometry.vertices.splice(index, 1);

    const vertices = this.geometry.vertices;
    this.geometry.dispose();
    this.dotsScene.remove(this.pointsInstance as THREE.Object3D);

    this.geometry = new THREE.Geometry();
    this.geometry.setFromPoints(vertices);
    this.geometry.verticesNeedUpdate = true;
    this.updateInstance();
  }

  public putPoint(pos: {x: number, y: number}, last = false) {
    if (last) {
      this.dots = [pos, ...this.dots];
      this.geometry.vertices = [new THREE.Vector3(pos.x, pos.y, 0), ...this.geometry.vertices];
    } else {
      this.dots.push(pos);
      this.geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, 0));
    }
    const vertices = this.geometry.vertices;
    this.geometry.dispose();
    this.dotsScene.remove(this.pointsInstance as THREE.Object3D);

    this.geometry = new THREE.Geometry();
    this.geometry.setFromPoints(vertices);
    this.geometry.verticesNeedUpdate = true;
    this.updateInstance();
  }

  public projectPoint(index, camera, canvasEl, theMatrix?: THREE.Matrix4) {
    let vec3: THREE.Vector3;

    vec3 = this.geometry.vertices[index].clone()
		// [vec3.x, vec3.z] = [vec3.z, vec3.x]
		if(theMatrix) {
			vec3 = vec3.set(vec3.x, vec3.z + 10, -vec3.y)
			vec3 = vec3.applyMatrix4(theMatrix)
		}
		vec3 = vec3.project(camera)

    vec3.x = (vec3.x + 1) / 2 * canvasEl.scrollWidth + canvasEl.offsetLeft;
    vec3.y = (vec3.y + 1) / 2 * canvasEl.scrollHeight;

    return {x: vec3.x,
            y: vec3.y,
						z: vec3.z};
  }

  public updateProjections(camera, canvasEl, theMatrix?: THREE.Matrix4) {
    this.projections = [];
    for (const index in this.geometry.vertices) {
      this.projections.push(this.projectPoint(index, camera, canvasEl, theMatrix));
    }
  }
}

export class MapDots extends Dots {

  public constructor() {
    super();
    // default material
    this.material = new THREE.PointsMaterial({color: '#487586', size: 10});
    this.updateInstance();
  }

  public updateInstance() {
    if (this.pointsInstance) {
      this.dotsScene.remove(this.pointsInstance as THREE.Object3D);
    }
    this.pointsInstance = new THREE.Points(this.geometry, this.material);
    this.dotsScene.add(this.pointsInstance);
  }

  public setMaterial(materialParameters: THREE.PointsMaterialParameters) {
    this.material = new THREE.PointsMaterial(materialParameters);
    this.pointsInstance!.material = this.material;
    this.geometry.colorsNeedUpdate = true;
    this.material.needsUpdate;
  }
}

export class MapGraph extends Dots {

  public constructor() {
    super();
    // default material
    this.material = new THREE.LineBasicMaterial({color: '#487586', linewidth: 3});
    this.updateInstance();
  }

  public updateInstance() {
    if (this.pointsInstance) {
      this.dotsScene.remove(this.pointsInstance as THREE.Object3D);
    }
    this.pointsInstance = new THREE.Line(this.geometry, this.material);
    this.dotsScene.add(this.pointsInstance);
  }

  public setMaterial(materialParameters: THREE.LineBasicMaterialParameters) {
    this.material = new THREE.LineBasicMaterial(materialParameters);
    this.pointsInstance!.material = this.material;
    this.geometry.colorsNeedUpdate = true;
    this.material.needsUpdate;
  }
}
