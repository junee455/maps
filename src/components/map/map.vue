<template>
  <div class="map-component">
    <div id="menu"
				 v-if="menuShown">
			<div class="floor-list">
				<div v-for="(floor, index) of cabinetsData">
					<button class="floor-button"
												 :class="(index === focusedFloor) ? 'active': ''"
												 @click="focusFloor(index)">{{index + 1}}</button>
					<!-- <input name="" type="text" value="" :placeholder="'Floor №' + (index + 1)"/> -->
				</div>
				
				<button class="round-button"
								style="margin: 5px; margin-left: auto;"
								@click="addNewFloor()"
								title="add new floor">+</button>
			</div>
			<div style="padding: 10px;"
					 v-if="focusedFloor >= 0">
				<button class="round-button"
											 id="add-cabinet"
											 title="add new cabinet"
											 v-if="focusedFloor >= 0"
											 @click="putPoint(focusedFloor)">+</button>
				<!-- <div class="block-divider">Floor data</div> -->
				<div>
					Model <input ref="model-upload"
											 style="display: none;"
											 @change="uploadFileHandler"
											 type="file"/>
					<button class="button--round"
									@click="uploadModel()"
									style="margin-left: 40px">Upload</button>
					
				</div>
				<div>Move floor
					<button class="button--round"
									@click="moveFloorUp(focusedFloor)">up</button>
					<button class="button--round"
									@click="moveFloorDown(focusedFloor)">down</button>
				</div>
				<button class="button--round"
											 @click="deleteFloor(focusedFloor)">Delete floor</button>
				<div class="block-divider">Cabinets & rooms</div>
			</div>
			<div class="floor-data"
					 v-if="focusedFloor >= 0">
				
				<div v-for="(cabinet, index) of cabinetsData[focusedFloor]">
					<div style="display: flex; width: 100%; justify-content: space-between">
						<div @click="toggleDropDown(index)"
								 class="dropdown-button"
								 :class="activeDropDown === index ? 'active' : ''">{{cabinet.number}}</div>
						
					</div>
					<div v-if="activeDropDown === index">
						<input name=""
									 type="text"
									 v-model="cabinet.number"/>
						<input name=""
									 type="number"
									 step="0.001"
									 v-model="cabinet.pos[0]"/>
						<input name=""
									 type="number"
									 step="0.001"
									 v-model="cabinet.pos[1]"/>
						<div v-if="activeDropDown === index"
								 class="round-button"
								 title="remove cabinet"
								 id="delete-point"
								 @click="deletePoint(index, focusedFloor)">−</div>
					</div>
				</div>
			</div>
			
			<button @click="bottomMenuShown = !bottomMenuShown"
											id="toggle-bottom-menu"
											class="round-button margin-center">
				{{ bottomMenuShown ? '▼' : '▲' }}
			</button>
			<div class="bottom-menu"
					 :class="bottomMenuShown ? 'shown' : 'hidden'">
				
				<button class="floor-button decorator"
								v-if="!!theMap"
								@click="theMap.floorHeight = (theMap.floorHeight == 15) ? 40 : 15">{{ (theMap.floorHeight == 15) ? 'expand map' : 'shrink map' }}</button>
				<button class="decorator floor-button"
								@click="switchEditor()">{{ currentEditor == "graph" ? "cabinets" : "graph" }} editor</button>
				<button class="decorator floor-button"
								@click="findWayEngaged = !findWayEngaged">find way</button>
				<button class="decorator floor-button"
								@click="toggleBadges()">toggle badges</button>
				<button class="floor-button decorator"
								@click="saveLayout()">save layout
				</button>
				<button class="decorator floor-button"
								@click="quit()">quit</button>
			</div>
    </div>
    <div id="three-canvas">
    </div>
		
		<div v-if="displayBadges && currentEditor == 'cabinets' && cabinets">
			<div v-for="point of cabinetsProjections"
					 :style="{bottom: point.y + 10 + 'px',
									left: point.x - 10 + 'px'}"
					 @click="badgeClick(point)"
					 class="cabinet-badge"
					 :class="[point.index == activeDropDown ? 'active' : '']">{{(point.name.split('_')[0] == 'ladder') ?
																																		"" : point.name}}</div>
		</div>
		<div v-if="activeDropDown >= 0"
				 v-bind:style="{bottom: highlitedPoint.y - 7 + 'px',
							 left: highlitedPoint.x - 7 + 'px'}"
				 class="point-highlight"></div>
		<div class="search-bar">
			<input v-model="fromCabinet"/>
			<span style="color: black;
									 margin-bottom: 0.1em;
									 margin-top: -0.1em;
									 font-size: 2em">→</span>
			<input v-model="toCabinet"/>
			<button class="button--round"
							@click="findWayButton()">GO</button>
		</div>
  </div>
</template>

<script lang="ts" src="./map.ts">
</script>

<style scoped lang="scss" src="./map.scss"></style>
