import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class AudioMessagingGateway {
  @WebSocketServer()
  server: Server;

  // -------------------------
  // TEXT BROADCAST
  // -------------------------
  @SubscribeMessage('text')
  handleText(@MessageBody() message: string) {
    this.server.emit('text', message);
  }

  // -------------------------
  // JOIN ROOM
  // -------------------------
  @SubscribeMessage('join-room')
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    for (const r of client.rooms) {
      if (r !== client.id) {
        client.leave(r);
      }
    }

    client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
  }

  // -------------------------
  // AUDIO STREAM
  // -------------------------
  @SubscribeMessage('audio')
  handleAudio(@ConnectedSocket() client: Socket, @MessageBody() data: Buffer) {
    const rooms = Array.from(client.rooms);
    const room = rooms[1];

    if (room) {
      client.to(room).emit('audio', data);
    }
  }

  // -------------------------
  // AUDIO END
  // -------------------------
  @SubscribeMessage('audio-end')
  handleAudioEnd(@ConnectedSocket() client: Socket) {
    const rooms = Array.from(client.rooms);
    const room = rooms[1];

    if (room) {
      client.to(room).emit('audio-end');
    }
  }
}
