import {
	Color3,
	DirectionalLight,
	Engine,
	HavokPlugin,
	HemisphericLight,
	MeshBuilder,
	PBRMetallicRoughnessMaterial,
	PhysicsAggregate,
	PhysicsShapeType,
	ReflectionProbe,
	Scene,
	ShadowGenerator,
	Vector3,
} from '@babylonjs/core';
import HavokPhysics from '@babylonjs/havok';

import '../styles/index.scss';
import { ChatBubbles, initChatInput, appendChatLog } from './chat';
import { CharacterController } from './character';
import { RemoteCharacter } from './remoteCharacter';
import { NetworkClient } from './network';
import { SkyMaterial } from '@babylonjs/materials';

declare global {
	interface Window {
		__BABYLON_SERVER_URL__?: string;
		__BABYLON_PLAYER_CKEY__?: string;
	}
}

const canvas = document.getElementById('renderer') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = new Engine(canvas);
engine.displayLoadingUI();

const havokInstance = await HavokPhysics();
const havokPlugin = new HavokPlugin(true, havokInstance);

const scene = new Scene(engine);
scene.enablePhysics(new Vector3(0, -9.81, 0), havokPlugin);

const sun = new DirectionalLight('light', new Vector3(-5, -10, 5).normalize(), scene);
sun.position = sun.direction.negate().scaleInPlace(40);

const shadowGenerator = new ShadowGenerator(1024, sun);
shadowGenerator.useExponentialShadowMap = true;

const hemiLight = new HemisphericLight('hemi', Vector3.Up(), scene);
hemiLight.intensity = 0.4;

const skyMaterial = new SkyMaterial('skyMaterial', scene);
skyMaterial.backFaceCulling = false;
skyMaterial.useSunPosition = true;
skyMaterial.sunPosition = sun.direction.negate();

const skybox = MeshBuilder.CreateBox('skyBox', { size: 100.0 }, scene);
skybox.material = skyMaterial;

const rp = new ReflectionProbe('ref', 512, scene);
rp.renderList?.push(skybox);
scene.environmentTexture = rp.cubeTexture;

const groundMaterial = new PBRMetallicRoughnessMaterial('groundMat', scene);
const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 });
ground.material = groundMaterial;
ground.receiveShadows = true;
new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

const characterController = await CharacterController.CreateAsync(scene);
characterController.getTransform().position.y = 3;
shadowGenerator.addShadowCaster(characterController.model);

for (let i = 0; i < 4; i++) {
	const boxMaterial = new PBRMetallicRoughnessMaterial('boxMaterial', scene);
	boxMaterial.baseColor = Color3.Random();

	const box = MeshBuilder.CreateBox('Box', { size: 1 }, scene);
	box.material = boxMaterial;
	shadowGenerator.addShadowCaster(box);
	box.position.copyFromFloats((Math.random() - 0.5) * 6, 4 + Math.random() * 2, 5 + Math.random() * 2);

	const boxAggregate = new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 10 }, scene);
	boxAggregate.body.applyAngularImpulse(new Vector3(Math.random(), Math.random(), Math.random()));
}

const remotePlayers = new Map<string, RemoteCharacter>();
const network = new NetworkClient();

network.onPlayerAdded = (sessionId, player) => {
	if (sessionId === network.sessionId) {
		return;
	}
	RemoteCharacter.CreateAsync(scene, sessionId, player).then((remote) => {
		remotePlayers.set(sessionId, remote);
	}).catch((err) => {
		console.error('RemoteCharacter.CreateAsync failed:', err);
	});
};

network.onPlayerChanged = (sessionId, player) => {
	remotePlayers.get(sessionId)?.setTarget(player.x, player.y, player.z, player.rotY);
};

network.onPlayerRemoved = (sessionId) => {
	remotePlayers.get(sessionId)?.dispose();
	remotePlayers.delete(sessionId);
};

const chatBubbles = new ChatBubbles(scene);

network.onChatMessage = (sessionId, ckey, text) => {
	const anchor = sessionId === network.sessionId ? characterController.getTransform() : remotePlayers.get(sessionId)?.root;
	if (anchor) {
		chatBubbles.show(anchor, text);
	}
	appendChatLog(ckey || sessionId, text);
};

initChatInput((text) => network.sendChat(text));

const serverUrl = window.__BABYLON_SERVER_URL__ ?? 'ws://localhost:2567';
const playerCkey = window.__BABYLON_PLAYER_CKEY__ ?? 'standalone';
network.connect(serverUrl, playerCkey).catch((error) => {
	console.error('Failed to connect to babylon_server:', error);
});

function updateScene() {
	const deltaSeconds = engine.getDeltaTime() / 1000;
	characterController.update(deltaSeconds);

	const transform = characterController.getTransform();
	const rotY = transform.rotationQuaternion?.toEulerAngles().y ?? 0;
	network.sendMove(transform.position.x, transform.position.y, transform.position.z, rotY);

	for (const remote of remotePlayers.values()) {
		remote.update(deltaSeconds);
	}
}

scene.executeWhenReady(() => {
	engine.loadingScreen.hideLoadingUI();
	scene.onBeforeRenderObservable.add(() => updateScene());
	engine.runRenderLoop(() => scene.render());
});

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	engine.resize();
});
