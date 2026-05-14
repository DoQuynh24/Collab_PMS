import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface CallInvitePayload {
  roomId: number;
  channelName: string;
  projectId: string;
  projectName: string;
  hostId: number;
  hostName: string;
  hostPicture?: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/video',
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoGateway.name);

  private userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) {
      client.disconnect();
      return;
    }
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    this.logger.log(`User ${userId} connected (socket: ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) return;
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.userSockets.delete(userId);
    }
    this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(data.userId);
    if (!userId) return;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    (client as any).userId = userId;
    this.logger.log(`Registered user ${userId} → socket ${client.id}`);
  }

  sendCallInvite(userIds: number[], payload: CallInvitePayload) {
    for (const uid of userIds) {
      const sockets = this.userSockets.get(uid);
      if (!sockets) continue;
      for (const socketId of sockets) {
        this.server.to(socketId).emit('call:incoming', payload);
      }
    }
  }

  sendCallEnded(userIds: number[], channelName: string) {
    for (const uid of userIds) {
      const sockets = this.userSockets.get(uid);
      if (!sockets) continue;
      for (const socketId of sockets) {
        this.server.to(socketId).emit('call:ended', { channelName });
      }
    }
  }

  private extractUserId(client: Socket): number | null {
    const uid = (client as any).userId ?? client.handshake.query?.userId;
    return uid ? Number(uid) : null;
  }
}
