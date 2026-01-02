// NOTE: Once Account entity is defined, replace all 'any' imports with it
// import { Account } from '../../accounts/entities/account.entity';

/**
 * Data for creating a new account
 */
export type CreateAccountData = {
  name: string;
  email: string;
  passwordHash: string;
};

/**
 * Data for updating an account
 */
export type UpdateAccountData = Partial<CreateAccountData>;

/**
 * Account Repository Interface
 */
export interface IAccountRepository {
  /**
   * Create a new account
   * @param data - Account data
   */
  //   create(data: CreateAccountData): Promise<Account>;
  create(data: CreateAccountData): Promise<any>;

  /**
   * Find account by ID
   * @param id - Account ID
   */
  //   findById(id: string): Promise<Account | null>;
  findById(id: string): Promise<any>;

  /**
   * Find account by email (for authentication)
   * @param email - Account email
   */
  //   findByEmail(email: string): Promise<Account | null>;
  findByEmail(email: string): Promise<any>;

  /**
   * Update account details
   * @param id - Account ID
   * @param data - Fields to update
   */
  //   update(id: string, data: UpdateAccountData): Promise<Account | null>;
  update(id: string, data: UpdateAccountData): Promise<any>;

  /**
   * Check if an email is already registered
   * @param email - Email to check
   */
  existsByEmail(email: string): Promise<boolean>;
}

export const ACCOUNT_REPOSITORY = Symbol('IAccountRepository');
