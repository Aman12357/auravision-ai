import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../src/app/(auth)/login/page';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => ({
    isLoading: false,
    isAuthenticated: false,
  }),
}));

describe('LoginPage', () => {
  it('renders login form with email and password fields', () => {
    render(<LoginPage />);

    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@company.com/i)).toBeInTheDocument();
  });

  it('allows user to switch between Password and Magic Link tabs', () => {
    render(<LoginPage />);

    const magicLinkTab = screen.getByText(/Magic Link/i);
    fireEvent.click(magicLinkTab);

    expect(screen.getByText(/Send OTP/i)).toBeInTheDocument();
  });
});
