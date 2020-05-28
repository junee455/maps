<template>
	<div>
		<button class="round-button"
									 id="add-cabinet"
									 title="add new cabinet"
									 @click="putPoint(focusedFloor)">+</button>
		<div class="block-divider">Floor data</div>
		<div>
			Name <input name="" type="text" :placeholder="'Floor №' + (focusedFloor + 1)"/>
		</div>
		<div>
			Model <input ref="model-upload"
									 style="display: none;"
									 type="file"/>
			<button class="button--round"
							@click="uploadModel()"
							style="margin-left: 40px">Upload</button>
		</div>
		<div class="block-divider">Cabinets & rooms</div>
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
</template>

<script lang="ts"
				src="floorEditor.ts"></script>
