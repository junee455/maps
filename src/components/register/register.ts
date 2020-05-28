import Vue from 'vue';
import axios from 'axios'

let validateEmail = (email) => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

let validatePass = (pass) => {
	return !!pass
}


export default Vue.extend({
	name: 'register',

	data() {
		return {
			name: "",
			email: "",
			emailDisclamer: "_",
			password: "",
			passwordRepeat: "",
			passwordStrength: "_",
			passwordColor: "transparent",
			passwordRepeatDisclamer: "_",
			passwordRepeatDisclamerColor: "transparent"
		}
	},
	
	watch: {
		email: {
			handler(newVal: string, oldVal: string) {
				if(!validateEmail(newVal)) {
					this.emailDisclamer = "invalid email address"
					this.emailDisclamerColor = "#E77EA0"
					return
				}
				axios.post(this.$host + 'api/isRegistered', {email: newVal}).then((res) => {
					if(res.status == 200) {
						this.emailDisclamer = "_"
						this.emailDisclamerColor = "transparent"
					} else if (res.status == 204) {
						this.emailDisclamer = "it appears you've already regestered"
						this.emailDisclamerColor = "#E77EA0"
					}
				})
			}
		},
		password: {
			handler(newVal: string, oldVal: string) {
				if(!newVal) {
					this.passwordStrength = "_";
					this.passwordColor = "transparent";
				} else if(newVal.length < 7) {
					this.passwordStrength = "weak";
					this.passwordColor = "#E77EA0";
				} else if(newVal.length < 14) {
					this.passwordStrength = "moderate";
					this.passwordColor = "#00708C";
				} else {
					this.passwordStrength = "strong";
					this.passwordColor = "#008C49";
				}
			}
		},
		passwordRepeat: {
			handler(newVal: string, oldVal: string) {
				if(!newVal) {
					this.passwordRepeatDisclamer = "_"
					this.passwordRepeatDisclamerColor = "transparent"
				} else if (newVal != this.password){
					this.passwordRepeatDisclamer = "wrong"
					this.passwordRepeatDisclamerColor = "#E77EA0"
				} else {
					this.passwordRepeatDisclamer = "✔";
					this.passwordRepeatDisclamerColor = "#008C49"
				}
			}
		}
	},
	
	methods: {
		register() {
			// console.log(this.$cookies.get('secret-key'));
			
			let creds = {
				name: this.name,
				email: this.email,
				password: this.password
			}
			axios.post(this.$host + 'api/register', creds).then((res) => {
				if(res.status == 200) {
					// do some stuff on successfull registration
				}
			})
		},
		rememberPassword() {
		}
	}
})
