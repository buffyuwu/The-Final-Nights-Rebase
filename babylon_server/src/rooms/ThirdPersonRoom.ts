import { type Client, Room } from 'colyseus';
import { enqueueChat, enqueueDebug } from '../chatQueue';
import { Player } from '../schema/Player';
import { State } from '../schema/State';
import { setPosition, removePosition } from '../positionStore';

const PALETTE = [
	'#e74c3c',
	'#3498db',
	'#2ecc71',
	'#f1c40f',
	'#9b59b6',
	'#1abc9c',
	'#e67e22',
	'#ecf0f1',
];

const SPAWN_RADIUS = 6;
const HEAR_DISTANCE = 15;

interface MoveMessage {
	x: number;
	y: number;
	z: number;
	rotY: number;
}

interface ChatMessage {
	text: string;
}

interface DebugMessage {
	text: string;
}

interface JoinOptions {
	ckey?: string;
}

const MAX_CHAT_LENGTH = 300;

export class ThirdPersonRoom extends Room<State> {
	maxClients = 100;

	private readonly ckeys = new Map<string, string>();

	onCreate() {
		this.setState(new State());

		this.onMessage('move', (client, message: MoveMessage) => {
			const player = this.state.players.get(client.sessionId);
			if (!player) {
				return;
			}
			player.x = message.x;
			player.y = message.y;
			player.z = message.z;
			player.rotY = message.rotY;
			const ckey = this.ckeys.get(client.sessionId);
			if (ckey) {
				setPosition(ckey, message.x, message.y, message.z);
			}
		});

		this.onMessage('debug', (_client, message: DebugMessage) => {
			const text = message.text?.trim().slice(0, MAX_CHAT_LENGTH);
			if (text) {
				enqueueDebug(text);
			}
		});

		this.onMessage('chat', (client, message: ChatMessage) => {
			const text = message.text?.trim().slice(0, MAX_CHAT_LENGTH);
			if (!text) {
				return;
			}
			const sender = this.state.players.get(client.sessionId);
			if (!sender) {
				return;
			}
			const ckey = this.ckeys.get(client.sessionId) ?? '';
			const msg = { sessionId: client.sessionId, ckey, text };
			const distSq = HEAR_DISTANCE * HEAR_DISTANCE;
			for (const target of this.clients) {
				const tp = this.state.players.get(target.sessionId);
				if (!tp) {
					continue;
				}
				const dx = tp.x - sender.x;
				const dy = tp.y - sender.y;
				const dz = tp.z - sender.z;
				if (dx * dx + dy * dy + dz * dz <= distSq) {
					target.send('chat', msg);
				}
			}
			if (ckey) {
				enqueueChat(ckey, text);
			}
		});
	}

	onJoin(client: Client, options: JoinOptions) {
		if (options.ckey) {
			this.ckeys.set(client.sessionId, options.ckey);
		}

		const player = new Player();
		const index = this.state.players.size;
		const angle = (index / PALETTE.length) * Math.PI * 2;
		player.x = Math.cos(angle) * SPAWN_RADIUS;
		player.z = Math.sin(angle) * SPAWN_RADIUS;
		player.color = PALETTE[index % PALETTE.length];
		this.state.players.set(client.sessionId, player);
	}

	onLeave(client: Client) {
		const ckey = this.ckeys.get(client.sessionId);
		if (ckey) {
			removePosition(ckey);
		}
		this.state.players.delete(client.sessionId);
		this.ckeys.delete(client.sessionId);
	}
}
