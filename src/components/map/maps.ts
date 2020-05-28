import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export class Floor {
	source: string = ""
	map: THREE.Group
  floor: THREE.Mesh
  rendered: boolean
	
	constructor() {
		this.rendered = true;
		this.floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: "#aaaaaa"}))
		this.floor.rotation.x = -90 / 180 * Math.PI;
		this.floor.translateZ(0.1);
		this.map = new THREE.Group()
		let floorModel = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({color: "#aaaaaa"}))
		floorModel.rotation.x = -90 / 180 * Math.PI;
		this.map.add(floorModel);
		this.map.add(this.floor);
	}
	
	public parseMapOBJ(source: string, mapMaterial: THREE.Material, floorTexture: THREE.Texture, scene: THREE.Scene, callback?: (floor: Floor) => void) {
		const loader = new OBJLoader();
		
    let currentMapMesh: THREE.Group;
    currentMapMesh = loader.parse(source);
    let currentFloorPolygon: THREE.Mesh;
    currentMapMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = mapMaterial;
      }
    });
		
    const mapBoundingBox = new THREE.Box3().setFromObject(currentMapMesh);
    const buffVector: THREE.Vector3 = new THREE.Vector3();
    mapBoundingBox.getSize(buffVector);
    currentFloorPolygon = new THREE.Mesh(new THREE.PlaneGeometry(buffVector.x * 1.5, buffVector.z * 1.5),
																				 new THREE.MeshBasicMaterial({map: floorTexture}));
    floorTexture.repeat = new THREE.Vector2(4, buffVector.z / buffVector.x * 4);
    currentFloorPolygon.rotation.x = -90 / 180 * Math.PI;
		// currentFloorPolygon.matrixWorld
    // currentMapMesh.rotation.x = -90 / 180 * Math.PI;
    currentFloorPolygon.translateZ(0.1);

    currentMapMesh.add(currentFloorPolygon);


    // currentMapMesh.position.y = -50 + 35 * this.floors.length;

		
    // if (!this.wholeGroup) {
    //   this.wholeGroup = new THREE.Object3D();
    //   this.wholeGroup.rotation.x = 45 / 180 * Math.PI;
    //   this.wholeGroup.rotation.y = 45 / 180 * Math.PI;
    //   scene.add(this.wholeGroup);
    // }

		//1000 - (point.z * 1000)

    // this.wholeGroup.add(currentMapMesh);

		this.map = currentMapMesh
		this.floor = currentFloorPolygon
		this.rendered = true
		
    // this.floors.push({
    //   map: currentMapMesh,
    //   floor: currentFloorPolygon,
    //   rendered: true,
    // });
    // this.floors.map((val, index) => {
    //   const buildingHeight = this.floors.length * this.floorHeight;
    //   val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
    // });
		if(callback)
			callback(this)
	}
	
  public loadMapOBJ(source: string, mapMaterial: THREE.Material, floorTexture: THREE.Texture, scene: THREE.Scene, callback?: (floor: Floor) => void) {
    const loader = new OBJLoader();

		this.source = source;
		
    loader.load( source, (object) => {

      let currentMapMesh: THREE.Group;
      currentMapMesh = object;
      let currentFloorPolygon: THREE.Mesh;
      currentMapMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = mapMaterial;
        }
      });
			
      const mapBoundingBox = new THREE.Box3().setFromObject(currentMapMesh);
      const buffVector: THREE.Vector3 = new THREE.Vector3();
      mapBoundingBox.getSize(buffVector);
      currentFloorPolygon = new THREE.Mesh(new THREE.PlaneGeometry(buffVector.x * 1.5, buffVector.z * 1.5),
																					 new THREE.MeshBasicMaterial({map: floorTexture}));
      floorTexture.repeat = new THREE.Vector2(4, buffVector.z / buffVector.x * 4);
      currentFloorPolygon.rotation.x = -90 / 180 * Math.PI;
			// currentFloorPolygon.matrixWorld
      // currentMapMesh.rotation.x = -90 / 180 * Math.PI;
      currentFloorPolygon.translateZ(0.1);

      currentMapMesh.add(currentFloorPolygon);


      // currentMapMesh.position.y = -50 + 35 * this.floors.length;

			
      // if (!this.wholeGroup) {
      //   this.wholeGroup = new THREE.Object3D();
      //   this.wholeGroup.rotation.x = 45 / 180 * Math.PI;
      //   this.wholeGroup.rotation.y = 45 / 180 * Math.PI;
      //   scene.add(this.wholeGroup);
      // }

//1000 - (point.z * 1000)

      // this.wholeGroup.add(currentMapMesh);

			this.map = currentMapMesh
			this.floor = currentFloorPolygon
			this.rendered = true
			
      // this.floors.push({
      //   map: currentMapMesh,
      //   floor: currentFloorPolygon,
      //   rendered: true,
      // });
      // this.floors.map((val, index) => {
      //   const buildingHeight = this.floors.length * this.floorHeight;
      //   val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
      // });
			if(callback)
				callback(this)
    }, undefined, function( error ) {
      console.error( error );
    });
  }
}

export function initMask(render: THREE.WebGLRenderer) {
  render.clear();

  const gl = render.getContext();

  gl.enable(gl.STENCIL_TEST);
  // gl.stencilFunc(gl.REPLACE, gl.REPLACE, gl.REPLACE);

  gl.stencilFunc(gl.ALWAYS, 1, 0xff);
  gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
}

export function disposeMask(render: THREE.WebGLRenderer) {
  const gl = render.getContext();
  gl.disable(gl.STENCIL_TEST);
}

export class BuildingMap {

