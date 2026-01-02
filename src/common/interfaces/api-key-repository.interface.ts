// import { ApiKey } from '../../api-keys/entities/api-key.entity';

/**
 * Data for creating a new API key
 */
export type CreateApiKeyData = {
  name: string;
  hashedKey: string;
  expiresAt?: Date;
};

/**
 * Result when validating an API key
 */
export type ValidatedApiKey = {
  id: string;
  accountId: string;
  name: string;
};

/**
 * API Key Repository Interface
 *
 * Note: All read/write operations (except validation) are scoped by accountId
 */
export interface IApiKeyRepository {
  /**
   * Create a new API key for an account
   * @param accountId - Owner account
   * @param data - API key data
   */
  //   create(accountId: string, data: CreateApiKeyData): Promise<ApiKey>;
  create(accountId: string, data: CreateApiKeyData): Promise<any>;

  /**
   * Find API key by ID (scoped to account)
   * Returns null if not found OR belongs to different account
   * @param accountId - Owner account
   * @param id - API key ID
   */
  //   findById(accountId: string, id: string): Promise<ApiKey | null>;
  findById(accountId: string, id: string): Promise<any>;

  /**
   * Find all API keys for an account
   * @param accountId - Owner account
   */
  //   findAllByAccount(accountId: string): Promise<ApiKey[]>;
  findAllByAccount(accountId: string): Promise<any[]>;

  /**
   * Validate an API key by its hash
   * Used by the API key guard during authentication
   * Returns null if not found, expired, or revoked
   * @param hashedKey - SHA-256 hash of the API key
   */
  findValidByHash(hashedKey: string): Promise<ValidatedApiKey | null>;

  /**
   * Revoke an API key (sets revokedAt)
   * @param accountId - Owner account
   * @param id - API key ID
   */
  revoke(accountId: string, id: string): Promise<boolean>;

  /**
   * Update lastUsedAt timestamp
   * Called after successful API key validation
   * @param id - API key ID
   */
  updateLastUsed(id: string): Promise<void>;
}

export const API_KEY_REPOSITORY = Symbol('IApiKeyRepository');
