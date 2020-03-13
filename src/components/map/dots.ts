import * as THREE from 'three';

export class Dots {
	dots: Array<{x: number, y: number}>
	dotsScene: THREE.Scene | undefined
	geometry: THREE.Geometry | undefined
	pointsInstance: THREE.Points | THREE.Line | undefined
	material: THREE.PointsMaterial | THREE.LineBasicMaterial | undefined
	projections: Array<{x: number, y: number}> | undefined
	
	updateInstance() {}
	
	public constructor() {
		this.dots = []
		this.dotsScene = new THREE.Scene();
		this.geometry = new THREE.Geometry();
	}
	
	
	setDots(dots: Array<{x: number, y: number, z: number}>) {
		this.dots = dots;
		
		this.geometry.dispose();
		this.dotsScene.remove(this.pointsInstance);
		
		this.geometry = new THREE.Geometry();
		
		this.dots.map(val => {
			this.geometry.vertices.push(new THREE.Vector3(val.x, val.y, val.z));
		})
		// apply new geometry
		this.updateInstance();
	}
	
	updatePoint(index: number, pos: {x: number, y: number}) {
		this.dots[index] = pos;
		this.geometry.vertices[index] = new THREE.Vector3(pos.x, pos.y, 0);
		this.geometry.verticesNeedUpdate = true;
	}
	
	deletePoint(index: number) {
		this.dots.splice(index, 1)
		this.geometry.vertices.splice(index, 1)
		
		let vertices = this.geometry.vertices
		this.geometry.dispose();
		this.dotsScene.remove(this.pointsInstance);
		
		this.geometry = new THREE.Geometry();
		this.geometry.setFromPoints(vertices);
		this.geometry.verticesNeedUpdate = true;
		this.updateInstance();
	}
	
	putPoint(pos: {x: number, y: number}, last = false) {
		if(last) {
			this.dots = [pos, ...this.dots]
			this.geometry.vertices = [new THREE.Vector3(pos.x, pos.y, 0), ...this.geometry.vertices];
		} else {
			this.dots.push(pos);
			this.geometry.vertices.push(new THREE.Vector3(pos.x, pos.y, 0));
		}
		let vertices = this.geometry.vertices
		this.geometry.dispose();
		this.dotsScene.remove(this.pointsInstance);
		
		this.geometry = new THREE.Geometry();
		this.geometry.setFromPoints(vertices);
		this.geometry.verticesNeedUpdate = true;
		this.updateInstance();
	}
	
	projectPoint(index, camera, canvasEl) {
		let vec3: any;
		
		vec3 = this.geometry.vertices[index].clone().project(camera);
		
		
		vec3.x = (vec3.x + 1) / 2 * canvasEl.scrollWidth + canvasEl.offsetLeft;
		vec3.y = (vec3.y + 1) / 2 * canvasEl.scrollHeight;
		
		return {x: vec3.x,
						y: vec3.y}
	}
	
	updateProjections(camera, canvasEl) {
		this.projections = []
		for(let index in this.geometry.vertices) {
			this.projections.push(this.projectPoint(index, camera, canvasEl));
		}
	}
}

export class MapDots extends Dots {
	
	updateInstance() {
		if(this.pointsInstance) {
			this.dotsScene.remove(this.pointsInstance)
		}
		this.pointsInstance = new THREE.Points(this.geometry, this.material);
		this.dotsScene.add(this.pointsInstance);
	}
	
	public constructor() {
		super();
		// default material
		this.material = new THREE.PointsMaterial({color: "#487586", size: 10});
		this.updateInstance();
	}
	
	setMaterial(materialParameters: THREE.PointsMaterialParameters) {
		this.material = new THREE.PointsMaterial(materialParameters);
		this.pointsInstance.material = this.material;
		this.geometry.colorsNeedUpdate = true;
		this.material.needsUpdate;
	}
}

export class MapGraph extends Dots {
	
	updateInstance() {
		if(this.pointsInstance) {
			this.dotsScene.remove(this.pointsInstance)
		}
		this.pointsInstance = new THREE.Line(this.geometry, this.material);
		this.dotsScene.add(this.pointsInstance);
	}
	
	public constructor() {
		super();
		// default material
		this.material = new THREE.LineBasicMaterial({color: "#487586", linewidth: 3});
		this.updateInstance();
	}
	
	setMaterial(materialParameters: THREE.LineBasicMaterialParameters) {
		this.material = new THREE.LineBasicMaterial(materialParameters);
		this.pointsInstance.material = this.material;
		this.geometry.colorsNeedUpdate = true;
		this.material.needsUpdate;
	}
}
