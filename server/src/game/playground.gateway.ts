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
import { Game } from './game.schema';
import { UserMoveDto } from './dto/usermove.dto';
import { JoinDataDto } from './dto/joindata.dto';

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
  }

  @SubscribeMessage('join')
  async joinARoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId, status }: JoinDataDto,
  ) {
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
      console.log('#### before disconnecting user');
      client.disconnect(true);
    }

    this.logger.debug(
      `Number of connected sockets in playground room: ${
        this.playground.adapter.rooms?.get(`room-${gameId}`)?.size
      }`,
    );

    this.logger.debug(
      `number of user connected to waiting room ${
        this.playground.adapter.rooms?.get(`waiting-${gameId}`)?.size
      }`,
    );
    if (status !== 'waiting') {
      client.to(`waiting-${gameId}`).emit('someOneJoined');

      const gameData = await this.gameProvider.getGameData(gameId);
      this.logger.debug('#### getting Game Data', gameData);

      client.emit('gameData', gameData);

      const gameMoves = await this.gameProvider.getGameMoves(gameId);
      this.logger.debug('#### getting game moves', gameMoves);
      client.emit('gameMoves', gameMoves);

      const gameTurn = await this.gameProvider.getGameTurn(gameId);
      this.logger.debug('##### getting game turn', gameTurn);
      client.emit('gameTurn', gameTurn);
    }
  }

  @SubscribeMessage('userMove')
  async handleUserMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UserMoveDto,
  ): Promise<void> {
    const { changes, status, game } = await this.gameProvider.userMove(data);

    this.playground.to(`room-${data.gameId}`).emit('changesForUser', changes);
    if (status) {
      this.playground
        .to(`room-${data.gameId}`)
        .emit('endRound', { game, status });
    }
  }

  @SubscribeMessage('continue')
  async handleCountinueAnotherRound(
    @ConnectedSocket() client: Socket,
    @MessageBody('gameId') gameId: string,
  ): Promise<void> {
    this.logger.debug('#### continue gameid', gameId);
    const { moves, turn, game } = await this.gameProvider.continueGame(gameId);
    this.logger.debug('#### continue', moves, turn, game);
    client.emit('acceptContinue', { moves, turn, game });
    client
      .to(`room-${gameId}`)
      .emit('otherUserDecision', { decision: 'continue' });
  }

  @SubscribeMessage('finish')
  async handleFinishGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('gameId') gameId: string,
  ): Promise<void> {
    this.logger.debug('#### finish gameid', gameId);
    await this.gameProvider.finishGame(gameId);
    client.emit('acceptFinish', '');

    client
      .to(`room-${gameId}`)
      .emit('otherUserDecision', { decision: 'finish' });
  }
}
