/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { Actor, Vector3 } from '@microsoft/mixed-reality-extension-sdk';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;
	private digits: MRE.Prefab[] = new Array(10);
	private colon: MRE.Actor = null;
	private yPos = -1;
	private popping = false;

	constructor(private context: MRE.Context) {
		this.context.onStarted(() => this.started());
	}

	/**
	 * Once the context is "started", initialize the app.
	 */
	private async started() {
		// set up somewhere to store loaded assets (meshes, textures, animations, gltfs, etc.)
		this.assets = new MRE.AssetContainer(this.context);

		// Create a new actor with no mesh, but some text.
		this.text = MRE.Actor.Create(this.context, {
			actor: {
				name: 'Text',
				transform: {
					app: { position: { x: 0, y: 0.5, z: 0 } }
				},
				text: {
					contents: "\\ 2022 /",
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3,
					font: MRE.TextFontFamily.Monospace
				}
			}
		});

		//this.text.text.contents = new Date().getSeconds().toString();

		// Here we create an animation for our text actor. First we create animation data, which can be used on any
		// actor. We'll reference that actor with the placeholder "text".
		/*const spinAnimData = this.assets.createAnimationData(
			// The name is a unique identifier for this data. You can use it to find the data in the asset container,
			// but it's merely descriptive in this sample.
			"Spin",
			{
				// Animation data is defined by a list of animation "tracks": a particular property you want to change,
				// and the values you want to change it to.
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("text").transform.local.rotation,
					// And the rotation will be set to spin over 20 seconds
					keyframes: this.generateSpinKeyframes(20, MRE.Vector3.Up()),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			});
		// Once the animation data is created, we can create a real animation from it.
		spinAnimData.bind(
			// We assign our text actor to the actor placeholder "text"
			{ text: this.text },
			// And set it to play immediately, and bounce back and forth from start to end
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.PingPong });*/

		// Load a glTF model before we use it
		//const cubeData = await this.assets.loadGltf('digits.glb', "box");

		// spawn a copy of the glTF model
		/*this.cube = MRE.Actor.CreateFromPrefab(this.context, {
			// using the data we loaded earlier
			firstPrefabFrom: cubeData,
			// Also apply the following generic actor properties.
			actor: {
				name: 'Digits',
				// Parent the glTF model to the text actor, so the transform is relative to the text
				parentId: this.text.id,
				transform: {
					local: {
						position: { x: 0, y: -1, z: 0 },
						scale: { x: 1, y: 1, z: 1 }
					}
				}
			}
		});

		// Create some animations on the cube.
		const flipAnimData = this.assets.createAnimationData(
			// the animation name
			"DoAFlip",
			{ tracks: [{
				// applies to the rotation of an unknown actor we'll refer to as "target"
				target: MRE.ActorPath("target").transform.local.rotation,
				// do a spin around the X axis over the course of one second
				keyframes: this.generateSpinKeyframes(1.0, MRE.Vector3.Right()),
				// and do it smoothly
				easing: MRE.AnimationEaseCurves.Linear
			}]}
		);
		// apply the animation to our cube
		const flipAnim = await flipAnimData.bind({ target: this.cube });

		// Set up cursor interaction. We add the input behavior ButtonBehavior to the cube.
		// Button behaviors have two pairs of events: hover start/stop, and click start/stop.
		const buttonBehavior = this.cube.setBehavior(MRE.ButtonBehavior);

		// Trigger the grow/shrink animations on hover.
		buttonBehavior.onHover('enter', () => {
			// use the convenience function "AnimateTo" instead of creating the animation data in advance
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.5, y: 0.5, z: 0.5 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});
		buttonBehavior.onHover('exit', () => {
			MRE.Animation.AnimateTo(this.context, this.cube, {
				destination: { transform: { local: { scale: { x: 0.4, y: 0.4, z: 0.4 } } } },
				duration: 0.3,
				easing: MRE.AnimationEaseCurves.EaseOutSine
			});
		});

		// When clicked, do a 360 sideways.
		buttonBehavior.onClick(_ => {
			flipAnim.play();
		});*/

		await this.preloadModels();

		// create colon actor
		this.colon = MRE.Actor.CreateFromGltf(this.assets, {
			uri: "colon.glb", 
			colliderType: "box",
			actor: {
				name: "colon",
				parentId: this.text.id,
				transform: {
					local: {
						position: {x: 0, y: -1, z: 0},
						rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI)
					}
				}
			}
		});

		this.playBreathEffect();

		setInterval(() => {
			let adjustYPos = -0.07;
			// clean countdown models
			this.cleanChildren(this.colon, "digit");

			let now = new Date();
			let currentMinues = now.getMinutes();
			let minues = 59 - currentMinues;
			let tensAtMinues = parseInt((minues/10).toString());
			let unitsAtMinues = parseInt(minues.toString()[minues < 10 ? 0 : 1]);
			let tensAtMinuesModel = MRE.Actor.CreateFromPrefab(this.context, {
				prefab: this.digits[tensAtMinues],
				actor: {
					tag: "digit",
					parentId: this.colon.id,
					transform: {
						local: {
							position: {x: 0.5 * 2, y: adjustYPos, z: 0}
						}
					}
				}
			});

			let unitsAtMinuesModel = MRE.Actor.CreateFromPrefab(this.context, {
				prefab: this.digits[unitsAtMinues],
				actor: {
					tag: "digit",
					parentId: this.colon.id,
					transform: {
						local: {
							position: {x: 0.5, y: adjustYPos, z: 0}
						}
					}
				}
			});
			
			//text.text.contents = (60 - new Date().getSeconds()).toString();
			let currentSeconds = now.getSeconds();
			let seconds = 59 - currentSeconds;
			let tens = parseInt((seconds/10).toString());
			let units = parseInt(seconds.toString()[seconds < 10 ? 0 : 1]);
			let tensModel = MRE.Actor.CreateFromPrefab(this.context, {
				prefab: this.digits[tens],
				actor: {
					tag: "digit",
					parentId: this.colon.id,
					transform: {
						local: {
							position: {x: -0.5, y: adjustYPos, z: 0}
						}
					}
				}
			});

			let unitsModel = MRE.Actor.CreateFromPrefab(this.context, {
				prefab: this.digits[units],
				actor: {
					tag: "digit",
					parentId: this.colon.id,
					transform: {
						local: {
							position: {x: -0.5 * 2, y: adjustYPos, z: 0}
						}
					}
				}
			});

			if (minues < 1 && seconds < 30) {
				if (!this.popping) {
					// assign popping animation to timer
					this.cleanAllAnims(this.colon);
					this.playPoppingEffect();
					this.popping = true;
				}
			} else {
				if (this.popping) {
					this.cleanAllAnims(this.colon);
					this.playBreathEffect();
					this.popping = false;
				}
			}
		}, 200);
	}

	private cleanAllAnims(actor: MRE.Actor) {
		let anims = actor.targetingAnimationsByName;
		anims.forEach(anim => {
			anim.delete();
		});
	}

	private playPoppingEffect() {
		const poppingAnimData = this.assets.createAnimationData(
			"Popping",
			{
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("target").transform.local.scale,
					// And the rotation will be set to spin over 20 seconds
					keyframes: this.generatePopKeyframes(1),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			}
		);
		poppingAnimData.bind(
			{ target: this.colon },
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop }
		);
	}

	private playBreathEffect() {
		// breath effect
		const breathAnimData = this.assets.createAnimationData(
			// The name is a unique identifier for this data. You can use it to find the data in the asset container,
			// but it's merely descriptive in this sample.
			"Breath",
			{
				// Animation data is defined by a list of animation "tracks": a particular property you want to change,
				// and the values you want to change it to.
				tracks: [{
					// This animation targets the rotation of an actor named "text"
					target: MRE.ActorPath("target").transform.local.scale,
					// And the rotation will be set to spin over 20 seconds
					keyframes: this.generateBreathKeyframes(8),
					// And it will move smoothly from one frame to the next
					easing: MRE.AnimationEaseCurves.Linear
				}]
			}
		);
		
		breathAnimData.bind(
			{ target: this.colon},
			{isPlaying: true, wrapMode: MRE.AnimationWrapMode.Loop}
		);
	}

	private cleanChildren(actor: MRE.Actor, withTag: string) {
		actor.children.forEach(child => {
			if (child.tag === withTag) {
				child.destroy();
			}
		});
	}

	private preloadModels() {
		const promises = [];
		for (let i = 0; i < 10; i++) {
			promises.push(this.assets.loadGltf("digit" + i + ".glb", "box")
							.then(assets => {
								this.digits[i] = assets.find(a => a.prefab !== null) as MRE.Prefab;
							})
							.catch(e => MRE.log.error("app", e)));
		}

		return Promise.all(promises);
	}

	/**
	 * Generate keyframe data for a simple spin animation.
	 * @param duration The length of time in seconds it takes to complete a full revolution.
	 * @param axis The axis of rotation in local space.
	 */
	private generateSpinKeyframes(duration: number, axis: MRE.Vector3): Array<MRE.Keyframe<MRE.Quaternion>> {
		return [{
			time: 0 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 0)
		}, {
			time: 0.25 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI / 2)
		}, {
			time: 0.5 * duration,
			value: MRE.Quaternion.RotationAxis(axis, Math.PI)
		}, {
			time: 0.75 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 3 * Math.PI / 2)
		}, {
			time: 1 * duration,
			value: MRE.Quaternion.RotationAxis(axis, 2 * Math.PI)
		}];
	}

	private generateBreathKeyframes(duration: number): Array<MRE.Keyframe<MRE.Vector3>> {
		return [{
			time: 0 * duration,
			value: MRE.Vector3.One()
		}, {
			time: 0.4 * duration,
			value: new MRE.Vector3(1.05, 1.05, 1)
		},
		{
			time: 1 * duration,
			value: MRE.Vector3.One()
		}];
	}

	private generatePopKeyframes(duration: number): Array<MRE.Keyframe<MRE.Vector3>> {
		return [{
			time: 0 * duration,
			value: MRE.Vector3.One()
		}, {
			time: 0.1 * duration,
			value: new MRE.Vector3(1.1, 1.1, 1)
		},
		{
			time: 1 * duration,
			value: MRE.Vector3.One()
		}];
	}
}
