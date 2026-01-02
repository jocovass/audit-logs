/**
 * Raw event data from any source
 * This is the shape before normalization
 */
export type RawEvent = {
  source: string; // 'http', 'webhook:github', 'webhook:stripe', 'queue', etc.
  payload: unknown; // Raw payload from the source
  metadata: {
    receivedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    headers?: Record<string, string>;
  };
};

/**
 * Normalized event ready for storage
 * This matches the AuditLog schema (minus system-generated fields)
 */
export type NormalizedEvent = {
  timestamp: Date;
  correlationId?: string;
  actor: {
    id: string;
    type: 'user' | 'system' | 'api_key';
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  action: string;
  category: string;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  source: string;
  metadata?: Record<string, unknown>;
};

/**
 * Event Source Interface
 *
 * Implements Open/Closed principle:
 * - New event sources can be added without modifying existing code
 * - All sources produce the same normalized output
 */
export interface IEventSource {
  /**
   * Unique identifier for this event source
   * e.g., 'http', 'webhook:github', 'queue:rabbitmq'
   */
  readonly sourceType: string;

  /**
   * Check if this source can handle the given raw event
   * @param raw - Raw event data
   */
  canHandle(raw: RawEvent): boolean;

  /**
   * Parse and normalize a raw event
   * @param raw - Raw event data
   * @returns Normalized event ready for storage
   * @throws Error if event cannot be normalized
   */
  normalize(raw: RawEvent): NormalizedEvent;
}
