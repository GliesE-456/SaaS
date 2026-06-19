'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export type FilterState = {
  impact: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  readState: 'ALL' | 'UNREAD' | 'READ';
};

interface FeedFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FeedFilters({ filters, onChange }: FeedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-3 rounded-lg border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filter</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Select 
          value={filters.impact} 
          onValueChange={(val: any) => onChange({ ...filters, impact: val })}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Impacts</SelectItem>
            <SelectItem value="HIGH">High Impact</SelectItem>
            <SelectItem value="MEDIUM">Medium Impact</SelectItem>
            <SelectItem value="LOW">Low Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select 
          value={filters.readState} 
          onValueChange={(val: any) => onChange({ ...filters, readState: val })}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Changes</SelectItem>
            <SelectItem value="UNREAD">Unread Only</SelectItem>
            <SelectItem value="READ">Read Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(filters.impact !== 'ALL' || filters.readState !== 'ALL') && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 text-xs px-2"
          onClick={() => onChange({ impact: 'ALL', readState: 'ALL' })}
        >
          Clear
        </Button>
      )}
    </div>
  );
}
