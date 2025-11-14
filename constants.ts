
import { UserRole } from './src/types.ts';

// Set API_BASE to '/mock' to use the mock API service.
// Change this to '/api' when your PHP backend is ready and deployed.
// FIX: Explicitly set type to string to avoid being inferred as a literal type.
export const API_BASE = window.location.origin + "/api";

export const ROLES = {
  USER: UserRole.USER,
  OFFICER: UserRole.OFFICER,
  ADMIN: UserRole.ADMIN,
};