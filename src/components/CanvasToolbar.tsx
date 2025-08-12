'use client';
import React from 'react';

type Props = {
  onAddDecision: () => void;
};

export default function CanvasToolbar({ onAddDecision }: Props) {
  return (
    <div className="absolute top-4 left-4 z-50">
      <div className="card p-2 flex gap-2 items-center">
        <button onClick={onAddDecision} className="btn btn-accent">+ Decision</button>
      </div>
    </div>
  );
}
