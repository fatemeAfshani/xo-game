import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import mongoose, { SchemaTypes, Types } from 'mongoose';
import { User } from 'src/user/user.schema';

@Schema({ versionKey: false })
export class Game {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  user1: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  user2: User;

  @Prop({ type: Number, default: 0 })
  roundsCount: number;

  @Prop({ type: Number, default: 0 })
  user1Wins: number;

  @Prop({ type: Number, default: 0 })
  user2Wins: number;

  @Prop({ type: Number, default: 0 })
  drawsCount: number;
}

export const GameSchema = SchemaFactory.createForClass(Game);
