import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('should remove falsy values', () => {
    expect(cn('px-2', false, 'py-1', null, undefined)).toBe('px-2 py-1');
  });

  it('should merge tailwind classes with priority', () => {
    // tailwind-merge should handle conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('should handle arrays of classes', () => {
    expect(cn(['px-2', 'py-1'], 'text-lg')).toBe('px-2 py-1 text-lg');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});
