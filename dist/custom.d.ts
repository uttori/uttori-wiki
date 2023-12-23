import { Express } from 'express-serve-static-core';

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

type UttoriContext = {
  config: Record<string, AddQueryOutputToViewModelConfig>;
  hooks: {
      on: Function;
      fetch: Function;
  };
}
type UttoriMiddleware = (string | Function | boolean)[]
type AsyncRequestHandler = (fn: import('express').RequestHandler) => (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => void

type AddQueryOutputToViewModelFormatFunction = (documents:object[]) => object[]
type AddQueryOutputToViewModelQueryFunction = (target:object, context:UttoriContext) => Promise<object[][]>
type AddQueryOutputToViewModelCallback = (target:object, context:UttoriContext) => Promise<object[]>
