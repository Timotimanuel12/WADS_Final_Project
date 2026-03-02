import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddTaskModal } from './AddTaskModal';

describe('AddTaskModal Component', () => {

    it('renders nothing when isOpen is false', () => {
        render(<AddTaskModal isOpen={false} onClose={() => { }} />);
        const heading = screen.queryByRole('heading', { name: /add new task/i });
        expect(heading).not.toBeInTheDocument();
    });

    it('renders the modal when isOpen is true', () => {
        render(<AddTaskModal isOpen={true} onClose={() => { }} />);
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveTextContent('Add New Task');
    });

    it('contains title and subject inputs', () => {
        render(<AddTaskModal isOpen={true} onClose={() => { }} />);
        const titleInput = screen.getByLabelText(/task title/i);
        const subjectInput = screen.getByLabelText(/subject \/ course/i);

        expect(titleInput).toBeInTheDocument();
        expect(subjectInput).toBeInTheDocument();
    });

    it('renders Save and Cancel buttons', () => {
        render(<AddTaskModal isOpen={true} onClose={() => { }} />);
        const saveButton = screen.getByRole('button', { name: /save task/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        expect(saveButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
    });
});
