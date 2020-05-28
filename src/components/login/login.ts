import Vue from 'vue';
import axios from 'axios'

export default Vue.extend({
	name: 'login',

	data() {
		return {
			email: "",
			password: ""
		}
	},
	
	methods: {
		login() {
			// console.log(this.$cookies.get('secret-key'));
			axios.post(this.$host + 'api/login', this.$data).then((res) => {
				this.$cookies.set('secret-key', res.data)
				let query = this.$route.query.path
				if(!!query) {
					this.$router.push(query)
					this.$router.forward()
				} else {
					this.$router.push('/cabinet')
				}

			})
		},
		rememberPassword() {
		}
	}
})
