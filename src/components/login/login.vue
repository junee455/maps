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
				<div>E-mail</div>
				<input name="" type="email" v-model="email"/>
			</div>
			<div>
				<div>Password</div>
				<input name="" type="password" v-model="password"/>
			</div>
			<div style="flex-direction: row-reverse; margin-top: 30px;">
				<button class="button--round"
								@click="login()">Login</button>
				<button class="button--underlined"
								@click="rememberPassword()"
								style="font-size: 70%;">forgot password</button>
			</div>
		</div>
	</div>
</template>

<script lang="ts"
							src="./login.ts"></script>

<style lang="scss" scoped>
 @import "@/global.scss";

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
 
 .header {
		 display: flex;
		 color: $foreground;
		 background-color: $background-main;
		 .title {
				 font-family: 'Roboto Slab', serif;
				 font-size: 32px;
				 align-self: center;
		 }
 }
 
 a {
		 color: $foreground;
		 text-decoration: none;
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
 
</style>
