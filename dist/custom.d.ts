import { Express } from 'express-serve-static-core';
import { EventDispatcher } from '@uttori/event-dispatcher';

// https://plusreturn.com/blog/how-to-extend-express-request-interface-in-typescript/
/** Add wikiFlash to the Request type. */
declare module 'express-serve-static-core' {
  interface Request {
    wikiFlash(key?: string, value?: any): object | any[] | boolean;
  }
}

// https://stackoverflow.com/questions/38900537/typescript-extend-express-session-interface-with-own-class
declare namespace Express {
  interface CustomSessionFields {
      myCustomField: string;
  }
  type RequestExpress = import('express-serve-static-core').Request;
  type SessionExpress = import('express-session').Session;
  type SessionDataExpress = import('express-session').SessionData;
  export interface RequestExtended extends RequestExpress {
      session: SessionExpress & Partial<SessionDataExpress> & CustomSessionFields
  }
}

export type UttoriPluginConfig =
  import('./../src/plugins/add-query-output.js').AddQueryOutputToViewModelConfig |
  import('./../src/plugins/add-ejs-includes.js').EJSRendererConfig |
  import('./../src/plugins/add-download-route.js').DownloadRouterConfig

export type UttoriContext = {
  config: Record<string, UttoriPluginConfig>;
  hooks: EventDispatcher;
}
export type UttoriMiddleware = (string | Function | boolean)[]

export type AddQueryOutputToViewModelFormatFunction = (documents:any[]) => any[]
export type AddQueryOutputToViewModelQueryFunction = (target:any, context:UttoriContext) => Promise<any[][]>
export type AddQueryOutputToViewModelCallback = (target:any, context:UttoriContext) => Promise<any>

export interface ParsedPathKey {
  /** The name of the segment variable. */
  name: string;
  /** When true, they segment is optional. */
  optional: boolean;
  /** The default value, if set. */
  def?: string;
}

export interface UttoriRedirect {
  /** The route to redirect from. */
  route: string;
  /** The route to redirect to. */
  target: string;
  /** The HTTP status code to use. Defaults to `301` */
  status?: number;
  /** If true, append the query string to the target. Default to `true` */
  appendQueryString?: boolean;
}

export interface SaveParams {
  /** Optional edit key/ */
  key?: string
  /** The slug to save to. */
  slug: string
}
