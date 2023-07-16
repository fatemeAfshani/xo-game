import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameProvider } from './game.provider';
import { UserMoveDto } from './dto/usermove.dto';
import { JoinDataDto } from './dto/joindata.dto';
import { NewMessageDto } from './dto/newMessage.dto';

@WebSocketGateway({ namespace: 'playground', cors: {} })
export class PlaygroundGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(PlaygroundGateway.name);
  @WebSocketServer() playground: Namespace;

  constructor(private readonly gameProvider: GameProvider) {}

  async handleConnection(client: Socket) {
    this.logger.debug(
      `WS Client with id: ${client.id} connected to playground!`,
    );
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected socket id: ${client.id}`);
  }

  @SubscribeMessage('join')
  async joinARoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId, status }: JoinDataDto,
  ) {
    this.logger.debug(
      `Adding client: ${client.id} to room-${gameId} with status ${status}`,
    );
    if (status === 'waiting') {
      this.logger.debug('Join someone to waiting room');
      await client.join(`waiting-${gameId}`);
    } else {
      this.logger.debug('Join some one to play room');
      await client.join(`room-${gameId}`);
    }

    this.logger.debug(
      `Number of connected sockets in playground room: ${
        this.playground.adapter.rooms?.get(`room-${gameId}`)?.size
      }`,
    );

    this.logger.debug(
      `Number of user connected to waiting room ${
        this.playground.adapter.rooms?.get(`waiting-${gameId}`)?.size
      }`,
    );
    if (this.playground.adapter.rooms?.get(`room-${gameId}`)?.size > 2) {
      this.logger.log(
        `Before disconnecting user from playgound room: ${this.playground.adapter.rooms?.get(
          `room-${gameId}`,
        )} users`,
      );
      client.disconnect(true);
    }

    if (status === 'waiting') {
      const ttl = await this.gameProvider.getOpenGameTtl(gameId);
      this.playground.to(`waiting-${gameId}`).emit('gameTtl', ttl);
    } else {
      client.to(`waiting-${gameId}`).emit('someOneJoined');

      const gameData = await this.gameProvider.getGameData(gameId);
      client.emit('gameData', gameData);

      const gameMoves = await this.gameProvider.getGameMoves(gameId);
      client.emit('gameMoves', gameMoves);

      const gameTurn = await this.gameProvider.getGameTurn(gameId);
      client.emit('gameTurn', gameTurn);

      const messageHistory = await this.gameProvider.getMessagesHistory(gameId);
      client.emit('messageHistory', messageHistory);
    }
  }

  @SubscribeMessage('userMove')
  async handleUserMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UserMoveDto,
  ): Promise<void> {
    const { changes, status, game } = await this.gameProvider.userMove(data);

    this.playground.to(`room-${data.gameId}`).emit('randome', changes);
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
    const { moves, turn, game } = await this.gameProvider.continueGame(gameId);

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
    await this.gameProvider.finishGame(gameId);

    client.emit('acceptFinish', '');
    client
      .to(`room-${gameId}`)
      .emit('otherUserDecision', { decision: 'finish' });
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() newMessage: NewMessageDto,
  ): Promise<void> {
    const message = await this.gameProvider.handleNewMessage(newMessage);

    this.playground
      .to(`room-${newMessage.gameId}`)
      .emit('sendMessage', message);
  }
}
