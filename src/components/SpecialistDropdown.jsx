import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { allSpecialists } from './data/specialists';

export function SpecialistDropdown({ value, onValueChange, className }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a specialist" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {allSpecialists.map((specialist, index) => (
          <SelectItem key={index} value={specialist.name}>
            <div className="flex items-center gap-2">
              <span>{specialist.emoji}</span>
              <span>{specialist.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
