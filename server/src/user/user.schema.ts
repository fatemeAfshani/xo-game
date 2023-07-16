import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class User {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: Number, default: 0 })
  winCount: number;

  @Prop({ type: Number, default: 0 })
  lossCount: number;

  @Prop({ type: Number, default: 0 })
  drawCount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
