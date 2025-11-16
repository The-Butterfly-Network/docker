import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusManagerProps {
  memberName: string;
  currentStatus?: {
    text: string;
    emoji?: string;
    updated_at: string;
  } | null;
  onStatusUpdated?: () => void;
}

// Common emoji suggestions
const EMOJI_SUGGESTIONS = [
  '💤', '🎮', '📚', '🎨', '🎵', '💻', '🌙', '☀️', 
  '🍕', '☕', '🎬', '✨', '💭', '😴', '🏃', '🧘'
];

export default function StatusManager({ 
  memberName, 
  currentStatus, 
  onStatusUpdated 
}: StatusManagerProps) {
  const [statusText, setStatusText] = useState(currentStatus?.text || '');
  const [emoji, setEmoji] = useState(currentStatus?.emoji || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', content: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!statusText.trim()) {
      setMessage({ type: 'error', content: 'Status text is required' });
      return;
    }

    if (statusText.length > 100) {
      setMessage({ type: 'error', content: 'Status text must be 100 characters or less' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', content: 'Authentication required' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/members/${memberName}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: statusText.trim(),
          emoji: emoji || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update status');
      }

      const data = await response.json();
      setMessage({ type: 'success', content: 'Status updated successfully!' });
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      setMessage({ 
        type: 'error', 
        content: err.message || 'Failed to update status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', content: 'Authentication required' });
      return;
    }

    if (!window.confirm('Are you sure you want to clear this status?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/members/${memberName}/status`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to clear status');
      }

      setStatusText('');
      setEmoji('');
      setMessage({ type: 'success', content: 'Status cleared successfully!' });
      
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (err: any) {
      console.error('Status clear error:', err);
      setMessage({ 
        type: 'error', 
        content: err.message || 'Failed to clear status' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-comic">Manage Status</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert 
            variant={message.type === 'error' ? 'destructive' : 'default'} 
            className="mb-4"
          >
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emoji" className="font-comic">
              Emoji (optional)
            </Label>
            <div className="flex gap-2 items-center">
              <Input
                id="emoji"
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
                placeholder="😊"
                className="w-20 text-center text-2xl font-comic"
                maxLength={2}
              />
              <div className="flex flex-wrap gap-1">
                {EMOJI_SUGGESTIONS.map((emojiSuggestion) => (
                  <button
                    key={emojiSuggestion}
                    type="button"
                    onClick={() => setEmoji(emojiSuggestion)}
                    className="w-8 h-8 text-xl hover:bg-accent rounded transition-colors"
                  >
                    {emojiSuggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="statusText" className="font-comic">
              Status Text
            </Label>
            <div className="space-y-1">
              <Input
                id="statusText"
                type="text"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="What's happening?"
                className="font-comic"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground font-comic text-right">
                {statusText.length}/100 characters
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !statusText.trim()}
              className="font-comic flex-1"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
            {currentStatus && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearStatus}
                disabled={loading}
                className="font-comic"
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {currentStatus && (
          <div className="mt-4 p-3 bg-muted rounded-lg border border-border">
            <p className="text-xs text-muted-foreground font-comic mb-1">Current Status:</p>
            <div className="flex items-center gap-2">
              {currentStatus.emoji && (
                <span className="text-xl">{currentStatus.emoji}</span>
              )}
              <p className="font-comic text-sm">{currentStatus.text}</p>
            </div>
            <p className="text-xs text-muted-foreground font-comic mt-1">
              Updated {new Date(currentStatus.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}