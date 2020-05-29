<template>
	<div class="component">
		<div class="header">
			<div class="main-logo"></div>
			<div class="title">Intermaps</div>
			<div class="subtitle"></div>
			<div style="display: flex">
				<a class="button--round"
					 href="/login">login</a>
				<a class="button--round"
					 href="/register">register</a>
			</div>
		</div>
		<div class="subtitle">interactive indoor maps delivery service</div>
		<div class="main-content">

			<div class="dashed-line"></div>
			<div>
				<div>Create a 3D model</div>
				<div class="step1"></div>
			</div>
			<div>
				<div>Set destination points</div>
				<div class="step2"></div>
			</div>
			<div>
				<div>Share your work</div>
				<div class="step3"></div>
			</div>
		</div>
		<a class="try-now"
			 href="/demo">Try now</a>
		<div class="footer">
			<a style="display: flex"
				 href="https://github.com/junee455/maps">
				<div style="align-self: center">GitHub</div>
				<div class="git-logo"></div>
			</a>
		</div>
		
	</div>
</template>

<script>
 import { Component, Vue } from 'vue-property-decorator';

 @Component({
 })
 export default class MainPage extends Vue {}
</script>

<style lang="scss"
			 scoped>
 @import "@/global.scss";
 
 * {
		 text-align: center;
 }
 
 .button--round {
		 font-size: 32px;
		 padding-left: 20px;
		 padding-right: 20px;
		 
 }
 
 .try-now {
		 cursor: pointer;
		 padding: 20px;
		 padding-left: 40px;
		 padding-right: 40px;
		 margin-left: auto;
		 margin-right: auto;
		 transition: 0.2s;
		 background: #E77EA0;
		 border-radius: 5px;
		 font-size: 42px;
		 width: 215.88px;
		 height: 88px;
		 color: white;
		 box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), inset 0px 0px 40px #CE5C5C;
		 &:hover {
				 box-shadow: none;
		 }
 }
 
 .main-logo {
		 background-image: url('~@/assets/logo.png');
		 background-repeat: no-repeat;
		 background-position: center;
		 background-size: contain;
		 content: "";
		 width: 100px;
		 height: 100px;
		 align-self: center;
 }
 
 .git-logo {
		 background-image: url('~@/assets/git_logo_beige.png');
		 background-repeat: no-repeat;
		 background-position: center;
		 background-size: contain;
		 content: "";
		 width: 68px;
		 height: 68px;
		 align-self: center;
 }
 
 .main-content {
		 color: rgba(#000000, 0.75);
		 margin-top: 3em;
		 margin-bottom: 3em;
		 display: grid;
		 grid-template-columns: 33% 33% 33%;
		 font-size: 40px;
		 justify-content: space-around;
		 .dashed-line {
				 position: absolute;
				 top: calc(50% + 0.2em);
				 background-image: url('~@/assets/dashed_line.svg');
				 background-repeat: no-repeat;
				 background-position: center;
				 background-size: contain;
				 content: "";
				 width: 60%;
				 left: 20%;
				 height: 20px;
		 }
		 .step1 {
				 margin-left: auto;
				 margin-right: auto;
				 background-image: url('~@/assets/landing_step1.png');
				 background-repeat: no-repeat;
				 background-position: center;
				 background-size: contain;
				 content: "";
				 width: 282px;
				 height: 282px;
		 }
		 .step2 {
				 margin-left: auto;
				 margin-right: auto;
				 background-image: url('~@/assets/landing_step2.png');
				 background-repeat: no-repeat;
				 background-position: center;
				 background-size: contain;
				 content: "";
				 width: 282px;
				 height: 282px;
		 }
		 .step3 {
				 margin-left: auto;
				 margin-right: auto;
				 background-image: url('~@/assets/landing_step3.png');
				 background-repeat: no-repeat;
				 background-position: center;
				 background-size: contain;
				 content: "";
				 width: 282px;
				 height: 282px;
		 }
 }
 
 a {
		 text-decoration: none;
		 color: $foreground;
 }
 
 .footer {
		 align-items: baseline;
		 width: 100%;
		 position: fixed;
		 bottom: 0;
		 display: flex;
		 flex-direction: row-reverse;
		 justify-content: space-between;
		 color: $foreground;
		 background-color: $background-main;
		 font-size: 32px;
 }
 
 
 .subtitle {
		 margin-top: 1em;
		 margin-bottom: -1em;
		 color: rgba(#000000, 0.75);
		 /* 				 position: absolute; */
		 margin-right: auto;
		 margin-left: auto;
		 align-self: center;
		 text-align: center;
		 flex-grow: 999;
		 font-size: 32px;
 }
 
 .header {
		 display: flex;
		 justify-content: space-between;
		 background-color: $background-main;
		 font-size: 32px;
		 color: $foreground;

		 .title {
				 font-family: 'Roboto Slab', serif;
				 font-size: 73px;
				 align-self: center;
				 margin-bottom: 0.13em;
				 margin-top: -0.13em;
		 }
		 .button--round {
				 font-size: 32px;
				 padding-left: 20px;
				 padding-right: 20px;
				 height: 40px;
				 align-self: center;
				 margin-right: 20px;
				 
		 }
 }

</style>

