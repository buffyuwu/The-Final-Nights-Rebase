import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Scene } from '@babylonjs/core/scene';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { Scalar } from '@babylonjs/core/Maths/math.scalar';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

import '@babylonjs/core/Animations/animatable';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';

import { character } from './character';
import { moveTowards } from './utils';

const POSITION_LERP_SPEED = 12;
const ROTATION_LERP_SPEED = 12;
const ANIMATION_BLEND_SPEED = 4.0;
const MOVING_THRESHOLD = 0.02;

function getRequiredAnimation(groups: AnimationGroup[], name: string): AnimationGroup {
	const group = groups.find((g) => g.name === name);
	if (!group) {
		throw new Error(`'${name}' animation not found on remote character import`);
	}
	return group;
}

export interface RemoteCharacterState {
	x: number;
	y: number;
	z: number;
	rotY: number;
}

export class RemoteCharacter {
	readonly root: TransformNode;
	private readonly walkAnim: AnimationGroup;
	private readonly idleAnim: AnimationGroup;

	private readonly targetPosition: Vector3;
	private targetRotY: number;

	static async CreateAsync(scene: Scene, name: string, initial: RemoteCharacterState): Promise<RemoteCharacter> {
		const result = await SceneLoader.ImportMeshAsync('', '', character, scene);
		return new RemoteCharacter(scene, name, result.meshes[0], result.animationGroups, initial);
	}

	private constructor(scene: Scene, name: string, model: AbstractMesh, animationGroups: AnimationGroup[], initial: RemoteCharacterState) {
		this.root = new TransformNode(`${name}_root`, scene);
		this.root.position.set(initial.x, initial.y, initial.z);
		this.root.rotation.y = initial.rotY;

		model.parent = this.root;
		model.rotate(Vector3.Up(), Math.PI);
		model.position.y = -1;

		this.walkAnim = getRequiredAnimation(animationGroups, 'Walking');
		this.idleAnim = getRequiredAnimation(animationGroups, 'Idle');
		this.walkAnim.weight = 0;
		this.idleAnim.weight = 1;
		this.idleAnim.play(true);

		this.targetPosition = new Vector3(initial.x, initial.y, initial.z);
		this.targetRotY = initial.rotY;
	}

	setTarget(x: number, y: number, z: number, rotY: number): void {
		this.targetPosition.set(x, y, z);
		this.targetRotY = rotY;
	}

	update(deltaSeconds: number): void {
		const distance = Vector3.Distance(this.root.position, this.targetPosition);
		const moving = distance > MOVING_THRESHOLD;

		const posT = Math.min(1, POSITION_LERP_SPEED * deltaSeconds);
		const rotT = Math.min(1, ROTATION_LERP_SPEED * deltaSeconds);
		this.root.position = Vector3.Lerp(this.root.position, this.targetPosition, posT);
		this.root.rotation.y = Scalar.LerpAngle(this.root.rotation.y, this.targetRotY, rotT);

		this.walkAnim.weight = moveTowards(this.walkAnim.weight, moving ? 1 : 0, ANIMATION_BLEND_SPEED * deltaSeconds);
		this.idleAnim.weight = moveTowards(this.idleAnim.weight, moving ? 0 : 1, ANIMATION_BLEND_SPEED * deltaSeconds);

		if (this.walkAnim.weight > 0 && !this.walkAnim.isPlaying) this.walkAnim.play(true);
		if (this.walkAnim.weight === 0 && this.walkAnim.isPlaying) this.walkAnim.pause();
		if (this.idleAnim.weight > 0 && !this.idleAnim.isPlaying) this.idleAnim.play(true);
		if (this.idleAnim.weight === 0 && this.idleAnim.isPlaying) this.idleAnim.pause();
	}

	dispose(): void {
		this.root.dispose();
	}
}
