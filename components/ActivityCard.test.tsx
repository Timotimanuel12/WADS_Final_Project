import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityCard from './ActivityCard';

describe('ActivityCard Component', () => {

    const mockActivity = {
        title: 'Study Session',
        category: 'Biology',
        status: 'In Progress' as const,
        priority: 'High' as const,
        type: 'Exam Prep'
    };

    it('renders activity details correctly', () => {
        render(<ActivityCard {...mockActivity} />);


        const title = screen.getByText('Study Session');
        const category = screen.getByText('Biology');
        const typeLabel = screen.getByText('Exam Prep');

        expect(title).toBeInTheDocument();
        expect(category).toBeInTheDocument();
        expect(typeLabel).toBeInTheDocument();
    });
});
