export type DemoUserId = 'ana' | 'bia';
export declare const DEMO_USERS: Readonly<Record<DemoUserId, {readonly id: DemoUserId; readonly salt: string; readonly passwordHash: string}>>;
export declare const SESSION_TTL_MS: number;
export interface SecurityService {
  login(username: string, password: string): string | null;
  csrfFor(sessionId: string | undefined): string | null;
  logout(sessionId: string | undefined, csrf: string | undefined): boolean;
  canLogout(sessionId: string | undefined, csrf: string | undefined): boolean;
  userFor(sessionId: string | undefined): DemoUserId | null;
  canRead(sessionId: string | undefined, ownerId: string): boolean;
  canWrite(sessionId: string | undefined, ownerId: string, csrf: string | undefined): boolean;
}
export declare function createSecurity(options?: {now?: () => number; users?: typeof DEMO_USERS; ttlMs?: number}): SecurityService;
export declare function securityHeaders(): Record<string, string>;
export declare function redactLogFields<T>(value: T): T;
