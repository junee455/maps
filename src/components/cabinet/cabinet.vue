<template>
	<div>
		<div v-if="mapsData.length">
			<div v-for="(map, index) of mapsData"
					 class="map-info dropdown-button"
					 @click.stop="toggleDropdown(index)">
				<div v-if="index != beingRenamed"
						 style="display: inline">{{map.name}}</div>
				<input v-if="index == beingRenamed"
							 @click.stop
							 ref="input-rename"
							 v-model="map.name"/>
				
				<div v-if="index == activeDropdown">
					<button class="button--round"
												 @click.stop="editMap(map._id)">edit</button>
					<button class="button--round"
												 @click.stop="renameMap(index)">rename</button>
					<button class="button--round"
												 @click.stop="getLink(map._id)">get link</button>
					<button class="button--round"
												 @click.stop="deleteMapConfirm(map._id)">delete</button>
					sharable <input type="checkbox"
													@click.stop="beingEdited = index"
													v-model="map.shared"/>
					<button class="button--round"
												 @click.stop="updateMapInfo(map)"
												 v-if="index == beingEdited">Done</button>
				</div>
			</div>
		</div>
		<div v-else>
			No maps yet
		</div>
		<button class="button--round"
						@click="newMap()">Create map</button>
	</div>
</template>

<script lang="ts" src="./cabinet.ts"></script>

<style lang="scss">
 @import "@/global.scss";
 .map-info {
		 color: rgba(black, 0.8);
		 margin: 5px;
		 padding: 5px;
		 border-radius: 5px;
		 box-shadow: 0 0 5px rgba($background-main, 0.8);
 }
 button {
		 color: $foreground;
 }
 .button--round {
		 margin: 5px;
 }
 .confirmationPopup {
		 &.displayed {
				 
		 }
 }
 input {
		 font-family: "Courier New", Courier, monospace;
		 border-bottom: solid 2px rgba($background-main, 0.5);
		 outline: none;
		 &:focus {
				 border-bottom: solid 2px $background-main;
		 }
 }
 .dropdown-button {
		 display: block;
		 width: 80%;
		 user-select: none;
		 padding: 5px;
		 // border-radius: 5px;
		 outline: none;
		 &:hover, &:focus {
				 &:before {
						 color: inherit;
				 }
		 }
		 &:before {
				 color: transparent;
				 content: "▼";
				 
		 }
		 &.active{
				 &:before {
						 color: inherit;
						 content: "▲";
				 }
		 }
 }
</style>
