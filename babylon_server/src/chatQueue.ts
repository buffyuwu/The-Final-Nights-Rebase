export interface QueuedChatMessage {
	ckey: string;
	message: string;
}

const MAX_MESSAGE_LENGTH = 300;

const pending: QueuedChatMessage[] = [];

export function enqueueChat(ckey: string, message: string): void {
	pending.push({ ckey, message: message.slice(0, MAX_MESSAGE_LENGTH) });
}

export function drainChat(): QueuedChatMessage[] {
	return pending.splice(0, pending.length);
}
