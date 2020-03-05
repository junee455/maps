<template>
  <div class="map-component">
    <div id="menu"
    v-if="menuShown">
    <div v-for="(floor, index) of theMap.floors"
    class="floor-button"
    :class="(index === focusedFloor) ? 'active': ''"
    @click="focusFloor(index)">{{index + 1}}</div>
      <!-- <div class="floor-button">one</div> -->
      <!-- <div class="floor-button">two</div> -->
      <!-- <div class="floor-button">three</div> -->
      <div class="hide-button"
      <!-- @click="menuShown = !menuShown"><<</div> -->
      <div class="floor-button"
      @click="theMap.floorHeight = (theMap.floorHeight == 15) ? 40 : 15">{{ (theMap.floorHeight == 15) ? 'expand' : 'shrink' }}</div>
    </div>
    
    <div id="three-canvas">
    </div>
    <div class="show-button"
    v-if="!menuShown"
      @click="menuShown = !menuShown">show</div>
  </div>
</template>

<script lang="ts" src="./map.ts">
</script>

<style scoped lang="scss" src="./map.scss"></style>
