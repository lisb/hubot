// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.
import { DirectDomain, DirectTalk, DirectUser } from "./direct";

export interface Brain {
  data: {
    users: {[id: string]: DirectUser};
    talks: {[id: string]: DirectTalk};
    domains: {[id: string]: DirectDomain};
    _private: object;
  };
  autoSave: boolean;

  set(key: string, value: any): Brain;
  set(obj: object): Brain;
  get(key: string): any | undefined;
  remove(key: string): Brain;

  save(): void;
  close(): void;

  setAutoSave(enabled: boolean): void;
  resetSaveInterval(seconds: number): void;

  mergeData(data: object): void;

  users(): {[id: string]: DirectUser};
  userForId(id: string, options?: object): DirectUser | any; // NOTE: get or create
  userForName(name: string): DirectUser[] | null;
  usersForRawFuzzyName(fuzzyName: string): DirectUser[];
  usersForFuzzyName(fuzzyName: string): DirectUser[];

  rooms(): {[id: string]: DirectTalk};
  domains(): {[id: string]: DirectDomain};
}