import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useTheme from '@/hooks/useTheme';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WS';
  path: string;
  description: string;
  auth: 'none' | 'user' | 'admin' | 'admin_or_self';
}

interface EndpointCategory {
  name: string;
  icon: string;
  endpoints: Endpoint[];
}

const Endpoints: React.FC = () => {
  const [theme] = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories: EndpointCategory[] = [
    {
      name: 'Authentication',
      icon: '🔐',
      endpoints: [
        { method: 'POST', path: '/api/login', description: 'User login with username/password + Turnstile', auth: 'none' },
        { method: 'GET', path: '/api/user_info', description: 'Get current user information', auth: 'user' },
        { method: 'GET', path: '/api/is_admin', description: 'Check if current user is admin', auth: 'user' },
      ]
    },
    {
      name: 'System & Members',
      icon: '👥',
      endpoints: [
        { method: 'GET', path: '/api/system', description: 'Get system information and mental state', auth: 'none' },
        { method: 'GET', path: '/api/members', description: 'Get all members (optional subsystem filter)', auth: 'none' },
        { method: 'GET', path: '/api/member/{member_id}', description: 'Get details for specific member', auth: 'none' },
        { method: 'GET', path: '/api/fronters', description: 'Get current fronting members', auth: 'none' },
      ]
    },
    {
      name: 'Member Status',
      icon: '💬',
      endpoints: [
        { method: 'GET', path: '/api/members/{member_identifier}/status', description: 'Get status for a specific member', auth: 'none' },
        { method: 'POST', path: '/api/members/{member_identifier}/status', description: 'Set or update member status', auth: 'admin' },
        { method: 'DELETE', path: '/api/members/{member_identifier}/status', description: 'Clear member status', auth: 'admin' },
      ]
    },
    {
      name: 'Mental State',
      icon: '🧠',
      endpoints: [
        { method: 'GET', path: '/api/mental-state', description: 'Get current mental state', auth: 'none' },
        { method: 'POST', path: '/api/mental-state', description: 'Update mental state', auth: 'admin' },
      ]
    },
    {
      name: 'Fronting Control',
      icon: '🔄',
      endpoints: [
        { method: 'POST', path: '/api/switch', description: 'Switch to multiple fronters', auth: 'user' },
        { method: 'POST', path: '/api/switch_front', description: 'Switch to single fronter', auth: 'user' },
        { method: 'POST', path: '/api/multi_switch', description: 'Switch to multiple fronters (detailed response)', auth: 'user' },
      ]
    },
    {
      name: 'Tags',
      icon: '🏷️',
      endpoints: [
        { method: 'GET', path: '/api/member-tags', description: 'Get all member tag assignments', auth: 'admin' },
        { method: 'POST', path: '/api/member-tags/{member_identifier}', description: 'Update complete tag list for member', auth: 'admin' },
        { method: 'POST', path: '/api/member-tags/{member_identifier}/add', description: 'Add single tag to member', auth: 'admin' },
        { method: 'DELETE', path: '/api/member-tags/{member_identifier}/{tag}', description: 'Remove single tag from member', auth: 'admin' },
      ]
    },
    {
      name: 'User Management',
      icon: '⚙️',
      endpoints: [
        { method: 'GET', path: '/api/users', description: 'List all users', auth: 'admin' },
        { method: 'POST', path: '/api/users', description: 'Create new user', auth: 'admin' },
        { method: 'PUT', path: '/api/users/{user_id}', description: 'Update user information', auth: 'admin_or_self' },
        { method: 'DELETE', path: '/api/users/{user_id}', description: 'Delete user', auth: 'admin' },
        { method: 'POST', path: '/api/users/{user_id}/avatar', description: 'Upload user avatar', auth: 'admin_or_self' },
        { method: 'GET', path: '/avatars/{filename}', description: 'Serve avatar images', auth: 'none' },
      ]
    },
    {
      name: 'Metrics',
      icon: '📊',
      endpoints: [
        { method: 'GET', path: '/api/metrics/fronting-time', description: 'Get fronting time metrics', auth: 'user' },
        { method: 'GET', path: '/api/metrics/switch-frequency', description: 'Get switch frequency metrics', auth: 'user' },
      ]
    },
    {
      name: 'Admin Utilities',
      icon: '🛠️',
      endpoints: [
        { method: 'POST', path: '/api/admin/refresh', description: 'Force refresh all connected clients', auth: 'admin' },
      ]
    },
    {
      name: 'Static & WebSocket',
      icon: '📁',
      endpoints: [
        { method: 'GET', path: '/', description: 'Serve main frontend application', auth: 'none' },
        { method: 'GET', path: '/{member_name}', description: 'Serve member page with dynamic meta tags', auth: 'none' },
        { method: 'GET', path: '/robots.txt', description: 'Serve robots.txt file', auth: 'none' },
        { method: 'GET', path: '/sitemap.xml', description: 'Serve sitemap.xml file', auth: 'none' },
        { method: 'GET', path: '/favicon.ico', description: 'Serve favicon', auth: 'none' },
        { method: 'WS', path: '/ws', description: 'WebSocket connection for real-time updates', auth: 'none' },
      ]
    },
  ];

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-green-500',
      POST: 'bg-blue-500',
      PUT: 'bg-yellow-500',
      DELETE: 'bg-red-500',
      WS: 'bg-purple-500',
    };
    return (
      <Badge className={`${colors[method]} text-white font-mono text-xs min-w-[60px] justify-center`}>
        {method}
      </Badge>
    );
  };

  const getAuthBadge = (auth: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      none: { label: 'Public', variant: 'outline' },
      user: { label: 'Auth', variant: 'secondary' },
      admin: { label: 'Admin', variant: 'destructive' },
      admin_or_self: { label: 'Admin/Self', variant: 'default' },
    };
    const c = config[auth];
    return <Badge variant={c.variant} className="font-comic text-xs">{c.label}</Badge>;
  };

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  // Calculate totals
  const allEndpoints = categories.flatMap(c => c.endpoints);
  const methodCounts = allEndpoints.reduce((acc, e) => {
    acc[e.method] = (acc[e.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-6 pt-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-comic">API Endpoints</h1>
            <p className="text-muted-foreground font-comic">{allEndpoints.length} endpoints available</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/dashboard" className="font-comic">Back to Dashboard</Link>
          </Button>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="font-comic">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm font-comic">
              {Object.entries(methodCounts).map(([method, count]) => (
                <div key={method} className="flex items-center gap-2">
                  {getMethodBadge(method)} <span>{count} endpoint{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {categories.map((category) => (
          <Card key={category.name}>
            <CardHeader
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => toggleCategory(category.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <CardTitle className="font-comic">{category.name}</CardTitle>
                    <CardDescription className="font-comic">
                      {category.endpoints.length} endpoint{category.endpoints.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${expandedCategory === category.name ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </CardHeader>
            {expandedCategory === category.name && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.endpoints.map((endpoint, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getMethodBadge(endpoint.method)}
                        {getAuthBadge(endpoint.auth)}
                      </div>
                      <code className="text-sm font-mono text-primary break-all">{endpoint.path}</code>
                      <span className="text-sm text-muted-foreground font-comic sm:ml-auto">
                        {endpoint.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Endpoints;