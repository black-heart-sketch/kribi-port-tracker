import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, Building, Briefcase, MapPin, User, Shield, Check, X, Loader2, Clock, Bell, Send, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import userService, { UserRole } from '@/services/user.service';
import notificationService, { NotificationType } from '@/services/notification.service';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'maritime_agent', label: 'Maritime Agent' },
  { value: 'cargo_owner', label: 'Cargo Owner' },
  { value: 'customs_broker', label: 'Customs Broker' },
  { value: 'port_authority', label: 'Port Authority' },
  { value: 'viewer', label: 'Viewer' },
];

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Fetch user details
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId!), 
    enabled: !!userId,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: (role: UserRole) => {
      if (!userId) return Promise.reject(new Error('User ID is required'));
      return userService.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });

  // Toggle user status
  const [notificationData, setNotificationData] = useState({
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    title: '',
    relatedDocument: '',
    relatedDocumentType: 'Berthing' as 'Berthing' | 'Cargo',
    actionUrl: ''
  });

  const handleNotificationChange = (field: string, value: string) => {
    setNotificationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => {
      if (!userId) return Promise.reject(new Error('User ID is required'));
      return userService.updateUserStatus(userId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User ${user?.isActive ? 'deactivated' : 'activated'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    },
  });

  // Map UI notification types to backend notification types
  const mapToBackendType = (type: string): NotificationType => {
    switch (type) {
      case 'error':
        return 'berthing_rejected';
      case 'success':
        return 'berthing_approved';
      case 'warning':
        return 'cargo_update';
      default:
        return 'system';
    }
  };

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID is required');
      if (!notificationData.message.trim()) {
        throw new Error('Notification message is required');
      }
      if (!notificationData.title.trim()) {
        throw new Error('Notification title is required');
      }
      
      const notificationType = mapToBackendType(notificationData.type);
      
      return notificationService.createNotification({
        userId,
        title: notificationData.title.trim(),
        message: notificationData.message.trim(),
        type: notificationType,
        fromUser: currentUser?.id,
        relatedDocument: notificationData.relatedDocument || undefined,
        relatedDocumentModel: notificationData.relatedDocument ? notificationData.relatedDocumentType : undefined,
        actionUrl: notificationData.actionUrl || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Notification sent successfully');
      setNotificationData({
        message: '',
        type: 'info',
        title: '',
        relatedDocument: '',
        relatedDocumentType: 'Berthing',
        actionUrl: ''
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to send notification: ${error.message}`);
    },
  });

  const getNotificationIcon = () => {
    switch (notificationData.type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading user</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'User not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div className="flex items-center space-x-4">
          <Button
            variant={user.isActive ? 'outline' : 'default'}
            size="sm"
            onClick={() => toggleStatusMutation.mutate(!user.isActive)}
            disabled={toggleStatusMutation.isPending}
          >
            {toggleStatusMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : user.isActive ? (
              <X className="h-4 w-4 mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Badge 
                    variant={user.isActive ? 'default' : 'outline'} 
                    className="mt-2"
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground">Role</p>
                    <Select
                      value={user.role}
                      onValueChange={(value: UserRole) => updateRoleMutation.mutate(value)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Account Details</p>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Member Since</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {user.lastLogin && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Additional Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Notification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Send Notification
              </CardTitle>
              <CardDescription>
                Send a direct notification to this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notification-title">Title</Label>
                    <Input
                      id="notification-title"
                      placeholder="Notification title"
                      value={notificationData.title}
                      onChange={(e) => handleNotificationChange('title', e.target.value)}
                      disabled={sendNotificationMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={notificationData.type}
                      onValueChange={(value: 'info' | 'warning' | 'error' | 'success') => 
                        handleNotificationChange('type', value)
                      }
                      disabled={sendNotificationMutation.isPending}
                    >
                      <SelectTrigger>
                        <div className="flex items-center">
                          {getNotificationIcon()}
                          <span className="ml-2 capitalize">{notificationData.type}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">
                          <div className="flex items-center">
                            <Info className="h-4 w-4 text-blue-500 mr-2" />
                            <span>Info</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="success">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Success</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span>Warning</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="error">
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span>Error</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-message">Message</Label>
                  <Textarea
                    id="notification-message"
                    placeholder="Type your notification message here..."
                    value={notificationData.message}
                    onChange={(e) => handleNotificationChange('message', e.target.value)}
                    disabled={sendNotificationMutation.isPending}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="related-document">Related Document ID (optional)</Label>
                    <Input
                      id="related-document"
                      placeholder="e.g., 60d21b4667d0d8992e610c85"
                      value={notificationData.relatedDocument}
                      onChange={(e) => handleNotificationChange('relatedDocument', e.target.value)}
                      disabled={sendNotificationMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select
                      value={notificationData.relatedDocumentType}
                      onValueChange={(value: 'Berthing' | 'Cargo') => 
                        handleNotificationChange('relatedDocumentType', value)
                      }
                      disabled={!notificationData.relatedDocument || sendNotificationMutation.isPending}
                    >
                      <SelectTrigger>
                        <span>{notificationData.relatedDocumentType}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Berthing">Berthing</SelectItem>
                        <SelectItem value="Cargo">Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-url">Action URL (optional)</Label>
                  <Input
                    id="action-url"
                    placeholder="e.g., /berthings/60d21b4667d0d8992e610c85"
                    value={notificationData.actionUrl}
                    onChange={(e) => handleNotificationChange('actionUrl', e.target.value)}
                    disabled={sendNotificationMutation.isPending}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => sendNotificationMutation.mutate()}
                    disabled={!notificationData.message.trim() || !notificationData.title.trim() || sendNotificationMutation.isPending}
                  >
                    {sendNotificationMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Notification
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Company Information */}
          {(user.company || user.position || user.department) && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.company && (
                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{user.company}</p>
                    </div>
                  </div>
                )}
                {user.position && (
                  <div className="flex items-start">
                    <Briefcase className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Position</p>
                      <p className="text-sm text-muted-foreground">{user.position}</p>
                    </div>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{user.department}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {(user.address || user.city || user.country || user.postalCode) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{user.address}</p>
                      </div>
                    </div>
                  )}
                  {(user.city || user.country || user.postalCode) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {user.city && (
                        <div>
                          <p className="text-sm font-medium">City</p>
                          <p className="text-sm text-muted-foreground">{user.city}</p>
                        </div>
                      )}
                      {user.country && (
                        <div>
                          <p className="text-sm font-medium">Country</p>
                          <p className="text-sm text-muted-foreground">{user.country}</p>
                        </div>
                      )}
                      {user.postalCode && (
                        <div>
                          <p className="text-sm font-medium">Postal Code</p>
                          <p className="text-sm text-muted-foreground">{user.postalCode}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Email Verified</p>
                    <Badge variant={user.emailVerified ? 'default' : 'outline'} className="mt-1">
                      {user.emailVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">2FA</p>
                    <Badge variant={user.twoFactorEnabled ? 'default' : 'outline'} className="mt-1">
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                {user.lastIpAddress && (
                  <div>
                    <p className="text-sm font-medium">Last IP Address</p>
                    <p className="text-sm text-muted-foreground">{user.lastIpAddress}</p>
                  </div>
                )}
                {user.loginCount !== undefined && (
                  <div>
                    <p className="text-sm font-medium">Login Count</p>
                    <p className="text-sm text-muted-foreground">{user.loginCount}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
