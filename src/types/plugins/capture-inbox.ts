export interface CaptureInboxConfig {
  /** Absolute private directory for originals, drafts, and publish checkpoints. Use one wiki process per directory. */
  directory: string;
  /** Return true only for a maintainer authenticated by the host application. */
  authorize: (request: import('express').Request) => boolean | Promise<boolean>;
  /** Optional authentication middleware that populates the request before authorization. */
  middleware?: import('express').RequestHandler[];
  /** Exact trusted HTTP(S) origins for remote captures. An empty list permits uploads only. */
  allowedOrigins?: string[];
  /** Publish reviewed captures to the wiki's Git-managed Markdown/JSON sidecars and keep evidence in directory. */
  sidecarIngest?: boolean;
}
