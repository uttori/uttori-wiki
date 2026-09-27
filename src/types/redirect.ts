export interface ParsedPathKey {
  /** The name of the segment variable. */
  name: string;
  /** When true, the segment is optional. */
  optional: boolean;
  /** The default value of the segment, if set. */
  def?: string;
}
