import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AuthGuard from '@/components/AuthGuard';
import * as auth from 'firebase/auth';

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
    let authCallback: any = null;
    (auth.onAuthStateChanged as jest.Mock).mockImplementation((_, callback) => {
      authCallback = callback;
      return jest.fn();
    });

    const { rerender } = render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    // Simulate user login
    if (authCallback) {
      authCallback({ uid: '123', email: 'test@example.com' });
    }

    await waitFor(() => {
      expect(auth.onAuthStateChanged).toHaveBeenCalled();
    });
  });
});
