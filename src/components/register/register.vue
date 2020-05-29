<template>
	<div>
		<div class="header">
			<a class="main-logo"
				 href="/"></a>
			<a class="title"
				 href="/">Intermaps</a>
		</div>
		<div class="login-content">
			<div>
				<div>Name</div>
				<input name="" type="text" v-model="name"/>
			</div>
				<br/>
			<div>
				<div>E-mail</div>
				<input name="" type="email" v-model="email"/>
			</div>
			<div>
				<div></div>
				<div :style="{color: (emailDisclamer == '_') ? 'transparent' : '#E77EA0', margin: '10px'}">{{emailDisclamer}}</div>
			</div>
			<div>
				<div>Password</div>
				<input name="" type="password" v-model="password"/>
			</div>
			<div>
				<div></div>
				<div :style="{color: passwordColor, margin: '10px'}">{{passwordStrength}}</div>
			</div>
			<div>
				<div>Repeat password</div>
				<input name="" type="password" v-model="passwordRepeat"/>
			</div>
			<div>
				<div></div>
				<div :style="{color: passwordRepeatDisclamerColor, margin: '10px'}">{{passwordRepeatDisclamer}}</div>
			</div>
			<div style="flex-direction: row-reverse; margin-top: 30px;">
				<button class="button--round"
								@click="register()">Register</button>
				<a class="button--round"
					 href="/login">Login</a>
			</div>
		</div>
	</div>
</template>

<script lang="ts"
							src="./register.ts"></script>

<style lang="scss" scoped>
 @import "@/global.scss";

 .header {
		 display: flex;
		 /* 		 justify-content: space-between; */
		 color: $foreground;
		 background-color: $background-main;
		 .title {
				 font-family: 'Roboto Slab', serif;
				 font-size: 32px;
				 align-self: center;
		 }
 }
 
 a {
		 text-decoration: none;
		 color: $foreground;
 }
 
 .main-logo {
		 background-image: url('~@/assets/logo.png');
		 background-repeat: no-repeat;
		 background-position: center;
		 background-size: contain;
		 content: "";
		 width: 50px;
		 height: 50px;
		 align-self: center;
 }

 .login-content {
		 background-color: $background-main;
		 * {
				 font-size: 20px;
				 color: $foreground;

		 }
		 input {
				 width: 50%;
				 font-family: "Courier New", Courier, monospace;
				 background-color: $background-main;
				 margin: 2px;
				 margin-left: 40px;
				 padding: 3px;
				 outline: none;
				 border: none;
				 border-bottom: solid 2px #93a1a1;
				 &:focus {
						 border-bottom: solid 2px $foreground;
				 }
		 }
		 min-width: 500px;
		 width: 50%;
		 margin-left: auto;
		 margin-right: auto;
		 border-radius: 5px;
		 padding-top: 100px;
		 padding-bottom: 100px;
		 margin-top: 10%;
		 &> div {
				 padding-left: 100px;
				 padding-right: 100px;
				 display: flex;
				 justify-content: space-between;
		 }
 }
 
 
</style>
