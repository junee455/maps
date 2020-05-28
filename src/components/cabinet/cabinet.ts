import Vue from 'vue';
import axios from 'axios'

export default Vue.extend({
	name: 'cabinet',

	data() {
		return {
			beingEdited: -1,
			beingRenamed: -1,
			activeDropdown: -1,
			mapsData: <Array<any>>[]
		}
	},
	
	beforeMount() {
		document.title = "cabinet";
		axios.get(this.$host + 'api/maps', {withCredentials: true}).then(res => {
			this.mapsData = res.data
		})
	},
	
	methods: {
		getLink(id) {
		},
		renameMap(index) {
			this.beingRenamed = this.beingEdited = index
			this.$nextTick(() => {
				console.log(this.$refs["input-rename"][0].focus())
			})
		},
		updateMapInfo(map) {
			axios.post(this.$host + 'api/updateMapInfo',
								 {id: map._id,
									name: map.name,
									shared: map.shared}, {withCredentials: true}).then(response => {
										this.beingEdited = -1;
										this.beingRenamed = -1;
									})
		},
		deleteMap(id) {
			axios.post(this.$host + 'api/mapDelete', {id: id}, {withCredentials: true})
				.then(res => {
					axios.get(this.$host + 'api/maps', {withCredentials: true}).then(res => {
						this.mapsData = res.data
					})
					console.log(res.status)
			})
		},
		deleteMapConfirm(id) {
			if(confirm("Are you sure?\nThis is permanent")) {
				this.deleteMap(id)
			}
		},
		toggleDropdown(index) {
			if(index == this.activeDropdown) {
				this.activeDropdown = -1
			} else {
				this.activeDropdown = index
			}
		},
		newMap() {
			console.log("newMap")
			this.$router.push({path: '/map'})
		},
		editMap(id) {
			console.log("editMap:", id)
			this.$router.push({path: '/map',
												 query: {id: id}})
		}
	}
})
 
