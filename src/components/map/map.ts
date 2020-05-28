import * as THREE from 'three';
import { BuildingMap, initMask, disposeMask } from './maps';
import { MapDots, MapGraph } from './dots';
import GraphWrapper from './graphWrapper';
import axios from 'axios';
import Vue from 'vue';

let theMap: BuildingMap;
let camera: THREE.OrthographicCamera;
let render: THREE.WebGLRenderer;
let scene: THREE.Scene;
let canvasEl: HTMLElement;
let cabinetsData: Array<Array<{number: string, pos: number[]}>>;
const transparentMaterial = new THREE.MeshPhongMaterial({color: '#f0f0f0'});
let floorTexture: THREE.Texture = new THREE.TextureLoader().load(process.env['VUE_APP_HOST'] + 'static/floor_pattern2.jpg');
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;

let graphs: GraphWrapper[];

export default Vue.extend({
  watch: {
		focusedFloor: {
			handler(newData: number, oldData: number) {
				if(newData != oldData)
					this.focusedFloor = -1;
				this.focusFloor(newData)
			}
		},
    cabinetsData: {
      deep: true,
      handler(newData: Array<Array<{number: string, pos: number[]}>>) {

        if (this.focusedFloor < 0) {
          return;
        }

        newData.map((floor, index: number) => {
          this.cabinets[index].setDots(floor.map((point) => {
            return {
              x: point.pos[0],
              y: point.pos[1],
            };
          }));
          // this.cabinets[index].updateProjections(camera, canvasEl);
					if(this.activeDropDown == newData[this.focusedFloor].length)
						this.activeDropDown--;
					this.recalculateProjections(this.focusedFloor)
					if(this.activeDropDown >= 0)
						this.highlitedPoint = this.cabinets[this.focusedFloor]!.projections[this.activeDropDown];
        });
      },
    },


    activeDropDown(newData, oldData) {
      if (newData >= 0) {
        this.highlitedPoint = this.cabinets[this.focusedFloor]!.projections[this.activeDropDown];
      }
    },
  },

  data() {
    return {
			shared: <boolean>false,
			buffMapModel: <any>undefined,
			mapId: "",
			mapName: "new map",
      activeDropDown: -1,
      menuShown: true,
      theMap: <BuildingMap>undefined,
			mapModels: <string[]>[],
			cabinets: <Array<MapDots>>[],
      // focused floor index
      focusedFloor: -1,
      cabinetsData: cabinetsData,
			cabinetsProjections: <Array<any>>undefined,
      highlitedPoint: {
        x: -1,
        y: -1,
      },
      bottomMenuShown: true,
			displayBadges: false,
      // "cabinets" | "graph"
      currentEditor: 'cabinets',
      fromPoint:<{x: any, y: any} | undefined>undefined,
      toPoint: <{x: any, y: any} | undefined>undefined,
      findWayEngaged: true,
      wayPath: new Array,
      toCabinet: "",
      fromCabinet: "",
    };
  },

  mounted() {

		console.log("host:", this.$host);
		
    

    canvasEl = document.getElementById('three-canvas') as HTMLElement;

    window.addEventListener('keypress', (key) => {
      if (key.key == 'Delete') {
        let activeDropDown = this.activeDropDown;
        this.deletePoint(this.activeDropDown, this.focusedFloor);
        if (activeDropDown >= this.cabinetsData[this.focusedFloor].length) {
          activeDropDown = this.cabinetsData[this.focusedFloor].length - 1;
        }
        this.activeDropDown = activeDropDown;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.which == 2) {
        mouseMiddlePressed = true;
      }
      if (e.which == 1) {
        mouseLeftPressed = true;
      }
    });

    let mouseMiddlePressed = false;
    let mouseLeftPressed = false;

    document.addEventListener('mouseup', (e) => {
      mouseMiddlePressed = false;
      mouseLeftPressed = false;
    });

    const zoomIn = false;

    window.addEventListener('mousemove', (e) => {
      if (theMap && mouseMiddlePressed) {
        theMap.rotateMap(e.movementY * 0.5, e.movementX * 0.5);
      }

			if(mouseMiddlePressed) {
				if(this.displayBadges) 
					this.recalculateProjections(this.focusedFloor)
			}
			
      if (this.currentEditor == 'graph') {
        let x = e.clientX - canvasEl.offsetLeft;
        let y = e.clientY;

        x = (x - canvasEl.scrollWidth / 2) / camera.zoom;
        y = (-y + canvasEl.scrollHeight / 2) / camera.zoom;

        graphs[this.focusedFloor].followCursor(x, y);
      }

      if (mouseLeftPressed && this.activeDropDown >= 0) {
        if (e.clientX < canvasEl.offsetLeft) {
          return;
        }

        let x = e.clientX - canvasEl.offsetLeft;
        let y = e.clientY;

        x = (x - canvasEl.scrollWidth / 2) / camera.zoom;
        y = (-y + canvasEl.scrollHeight / 2) / camera.zoom;

        cabinetsData[this.focusedFloor][this.activeDropDown].pos = [x, y];
				this.recalculateProjections(this.focusedFloor);
      }
    });

    canvasEl.addEventListener('wheel', (e) => {
      camera.zoom -= e.deltaY * 0.001;

      camera.updateProjectionMatrix();


			if(this.activeDropDown >= 0)
				this.highlitedPoint = this.cabinets[this.focusedFloor].projections[this.activeDropDown];
			
			this.recalculateProjections(this.focusedFloor)
    });

    camera = new THREE.OrthographicCamera( canvasEl.scrollWidth / -2,
                                           canvasEl.scrollWidth / 2,
                                           canvasEl.scrollHeight / 2,
                                           canvasEl.scrollHeight / -2, -200, 1000);

		// this.recalculateProjections()
    window.addEventListener('click', (ev: any) => {
      let x, y;

      if (ev.clientX < canvasEl.offsetLeft) {
        return;
      }

      let index;
      if (this.focusedFloor < 0) {
        return;
      }

      if (this.currentEditor == 'cabinets') {
        x = ev.clientX;
        y = canvasEl.scrollHeight - ev.clientY;
        this.cabinets[this.focusedFloor].projections.map((point, _index) => {
          const delta = (point.x - x) ** 2 + (point.y - y) ** 2;
          if (delta < 25) {
            index = _index;
          }
        });
        if (index >= 0) {
          this.activeDropDown = <number>index;
        }
      } else if (this.currentEditor == 'graph') {
        if (ev.clientX < canvasEl.offsetLeft) {
          return;
        }

        x = ev.clientX - canvasEl.offsetLeft;
        y = ev.clientY;

        // compute real coordinates
        x = (x - canvasEl.scrollWidth / 2) / camera.zoom;
        y = (-y + canvasEl.scrollHeight / 2) / camera.zoom;

        graphs[this.focusedFloor].click(x, y);
				
        // graphs[this.focusedFloor].putRandomPoint();

        // graphsData[this.focusedFloor].push({x: (x - canvasEl.scrollWidth / 2) / camera.zoom,
        // 								 y: (-y + canvasEl.scrollHeight / 2) / camera.zoom});

        // graphs[this.focusedFloor].setDots(graphsData[this.focusedFloor]);




        // graphs[this.focusedFloor].putPoint({x: (x - canvasEl.scrollWidth / 2) / camera.zoom,
        // 																		y: (-y + canvasEl.scrollHeight / 2) / camera.zoom});

      }
      if (this.findWayEngaged) {

        x = ev.clientX - canvasEl.offsetLeft;
        y = ev.clientY;

        // compute real coordinates
        x = (x - canvasEl.scrollWidth / 2) / camera.zoom;
        y = (-y + canvasEl.scrollHeight / 2) / camera.zoom;


        this.findWay(x, y);
      }


    });

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


    const context = render.getContext();


    const animate = () => {

      requestAnimationFrame(animate);

      initMask(render);

      theMap.renderMap(render, scene, camera);
      disposeMask(render);
      context.clear(context.DEPTH_BUFFER_BIT || context.STENCIL_BUFFER_BIT);
      if (this.focusedFloor >= 0) {
        render.render(this.cabinets[this.focusedFloor].dotsScene, camera);
        graphs[this.focusedFloor].lines.map((val) => {
          render.render(val.dotsScene, camera);
        });
      }

			context.clear(context.DEPTH_BUFFER_BIT)
			
      if (this.wayPath.length) {
        const graphToRender = this.wayPath.slice(-1)[0];
        // const graphToRender = this.wayPath
        graphToRender.dotsScene.rotation.x = -theMap.wholeGroup.rotation.x + 90 / 180 * Math.PI;
        graphToRender.dotsScene.rotation.z = theMap.wholeGroup.rotation.y;

        render.render(graphToRender.dotsScene, camera);
      }
    };
    animate();
  },

	destroyed() {
		theMap = undefined
		camera = undefined
		render = undefined
		scene = undefined
		canvasEl = undefined
		cabinetsData = []
		graphs = []
	},
	
  beforeMount() {
		// floorTexture = new THREE.TextureLoader().load(this.$host + 'static/floor_pattern2.jpg');
		scene = new THREE.Scene();
		this.theMap = new BuildingMap()
		this.theMap.floorHeight = 40;
		theMap = this.theMap;

		this.cabinets = new Array;
    graphs = new Array;

		
		this.cabinetsData = []
		cabinetsData = this.cabinetsData;
		
    // load all the data and set up the render before compenent mount

    // const floorTexture = new THREE.TextureLoader().load(this.$host + 'floor_pattern2.jpg');



		this.mapId = this.$route.query.id
		
		// console.log("the map:", id)
		
		// create new map
		document.title = "edit: new map";
		if(!!this.mapId)
			axios.post(this.$host + 'api/map', {id: this.mapId}, {withCredentials: true}).then((response) => {
		// axios.get(this.$host + 'cabinets.json').then((res) => {

			let res = response.data
			this.mapName = res.name
			this.shared = !!res.shared
			document.title = "edit: " + this.mapName;


			//load floor models
			res.data.map(cab => {
				this.mapModels.push(cab.model)
				// this.$host + 'api/getMapModel' + cab.model
				if(!!cab.model) {
					// theMap.loadMapOBJ('http://localhost:8080/' + cab.model, transparentMaterial, floorTexture, scene);
					let buffFloor = theMap.addNewFloor(scene)
					axios.post(this.$host + 'api/getMapModel',
										 {fileName: cab.model},
										 {withCredentials: true}).then(response => {
											 buffFloor.parseMapOBJ(response.data.mapModel, transparentMaterial, floorTexture, scene)
											 theMap.updateModel(scene)
					})
					// buffFloor.parseMapOBJ
				}
				else
					theMap.addNewFloor(scene)
				// theMap.loadMapOBJ(this.$host + cab.model, transparentMaterial, floorTexture, scene);
			})
			
      res.data.map((floor) => {
        const floorCabinets = new MapDots();

        cabinetsData.push(floor.cabinets);
        // graphsData.push(floor.graph)
        floorCabinets.setDots(floor.cabinets.map((val) => {
          return {
            x: val.pos[0],
            y: val.pos[1],
          };
        }));
        // floorGraph.setDots(floor.graph.map(val => {
        // 	return {
        // 		x: val.pos[0],
        // 		y: val.pos[1],
        // 	}
        // }))

        floorCabinets.updateProjections(camera, canvasEl);

        this.cabinets.push(floorCabinets);
      });

      res.data.map((graph) => {
        const floorGraph = new GraphWrapper();
        floorGraph.importGraph({points: graph.points, lines: graph.lines});

        graphs.push(floorGraph);

      });


    });
		
		
		
    // floors in correct order

    // secondFloor.loadMapOBJ('http://localhost:8080/testmap3.obj', transparentMaterial, floorTexture, scene);

    // _firstFloorMap.rotation.x = 90 / 180 * Math.PI;

    // let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // let canvas = document.querySelector('#canvas');
    render = new THREE.WebGLRenderer({antialias: true});
    render.autoClear = false;
    render.setClearColor('#ffffff');



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


    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, wireframeLinewidth: 5 } );





    const light = new THREE.PointLight( 0xffffff, 1 );
    light.position.set( 400, 200, 600 );
    scene.add( light );


  },

  methods: {
		uploadFileHandler(event) {
			let focusedFloor = this.focusedFloor
			let theFile = event.target.files[0]
			console.log(theFile)
			let reader = new FileReader()
			reader.onload = (event) => {
				axios.post(this.$host + 'api/uploadMapModel', {
					mapModel: event.target.result,
					mapName: theFile.name
				}, {withCredentials: true}).then((response) => {
					this.mapModels[focusedFloor] = response.data.fileName
				})
				theMap.floors[focusedFloor].parseMapOBJ(event.target.result as string, transparentMaterial, floorTexture, scene)
				theMap.updateModel(scene)

				// theMap.floors[this.focusedFloor].loadMapOBJ('http://localhost:8080/' + theFile.name, transparentMaterial, floorTexture, scene)
			}
			reader.readAsBinaryString(theFile)

		},
		moveFloorUp(index) {
			console.log(index)
		},
		moveFloorDown(index) {
			console.log(index)
		},
		toggleBadges() {
			if(this.displayBadges) {
				this.displayBadges = false;
				return
			} else {
				this.displayBadges = true;
				this.recalculateProjections()
			}
			
		},
		badgeClick(point) {
			if(this.focusedFloor >= 0) {
				this.activeDropDown = this.focusedFloor < 0 ? -1 : point.index
			} else {
				if(!this.fromCabinet) {
					this.fromCabinet = point.name
					return
				}
				if(!this.toCabinet) {
					this.toCabinet = point.name
					return
				}
				this.toCabinet = ""
				this.fromCabinet = point.name
			}
		},
		uploadModel() {
			this.$refs["model-upload"].click()
		},
		addNewFloor() {
			this.cabinetsData.push([])
			this.cabinets.push(new MapDots())
			graphs.push(new GraphWrapper())
			this.theMap.addNewFloor(scene);
			this.mapModels.push("");
		},
		deleteFloor(index) {
			this.focusedFloor = -1
			this.cabinetsData.splice(index, 1)
			this.cabinets.splice(index, 1)
			graphs.splice(index, 1)
			this.mapModels.splice(index, 1)
			this.theMap.deleteFloor(index)
		},
		recalculateProjections(floorNumber = -1) {
			this.cabinetsProjections = new Array
			// cabinets[0].updateProjections(camera, canvasEl, theMap.floors[0].map.matrixWorld)
			if(floorNumber >= 0) {
				let floor = this.cabinets[floorNumber]
				floor.updateProjections(camera, canvasEl, theMap.floors[floorNumber].map.matrixWorld)
				this.cabinetsProjections = floor.projections.map((cab, index) => {
					cab.name = cabinetsData[floorNumber][index].number
					// if(cab.name.split('_')[0] == 'ladder')
						// cab.name = ""
					cab.index = index
					cab.floor = floorNumber
					return cab
				}).sort((a, b) => b.z > a.z ? 1 : -1)
			} else {
				this.cabinets.map((floor, index) => {
					floor.updateProjections(camera, canvasEl, theMap.floors[index].map.matrixWorld)
					this.cabinetsProjections = this.cabinetsProjections.concat(floor.projections.map((cab, _index) => {
						cab.name = cabinetsData[index][_index].number
						// if(cab.name.split('_')[0] == 'ladder')
							// cab.name = ""
						cab.index = _index
						cab.floor = index
						return cab
					}).sort((a, b) => b.z > a.z ? 1 : -1))
				})
			}

			
		},
		deletePoint(index, focusedFloor) {
			cabinetsData[focusedFloor].splice(index, 1);
			
		},
    findWayButton() {

      if (this.toCabinet != "" && this.fromCabinet != "") {
        this.fromPoint = this.toPoint = undefined;

        let fromFloor, toFloor;

        let fromPos, toPos;
        this.wayPath = [];

        cabinetsData.map((floor, index) => {
          floor.map((val) => {
            if (val.number == this.fromCabinet) {
              fromFloor = index;
              fromPos = val.pos;
            } else if (val.number == this.toCabinet) {
              toFloor = index;
              toPos = val.pos;
            }
          });
        });

        if (fromFloor == toFloor) {
          this.findWay(...fromPos, toFloor);
          this.findWay(...toPos, toFloor);
        } else {
          // find closest ladder
          let fromLadder, toLadder;
          cabinetsData[fromFloor].map((val) => {
            if (val.number.split('_')[0] == 'ladder') {
              const distance = (val.pos[0] - fromPos[0]) ** 2 + (val.pos[1] - fromPos[1]) ** 2;
              if (!fromLadder) {
                fromLadder = val.pos;
              }
              if (distance <= (fromLadder[0] - fromPos[0]) ** 2 + (fromLadder[1] - fromPos[1]) ** 2) {
                fromLadder = val.pos;
                console.log(cabinetsData[toFloor].map((_val) => _val.number));
                toLadder = cabinetsData[toFloor].find((_val) => _val.number == val.number)!.pos;
              }
            }
          });
          console.log(fromPos, fromLadder, toLadder, toPos);
          // ladders found
          this.findWay(...fromPos, fromFloor);
          this.findWay(...fromLadder, fromFloor);
          const connection = new MapGraph();
          // , z: -theMap.floorHeight * (fromFloor - theMap.floors.length / 2) - 10
          // , z: -theMap.floorHeight * (toFloor - theMap.floors.length / 2) - 10
          connection.setDots([{x: fromLadder[0], y: fromLadder[1], z: -theMap.floorHeight * (fromFloor - theMap.floors.length / 2) - 10},
                              {x: fromLadder[0], y: fromLadder[1], z: -theMap.floorHeight * (toFloor - theMap.floors.length / 2) - 10}]);
          connection.setMaterial({color: '#e77ea0', linewidth: 10, linejoin: 'round'});
          // this.wayPath.push(connection);
          this.findWay(...toLadder, toFloor);
          this.findWay(...toPos, toFloor);
          connection.dotsScene.add(this.wayPath[0].pointsInstance, this.wayPath[1].pointsInstance);
          this.wayPath.push(connection);


        }
      }
    },

    findWay(x, y, index) {
			if(this.focusedFloor >= 0)
				return
      if (!this.fromPoint) {
        this.fromPoint = {x, y};
      } else if (!this.toPoint) {
        this.toPoint = {x, y};
        const wayGraph = graphs[index].findPath(this.fromPoint!, this.toPoint!);
        wayGraph.pointsInstance!.translateZ(-theMap.floorHeight * (index - theMap.floors.length / 2) - 10);
        this.wayPath.push(wayGraph);
        this.fromPoint = this.toPoint = undefined;
      }
    },

		quit() {
			// not implemented
			this.$router.push("/cabinet");
		},

    saveLayout() {
			console.log("not implemented yet")
			console.log("~~graps~~")
			graphs.map(g => console.log(g.exportGraph()))
			console.log("~~cabinets~~")
			this.cabinetsData.map(g => console.log(g))
			console.log("~~models~~")
			console.log(this.mapModels)
			let result: any = {
				shared: this.shared,
				name: this.mapName,
				data: []
			}
			
			for(let i in this.theMap.floors) {
				let exportGraph = graphs[i].exportGraph()
				result.data.push({
					cabinets: this.cabinetsData[i],
					lines: exportGraph.lines,
					points: exportGraph.points,
					model: this.mapModels[i]
				})
			}
			
			if(!!this.mapId) {
				
				result._id = this.mapId
			}

			console.log("result:", result)
			
			axios.post(this.$host + 'api/saveMap', result, {withCredentials: true}).then(res => {
				console.log(res.status)
			})
		},

    toggleDropDown(index: number) {
      if (index === this.activeDropDown) {
        this.activeDropDown = -1;
      } else {
        this.activeDropDown = index;
      }
    },

    focusFloor(index) {
      if (index === this.focusedFloor) {
        this.theMap.disableFocus();
        this.activeDropDown = -1;
        this.focusedFloor = -1;
      } else {
				this.wayPath = new Array
				this.activeDropDown =  -1;
				this.theMap.focusFloor(index);
				this.focusedFloor = index;
			}
			this.recalculateProjections(this.focusedFloor)

    },



    putPoint(floor, x = canvasEl.scrollWidth / 2, y = canvasEl.scrollHeight / 2) {

      x = (x - canvasEl.scrollWidth / 2) / camera.zoom;
      y = (-y + canvasEl.scrollHeight / 2) / camera.zoom;


      if (this.currentEditor == 'graph') {
        // graphsData.push({
        // 	x: Math.random() * 20 - 10,
        // 	y: Math.random() * 20 - 10
        // });

        // graphs[this.focusedFloor].setDots(graphsData);



        // graphs[this.focusedFloor].putPoint({
        // 	x: 0,
        // 	y: 0
        // });

        return;
      }

      cabinetsData[this.focusedFloor].push({number: 'Новая точка', pos: [x, y]});
      this.activeDropDown = cabinetsData[this.focusedFloor].length - 1;
    },

    switchEditor() {
      // "cabinets" | "graph"
      if (this.currentEditor == 'cabinets') {
				this.activeDropDown = -1;
        this.currentEditor = 'graph';
        this.cabinets.map((floor) => {
          floor.setMaterial({color: '#487586', size: 5});
        });
        // this.currentDots = this.graphs
      } else {
        this.currentEditor = 'cabinets';
        this.cabinets.map((floor) => {
          floor.setMaterial({color: '#487586', size: 10});
        });
        // this.currentDots = this.cabinetsData
      }

    },
  },

});

