import * as THREE from 'three'
import { FloorMap, initMask, disposeMask } from './maps';
import { MapDots, MapGraph } from './dots';
import GraphWrapper from './graphWrapper';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import axios from 'axios';
import Vue from 'vue';
import {Watch, Component} from 'vue-property-decorator';

let theMap: FloorMap = new FloorMap()
theMap.floorHeight = 40;
let camera: THREE.OrthographicCamera
let render: THREE.WebGLRenderer
let scene = new THREE.Scene();
let canvasEl: HTMLElement
let cabinetsData: Array<Array<{number: string, pos: Array<number>}>> = []
let graphsData: Array<any> = []

let cabinets: Array<MapDots>
let graphs: Array<GraphWrapper>

let fileLoaded = false;

let graphRawData

@Component
export default class Map extends Vue{
	
	activeDropDown: number | undefined
	menuShown: boolean = true
	theMap = theMap
	// focused floor index
	focusedFloor: number | undefined
	cabinetsData = cabinetsData
	graphsData = graphsData
	highlitedPoint: {
		x: number,
		y: number
	}
	bottomMenuShown: boolean = true
	// "cabinets" | "graph"
	currentEditor: string = "cabinets"
	
	data() {
		return {
			
			activeDropDown: undefined,
			menuShown: true,
			theMap: theMap,
			// focused floor index
			focusedFloor: undefined,
			cabinetsData: cabinetsData,
			graphsData: graphsData,
			highlitedPoint: {
				x: undefined,
				y: undefined
			},
			bottomMenuShown: true,
			// "cabinets" | "graph"
			currentEditor: "cabinets",
			fromPoint: undefined,
			toPoint: undefined,
			findWayEngaged: true,
			wayPath: undefined,
			toCabinet: undefined,
			fromCabinet: undefined
		}
	}
	
	mounted() {
		
		axios.get('http://localhost:8080/cabinets.json').then(res => {

			cabinets = []
			graphs = []
			
			res.data['cabinets'].map(floor => {
				let floorCabinets = new MapDots()

				cabinetsData.push(floor)
				// graphsData.push(floor.graph)
				
				floorCabinets.setDots(floor.map(val => {
					return {
						x: val.pos[0],
						y: val.pos[1],
					}
				}))
				// floorGraph.setDots(floor.graph.map(val => {
				// 	return {
				// 		x: val.pos[0],
				// 		y: val.pos[1],
				// 	}
				// }))
				
				floorCabinets.updateProjections(camera, canvasEl);
				
				cabinets.push(floorCabinets)
			})
			
			res.data['graphs'].map(graph => {
				let floorGraph = new GraphWrapper()
				floorGraph.importGraph(graph)
				
				graphs.push(floorGraph);
				
			})
			
		})

		canvasEl = document.getElementById("three-canvas") as HTMLElement
		
		window.addEventListener('keypress', (key) => {
			if(key.key == "Delete") {
				let activeDropDown = this.activeDropDown
				this.deletePoint(this.activeDropDown, this.focusedFloor);
				if(activeDropDown >= this.cabinetsData[this.focusedFloor].length)
					activeDropDown = this.cabinetsData[this.focusedFloor].length - 1;
				this.activeDropDown = activeDropDown;
			}
		});
		
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
		
		window.addEventListener('mousemove', (e) => {
			if(theMap && mouseMiddlePressed) {
				theMap.rotateMap(e.movementY * 0.5, e.movementX * 0.5);
			}

			if(this.currentEditor == "graph") {
				let x = e.clientX - canvasEl.offsetLeft
				let y = e.clientY
				
				x = (x - canvasEl.scrollWidth / 2) / camera.zoom
				y = (-y + canvasEl.scrollHeight / 2) / camera.zoom

				graphs[this.focusedFloor].followCursor(x, y);
			}
			
			if(mouseLeftPressed && this.activeDropDown !== undefined) {
				if(e.clientX < canvasEl.offsetLeft)
					return
				
				let x = e.clientX - canvasEl.offsetLeft
				let y = e.clientY
				
				x = (x - canvasEl.scrollWidth / 2) / camera.zoom
				y = (-y + canvasEl.scrollHeight / 2) / camera.zoom
				
				cabinetsData[this.focusedFloor][this.activeDropDown].pos = [x, y]
			}
		})
		
		// canvasEl.addEventListener('wheel', (e) => {
		// 	camera.zoom -= e.deltaY * 0.001;
			
		// 	camera.updateProjectionMatrix();
			
		// })
		
		camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
																					 canvasEl.scrollWidth / 2,
																					 canvasEl.scrollHeight / 2,
																					 canvasEl.scrollHeight / -2, -200, 1000);
		
