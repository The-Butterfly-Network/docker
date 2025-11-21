import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import useTheme from '@/hooks/useTheme';

interface Member {
  id: string;
  name: string;
  display_name?: string;
  avatar_url?: string;
  pronouns?: string;
  tags?: string[];
}

interface FrontingData {
  id: string;
  timestamp: string;
  members: Member[];
}

const SwitchManager: React.FC = () => {
  const [theme] = useTheme();
  const [members, setMembers] = useState<Member[]>([]);
  const [currentFronters, setCurrentFronters] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersRes, frontersRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/fronters')
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const regularMembers = membersData
          .sort((a: Member, b: Member) =>
            (a.display_name || a.name).toLowerCase()
              .localeCompare((b.display_name || b.name).toLowerCase())
          );
        setMembers(regularMembers);
      }

      if (frontersRes.ok) {
        const frontersData: FrontingData = await frontersRes.json();
        setCurrentFronters(frontersData.members || []);
        
        // Pre-populate selected members with current fronters
        const fronterIds = new Set(
          frontersData.members?.map(m => m.id) || []
        );
        setSelectedMembers(fronterIds);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage({ type: 'error', content: 'Failed to fetch data' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    
    setSelectedMembers(newSelected);
  };

  const handleApplySwitch = async () => {
    if (selectedMembers.size === 0) {
      setMessage({ type: 'error', content: 'Please select at least one member' });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', content: 'Authentication required' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/multi_switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          member_ids: Array.from(selectedMembers)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to switch fronters');
      }

      const data = await response.json();
      setMessage({ 
        type: 'success', 
        content: `Successfully switched to ${data.count} member${data.count !== 1 ? 's' : ''}!` 
      });
      
      // Refresh fronters data
      await fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', content: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    const allMemberIds = new Set(filteredMembers.map(m => m.id));
    setSelectedMembers(allMemberIds);
  };

  const handleClearAll = () => {
    setSelectedMembers(new Set());
  };

  const isCurrentlyFronting = (memberId: string): boolean => {
    return currentFronters.some(f => f.id === memberId);
  };

  const filteredMembers = members.filter(m =>
    (m.display_name || m.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSelectedMembersList = () => {
    return members.filter(m => selectedMembers.has(m.id));
  };

  const hasChanges = () => {
    // Compare current fronters with selected members
    const currentIds = new Set(currentFronters.map(m => m.id));
    
    if (currentIds.size !== selectedMembers.size) return true;
    
    for (const id of selectedMembers) {
      if (!currentIds.has(id)) return true;
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="text-center font-comic">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-comic">Switch Manager</h1>
            <p className="text-muted-foreground font-comic">Manage fronting members</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Member Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Actions */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-comic"
                />
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="font-comic"
                    disabled={filteredMembers.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearAll}
                    className="font-comic"
                    disabled={selectedMembers.size === 0}
                  >
                    Clear All
                  </Button>
                  <div className="ml-auto text-sm text-muted-foreground font-comic flex items-center">
                    {selectedMembers.size} selected
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Member List */}
            <Card>
              <CardHeader>
                <CardTitle className="font-comic">Select Members</CardTitle>
                <CardDescription className="font-comic">
                  Choose members to front
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMembers.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {filteredMembers.map((member) => {
                      const isSelected = selectedMembers.has(member.id);
                      const isFronting = isCurrentlyFronting(member.id);
                      
                      return (
                        <div
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-accent'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleMember(member.id)}
                            onClick={(e) => e.stopPropagation()}
                          />

                          <img
                            src={member.avatar_url || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'}
                            alt={member.display_name || member.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                            }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-comic font-semibold">
                                {member.display_name || member.name}
                              </p>
                              {isFronting && (
                                <Badge variant="secondary" className="font-comic text-xs">
                                  Currently Fronting
                                </Badge>
                              )}
                            </div>
                            {member.pronouns && (
                              <p className="text-xs text-muted-foreground font-comic">
                                {member.pronouns}
                              </p>
                            )}
                            {member.tags && member.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {member.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-comic"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {member.tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground font-comic">
                                    +{member.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground font-comic py-8">
                    {searchQuery ? 'No members found matching your search' : 'No members available'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Selected Members & Apply */}
          <div className="space-y-4">
            {/* Currently Fronting */}
            <Card>
              <CardHeader>
                <CardTitle className="font-comic">Currently Fronting</CardTitle>
              </CardHeader>
              <CardContent>
                {currentFronters.length > 0 ? (
                  <div className="space-y-2">
                    {currentFronters.map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <img
                          src={member.avatar_url || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'}
                          alt={member.display_name || member.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                          }}
                        />
                        <span className="font-comic text-sm">
                          {member.display_name || member.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-comic text-center py-4">
                    No one currently fronting
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Members */}
            <Card>
              <CardHeader>
                <CardTitle className="font-comic">Selected Members</CardTitle>
                <CardDescription className="font-comic">
                  {selectedMembers.size} member{selectedMembers.size !== 1 ? 's' : ''} selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMembers.size > 0 ? (
                  <div className="space-y-2">
                    {getSelectedMembersList().map((member) => (
                      <div key={member.id} className="flex items-center gap-2">
                        <img
                          src={member.avatar_url || 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png'}
                          alt={member.display_name || member.name}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://www.yuri-lover.win/cdn/pfp/fallback_avatar.png';
                          }}
                        />
                        <span className="font-comic text-sm flex-1">
                          {member.display_name || member.name}
                        </span>
                        <button
                          onClick={() => handleToggleMember(member.id)}
                          className="text-destructive hover:text-destructive/80 text-sm"
                          title="Remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground font-comic text-center py-4">
                    No members selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Apply Button */}
            <Button
              onClick={handleApplySwitch}
              disabled={saving || selectedMembers.size === 0 || !hasChanges()}
              className="w-full font-comic"
              size="lg"
            >
              {saving ? 'Switching...' : hasChanges() ? 'Apply Switch' : 'No Changes'}
            </Button>

            {!hasChanges() && selectedMembers.size > 0 && (
              <p className="text-xs text-center text-muted-foreground font-comic">
                Selected members match current fronters
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwitchManager;