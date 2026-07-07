import { WebSocketTransport } from '@colyseus/ws-transport';
import { Server } from 'colyseus';
import { drainChat, drainDebug } from './chatQueue';
import { getPositions } from './positionStore';
import { ThirdPersonRoom } from './rooms/ThirdPersonRoom';

const PORT = Number(process.env.PORT ?? 2567);
const INTERNAL_PORT = Number(process.env.INTERNAL_PORT ?? 2568);

const server = new Server({
	transport: new WebSocketTransport(),
});

server.define('third_person', ThirdPersonRoom);

server.listen(PORT).then(() => {
	console.log(`babylon_server listening on ws://localhost:${PORT}`);
});

Bun.serve({
	hostname: '127.0.0.1',
	port: INTERNAL_PORT,
	fetch(req) {
		const url = new URL(req.url);
		if (url.pathname === '/pending-chat') {
			return Response.json(drainChat());
		}
		if (url.pathname === '/pending-debug') {
			return Response.json(drainDebug());
		}
		if (url.pathname === '/player-positions') {
			return Response.json(getPositions());
		}
		return new Response('Not found', { status: 404 });
	},
});
console.log(`babylon_server internal chat queue on http://127.0.0.1:${INTERNAL_PORT}`);
