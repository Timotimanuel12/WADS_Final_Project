import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './sidebar';

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    usePathname: () => '/dashboard',
}));

jest.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: jest.fn(),
    }),
}));

describe('Sidebar Component', () => {

    it('renders the application title', () => {
        render(<Sidebar />);
        const heading = screen.getByRole('heading', { level: 1, name: /helpimtoolazy/i });
        expect(heading).toBeInTheDocument();
    });

    it('renders main navigation buttons', () => {
        render(<Sidebar />);

        expect(screen.getByRole('button', { name: /dashboard/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /calendar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /activities/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /focus timer/i })).toBeInTheDocument();
    });

    it('renders the Add New Task button', () => {
        render(<Sidebar />);
        const addButton = screen.getByRole('button', { name: /add new task/i });
        expect(addButton).toBeInTheDocument();
    });

});
