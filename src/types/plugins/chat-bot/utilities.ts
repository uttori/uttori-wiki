export interface MarkdownASTNode {
  /** The type of node. */
  type: string;
  /** Text content for the node. */
  content: (string | string[])[];
  /** The relevant headers for this node. */
  headers: MarkdownASTHeaderValue[];
  /** The MarkdownIt Token object for the opening tag. */
  open?: import('markdown-it').Token | null;
  /** The MarkdownIt Token object for the closing tag. */
  close?: import('markdown-it').Token | null;
  /** The child nodes for this node. */
  children: MarkdownASTNode[];
}

export type MarkdownASTHeaderEntry = string | number | MarkdownASTNode | (string | MarkdownASTNode | number)[];

export type MarkdownASTHeaderStack = MarkdownASTHeaderEntry[];

/** A header slot before or after consolidation. */
export type MarkdownASTHeaderValue = string | number | boolean | null | undefined | MarkdownASTHeaderStack;

/** Optional footnote metadata on a MarkdownIt token. */
export interface MarkdownFootnoteMeta {
  /** Footnote label text. */
  label?: unknown;
}
