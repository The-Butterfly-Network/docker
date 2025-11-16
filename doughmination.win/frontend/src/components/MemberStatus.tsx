import React from 'react';
import { Badge } from '@/components/ui/badge';

interface MemberStatus {
  text: string;
  emoji?: string;
  updated_at: string;
}

interface MemberStatusProps {
  status: MemberStatus | null | undefined;
  compact?: boolean;
}

export default function MemberStatus({ status, compact = false }: MemberStatusProps) {
  if (!status) {
    return null;
  }

  if (compact) {
    // Compact version for member cards
    return (
      <div className="mt-2 flex items-center justify-center gap-1">
        {status.emoji && (
          <span className="text-sm">{status.emoji}</span>
        )}
        <span className="text-xs text-muted-foreground font-comic truncate max-w-[100px]">
          {status.text}
        </span>
      </div>
    );
  }

  // Full version for member details page
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
      {status.emoji && (
        <span className="text-2xl flex-shrink-0">{status.emoji}</span>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-comic text-sm break-words">{status.text}</p>
        <p className="text-xs text-muted-foreground font-comic mt-1">
          Updated {new Date(status.updated_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// Export the status interface for use in other components
export type { MemberStatus };