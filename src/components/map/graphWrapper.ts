import { MapGraph } from './dots';

export default class GraphWrapper {
	
	lines: Array<MapGraph> = []
	// 5px
	snapRadius: number = 10
	selectedPoint: number = undefined
	selectedLine: number = undefined
	
	followedPoint: number = undefined
	
	graphData: {
		points: Array<Array<number>>,
		lines: Array<Array<number>>
	} | undefined
	
	constructor() {
	}
	
	findPath(from: {x: number, y: number}, to: {x: number, y: number}) {
		if(!this.graphData) {
			this.graphData = this.exportGraph();
		}
		
		// find point indexes
		let fromI, toI

		for(let _index in this.graphData.points) {
			let index = parseInt(_index);
			if(fromI === undefined) {
				let delta = (this.graphData.points[index][0] - from.x) ** 2 + (this.graphData.points[index][1] - from.y) ** 2
				if(delta < this.snapRadius) {
					fromI = index
				}
			}
			if(toI === undefined) {
				let delta = (this.graphData.points[index][0] - to.x) ** 2 + (this.graphData.points[index][1] - to.y) ** 2
				if(delta < this.snapRadius) {
					toI = index
				}
			}
			// points found
			if(toI !== undefined && fromI !== undefined)
				break
		}
		// find the way
		// find lines points belong to
		let fromL, toL
		for(let _line in this.graphData.lines) {
			let line = parseInt(_line)
			for(let _point in this.graphData.lines[line]) {
				let point = parseInt(_point)
				if(this.graphData.lines[line][point] == fromI)
					fromL = line;
				if(this.graphData.lines[line][point] == toI)
					toL = line
				if(fromL !== undefined && toL !== undefined)
					break
			}
		}
		// wave search algorithm but for sets of points
		let path: Array<{
			level: number,
			points: Array<number>
		}> = [{level: 0, points: [fromL]}]
		// indexes of lines not included in path
		let checked = [fromL]
		let pathFound = false
		
		let areNeighbours = (a: number, b: number) => {
			let neighbours = false
			this.graphData.lines[a].map((val) => {
				if(this.graphData.lines[b] && this.graphData.lines[b].includes(val))
					neighbours = true
			})
			return neighbours
		}
		
		let intersection = (a: Array<any>, b: Array<any>) => {
			let common = []
			a.map(val => {
				if(b.includes(val))
					common.push(val)
			})
			return common
		}
		
		console.log(fromL, toL);
		
		let buildPath = () => {
			if(pathFound)
				return
			let level = path.length
			let points = path[level - 1].points
			let newPoints = []
			points.map(val => {
				this.graphData.lines.map((_val, index) =>{
					if(pathFound)
						return
					if(!checked.includes(index)) {
						if(areNeighbours(index, val)) {
							checked.push(index)
							if(index != toL) {
								newPoints.push(index)
							} else {
								console.log("found")
								newPoints = [index]
								pathFound = true
							}
						}
					}
				})
			})

			path.push({
				level: level,
				points: newPoints
			})
		}
		
		while(!pathFound) {
			buildPath();
			if(path[path.length - 1].points.length == 0)
				break
		}
		
		console.log(path);

		// invert path
		path.reverse()

		let finalPath = [toL]
		
		// trace the way back 
		path.slice(1).map((val, index) => {
			let done = false
			val.points.map(pt => {
				if(!done && areNeighbours(pt, finalPath[finalPath.length - 1])) {
					done = true
					finalPath.push(pt)
				}
			})
		})
		
		finalPath.reverse()
		
		let intersections = [fromI]
		let finalPathPoints = []
		
		// this.graphData.lines(finalPath[0])
		
		//find intersection points
		finalPath.slice(1).map((val, index) => {
			intersections.push(intersection(this.graphData.lines[finalPath[index]],
																			this.graphData.lines[val])[0])
		})
		
		intersections.push(toI)
		
		console.log("final path", finalPath);
		console.log("intersections", intersections);
		
		let getPointsRange = (start: number, end: number, line: number) => {
			start = this.graphData.lines[line].indexOf(start)
			end = this.graphData.lines[line].indexOf(end)
			let reverse = false
			if(end < start) {
				[end, start] = [start, end]
				reverse = true
			}
			return reverse ? this.graphData.lines[line].slice(start, end).reverse() : this.graphData.lines[line].slice(start, end);
		}
		
		intersections.map((val, index) => {
			if(intersections[index + 1] !== undefined)
				getPointsRange(val, intersections[index + 1], finalPath[index]).map(_val => finalPathPoints.push(_val));
		})
		
		finalPathPoints.push(intersections[intersections.length - 1]);
		finalPathPoints.push(toI);
		
		finalPathPoints = finalPathPoints.map(val => {
			return {
				x: this.graphData.points[val][0],
				y: this.graphData.points[val][1]}
		});
		
		console.log("final path", finalPath);
		console.log("intersections", intersections);
		console.log("finalPath", finalPathPoints);

		let resultGraph = new MapGraph()
		resultGraph.setDots(finalPathPoints);
		
		resultGraph.setMaterial({color: "#e77ea0", linewidth: 10, linejoin: "round"})
		
		return resultGraph;
	}
	
