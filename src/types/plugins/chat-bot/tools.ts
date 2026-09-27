export interface OllamaToolFunction {
  /** The function name. */
  name: string;
  /** The function description. */
  description: string;
  /** The JSON Schema for the function parameters. */
  parameters: object;
}

export interface OllamaTool {
  /** The type of tool. */
  type: 'function';
  /** The function definition. */
  function: OllamaToolFunction;
}

export interface ChatToolResult {
  /** Set when the tool name is unknown or no provider handled it. */
  error?: string;
}

export interface ChatToolExecutionContext {
  /** The Uttori event dispatcher. */
  hooks?: import('@uttori/event-dispatcher').EventDispatcher;
  /** The full Uttori context. */
  context?: object;
  /** The chat bot configuration. */
  config?: object;
}
