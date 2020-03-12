<template>
  <div class="map-component">
    <div id="menu"
				 v-if="menuShown">
			<div style="display: flex">
				<div v-for="(floor, index) of theMap.floors"
					class="floor-button decorator"
					:class="(index === focusedFloor) ? 'active': ''"
					@click="focusFloor(index)">{{index + 1}}</div>
				<div class="round-button"
						 id="new-point"
						 v-if="focusedFloor !== undefined"
						 @click="putPoint(focusedFloor)">+</div>
			</div>
			<div class="cabinets-container"
					 v-if="focusedFloor !== undefined">
				<div v-for="(cabinet, index) of cabinetsData[focusedFloor]">
					<div style="display: flex; width: 100%; justify-content: space-between">
						<div @click="toggleDropDown(index)"
								 class="cabinet-button"
								 :class="activeDropDown === index ? 'active' : ''">{{cabinet.number}}</div>
						
					</div>
					<div v-if="activeDropDown === index">
						<input name=""
									 type="text"
									 v-model="cabinet.number"/>
						<input name=""
									 type="number"
									 v-model="cabinet.pos[0]"/>
						<input name=""
									 type="number"
									 v-model="cabinet.pos[1]"/>
						<div v-if="activeDropDown === index"
								 class="round-button"
								 id="delete-point"
								 @click="deletePoint(index, focusedFloor)">−</div>
					</div>
				</div>

			</div>
			<div @click="bottomMenuShown = !bottomMenuShown"
					 id="toggle-bottom-menu"
					 class="round-button margin-center">
				{{ bottomMenuShown ? '▼' : '▲' }}
			</div>
			<div class="bottom-menu"
					 :class="bottomMenuShown ? 'shown' : 'hidden'">
				<div class="floor-button decorator"
						 @click="theMap.floorHeight = (theMap.floorHeight == 15) ? 40 : 15">{{ (theMap.floorHeight == 15) ? 'expand' : 'shrink' }}</div>
				<div class="floor-button decorator"
						 @click="downloadLayout()">download layout
					<a id="download-button"
						 style="display: none"></a>
				</div>
				<div class="decorator floor-button"
						 @click="switchEditor()">{{ currentEditor == "graph" ? "cabinets" : "graph" }} editor</div>
				<div class="decorator floor-button"
						 @click="findWayEngaged = !findWayEngaged">find way</div>
			</div>
    </div>
    
    <div id="three-canvas">
    </div>
		<div v-if="activeDropDown !== undefined"
				 v-bind:style="{bottom: highlitedPoint.y - 10 + 'px',
							 left: highlitedPoint.x - 10 + 'px'}"
				 class="point-highlight"></div>
  </div>
</template>

<script lang="ts" src="./map.ts">
</script>

<style scoped lang="scss" src="./map.scss"></style>
