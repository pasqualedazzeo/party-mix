import React from 'react';

interface SliderProps {
  name: string;
  min: number;
  max: number;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Slider({ name, min, max, value, onChange }: SliderProps) {
  return (
    <input
      type="range"
      name={name}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-dark-highlight rounded-lg appearance-none cursor-pointer accent-spotify-green"
    />
  );
}
