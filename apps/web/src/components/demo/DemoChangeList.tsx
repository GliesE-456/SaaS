"use client";

import * as React from 'react';
import { DemoChangeCard } from './DemoChangeCard';
import { MOCK_CHANGES } from '@/lib/demo-mock-data';
import { Button } from '@/components/ui/button';

export function DemoChangeList() {
  const [filter, setFilter] = React.useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');

  const filteredChanges = MOCK_CHANGES.filter((c) => {
    if (filter === 'ALL') return true;
    return c.impactLevel === filter;
  });

  return (
    <div className="space-y-6">
      {/* Mini filter tabs */}
      <div className="flex gap-2 bg-slate-950/40 p-1.5 rounded-lg border border-indigo-500/10 max-w-md">
        <Button
          size="sm"
          variant={filter === 'ALL' ? 'default' : 'ghost'}
          onClick={() => setFilter('ALL')}
          className={`flex-1 h-8 ${filter === 'ALL' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          All changes
        </Button>
        <Button
          size="sm"
          variant={filter === 'HIGH' ? 'default' : 'ghost'}
          onClick={() => setFilter('HIGH')}
          className={`flex-1 h-8 ${filter === 'HIGH' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          High Impact
        </Button>
        <Button
          size="sm"
          variant={filter === 'MEDIUM' ? 'default' : 'ghost'}
          onClick={() => setFilter('MEDIUM')}
          className={`flex-1 h-8 ${filter === 'MEDIUM' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Medium Impact
        </Button>
      </div>

      <div className="grid gap-6">
        {filteredChanges.map((change) => (
          <DemoChangeCard key={change.id} change={change} />
        ))}
      </div>
    </div>
  );
}
