<template>
	<div>
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

<style>
 a {
		 text-decoration: none;
 }
</style>
