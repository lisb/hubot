// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { Brain } from "./brain";
import { HttpClient } from "./http";
import { User, Message, MessageId, TextMessage, EnterMessage, LeaveMessage, JoinMessage, TopicMessage, CatchAllMessage } from "./message";
import { Response, ResponseWithJson, Stamp, YesNoWithResponse, SelectWithResponse, TaskWithResponse, RemoteFile, RemoteFiles, ActualLocation, SendableContent, JsonContent } from "./response";

export type Matcher = (msg: Message) => boolean;
export type Callback<M extends Message> = (res: Response<M>) => void;
export type ErrorHandler = (err: Error, res: object) => void;

export type RespondType = "stamp" | "yesno" | "select" | "task" | "file" | "files" | "map";
export type TypedJsonCallback<T extends RespondType, J extends JsonContent> = (res: ResponseWithJson<J>) => void;

export interface Robot {
  brain: Brain;

  listen<M extends Message>(matcher: Matcher, options: object, callback: Callback<M>): void;

  hear(regex: RegExp, callback: Callback<TextMessage>): void;
  respond(regex: RegExp, callback: Callback<TextMessage>): void;

  respond(type: "stamp", callback: TypedJsonCallback<"stamp", Stamp>): void;
  respond(type: "yesno", callback: TypedJsonCallback<"yesno", YesNoWithResponse>): void;
  respond(type: "select", callback: TypedJsonCallback<"select", SelectWithResponse>): void;
  respond(type: "task", callback: TypedJsonCallback<"task", TaskWithResponse>): void;
  respond(type: "file", callback: TypedJsonCallback<"file", RemoteFile>): void;
  respond(type: "files", callback: TypedJsonCallback<"files", RemoteFiles>): void;
  respond(type: "map", callback: TypedJsonCallback<"map", ActualLocation>): void;

  enter(callback: Callback<EnterMessage>): void;
  leave(callback: Callback<LeaveMessage>): void;
  join(callback: Callback<JoinMessage>): void;
  topic(callback: Callback<TopicMessage>): void;
  error(callback: ErrorHandler): void;
  catchAll(callback: Callback<CatchAllMessage>): void;

  send(envelope: {room: string}, ...contents: SendableContent[]): void;
  reply(envelope: {room: string, user: User}, ...contents: SendableContent[]): void;
  announce(domain: {id: string}, ...contents: string[]): void;

  http(url: string, options: object): HttpClient;
}