	importGraph(data: {
		points: Array<Array<number>>,
		lines: Array<Array<number>>
	}) {
		this.graphData = data
		data.lines.map(line => {
			let _line = new MapGraph()
			let dots = line.map(pointI => {
				return {x: data.points[pointI][0],
								y: data.points[pointI][1]
							 }
			})
			_line.setDots(dots);
			this.lines.push(_line);
		})
	}
	
	exportGraph() {
		let exportedPoints = []
		let exportedLines = []
		this.lines.map((line, lineI) => {
			exportedLines.push([])
			if(line.geometry)
				line.geometry.vertices.map((vertex, vertexI) => {
					// remove duplicates
					let duplicate = false
					for(let _vertex in exportedPoints) {
						let delta = (exportedPoints[_vertex][0] - vertex.x) ** 2 + (exportedPoints[_vertex][1] - vertex.y) ** 2
						console.log("delta", delta);
						if(delta < this.snapRadius) {
							console.log("duplicate");
							duplicate = true
							vertexI = +_vertex
							break
						}
					}
					if(!duplicate)
						vertexI = exportedPoints.push([vertex.x, vertex.y]) - 1
					// establish connections
					exportedLines[lineI].push(vertexI)
				})
		})
		return {
			points: exportedPoints,
			lines: exportedLines
		}
	}
	
	findSnap(x: number, y: number) {
		let snap = undefined
		this.lines.map((line, lineIndex) => line.geometry.vertices.map((point, pointIndex) => {
			if(this.selectedLine == lineIndex && pointIndex == this.followedPoint) {
				return;
			}
			let delta = (point.x - x) ** 2 + (point.y - y) ** 2
			if(delta < this.snapRadius) {
				// this.selectedLine = lineIndex
				// this.selectedPoint = pointIndex
				snap = {
					line: lineIndex,
					point: pointIndex,
					x: point.x,
					y: point.y
				}
			}
		}))
		return snap;
	}
	
	ifSamePoint(x: number, y: number) {
		let point = this.lines[this.selectedLine].geometry.vertices[this.selectedPoint];
		let delta = (point.x - x) ** 2 + (point.y - y) ** 2
		if(delta < this.snapRadius)
			return true;
		
		return false;
	}
	
	// move selected point
	followCursor(x: number, y: number) {
		
		if(this.selectedLine === undefined)
			return
		
		let snap = this.findSnap(x, y)

		if(snap) {
			x = snap.x
			y = snap.y
		}
		
		this.lines[this.selectedLine].geometry.vertices[this.followedPoint].x = x
		this.lines[this.selectedLine].geometry.vertices[this.followedPoint].y = y
		this.lines[this.selectedLine].geometry.verticesNeedUpdate = true
	}
	
	click(x: number, y: number) {
		// if graph is empty
		if(this.lines.length == 0) {
			this.lines.push(new MapGraph())
			this.selectedLine = 0
			this.selectedPoint = 0
			this.followedPoint = 1
			this.lines[this.selectedLine].putPoint({x: x, y: y})
			this.lines[this.selectedLine].putPoint({x: x, y: y})
			return
		}


		
		let noSelection = this.selectedPoint == undefined;
		let isSamePoint
		if(!noSelection) {
			isSamePoint = this.ifSamePoint(x, y)
		}
		let snap = this.findSnap(x, y)
		
		
		if(snap) {
			x = snap.x
			y = snap.y
		}

		
		if(noSelection) {
			// put new node or select point under cursor
			console.log("no selection")
			console.log("snap", snap)
			if(!snap) {
				// put two new points
				let index = this.lines.push(new MapGraph) - 1;
				this.lines[index].putPoint({x: x, y: y});
				this.lines[index].putPoint({x: x, y: y});
				this.selectedLine = index
				this.selectedPoint = 0
				this.followedPoint = 1
				return
			}
			// or select line
			this.selectedLine = snap.line
			this.selectedPoint = snap.point
			this.followedPoint = snap.point
			
			if(this.selectedPoint == this.lines[this.selectedLine].geometry.vertices.length - 1) {
				this.selectedPoint--
			} else if(this.selectedPoint == 0) {
				this.selectedPoint++
			}
			
		} else {
			// put new point in current graph or release selected point
			
			// release point and add new one
			
			if(isSamePoint) {
				// if in the end of line
				
				if(this.followedPoint == 0 || this.followedPoint == this.lines[this.selectedLine].dots.length - 1)
					this.lines[this.selectedLine].deletePoint(this.followedPoint);

				this.selectedLine = undefined
				this.selectedPoint = undefined
				this.followedPoint = undefined

				// delete followed point
				
				
				// if in the middle of the line
				// this.selectedLine = undefined
				// this.selectedPoint = undefined
				return
			}
			
			
			this.lines[this.selectedLine].updatePoint(this.followedPoint, {x: x, y: y});

			
			if(this.followedPoint == this.lines[this.selectedLine].geometry.vertices.length - 1) {
				console.log("end of line");
				this.selectedPoint++;
				this.followedPoint++;
				this.lines[this.selectedLine].putPoint({x: x, y: y})					
			} else if (this.followedPoint == 0) {
				this.lines[this.selectedLine].putPoint({x: x, y: y}, true);
			}
			
			// this.lines[this.selectedLine].putPoint({x: x, y: y});
			// this.followedPoint++
			// this.selectedPoint++
			
		}
	}
}
