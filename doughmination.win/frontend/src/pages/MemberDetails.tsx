import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useTheme from '@/hooks/useTheme';

interface Member {
  id: number;
  name: string;
  display_name?: string;
  avatar_url?: string;
  pronouns?: string;
  description?: string;
  tags?: string[];
  is_private: boolean;
  is_cofront: boolean;
  is_special: boolean;
}

interface MemberDetailsProps {
  members?: Member[];
  defaultAvatar?: string;
}

export default function MemberDetails({ members = [], defaultAvatar }: MemberDetailsProps) {
  const [theme] = useTheme();
  const { member_id } = useParams<{ member_id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!member_id) {
        setError('No member ID provided');
        setLoading(false);
        return;
      }

      // First try to find member in props
      const foundMember = members.find(m => m.name.toLowerCase() === member_id.toLowerCase());
      if (foundMember) {
        setMember(foundMember);
        setLoading(false);
        return;
      }

      // Otherwise fetch from API
      try {
        const response = await fetch(`/api/member/${member_id}`);
        if (!response.ok) {
          throw new Error('Member not found');
        }
        const data = await response.json();
        setMember(data);
      } catch (err) {
        console.error('Error fetching member:', err);
        setError('Member not found or error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberData();
  }, [member_id, members]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="text-center font-comic">Loading member details...</div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="max-w-md mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Member not found'}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <img 
                src={member.avatar_url || defaultAvatar || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'} 
                alt={member.display_name || member.name}
                className="w-32 h-32 rounded-full mx-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                }}
              />
            </div>
            <CardTitle className="text-3xl font-comic">
              {member.display_name || member.name}
            </CardTitle>
            {member.pronouns && (
              <p className="text-muted-foreground font-comic">
                {member.pronouns}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {member.description && (
              <div>
                <h3 className="text-lg font-comic mb-2">About</h3>
                <p className="text-muted-foreground font-comic">
                  {member.description}
                </p>
              </div>
            )}

            {member.tags && member.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-comic mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="font-comic">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <Button variant="outline" asChild>
                <Link to="/" className="font-comic">
                  ← Back to Members
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
