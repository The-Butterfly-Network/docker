import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useTheme from '@/hooks/useTheme';

interface Member {
  id: string;
  name: string;
  display_name?: string;
  avatar_url?: string;
  tags?: string[];
}

const TagManager: React.FC = () => {
  const [theme] = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique tags from all members
  const allTags = Array.from(
    new Set(members.flatMap(m => m.tags || []))
  ).sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', content: 'Authentication required' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const regularMembers = data
          .filter((m: Member) => !m.is_cofront && !m.is_special)
          .sort((a: Member, b: Member) =>
            (a.display_name || a.name).toLowerCase()
              .localeCompare((b.display_name || b.name).toLowerCase())
          );

        setMembers(regularMembers);
      } else {
        setMessage({ type: 'error', content: 'Failed to fetch members' });
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setMessage({ type: 'error', content: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!selectedMember) {
      setMessage({ type: 'error', content: 'Please select a member' });
      return;
    }

    if (!newTag.trim()) {
      setMessage({ type: 'error', content: 'Tag cannot be empty' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return setMessage({ type: 'error', content: 'Authentication required' });

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/member-tags/${selectedMember}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tag: newTag.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add tag');
      }

      setNewTag('');
      setMessage({ type: 'success', content: 'Tag added successfully!' });
      await fetchMembers();
    } catch (err: any) {
      setMessage({ type: 'error', content: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTag = async (memberName: string, tag: string) => {
    const token = localStorage.getItem('token');
    if (!token) return setMessage({ type: 'error', content: 'Authentication required' });

    if (!window.confirm(`Remove tag "${tag}" from ${memberName}?`)) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/member-tags/${memberName}/${tag}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove tag');
      }

      setMessage({ type: 'success', content: 'Tag removed successfully!' });
      await fetchMembers();
    } catch (err: any) {
      setMessage({ type: 'error', content: err.message });
    } finally {
      setSaving(false);
    }
  };

  const getSelectedMember = () => {
    return members.find(m => m.name === selectedMember);
  };

  const filteredMembers = members.filter(m =>
    (m.display_name || m.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="text-center font-comic">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-comic">Tag Manager</h1>
            <p className="text-muted-foreground font-comic">Manage member tags and sub-systems</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard" className="font-comic">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Messages */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.content}</AlertDescription>
          </Alert>
        )}

        {/* Add Tag Form */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comic">Add Tag</CardTitle>
            <CardDescription className="font-comic">Select a member and add a tag</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Member Selection */}
            <div className="space-y-2">
              <Label htmlFor="member-select" className="font-comic">Select Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger id="member-select" className="font-comic">
                  <SelectValue placeholder="Choose a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.name} className="font-comic">
                      <div className="flex items-center gap-2">
                        <img
                          src={member.avatar_url || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'}
                          alt={member.display_name || member.name}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                          }}
                        />
                        <span>{member.display_name || member.name}</span>
                        {member.tags && member.tags.length > 0 && (
                          <span className="text-xs text-muted-foreground">({member.tags.length} tag{member.tags.length !== 1 ? 's' : ''})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Tags Display */}
            {selectedMember && getSelectedMember() && (
              <div className="p-3 bg-muted rounded-lg border border-border">
                <p className="text-xs text-muted-foreground font-comic mb-2">Current Tags:</p>
                {getSelectedMember()?.tags && getSelectedMember()!.tags!.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedMember()!.tags!.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="font-comic">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-comic">No tags assigned</p>
                )}
              </div>
            )}

            {/* New Tag Input */}
            {selectedMember && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="new-tag" className="font-comic">New Tag</Label>
                  <Input
                    id="new-tag"
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name..."
                    className="font-comic"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                </div>

                {/* Existing Tags Quick Add */}
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-comic">Or select from existing tags:</Label>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewTag(tag)}
                          className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors font-comic"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddTag}
                  disabled={saving || !newTag.trim()}
                  className="w-full font-comic"
                >
                  {saving ? 'Adding...' : 'Add Tag'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* All Members with Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comic">All Members</CardTitle>
            <CardDescription className="font-comic">
              {members.filter(m => m.tags && m.tags.length > 0).length} member(s) with tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <Input
                type="text"
                placeholder="Search members or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-comic"
              />
            </div>

            {/* Members List */}
            {filteredMembers.length > 0 ? (
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member.name)}
                    className="flex items-start gap-3 p-3 bg-muted rounded-lg border border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <img
                      src={member.avatar_url || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'}
                      alt={member.display_name || member.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-comic font-semibold">
                        {member.display_name || member.name}
                      </p>

                      {member.tags && member.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              <Badge variant="secondary" className="font-comic text-xs">
                                {tag}
                              </Badge>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveTag(member.name, tag);
                                }}
                                className="text-destructive hover:text-destructive/80 text-xs"
                                title={`Remove ${tag}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground font-comic mt-1">No tags</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-comic text-center py-4">
                {searchQuery ? 'No members found matching your search' : 'No members available'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tag Statistics */}
        {allTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-comic">Tag Statistics</CardTitle>
              <CardDescription className="font-comic">{allTags.length} unique tag{allTags.length !== 1 ? 's' : ''}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const count = members.filter(m => m.tags?.includes(tag)).length;
                  return (
                    <div key={tag} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                      <Badge variant="secondary" className="font-comic">{tag}</Badge>
                      <span className="text-sm text-muted-foreground font-comic">×{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TagManager;