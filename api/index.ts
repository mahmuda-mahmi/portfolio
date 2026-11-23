import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../backend/dist/app.factory';

let cachedHandler: ((req: IncomingMessage, res: ServerResponse) => void) | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!cachedHandler) {
    cachedHandler = await createApp();
  }
  return cachedHandler(req, res);
}
