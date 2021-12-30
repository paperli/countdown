/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
//import { Actor, Animation, AnimationData, AnimationWrapMode, Vector3 } from '@microsoft/mixed-reality-extension-sdk';
//import { timeStamp } from 'console';
//import { Transform } from 'stream';

/**
 * The main class of this app. All the logic goes here.
 */
export default class HelloWorld {
	private text: MRE.Actor = null;
	private cube: MRE.Actor = null;
	private assets: MRE.AssetContainer;
	private digits: MRE.Prefab[] = new Array(10);
	private colon: MRE.Actor = null;
	private champaign: MRE.Actor = null;
	private yPos = -1;
	private popping = false;
	private dropping = false;
	private testCube: MRE.Actor = null;
	private newyearPrefab: MRE.Prefab;
	private newyear: MRE.Actor;
	private cheerSound: MRE.Sound;
	private countDownString = "NEW YEAR COUNTDOWN";
	private finalLineString = "\\ 2022 /";

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
					contents: this.countDownString,
					anchor: MRE.TextAnchorLocation.MiddleCenter,
					color: { r: 30 / 255, g: 206 / 255, b: 213 / 255 },
					height: 0.3,
					font: MRE.TextFontFamily.Monospace
				}
			}
		});

		this.text.text.contents = this.finalLineString;
		this.text.text.contents = this.countDownString;

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

		this.cheerSound = this.assets.createSound("Cheer", {
			uri: "cheer.mp3"
		});

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

		// prepare new year sign
		this.spawnNewYearSign();

		// load champaign
		/*this.champaign = MRE.Actor.CreateFromGltf(this.assets, {
			uri: "champaign.glb",
			colliderType: "box",
			actor: {
				name: "champaign",
				parentId: this.text.id,
				transform: {
					local: {
						position: {x: 0, y: -1, z: 0}
					}
				}
			}
		});*/

		setInterval(() => {
			const adjustYPos = -0.07;
			// clean countdown models
			this.cleanChildren(this.colon, "digit");

			const now = new Date();
			const currentMinues = now.getMinutes();
			const minues = 59 - currentMinues;
			const tensAtMinues = parseInt((minues/10).toString());
			const unitsAtMinues = parseInt(minues.toString()[minues < 10 ? 0 : 1]);
			MRE.Actor.CreateFromPrefab(this.context, {
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

			MRE.Actor.CreateFromPrefab(this.context, {
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
			const currentSeconds = now.getSeconds();
			const seconds = 59 - currentSeconds;
			const tens = parseInt((seconds/10).toString());
			const units = parseInt(seconds.toString()[seconds < 10 ? 0 : 1]);
			MRE.Actor.CreateFromPrefab(this.context, {
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

			MRE.Actor.CreateFromPrefab(this.context, {
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
			}

			if (minues < 1 && seconds === 0 && !this.dropping) {
				this.dropping = true;
				// play new year animation
				this.newyear.appearance.enabled = true;
				this.playDropEffect(1);

				this.cleanAllAnims(this.colon);
				this.playSmashEffect(1);

				this.text.text.contents = this.finalLineString;

				this.playCheerSound();

				// reset after 15 minues
				const timer = setTimeout(() => {
					this.resetCountdownTimer();
					clearTimeout(timer);
				}, 15 * 60 * 1000);
			}
		}, 500);
	}

	private playCheerSound() {
		this.newyear.startSound(this.cheerSound.id, {
			looping: false
		});
	}

	private resetCountdownTimer() {
		this.dropping = false;
		// reset new year model
		this.resetNewYearSign();

		this.resetTimerSign();

		this.text.text.contents = this.countDownString;

	}

	private spawnNewYearSign() {
		this.newyear = MRE.Actor.CreateFromPrefab(this.context, {
			prefabId: this.newyearPrefab.id,
			actor: {
				name: "newyear",
				parentId: this.text.id,
				transform: {
					local: {
						position: {x: 0, y: 3, z: 0},
						scale: {x: 1, y: 1, z: 1},
						rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI)
					}
				},
				appearance: {
					enabled: false
				}
			}
		});
	}

	private resetNewYearSign() {
		this.newyear.destroy();
		this.spawnNewYearSign();
	}

	private playDropEffect(duration: number) {
		MRE.Animation.AnimateTo(this.context, this.newyear, {
			destination: { transform: { local: { 
				scale: { x: 1, y: 1, z: 1 },
				position: {x: 0, y: -1, z: 0} 
			} } },
			duration: duration,
			easing: MRE.AnimationEaseCurves.EaseOutBack
		});
		/*const dropAnimData = this.assets.createAnimationData(
			"Drop",
			{
				tracks: [{
					target: MRE.ActorPath("target").transform.local.position,
					keyframes: this.generateDropKeyframes(duration),
					easing: MRE.AnimationEaseCurves.EaseOutBack
				}, {
					target: MRE.ActorPath("target").transform.local.scale,
					keyframes: this.generateDropScaleKeyframes(duration),
					easing: MRE.AnimationEaseCurves.EaseOutBack
				}]
			}
		);
		dropAnimData.bind(
			{ target: this.newyear },
			{ isPlaying: true, wrapMode: AnimationWrapMode.Once }
		);*/
	}

	private resetTimerSign() {
		this.colon.appearance.enabled = true;
		this.colon.transform.local.scale = new MRE.Vector3(1, 1, 1);
		this.colon.transform.local.rotation = MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI);

		// start breathing again
		this.cleanAllAnims(this.colon);
		this.playBreathEffect();
		this.popping = false;
	}

	private cleanAllAnims(actor: MRE.Actor) {
		const anims = actor.targetingAnimationsByName;
		anims.forEach(anim => {
			anim.delete();
		});
	}

	private playSmashEffect(duration: number) {
		const smashAnimData = this.assets.createAnimationData(
			"Smash",
			{
				tracks: [{
					target: MRE.ActorPath("target").transform.local.scale,
					keyframes: this.generateSmashingKeyframes(duration),
					easing: MRE.AnimationEaseCurves.Linear
				}]
			}
		);
		smashAnimData.bind(
			{ target: this.colon },
			{ isPlaying: true, wrapMode: MRE.AnimationWrapMode.Once }
		);
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

		promises.push(this.assets.loadGltf("newyear.glb", "box")
						.then(assets => {
							this.newyearPrefab = assets.find(a => a.prefab !== null) as MRE.Prefab;
						})
						.catch(e => MRE.log.error("app", e)));

		/*promises.push(this.assets.loadGltf("champaign.glb", "box")
						.then(assets => {
							this.champaign = MRE.Actor.CreateFromPrefab(this.context, {
								firstPrefabFrom: assets,
								actor: {
									parentId: this.text.id,
									transform: {
										local: {
											position: {x: 0, y: -1, z:0},
											rotation: MRE.Quaternion.RotationAxis(MRE.Vector3.Up(), Math.PI)
										}
									}
								}
							});
							let anims = this.champaign.targetingAnimationsByName;
							Object.keys(anims).map(animName => {
								this.text.text.contents = animName;
							});
						})
						.catch(e => MRE.log.error("app", e)));*/
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

	private generateSmashingKeyframes(duration: number): Array<MRE.Keyframe<MRE.Vector3>> {
		return [{
			time: 0 * duration,
			value: MRE.Vector3.One()
		}, {
			time: 0.1 * duration,
			value: MRE.Vector3.One()
		},
		{
			time: 0.5 * duration,
			value: new MRE.Vector3(1, 0, 1)
		}];
	}

	private generateDropKeyframes(duration: number): Array<MRE.Keyframe<MRE.Vector3>> {
		return [{
			time: 0 * duration,
			value: new MRE.Vector3(0, 3, 0)
		}, {
			time: 1 * duration,
			value: new MRE.Vector3(0, -1, 0)
		}];
	}

	private generateDropScaleKeyframes(duration: number): Array<MRE.Keyframe<MRE.Vector3>> {
		return [{
			time: 0 * duration,
			value: new MRE.Vector3(0, 0, 0)
		}, {
			time: 0.5 * duration,
			value: new MRE.Vector3(1, 1, 1)
		}];
	}

}