  get floorHeight() {
    return this._floorHeight;
  }
  set floorHeight(val: number) {
    this._floorHeight = val;
    this.floors.map((val, index) => {
      const buildingHeight = this.floors.length * this.floorHeight;
      val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
    });
  }

  public wholeGroup: THREE.Object3D | undefined;

  public focused: boolean = false;

  public floors: Floor[] = new Array

	public updateModel(scene: THREE.Scene) {
		// scene.remove
		this.floors.map(floor => {
			if(this.wholeGroup) {
				this.wholeGroup.remove(floor.map)
			}
			
			scene.remove(floor.map)
		})
		this.floors.map(floor => {
			scene.add(floor.map)
			if(this.wholeGroup) {
				this.wholeGroup.add(floor.map)
			}
		})
		let buff = this._floorHeight
		this.floorHeight = 0
		this.floorHeight = buff
	}
	
  public currentAngle: {
    x: number,
    y: number,
  } | undefined = undefined;

  private _floorHeight: number = 15;

  constructor() {
  }

  // x y angles in degrees
  public rotateMap(x: number, y: number) {
    // this.floors.map(val => {
    // val.map.rotation.x += x / 180 * Math.PI;
    // val.map.rotation.y += y / 180 * Math.PI;
    // })

    if (this.focused) {
      return;
    }


    if (this.wholeGroup) {
      this.wholeGroup.rotation.x += x / 180 * Math.PI;
      this.wholeGroup.rotation.y += y / 180 * Math.PI;
    }

    // if(this.mapMesh && this.floorPolygon) {

    //     this.mapMesh.rotation.x += x / 180 * Math.PI;
    //     this.mapMesh.rotation.y += y / 180 * Math.PI;
    // }
  }

  public renderMapMask(render: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.floors.map((val) => {
      val.floor.visible = false;
    });

    render.render(scene, camera);
  }

  public unfocus() {
    this.floors.map((val) => {
      val.rendered = true;
    });
		this.currentAngle = undefined;
    if (this.wholeGroup && this.currentAngle) {
      this.wholeGroup.rotation.x = this.currentAngle.x;
      this.wholeGroup.rotation.y = this.currentAngle.y;
    }
  }

  public disableFocus() {
    this.focused = false;
    this.floors.map((val, index) => {
      const buildingHeight = this.floors.length * this.floorHeight;
      val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
      val.rendered = true;
    });

    if (this.currentAngle) {
      this.wholeGroup!.rotation.x = this.currentAngle!.x;
      this.wholeGroup!.rotation.y = this.currentAngle!.y;
    }
		
		this.currentAngle = undefined;
  }

  public focusFloor(index: number) {

    const buildingHeight = this.floors.length * this.floorHeight;

    this.focused = false;
    this.floors.map((val, ind) => {
      if (ind !== index) {
        val.rendered = false;
      } else {
        val.rendered = true;
        val.map.position.y = 0;
        // this.wholeGroup.position.y = 0;
        this.focused = true;
      }
    });

    if (this.wholeGroup && this.focused) {
      if (!this.currentAngle) {
        this.currentAngle = {
          x: this.wholeGroup.rotation.x,
          y: this.wholeGroup.rotation.y,
        };
      }
      this.wholeGroup.rotation.x = Math.PI / 2;
      this.wholeGroup.rotation.y = 0;
    }
    return this.focused;
  }

  public renderMap(render: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const gl = render.getContext();

    this.floors.map((val) => {
      val.floor.visible = false;
      val.map.visible = false;
    });

    this.floors.map((val) => {

      if (!val.rendered) {
        return;
      }

      gl.stencilFunc(gl.ALWAYS, 1, 0xff);
      gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);

      val.map.visible = true;

      render.render(scene, camera);


      gl.stencilFunc(gl.EQUAL, 1, 0xff);
      gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

      val.floor.visible = true;

      render.render(scene, camera);

      gl.clear(gl.STENCIL_BUFFER_BIT);

      val.map.visible = false;
      val.floor.visible = false;

    });

  }

	public addNewFloor(scene) {
		if (!this.wholeGroup) {
      this.wholeGroup = new THREE.Object3D();
      this.wholeGroup.rotation.x = 45 / 180 * Math.PI;
      this.wholeGroup.rotation.y = 45 / 180 * Math.PI;
      scene.add(this.wholeGroup);
    }
		let floor = new Floor()
		this.floors.push(floor)
		this.wholeGroup.add(floor.map)
		
		let buff = this._floorHeight
		this.floorHeight = 0
		this.floorHeight = buff
		return floor
	}
	
	public deleteFloor(index) {
		this.floors.splice(index, 1)
		let buff = this._floorHeight
		this.floorHeight = 0
		this.floorHeight = buff
	}
	
  public loadMapOBJ(source: string, mapMaterial: THREE.Material, floorTexture: THREE.Texture, scene: THREE.Scene) {
		if (!this.wholeGroup) {
      this.wholeGroup = new THREE.Object3D();
      this.wholeGroup.rotation.x = 45 / 180 * Math.PI;
      this.wholeGroup.rotation.y = 45 / 180 * Math.PI;
      scene.add(this.wholeGroup);
    }
		
		let floor = new Floor()
		
		
		let callback = (floor: Floor) => {
			this.wholeGroup.add(floor.map)
			let buff = this._floorHeight
			this.floorHeight = 0
			this.floorHeight = buff

		}
		
		floor.loadMapOBJ(source, mapMaterial, floorTexture, scene, callback)
		this.floors.push(floor)
		

		


		// this.wholeGroup.add(currentMapMesh);
		
	}
}
