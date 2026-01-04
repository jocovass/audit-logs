export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
}

export enum AuditActorType {
  USER = 'user',
  SYSTEM = 'system',
  API_KEY = 'api_key',
}

export enum AuditCategory {
  USER = 'user',
  AUTHENTICATION = 'authentication',
  DATA = 'data',
  SYSTEM = 'system',
  SECURITY = 'security',
}

export enum AuditSource {
  API = 'api',
  WEB = 'web',
  SYSTEM = 'system',
  WORKER = 'worker',
}
