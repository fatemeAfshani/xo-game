import { Types } from 'mongoose';

export type Payload = {
  username: string;
  _id: Types.ObjectId;
};
