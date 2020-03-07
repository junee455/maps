<template>
  <div class="map-component">
    <div id="menu"
				 v-if="menuShown">
			<div style="display: flex">
				<div v-for="(floor, index) of theMap.floors"
										class="floor-button"
										:class="(index === focusedFloor) ? 'active': ''"
										@click="focusFloor(index)">{{index + 1}}</div>
			</div>
      <!-- <div class="hide-button" -->
      <!-- @click="menuShown = !menuShown"><<</div> -->
			<div style="display: flex">
				<div class="floor-button"
						 @click="theMap.floorHeight = (theMap.floorHeight == 15) ? 40 : 15">{{ (theMap.floorHeight == 15) ? 'expand' : 'shrink' }}</div>
				<a class="floor-button"
					 id="download-button"
					 @click="downloadLayout()">download layout</a>
			</div>
			<div class="cabinets-container">
				<div v-for="(cabinet, index) of dotsData">
					<div style="display: flex; width: 100%; justify-content: space-between">
						<div @click="toggleDropDown(index)"
								 class="cabinet-button">{{cabinet.number}}</div>
						<div v-if="activeDropDown === index"
								 class="minus-button"
								 @click="deletePoint(index)">−</div>
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
					</div>
				</div>
			</div>

    </div>
    
    <div id="three-canvas">
    </div>
    <div class="show-button"
				 v-if="!menuShown"
				 @click="menuShown = !menuShown">show</div>
		<div v-if="activeDropDown !== undefined"
				 v-bind:style="{bottom: highlitedPoint.y - 6.5 + 'px',
							 left: highlitedPoint.x - 6.5 + 'px'}"
				 class="point-highlight"></div>
  </div>
</template>

<script lang="ts" src="./map.ts">
</script>

<style scoped lang="scss" src="./map.scss"></style>
