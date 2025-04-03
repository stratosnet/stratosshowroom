import React, { ComponentType } from 'react';
import { useAuth, AuthContextType } from './authContext';

// A higher-order component that provides auth context to wrapped components
export function withAuth<P extends object>(
  Component: ComponentType<P & { auth: AuthContextType }>
): ComponentType<P> {
  return function WithAuthComponent(props: P) {
    // Use auth context directly at the top level
    const auth = useAuth();
    
    // Pass auth to the wrapped component
    return <Component {...props} auth={auth} />;
  };
}

// A fallback component for when auth context is not available
export function withOptionalAuth<P extends object>(
  Component: ComponentType<P & { auth?: AuthContextType | null }>
): ComponentType<P> {
  return function WithOptionalAuthComponent(props: P) {
    try {
      const auth = useAuth();
      return <Component {...props} auth={auth} />;
    } catch (error) {
      console.log('Auth provider not ready yet for', Component.displayName || Component.name);
      return <Component {...props} auth={null} />;
    }
  };
}