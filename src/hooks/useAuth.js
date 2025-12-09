// Convenience hook that re-exports useAuth from AuthContext
// This allows for cleaner imports: import { useAuth } from '../hooks/useAuth'
import { useAuth as useAuthContext } from '../contexts/AuthContext';

export { useAuthContext as useAuth };