		window.addEventListener('click', (ev: any) => {
			let x, y

			if(ev.clientX < canvasEl.offsetLeft) {
				return
			}
			
			let index = undefined;
			if(this.focusedFloor === undefined)
				return
			
			if(this.currentEditor == "cabinets") {
				x = ev.clientX
				y = canvasEl.scrollHeight - ev.clientY;
				cabinets[this.focusedFloor].projections.map((point, _index) => {
					let delta = (point.x - x) ** 2 + (point.y - y) ** 2
					if(delta < 25) {
						index = _index
					}
				})
				if(index !== undefined)
					this.activeDropDown = index
			} else if(this.currentEditor == "graph") {
				if(ev.clientX < canvasEl.offsetLeft)
					return
				
				x = ev.clientX - canvasEl.offsetLeft
				y = ev.clientY
				
				// compute real coordinates
				x = (x - canvasEl.scrollWidth / 2) / camera.zoom
				y = (-y + canvasEl.scrollHeight / 2) / camera.zoom
				
				graphs[this.focusedFloor].click(x, y);
				// graphs[this.focusedFloor].putRandomPoint();
				
				// graphsData[this.focusedFloor].push({x: (x - canvasEl.scrollWidth / 2) / camera.zoom,
				// 								 y: (-y + canvasEl.scrollHeight / 2) / camera.zoom});
				
				// graphs[this.focusedFloor].setDots(graphsData[this.focusedFloor]);
				
				

				
				// graphs[this.focusedFloor].putPoint({x: (x - canvasEl.scrollWidth / 2) / camera.zoom,
				// 																		y: (-y + canvasEl.scrollHeight / 2) / camera.zoom});
				
			}
			if(this.findWayEngaged) {
				
				x = ev.clientX - canvasEl.offsetLeft
				y = ev.clientY
				
				// compute real coordinates
				x = (x - canvasEl.scrollWidth / 2) / camera.zoom
				y = (-y + canvasEl.scrollHeight / 2) / camera.zoom

				
				this.findWay(x, y)
			}
			

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
			
			
			// if(fileLoaded && !projectionInited) {
			// 	cabinetsData.map((floorDots, floor) => {
			// 		this.dotsProjection.push([]);
			// 		for(let index in floorDots)
			// 			this.dotsProjection[floor].push(this.projectPoint(index, floor));	
			// 	})
			// 	projectionInited = true;
			// }
			
			initMask(render);
			
			// firstFloor.renderMapMask(render, scene, camera);
			theMap.renderMap(render, scene, camera);
			disposeMask(render);
			context.clear(context.DEPTH_BUFFER_BIT || context.STENCIL_BUFFER_BIT);
			if(this.focusedFloor !== undefined) {
				// if(dotsScene[this.focusedFloor]) {
				render.render(cabinets[this.focusedFloor].dotsScene, camera);
				// graphs[this.focusedFloor].lines.map(val => {
				// 	render.render(val.dotsScene, camera);
				// })

					// render.render(graphs[this.focusedFloor].dotsScene, camera);
				// }
			}
			
			render.getContext().clear(render.getContext().DEPTH_BUFFER_BIT)
			
			if(this.wayPath) {
				this.wayPath.dotsScene.rotation.x = theMap.wholeGroup.rotation.x - 90 / 180 * Math.PI;
				this.wayPath.dotsScene.rotation.z = theMap.wholeGroup.rotation.y
				this.wayPath.dotsScene.position.y = -10
				// this.wayPath.dotsScene.rotation.z = theMap.wholeGroup.rotation.z
					render.render(this.wayPath.dotsScene, camera);
			}
			
			// if(this.currentEditor == "graph") {
			// 	render.render(this.graphsObj.dotsScene, camera)
			// }
			
			
		}
		animate();
	}
	
	
	findWayButton() {
		if(this.toCabinet !== undefined && this.fromCabinet !== undefined) {
			this.fromPoint = this.toPoint = undefined

			
			
			this.findWay(...cabinetsData[1].find(val => val.number == this.fromCabinet).pos)
			this.findWay(...cabinetsData[1].find(val => val.number == this.toCabinet).pos)
		}
	}
	
	findWay(x, y) {
		// if(this.focusedFloor == undefined)
			// return
		
		if(!this.fromPoint) {
			this.fromPoint = {x: x, y: y}
		} else if(!this.toPoint) {
			this.toPoint = {x: x, y: y}
			this.wayPath = graphs[1].findPath(this.fromPoint, this.toPoint);
			this.fromPoint = this.toPoint = undefined
		}
	}
	
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
	

	downloadLayout() {
		let data = "data:text/json;charset=utf-8," + JSON.stringify({cabinets: this.cabinetsData,
																																 graphs: graphs.map(graph => graph.exportGraph())});
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
	
	focusFloor(index) {
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

	@Watch('cabinetsData', {deep: true})
	onDataChanged(newData) {
		
		if(this.focusedFloor === undefined)
			return
		
		newData.map((floor, index) => {
			cabinets[index].setDots(floor.map(point => {
				return {
					x: point.pos[0],
					y: point.pos[1]
				}
			}))
			cabinets[index].updateProjections(camera, canvasEl);
			this.highlitedPoint = cabinets[this.focusedFloor].projections[this.activeDropDown]
		});
	}
	
	@Watch('activeDropDown')
	onActiveDropDownChange(newData, oldData) {
		if(newData !== undefined) {
			this.highlitedPoint = cabinets[this.focusedFloor].projections[this.activeDropDown]
		}
	}
	
	putPoint(floor, x = canvasEl.scrollWidth / 2, y = canvasEl.scrollHeight / 2) {

		x = (x - canvasEl.scrollWidth / 2) / camera.zoom
		y = (-y + canvasEl.scrollHeight / 2) / camera.zoom

		
		if(this.currentEditor == "graph") {
			// graphsData.push({
			// 	x: Math.random() * 20 - 10,
			// 	y: Math.random() * 20 - 10
			// });

			// graphs[this.focusedFloor].setDots(graphsData);
			

			
			// graphs[this.focusedFloor].putPoint({
			// 	x: 0,
			// 	y: 0
			// });
			
			return
		}
		
		cabinetsData[this.focusedFloor].push({number: "Новая точка", pos: [x, y]});
		this.activeDropDown = cabinetsData[this.focusedFloor].length - 1
	}
	
	switchEditor() {
		// "cabinets" | "graph"
		if(this.currentEditor == "cabinets") {
			this.currentEditor = "graph"
			cabinets.map(floor => {
				floor.setMaterial({color: "#487586", size: 5});
			})
			// this.currentDots = this.graphs
		} else {
			this.currentEditor = "cabinets"
			cabinets.map(floor => {
				floor.setMaterial({color: "#487586", size: 10});
			})
			// this.currentDots = this.cabinetsData
		}
		
	}
	

}

