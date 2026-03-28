import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '@/components/AuthGuard';
import * as auth from 'firebase/auth';

type AuthStateCallback = (user: { uid: string; email: string } | null) => void;

describe('AuthGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state initially', () => {
    (auth.onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn());
    
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );
    
    // Component should handle loading state
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should call onAuthStateChanged on mount', () => {
    (auth.onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn());
    
    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });

  it('should handle auth state changes', async () => {
    let authCallback: AuthStateCallback | null = null;
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback: AuthStateCallback) => {
      authCallback = callback;
      return jest.fn();
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // Simulate user login
    if (authCallback) {
      await act(async () => {
        authCallback({ uid: '123', email: 'test@example.com' });
      });
    }

    await waitFor(() => {
      expect(auth.onAuthStateChanged).toHaveBeenCalled();
    });
  });
});
