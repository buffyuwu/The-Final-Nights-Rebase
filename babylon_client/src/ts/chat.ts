import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import type { Scene } from '@babylonjs/core/scene';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';

const BUBBLE_DURATION_MS = 5000;
const HEAD_HEIGHT = 2.2;

export function initChatInput(onSend: (text: string) => void): void {
	const bar = document.getElementById('chatBar') as HTMLDivElement;
	const input = document.getElementById('chatInput') as HTMLInputElement;

	const open = () => {
		bar.style.display = 'block';
		input.value = '';
		input.focus();
	};

	const close = () => {
		bar.style.display = 'none';
		input.blur();
	};

	window.addEventListener('keydown', (event) => {
		if (document.activeElement === input) {
			if (event.key === 'Enter') {
				const text = input.value.trim();
				if (text) {
					onSend(text);
				}
				close();
			} else if (event.key === 'Escape') {
				close();
			}
			return;
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			open();
		}
	});
}

export class ChatBubbles {
	private readonly ui: AdvancedDynamicTexture;

	constructor(scene: Scene) {
		this.ui = AdvancedDynamicTexture.CreateFullscreenUI('chatBubbles', true, scene);
	}

	show(anchor: TransformNode, text: string): void {
		const headPoint = new TransformNode('chat_bubble_anchor', anchor.getScene());
		headPoint.parent = anchor;
		headPoint.position.set(0, HEAD_HEIGHT, 0);

		const label = new TextBlock();
		label.text = text;
		label.color = 'white';
		label.fontSize = 16;
		label.outlineWidth = 4;
		label.outlineColor = 'black';
		label.resizeToFit = true;

		this.ui.addControl(label);
		label.linkWithMesh(headPoint);

		setTimeout(() => {
			this.ui.removeControl(label);
			headPoint.dispose();
		}, BUBBLE_DURATION_MS);
	}
}
