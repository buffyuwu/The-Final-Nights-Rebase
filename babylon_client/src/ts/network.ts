import { Client, getStateCallbacks, type Room } from 'colyseus.js';

export interface PlayerState {
	x: number;
	y: number;
	z: number;
	rotY: number;
	color: string;
}

const MOVE_SEND_INTERVAL_MS = 50;

export class NetworkClient {
	private room?: Room;
	private lastSendAt = 0;

	onPlayerAdded: (sessionId: string, player: PlayerState) => void = () => {};
	onPlayerChanged: (sessionId: string, player: PlayerState) => void = () => {};
	onPlayerRemoved: (sessionId: string) => void = () => {};
	onChatMessage: (sessionId: string, ckey: string, text: string) => void = () => {};

	get sessionId(): string {
		if (!this.room) {
			throw new Error('NetworkClient.sessionId read before connect() resolved');
		}
		return this.room.sessionId;
	}

	async connect(url: string, ckey: string): Promise<void> {
		const client = new Client(url);
		this.room = await client.joinOrCreate('third_person', { ckey });

		const $ = getStateCallbacks(this.room);
		$(this.room.state).players.onAdd((player: PlayerState, sessionId: string) => {
			this.onPlayerAdded(sessionId, player);
			$(player).onChange(() => this.onPlayerChanged(sessionId, player));
		});
		$(this.room.state).players.onRemove((_player: PlayerState, sessionId: string) => {
			this.onPlayerRemoved(sessionId);
		});
		this.room.onMessage('chat', (message: { sessionId: string; ckey: string; text: string }) => {
			this.onChatMessage(message.sessionId, message.ckey, message.text);
		});
	}

	sendMove(x: number, y: number, z: number, rotY: number): void {
		if (!this.room) {
			return;
		}
		const now = performance.now();
		if (now - this.lastSendAt < MOVE_SEND_INTERVAL_MS) {
			return;
		}
		this.lastSendAt = now;
		this.room.send('move', { x, y, z, rotY });
	}

	sendChat(text: string): void {
		if (!this.room || !text) {
			return;
		}
		this.room.send('chat', { text });
	}

	sendDebug(text: string): void {
		if (!this.room || !text) {
			return;
		}
		this.room.send('debug', { text });
	}
}
