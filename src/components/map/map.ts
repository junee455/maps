import * as THREE from 'three'
import { FloorMap, initMask, disposeMask } from './maps';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import axios from 'axios';
import {Watch, Component, Vue} from 'vue-property-decorator';

function initRender() {
	
}

let theMap: FloorMap = new FloorMap()
theMap.floorHeight = 40;
let camera: THREE.OrthographicCamera
let dotsData: Array<{number: string, pos: Array<number>}>
let render: THREE.WebGLRenderer
let dotsScene: THREE.Scene
let scene = new THREE.Scene();
let canvasEl: HTMLElement
let needUpdate = false;

@Component
export default class Map extends Vue{
	
	
	constructor() {
		super();
		
		// load all the data and set up the render before compenent mount
		let transparentMaterial = new THREE.MeshPhongMaterial({color: "#f0f0f0"});
		let floorTexture = new THREE.TextureLoader().load('http://localhost:8080/floor_pattern2.jpg');
		floorTexture.wrapS = THREE.RepeatWrapping;
		floorTexture.wrapT = THREE.RepeatWrapping;
		
		let secondFloor: FloorMap = new FloorMap();
		
		// floors in correct order
		theMap.loadMapOBJ('http://localhost:8080/floor1.obj', transparentMaterial, floorTexture, scene);
		theMap.loadMapOBJ('http://localhost:8080/testmap2.obj', transparentMaterial, floorTexture, scene);
		theMap.loadMapOBJ('http://localhost:8080/testmap3.obj', transparentMaterial, floorTexture, scene);
		
		
		dotsScene = new THREE.Scene();
		
		
		
		// secondFloor.loadMapOBJ('http://localhost:8080/testmap3.obj', transparentMaterial, floorTexture, scene);
		
		// _firstFloorMap.rotation.x = 90 / 180 * Math.PI;
		
		// let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// let canvas = document.querySelector('#canvas');
		render = new THREE.WebGLRenderer({antialias: true});
		render.autoClear = false;
		render.setClearColor("#ffffff");
		
		
		
		// window.addEventListener('resize', (ev) => {
		// 	console.log("resize");
		// 	canvasEl = document.getElementById("three-canvas") as HTMLElement
		// 	camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
		// 		canvasEl.scrollWidth / 2,
		// 		canvasEl.scrollHeight / 2,
		// 		canvasEl.scrollHeight / -2, -200, 1000);
		// 	render.setViewport(0, 0, canvasEl.scrollWidth, canvasEl.scrollHeight);
		// 	camera.updateMatrix();
		// 	camera.updateProjectionMatrix();
		// 	render.setSize(canvasEl.scrollWidth, canvasEl.scrollHeight);
		// 	camera.updateMatrix();
		
		// })
		
		// render.setSize(canvasEl.scrollWidth, canvasEl.scrollHeight);
		
		
		let geometry = new THREE.BoxGeometry();
		let material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, wireframeLinewidth: 5 } );
		
		
		
		
		
		var light = new THREE.PointLight( 0xffffff, 1 );
		light.position.set( 0, 200, 1000 );
		scene.add( light );
		
	}

	data() {
		return {
			activeDropDown: undefined,
			menuShown: true,
			theMap: theMap,
			// focused floor index
			focusedFloor: null,
			dotsData: dotsData,
			highlitedPoint: {
				x: undefined,
				y: undefined
			}
		}
	}

	toggleDropDown(index: number) {
		if(index === this.activeDropDown) {
			this.activeDropDown = undefined;
		} else {
			this.activeDropDown = index;
		}
	}
	
	focusFloor (index) {
		if(index === this.focusedFloor) {
			this.theMap.disableFocus()
			this.focusedFloor = null
			return
		}
		this.theMap.focusFloor(index);
		this.focusedFloor = index
	}

	@Watch('dotsData', {deep: true})
	onDataChanged(newData, oldData) {
		
		dotsScene.traverse(val => {
			if(val instanceof THREE.Points && val.geometry instanceof THREE.Geometry) {
				
				val.geometry.vertices = newData.map(point => {
					return new THREE.Vector3(parseFloat(point.pos[0]), parseFloat(point.pos[1]), 0);
				})
				
				val.geometry.setFromPoints(val.geometry.vertices);
				
				val.geometry.verticesNeedUpdate = true;
			}
		})
		
		if(this.activeDropDown !== undefined) {
			this.projectPoint(this.activeDropDown);
		}
	}
	
	projectPoint(index) {
		dotsScene.traverse(val => {
			if(val instanceof THREE.Points && val.geometry instanceof THREE.Geometry) {
				
				let vec3 = val.geometry.vertices[index].clone().project(camera);
				
				camera.updateMatrixWorld();
				
				vec3.x = (vec3.x + 1) / 2 * canvasEl.scrollWidth + canvasEl.offsetLeft;
				vec3.y = (vec3.y + 1) / 2 * canvasEl.scrollHeight;
				
				this.highlitedPoint.x = vec3.x;
				this.highlitedPoint.y = vec3.y;
				
				// val.geometry.verticesNeedUpdate = true;
			}
		})
	}
	
	@Watch('activeDropDown')
	onActiveDropDownChange(newData, oldData) {
		console.log("data change", newData);
		if(newData !== undefined) {
			this.projectPoint(newData);
		}
	}
	
	beforeUpdate() {

	}
	
	mounted() {


		axios.get('http://localhost:8080/cabinets.json').then(res => {

			let dots: THREE.Geometry = new THREE.Geometry();
			
			dotsData = JSON.parse(res.data.split('\'').join('"'));
			// dots.vertices.push(new THREE.Vector3(0, 0, -200));
			
			dotsData = dotsData.map(val => {
				dots.vertices.push(new THREE.Vector3(...val.pos.map(val => val * 40), 0));
				val.pos = [val.pos[0] * 40, val.pos[1] * 40]
				return val;
			})

			this.dotsData = dotsData;
			
			dotsScene.add(new THREE.Points(dots, new THREE.PointsMaterial({color: "#ff5555", size: 10})));
		})
		
		canvasEl = document.getElementById("three-canvas") as HTMLElement
		
		canvasEl.addEventListener('mousedown', (e) => {
			mousePressed = true;
		})

		let mousePressed = false;
		
		document.addEventListener('mouseup', (e) => {
			mousePressed = false;
		})
		
		let zoomIn = false;
		
		// document.addEventListener('dblclick', (e) => {
		// 	zoomIn = !zoomIn;
		// 	if(zoomIn) {
		// 		camera.zoom = 2;
		// 		camera.updateProjectionMatrix();
		// 	} else {
		// 		camera.zoom = 1;
		// 		camera.updateProjectionMatrix();
		// 	}
		// })
		
		
		
		window.addEventListener('mousemove', (e) => {
			if(theMap && mousePressed) {
				theMap.rotateMap(e.movementY * 0.5, e.movementX * 0.5);
			}

		})
		
		canvasEl.addEventListener('wheel', (e) => {
			camera.zoom -= e.deltaY * 0.001;
			// if(camera.zoom > 3) camera.zoom = 3;
			// if(camera.zoom < 1) camera.zoom = 1;
			camera.updateProjectionMatrix();
		})
		
		camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
																					 canvasEl.scrollWidth / 2,
																					 canvasEl.scrollHeight / 2,
																					 canvasEl.scrollHeight / -2, -200, 1000);
		
		canvasEl.addEventListener('click', (ev: any) => {
			console.log(ev.layerX, ev.layerY);
			// dotsScene.vertices.push(new THREE.Vector3(...val.pos.map(val => val * 40), -200));
			dotsScene.autoUpdate = true;
			dotsScene.traverse((obj) => {
				if(obj instanceof THREE.Points) {
					if(obj.geometry instanceof THREE.Geometry) {
						obj.geometry.vertices.push(new THREE.Vector3(
							(ev.layerX - canvasEl.scrollWidth / 2) / camera.zoom,
							(-ev.layerY + canvasEl.scrollHeight / 2) / camera.zoom,
							0));
						
						this.dotsData.push({
							number: "Новая точка",
							pos: [
								(ev.layerX - canvasEl.scrollWidth / 2) / camera.zoom,
								(-ev.layerY + canvasEl.scrollHeight / 2) / camera.zoom
							]
						});
						
						obj.geometry.setFromPoints(obj.geometry.vertices);
						
						obj.geometry.verticesNeedUpdate = true;
						obj.geometry.elementsNeedUpdate = true;
						
						dotsScene.add(new THREE.Points(obj.geometry.clone(), new THREE.PointsMaterial({color: "#ff5555", size: 10})));
						
						dotsScene.remove(obj);
						
						obj.geometry.dispose();
						
					}
					obj.geometry.dispose();
				}
			})
			// scene.autoUpdate = true;
		})
		
		// dotsScene.autoUpdate = true;
		
		camera.position.z = -50;
		camera.zoom = 5;
		camera.updateProjectionMatrix();
		
		render.setSize(canvasEl.scrollWidth, canvasEl.scrollHeight);
		canvasEl.appendChild(render.domElement);
		
		let context = render.getContext();
		
		// window.addEventListener('resize', (ev) => {
		// 	canvasEl = document.getElementById("three-canvas") as HTMLElement
		
		// 	camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
		// 		canvasEl.scrollWidth / 2,
		// 		canvasEl.scrollHeight / 2,
		// 		canvasEl.scrollHeight / -2, -200, 1000);
		// 		camera.position.z = -50;
		// 		camera.zoom = 5;
		// 		camera.updateProjectionMatrix();
		// 	})
		
		
		function animate() {
			
			requestAnimationFrame(animate);
			
			
			initMask(render);
			
			// firstFloor.renderMapMask(render, scene, camera);
			theMap.renderMap(render, scene, camera);
			disposeMask(render);
			context.clear(context.DEPTH_BUFFER_BIT || context.STENCIL_BUFFER_BIT);
			if(dotsScene) {
				render.render(dotsScene, camera);
			}
			
			
		}
		animate();
		
	}
	
}

