import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export function initMask(render: THREE.WebGLRenderer) {
    render.clear();
    
    let gl = render.getContext();
    
    gl.enable(gl.STENCIL_TEST);
    // gl.stencilFunc(gl.REPLACE, gl.REPLACE, gl.REPLACE);
    
    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
}

export function disposeMask(render:THREE.WebGLRenderer) {
    let gl = render.getContext()
    gl.disable(gl.STENCIL_TEST);
}

export class FloorMap {
    
    wholeGroup: THREE.Object3D | undefined
    
    private _floorHeight: number = 15;
    
    focused: boolean = false;
    
    get floorHeight () {
        return this._floorHeight
    }
    set floorHeight (val: number) {
        this._floorHeight = val
        this.floors.map((val, index) => {
            let buildingHeight = this.floors.length * this.floorHeight;
            val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
        })
    }
    
    floors: Array<{
        map: THREE.Group,
        floor: THREE.Mesh,
        rendered: boolean
    }>
    
    currentAngle: {
        x: number,
        y: number
    } | undefined = undefined
    
    constructor() {
        this.floors = [];
    }
    
    // x y angles in degrees
    rotateMap(x: number, y: number) {
        // this.floors.map(val => {
        // val.map.rotation.x += x / 180 * Math.PI;
        // val.map.rotation.y += y / 180 * Math.PI;
        // })
        
        if(this.focused)
        return
        
			
        if(this.wholeGroup) {
            this.wholeGroup.rotation.x += x / 180 * Math.PI;
            this.wholeGroup.rotation.y += y / 180 * Math.PI;
        }
        
        // if(this.mapMesh && this.floorPolygon) {
        
        //     this.mapMesh.rotation.x += x / 180 * Math.PI;
        //     this.mapMesh.rotation.y += y / 180 * Math.PI;
        // }
    }
    
    renderMapMask(render: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        this.floors.map(val => {
            val.floor.visible = false;
        });
        
        render.render(scene,camera);
    }
    
    unfocus() {
        this.floors.map(val => {
            val.rendered = true;
        })
        if(this.wholeGroup) {
            this.wholeGroup.rotation.x = this.currentAngle.x
            this.wholeGroup.rotation.y = this.currentAngle.y
        }
    }
    
    disableFocus() {
        this.focused = false;
        this.floors.map((val, index) => {
            let buildingHeight = this.floors.length * this.floorHeight;
            val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
            val.rendered = true;
        })
        
        if(this.currentAngle) {
            this.wholeGroup.rotation.x = this.currentAngle.x;
            this.wholeGroup.rotation.y = this.currentAngle.y;
        }
    }
    
    focusFloor(index: number) {
        
        let buildingHeight = this.floors.length * this.floorHeight;
        
        this.focused = false;
        this.floors.map((val, ind) => {
            if(ind != index) {
                val.rendered = false;
            } else {
                val.rendered = true;
                val.map.position.y = 0;
                // this.wholeGroup.position.y = 0;
                this.focused = true;
            }
        })
        
        if(this.wholeGroup && this.focused) {
            if(!this.currentAngle)
            this.currentAngle = {
                x: this.wholeGroup.rotation.x,
                y: this.wholeGroup.rotation.y
            }
            this.wholeGroup.rotation.x = Math.PI / 2;
            this.wholeGroup.rotation.y = 0;
        }
        return this.focused;
    }
    
    renderMap(render: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
        let gl = render.getContext();
        
        // gl.stencilFunc(gl.EQUAL, 1, 0xff);
        // gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
        
        // gl.clear(gl.STENCIL_BUFFER_BIT);
        this.floors.map(val => {
            val.floor.visible = false;
            val.map.visible = false;
        })
        
        this.floors.map(val => {
            
            if(!val.rendered)
            return;
            
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
    
    loadMapOBJ(source: string, mapMaterial: THREE.Material, floorTexture: THREE.Texture, scene: THREE.Scene) {
        let loader = new OBJLoader();
        
        loader.load( source, (object) => {
            
            let currentMapMesh: THREE.Group;
            currentMapMesh = object;
            let currentFloorPolygon: THREE.Mesh;
            currentMapMesh.traverse((child) => {
                if(child instanceof THREE.Mesh) {
                    child.material = mapMaterial;
                }
            })
            let mapBoundingBox = new THREE.Box3().setFromObject(currentMapMesh);
            let buffVector: THREE.Vector3 = new THREE.Vector3();
            mapBoundingBox.getSize(buffVector);
            currentFloorPolygon = new THREE.Mesh(new THREE.PlaneGeometry(buffVector.x * 1.5, buffVector.z * 1.5), 
            new THREE.MeshBasicMaterial({map: floorTexture}));
            floorTexture.repeat = new THREE.Vector2(4, buffVector.z / buffVector.x * 4);
            currentFloorPolygon.rotation.x = -90 / 180 * Math.PI;
            currentFloorPolygon.translateZ(0.1);
            
            currentMapMesh.add(currentFloorPolygon);
            
            
            // currentMapMesh.position.y = -50 + 35 * this.floors.length;
            
            if(!this.wholeGroup) {
                this.wholeGroup = new THREE.Object3D();
                this.wholeGroup.rotation.x = 45 / 180 * Math.PI;
                this.wholeGroup.rotation.y = 45 / 180 * Math.PI;
                scene.add(this.wholeGroup)
            }
            
            
            
            this.wholeGroup.add(currentMapMesh)
            
            this.floors.push({
                map: currentMapMesh,
                floor: currentFloorPolygon,
                rendered: true
            });
            
            this.floors.map((val, index) => {
                let buildingHeight = this.floors.length * this.floorHeight;
                val.map.position.y = -buildingHeight / 2 + this.floorHeight * index;
            })
        }, undefined, function ( error ) {
            console.error( error );
        });
    }
}
