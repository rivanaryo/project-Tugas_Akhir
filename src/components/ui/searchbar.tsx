import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface SearchBarProps {
  value: string;
  onChange: (nextValue: string) => void;
  onReset: () => void;
  placeholder: string;
  isLoading?: boolean;
  variant?: 'default' | 'compact';
  label?: string;
}

export function SearchBar({
  value,
  onChange,
  onReset,
  placeholder,
  isLoading,
  variant = 'default',
  label = 'Search',
}: SearchBarProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
          Reset
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-surface-2/40 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full space-y-2">
          <Label htmlFor="search">{label}</Label>
          <Input
            id="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onReset} disabled={isLoading}>
            Reset Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
