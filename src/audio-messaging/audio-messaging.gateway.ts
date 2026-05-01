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
    origin: '*',
  },
})
export class AudioMessagingGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('text')
  handleTest(
    @MessageBody() message: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.emit('text', message);
  }

  @SubscribeMessage('join-room')
  handleJoin(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    const rooms = [...client.rooms];
    rooms.forEach((r) => {
      if (r !== client.id) {
        client.leave(r);
      }
    });

    client.join(room);
    console.log(`Client ${client.id} switched to room ${room}`);
  }

  @SubscribeMessage('audio')
  handleAudio(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Buffer, // ← type as Buffer
  ) {
    const rooms = Array.from(client.rooms);
    const room = rooms[1];

    if (room) {
      client.to(room).emit('audio', data);
    }
  }

  @SubscribeMessage('audio-end')
  handleAudioEnd(@ConnectedSocket() client: Socket) {
    const rooms = Array.from(client.rooms);
    const room = rooms[1];
    if (room) {
      client.to(room).emit('audio-end');
    }
  }
}
