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
let dotsData: any
let render: THREE.WebGLRenderer
let dotsScene: Array<THREE.Scene> = []
let scene = new THREE.Scene();
let canvasEl: HTMLElement
let needUpdate = false;
let projectionInited = false;

let fileLoaded = false;

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
			focusedFloor: undefined,
			dotsData: dotsData,
			highlitedPoint: {
				x: undefined,
				y: undefined
			},
			dotsProjection: [],
			bottomMenuShown: false
		}
	}

	downloadLayout() {
		let data = "data:text/json;charset=utf-8," + JSON.stringify(this.dotsData);
		let button = document.getElementById("download-button");
		button.setAttribute("href", data)
		button.setAttribute("download", "cabinets.json");
		button.click();
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
			this.activeDropDown = undefined;
			this.focusedFloor = undefined
			return
		}
		this.activeDropDown = undefined;
		this.theMap.focusFloor(index);
		this.focusedFloor = index
	}

	@Watch('dotsData', {deep: true})
	onDataChanged(newData, oldData) {
		if(this.focusedFloor === undefined)
			return;
		dotsScene[this.focusedFloor].traverse(val => {
			if(val instanceof THREE.Points && val.geometry instanceof THREE.Geometry) {
				
				val.geometry.vertices = newData[this.focusedFloor].map(point => {
					return new THREE.Vector3(parseFloat(point.pos[0]), parseFloat(point.pos[1]), 0);
				})
				
				val.geometry.setFromPoints(val.geometry.vertices);
				
				val.geometry.verticesNeedUpdate = true;
			}
		})
		
		if(this.activeDropDown !== undefined) {
			this.highlitedPoint = this.projectPoint(this.activeDropDown, this.focusedFloor);
			// this.dotsProjection[this.activeDropDown] = this.highlitedPoint;
		}
	}
	
	projectPoint(index, floor) {
		let vec3: any;
		dotsScene[floor].traverse(val => {
			if(val instanceof THREE.Points && val.geometry instanceof THREE.Geometry) {
				camera.updateMatrixWorld();
				
				vec3 = val.geometry.vertices[index].clone().project(camera);
				
				
				vec3.x = (vec3.x + 1) / 2 * canvasEl.scrollWidth + canvasEl.offsetLeft;
				vec3.y = (vec3.y + 1) / 2 * canvasEl.scrollHeight;
				
				
			}
		})
		return {x: vec3.x,
						y: vec3.y}
	}
	
	@Watch('activeDropDown')
	onActiveDropDownChange(newData, oldData) {
		console.log("data change", newData);
		if(newData !== undefined) {
			this.highlitedPoint = this.projectPoint(newData, this.focusedFloor);
			this.dotsProjection[this.focusedFloor][newData] = this.highlitedPoint;
		}
	}
	
	beforeUpdate() {

	}
	
	movePoint(x, y, index, floor) {
		dotsScene[floor].traverse((obj) => {
			if(obj instanceof THREE.Points) {
				if(obj.geometry instanceof THREE.Geometry) {
					obj.geometry.vertices[index] = new THREE.Vector3(
						(x - canvasEl.scrollWidth / 2) / camera.zoom,
						(-y + canvasEl.scrollHeight / 2) / camera.zoom,
						0);
					
					this.dotsData[floor][index].pos[0] = (x - canvasEl.scrollWidth / 2) / camera.zoom;
					this.dotsData[floor][index].pos[1] = (-y + canvasEl.scrollHeight / 2) / camera.zoom;
					obj.geometry.verticesNeedUpdate = true;
				}
			}
		})
	}
	
	deletePoint(index, floor) {
		this.dotsData[floor].splice(index, 1)
		this.dotsProjection[floor] = []

		
		dotsScene[floor].traverse((obj) => {
			if(obj instanceof THREE.Points) {
				if(obj.geometry instanceof THREE.Geometry) {
					
					obj.geometry.vertices.splice(index, 1)
					obj.geometry.setFromPoints(obj.geometry.vertices);
					
					obj.geometry.verticesNeedUpdate = true;
					obj.geometry.elementsNeedUpdate = true;
					
					dotsScene[floor].add(new THREE.Points(obj.geometry.clone(), new THREE.PointsMaterial({color: "#487586", size: 10})));
					
					dotsScene[floor].remove(obj);
					
					obj.geometry.dispose();
					
				}
				obj.geometry.dispose();
			}
		})
		
		for(let index in this.dotsData[floor])
			this.dotsProjection[floor].push(this.projectPoint(index, floor));
		
		this.activeDropDown = undefined;
	}
	
	putPoint(floor, x = canvasEl.scrollWidth / 2, y = canvasEl.scrollHeight / 2) {
		console.log(dotsScene);

		dotsScene[floor].traverse((obj) => {
			if(obj instanceof THREE.Points) {
				if(obj.geometry instanceof THREE.Geometry) {
					obj.geometry.vertices.push(new THREE.Vector3(
						(x - canvasEl.scrollWidth / 2) / camera.zoom,
						(-y + canvasEl.scrollHeight / 2) / camera.zoom,
						0));
					
					this.dotsData[floor].push({
						number: "Новая точка",
						pos: [
							(x - canvasEl.scrollWidth / 2) / camera.zoom,
							(-y + canvasEl.scrollHeight / 2) / camera.zoom
						]
					});
					
					obj.geometry.setFromPoints(obj.geometry.vertices);
					
					obj.geometry.verticesNeedUpdate = true;
					obj.geometry.elementsNeedUpdate = true;
					
					dotsScene[floor].add(new THREE.Points(obj.geometry.clone(), new THREE.PointsMaterial({color: "#487586", size: 10})));
					
					dotsScene[floor].remove(obj);
					
					obj.geometry.dispose();
					
				}
				obj.geometry.dispose();
			}
		})
		for(let index in this.dotsData[floor])
			this.dotsProjection[floor][index] = this.projectPoint(index, floor);
		this.activeDropDown = this.dotsData[floor].length - 1;
	}
	
	mounted() {


		axios.get('http://localhost:8080/cabinets.json').then(res => {

			let dots: Array<THREE.Geometry> = [];
			
			// console.log(res.data);
			
			dotsData = res.data;
			// dots.vertices.push(new THREE.Vector3(0, 0, -200));
			
			this.dotsData = dotsData;

			dotsData.map((floorDots, index) => {
				dots.push(new THREE.Geometry());
				floorDots.map((val) => {
					dots[index].vertices.push(new THREE.Vector3(...val.pos, 0));
				})
				dotsScene.push(new THREE.Scene());
				dotsScene[index].add(new THREE.Points(dots[index], new THREE.PointsMaterial({color: "#487586", size: 10})));
			})
			
			fileLoaded = true;
			
			// dotsData
			// this.projectPoint()
		})
		
		canvasEl = document.getElementById("three-canvas") as HTMLElement
		
		window.addEventListener('mousedown', (e) => {
			if(e.which == 2)
				mouseMiddlePressed = true;
			if(e.which == 1)
				mouseLeftPressed = true;
		})

		let mouseMiddlePressed = false;
		let mouseLeftPressed = false;
		
		document.addEventListener('mouseup', (e) => {
			mouseMiddlePressed = false;
			mouseLeftPressed = false;
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
			if(theMap && mouseMiddlePressed) {
				theMap.rotateMap(e.movementY * 0.5, e.movementX * 0.5);
			}

			if(mouseLeftPressed && this.activeDropDown !== undefined) {
				if(e.clientX < canvasEl.offsetLeft)
					return
				this.movePoint(e.clientX - canvasEl.offsetLeft, e.clientY, this.activeDropDown, this.focusedFloor);
				this.highlitedPoint = this.projectPoint(this.activeDropDown, this.focusedFloor);
				this.dotsProjection[this.focusedFloor][this.activeDropDown] = this.highlitedPoint
			}
		})
		
		canvasEl.addEventListener('wheel', (e) => {
			camera.zoom -= e.deltaY * 0.001;
			// if(camera.zoom > 3) camera.zoom = 3;
			// if(camera.zoom < 1) camera.zoom = 1;
			camera.updateProjectionMatrix();
			this.dotsData.map((floorDots, floor) => {
			for(let index in floorDots)
				this.dotsProjection[floor][index] = this.projectPoint(index, floor);
			})
			if(this.focusedFloor !== undefined)
				this.highlitedPoint = this.dotsProjection[this.focusedFloor][this.activeDropDown];
		})
		
		camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
																					 canvasEl.scrollWidth / 2,
																					 canvasEl.scrollHeight / 2,
																					 canvasEl.scrollHeight / -2, -200, 1000);
		// click handler
		// canvasEl.addEventListener('click', (ev: any) => {
		// 	console.log(ev.layerX, ev.layerY);
		// 	// dotsScene.vertices.push(new THREE.Vector3(...val.pos.map(val => val * 40), -200));
		// 	dotsScene.autoUpdate = true;

		// 	putPoint(ev.layerX, ev.layerY);
			
		// 	// scene.autoUpdate = true;
		// })
		
		window.addEventListener('click', (ev: any) => {
			let x, y
			x = ev.clientX
			y = canvasEl.scrollHeight - ev.clientY;
			if(x < canvasEl.offsetLeft)
				return
			console.log(ev);
			let index = undefined;
			this.dotsProjection[this.focusedFloor].map((point, _index) => {
				let delta = (point.x - x) ** 2 + (point.y - y) ** 2
				if(delta < 25) {
					index = _index
				}
			})
			if(index !== undefined)
				this.activeDropDown = index
		})
		
		// dotsScene.autoUpdate = true;
		
		camera.position.z = -50;
		camera.zoom = 5;
		camera.updateProjectionMatrix();
		
		render.setSize(canvasEl.scrollWidth, canvasEl.scrollHeight);
		canvasEl.appendChild(render.domElement);
		
		
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
		
		
		// for(let index in this.dotsData)
		// 		this.dotsProjection.push(this.projectPoint(index));

		
		let context = render.getContext();

		
		let animate = () => {
			
			requestAnimationFrame(animate);
			
			
			if(fileLoaded && !projectionInited) {
				dotsData.map((floorDots, floor) => {
					this.dotsProjection.push([]);
					for(let index in floorDots)
						this.dotsProjection[floor].push(this.projectPoint(index, floor));	
				})
				projectionInited = true;
			}
			
			initMask(render);
			
			// firstFloor.renderMapMask(render, scene, camera);
			theMap.renderMap(render, scene, camera);
			disposeMask(render);
			context.clear(context.DEPTH_BUFFER_BIT || context.STENCIL_BUFFER_BIT);
			if(this.focusedFloor !== undefined) {
				if(dotsScene[this.focusedFloor]) {
					render.render(dotsScene[this.focusedFloor], camera);
				}
			}
			
			
		}
		animate();
	}
}

