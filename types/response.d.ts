// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { DirectUser } from "./direct";
import { HttpClient } from "./http";
import { Message, MessageId, TextMessage, User } from "./message";
import { Robot } from "./robot";

export interface Response<M extends Message> {
  robot: Robot;
  message: M;
  match: RegExpMatchArray;
  envelope: {room: string, user: User, message: M};

  send(...content: SendableContent[]): void;
  download(file: RemoteFile, callback: (path: string) => void): void;
  announce(...content: string[]): void;
  leave(user?: {id: string}): void;
  topic(...content: string[]): void;
  finish(): void;
  http(url: string, options: object): HttpClient;
}

export interface ResponseWithJson<T extends JsonContent> extends Response<TextMessage> {
  json: T;
}

// type definitions

export type SelectResponse = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export declare enum TaskClosingType { Any = 0, All = 1 }

export type SendableContent =
    string
  | Text
  | Text   & SendTextHandler
  | Stamp
  | Stamp  & SendStampHandler
  | YesNo
  | YesNo  & SendYesNoHandler
  | Select
  | Select & SendSelectHandler
  | Task
  | Task   & SendTaskHandler
  | Note
  | Note   & SendNoteHandler
  | CloseYesNo | CloseSelect | CloseTask
  | AttachmentFile | AttachmentFiles
  | ReplyResponse<boolean> | ReplyResponse<SelectResponse> | ReplyTask
  ;

export type Text         = {text: string}
export type Stamp        = {stamp_set: string, stamp_index: string, text?: string};
export type YesNo        = {question: string};
export type CloseYesNo   = {close_yesno: MessageId};
export type Select       = {question: string, options: string[]};
export type CloseSelect  = {close_select: MessageId};
export type Task         = {title: string, closing_type: TaskClosingType};
export type CloseTask    = {close_task: MessageId};
export type Note         = {note_title: string, note_content: string, note_attachments?: AttachmentFile[]};

export type AttachmentFile = {
  path:  string;
  name?: string;
  type?: string;
  text?: string;
};
export type AttachmentFiles = {
  path:  string[];
  name?: string[];
  type?: string[];
  text?: string;
};
export type ReplyResponse<R> = {in_reply_to: MessageId, response: R};
export type ReplyTask        = {in_reply_to: MessageId, done: boolean};

export type SentText   = Sent<Text>;
export type SentStamp  = Sent<Stamp>;
export type SentYesNo  = SentAction<YesNoAnswer, YesNo>;
export type SentSelect = SentAction<SelectAnswer, Select>;
export type SentTask   = SentAction<TaskAnswer, Task>;
export type SentNote   = {
  note: {
    id: string;
    noteRevision: {
      revision: number;
      title: string;
      contentType: number;
      contentText: string;
      contentFiles?: RemoteFile[];
    }
  }
};

type YesNoAnswer  = (trues: DirectUser[], falses: DirectUser[]) => void;
type SelectAnswer = (options: Array<DirectUser[]>) => void;
type TaskAnswer   = (dones: DirectUser[], undones: DirectUser[]) => void;

type SendTextHandler   = OnSend<SentText>   | WithOnReadStatusHandler<SentText>   | WithReadStatusProperties<SentText>;
type SendStampHandler  = OnSend<SentStamp>  | WithOnReadStatusHandler<SentStamp>  | WithReadStatusProperties<SentStamp>;
type SendYesNoHandler  = OnSend<SentYesNo>  | WithOnReadStatusHandler<SentYesNo>  | WithReadStatusProperties<SentYesNo>;
type SendSelectHandler = OnSend<SentSelect> | WithOnReadStatusHandler<SentSelect> | WithReadStatusProperties<SentSelect>;
type SendTaskHandler   = OnSend<SentTask>   | WithOnReadStatusHandler<SentTask>   | WithReadStatusProperties<SentTask>;
type SendNoteHandler   = OnSend<SentNote>;

export type WithOnReadStatusHandler<S> =
  OnRead<(readNowUsers: DirectUser[], readUsers: DirectUser[], unreadUsers: DirectUser[]) => void> &
  OnSend<S>;
export type WithReadStatusProperties<S> =
  OnRead<() => true> &
  OnSend<S & {readUsers: DirectUser[], unreadUsers: DirectUser[]}>;
type OnRead<H> = {onread: H};
type OnSend<S> = {onsend: (sent: S) => void};

type Sent<C>          = {message: SentMessage<C>};
type SentAction<H, C> = Sent<C & {listing: boolean}> & {answer: SentAnswer<H>};
type SentAnswer<H>    = (cb: H) => void;
type SentMessage<C>   = {id: MessageId, type: number, content: C};

export type JsonContent =
    Stamp
  | YesNoWithResponse | SelectWithResponse | TaskWithResponse
  | RemoteFile | RemoteFiles
  | ActualLocation
  | NoteCreated | NoteUpdated | NoteDeleted
  ;

export type YesNoWithResponse  = YesNo & {response?: boolean};
export type SelectWithResponse = Select & {response?: SelectResponse};
export type TaskWithResponse   = Task & {done?: boolean}

export type RemoteFile = {
  id: string;
  name: string;
  content_type: string;
  content_size: number;
  url: string;
};
export type RemoteFiles = {
  files: RemoteFile[];
  text?: string;
};

export type ActualLocation = {
  place: string;
  lat: number;
  lng: number;
};

export type NoteCreated = {
  note_id: string;
  title: string;
  revision: number;
  has_attachments?: boolean;
};

export type NoteUpdated = {
  note_id: string;
  title: string;
  revision: number;
  has_attachments?: boolean;
};

export type NoteDeleted = {
  note_id: string;
  title: string;
};
