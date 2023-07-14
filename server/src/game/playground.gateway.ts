import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { GameProvider } from './game.provider';

@WebSocketGateway({ namespace: 'playground', cors: {} })
export class PlaygroundGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PlaygroundGateway.name);
  // @WebSocketServer() server: Server;
  // private playground: Namespace;
  @WebSocketServer() playground: Namespace;

  // @WebSocketServer() server: Server;
  constructor(private readonly gameProvider: GameProvider) {}
  afterInit() {
    // this.playground = this.server.of('/playground');
    // ...
  }
  async handleConnection(client: Socket) {
    const sockets = this.playground.sockets;

    this.logger.debug(
      `WS Client with id: ${client.id} connected to playground!`,
    );
    // this.logger.debug(
    //   `Number of connected sockets to playground: ${sockets.size}`,
    // );

    const gameId = client.handshake.headers.game as string;
    const status = client.handshake.headers.status as string;
    console.log('#### gameId, status', gameId, status);
    this.logger.debug(
      `adding client : ${client.id} to room-${gameId} with status ${status}`,
    );
    if (status === 'waiting') {
      this.logger.debug('#### join some one to waiting room');
      await client.join(`waiting-${gameId}`);
    } else {
      this.logger.debug('#### join some one to play room');

      await client.join(`room-${gameId}`);
    }
    // console.log(
    //   'room user counts',
    //   this.playground.adapter.rooms?.get(`room-${gameId}`)?.size,
    // );
    if (this.playground.adapter.rooms?.get(`room-${gameId}`)?.size > 2) {
      client.disconnect(true);
    }

    this.logger.debug(
      `Number of connected sockets in playground: ${sockets.size}`,
    );

    if (status !== 'waiting') {
      this.logger.debug('before emiting to waiting room');
      client.to(`waiting-${gameId}`).emit('someOneJoined');

      const gameData = await this.gameProvider.getGameData(gameId);
      this.logger.debug('#### getting Game Data', gameData);

      client.emit('gameData', gameData);

      const gameMoves = await this.gameProvider.getGameMoves(gameId);
      this.logger.debug('#### getting game moves', gameMoves);
      client.emit('gameMoves', gameMoves);
    }
  }

  async handleDisconnect(client: Socket) {
    const sockets = this.playground.sockets;
    // const roomName = client.pollID;
    // const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;

    this.logger.log(`Disconnected socket id: ${client.id}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    // this.logger.debug(
    //   `Total clients connected to room '${roomName}': ${clientCount}`,
    // );

    // updatedPoll could be undefined if the the poll already started
    // in this case, the socket is disconnect, but no the poll state
    // if (updatedPoll) {
    //   this.io.to(pollID).emit('poll_updated', updatedPoll);
    // }
  }

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }

  // @SubscribeMessage('joinGame')
  // async addUserGame(
  //   @MessageBody('gameId') gameId: string,
  //   @ConnectedSocket() client: Socket,
  // ): Promise<void> {
  //   this.logger.log(
  //     `adding client : ${client.id} to room-${gameId} playground`,
  //   );
  //   const sockets = this.playground.sockets;
  //   if (sockets.size > 2) {
  //     await client.disconnect();
  //   }

  //   this.logger.debug(
  //     `Number of connected sockets in playground: ${sockets.size}`,
  //   );

  //   await client.join(`room-${gameId}`);

  //   console.log('#### before sending data to waiting user');
  //   await client.to(`room-${gameId}`).emit('someOneJoined');
  //   // await this.playground.to(`room-${gameId}`).emit('someOneJoined');
  //   // const updatedPoll = await this.pollsService.removeNomination(
  //   //   client.pollID,
  //   //   nominationID,
  //   // );
  //   // this.io.to(client.pollID).emit('poll_updated', updatedPoll);
  // }
}
