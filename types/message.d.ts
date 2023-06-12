// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { DirectTalk, DirectTalkType, DirectUser } from "./direct";

export interface User extends DirectUser {
  room: string;
  rooms: DirectTalk[];
}

export interface Message {
  user: User;
  room: string;
  roomType: DirectTalkType;
  roomTopic: string;
  roomUsers: User[];
  rooms: { [id: string]: DirectTalk };
}

export type MessageId = string;
export type Mention = { user: { id: string } };

export interface TextMessage extends Message {
  text: string;
  id: MessageId;

  mentionAll?: boolean;
  mentionMe?: boolean;
  mentions?: Mention[];
}

export interface EnterMessage extends Message {}
export interface LeaveMessage extends Message {}
export interface TopicMessage extends Message {}
export interface JoinMessage extends Message {}

// a message that no matchers matched
export interface CatchAllMessage extends Message {
  message: any; // the original message
}
