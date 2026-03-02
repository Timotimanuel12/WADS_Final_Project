import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileSettings from './ProfileSettings';

describe('ProfileSettings Component', () => {

    it('renders the Profile Picture section', () => {
        render(<ProfileSettings />);
        const heading = screen.getByRole('heading', { level: 3, name: /profile picture/i });
        expect(heading).toBeInTheDocument();
    });

    it('renders the generic profile input fields', () => {
        render(<ProfileSettings />);

        // Check for some labels to ensure inputs are there
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/university email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/major \/ program/i)).toBeInTheDocument();
    });

    it('renders the Save Changes button', () => {
        render(<ProfileSettings />);
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        expect(saveButton).toBeInTheDocument();
    });

});
