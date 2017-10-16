// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.

export interface Int64 {
  high: number;
  low: number;
}

export interface DirectUser {
  id: string;
  id_i64: Int64;
  name: string;
  displayName: string;
  canonicalDisplayName: string;
  phoneticDisplayName: string | null;
  canonicalPhoneticDisplayName: string | null;
  email?: string;
  profile_url?: string;
  updatedAt: Int64;
}

export interface DirectDomain {
  id: string;
  id_i64: Int64;
  domainInfo: {
    name: string,
    logoUrl: string | null,
    frozen: boolean
  },
  closed: boolean;
  contract: any; // TODO
  profileDefinition: any; // TODO
  setting: any; // TODO
  role: any; // TODO
}

export enum DirectTalkType {
  Unknown = 0,
  Pair = 1,
  Group = 2,
}

export interface DirectTalk {
  id: string;
  id_i64: Int64;
  domainId: string;
  domainId_i64: Int64;
  type: DirectTalkType;
  name: string | null;
  topic: string | null;
  iconUrl: string | null;
  userIds: Int64[];
  guestIds: null;
  leftUsers: any[]; // TODO
  users: DirectUser[];
  domain: DirectDomain;
  updatedAt: Int64;
}