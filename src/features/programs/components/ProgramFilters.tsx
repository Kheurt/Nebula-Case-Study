'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const DOMAINS = [
  'FINANCE', 'CONSULTING', 'DATA', 'PRODUCT', 'SOFTWARE', 'MARKETING', 'ENTREPRENEURSHIP',
];

interface ProgramFiltersProps {
  coaches: { id: string; name: string }[];
  currentParams: { domain?: string; search?: string; coachId?: string };
}

export function ProgramFilters({ coaches, currentParams }: ProgramFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(
      Object.entries({ ...currentParams, [key]: value }).filter(([, v]) => v),
    );
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleReset() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg bg-gray-50 p-4">
      <div className="min-w-[180px]">
        <Select
          label="Domain"
          value={currentParams.domain ?? ''}
          options={DOMAINS.map((d) => ({ value: d, label: d }))}
          placeholder="All domains"
          onChange={(e) => handleChange('domain', e.target.value)}
        />
      </div>
      <div className="min-w-[220px]">
        <Select
          label="Coach"
          value={currentParams.coachId ?? ''}
          options={coaches.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="All coaches"
          onChange={(e) => handleChange('coachId', e.target.value)}
        />
      </div>
      <div className="min-w-[240px]">
        <Input
          label="Search"
          placeholder="Title or coach name…"
          defaultValue={currentParams.search ?? ''}
          onBlur={(e) => handleChange('search', e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleChange('search', e.currentTarget.value);
          }}
        />
      </div>
      {(currentParams.domain || currentParams.search || currentParams.coachId) && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
