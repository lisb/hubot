// Copyright (c) 2017 Sho Kuroda <krdlab@gmail.com>
// Released under the MIT license.

export type HttpHeaderName = "Accept" | "Authorization" | "Content-Type";

export type HttpHeaders = {[n in HttpHeaderName]?: string};

export type HttpClientResponseHandler = (err: any, res: any, body: any) => void;

export interface HttpClient {
  header(name: HttpHeaderName, value: string): HttpClient;
  headers(hs: HttpHeaders): HttpClient;
  query(ps: {[key: string]: string | number}): HttpClient;

  get(): (callback: HttpClientResponseHandler) => void;
  post(data: any): (callback: HttpClientResponseHandler) => void;
}