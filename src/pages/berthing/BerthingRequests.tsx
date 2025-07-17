import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreHorizontal, Clock, Check, X, Ship, Search, AlertCircle, Loader2, Anchor, Calendar, Key, User, Flag, Package, Scale, Milestone, Edit
} from 'lucide-react';
import { toast } from 'sonner';
import berthingService from '@/services/berthing.service';
import { useAuth } from '@/contexts/AuthContext';

// --- Components and constants remain largely the same ---

const TableSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
    <TableCell><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
  </TableRow>
);

const statusVariant = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
  approved: 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
  in_progress: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
  completed: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
  rejected: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
  cancelled: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100',
};

const statusIcons = {
  pending: <Clock className="w-3.5 h-3.5 mr-1.5" />,
  approved: <Check className="w-3.5 h-3.5 mr-1.5" />,
  in_progress: <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />,
  completed: <Check className="w-3.5 h-3.5 mr-1.5" />,
  rejected: <X className="w-3.5 h-3.5 mr-1.5" />,
  cancelled: <X className="w-3.5 h-3.5 mr-1.5" />,
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

// A helper component to render details neatly
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
  <div className="flex items-start justify-between py-2">
    <div className="flex items-center text-sm text-muted-foreground">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="text-sm text-right break-words">{value || 'N/A'}</div>
  </div>
);

// The "Awesome" Popup Component, now more detailed and robust
const BerthingDetailsPopup = ({ berthing, isOpen, onClose }: { berthing: any | null; isOpen: boolean; onClose: () => void; }) => {
  if (!berthing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Ship className="w-7 h-7 mr-3 text-primary" /> {berthing.ship?.name || 'Unknown Ship'}
          </DialogTitle>
          <DialogDescription>
            <Badge variant="outline" className={`${statusVariant[berthing.status]} capitalize`}>
              {statusIcons[berthing.status]} {statusLabels[berthing.status] || 'Unknown'}
            </Badge>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="font-mono text-xs">{berthing._id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
          {/* Ship Details Column */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Ship Details</h3>
            <Separator />
            <InfoRow icon={<Key className="w-4 h-4 mr-2" />} label="IMO Number" value={berthing.ship?.imoNumber} />
            <InfoRow icon={<Milestone className="w-4 h-4 mr-2" />} label="Ship Type" value={<span className="capitalize">{berthing.ship?.type}</span>} />
            <InfoRow icon={<Flag className="w-4 h-4 mr-2" />} label="Flag" value={berthing.ship?.flag} />
            <InfoRow icon={<Scale className="w-4 h-4 mr-2" />} label="Gross Tonnage" value={berthing.ship?.grossTonnage?.toLocaleString() + ' t'} />
            <InfoRow icon={<Anchor className="w-4 h-4 mr-2" />} label="Draft" value={berthing.ship?.draft + ' m'} />
            <InfoRow icon={<Milestone className="w-4 h-4 mr-2" />} label="Year Built" value={berthing.ship?.yearBuilt} />
            <InfoRow icon={<User className="w-4 h-4 mr-2" />} label="Owner" value={berthing.ship?.owner} />
          </div>

          {/* Schedule & Location Column */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Schedule & Logistics</h3>
            <Separator />
            <InfoRow icon={<Calendar className="w-4 h-4 mr-2" />} label="Arrival" value={berthing.arrivalDate ? format(new Date(berthing.arrivalDate), 'MMM d, yyyy, HH:mm') : 'N/A'} />
            <InfoRow icon={<Calendar className="w-4 h-4 mr-2" />} label="Departure" value={berthing.departureDate ? format(new Date(berthing.departureDate), 'MMM d, yyyy, HH:mm') : 'N/A'} />
            <InfoRow icon={<Anchor className="w-4 h-4 mr-2" />} label="Assigned Dock" value={berthing.dock?.name} />
            <InfoRow icon={<User className="w-4 h-4 mr-2" />} label="Requested By" value={berthing.createdBy?.name} />
            <InfoRow icon={<Calendar className="w-4 h-4 mr-2" />} label="Created On" value={berthing.createdAt ? format(new Date(berthing.createdAt), 'MMM d, yyyy') : 'N/A'} />
          </div>
        </div>

        {/* Rejection reason section */}
        {berthing.rejectionReason && (
          <div>
             <h3 className="font-semibold text-lg mb-2 text-destructive">Rejection Reason</h3>
             <Separator />
             <p className="mt-2 text-sm p-3 bg-red-50/50 border border-red-200 rounded-md">{berthing.rejectionReason}</p>
          </div>
        )}

        {/* Cargo Manifest Section */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Cargo Manifest</h3>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Weight (t)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {berthing.cargoDetails?.length > 0 ? (
                    berthing.cargoDetails.map((item: any, index: number) => (
                      <TableRow key={item._id || index}>
                        <TableCell className="capitalize font-medium">{item.type || 'N/A'}</TableCell>
                        <TableCell>{item.description || 'N/A'}</TableCell>
                        <TableCell className="text-right">{`${item.quantity?.toLocaleString() || 'N/A'} ${item.unit || ''}`}</TableCell>
                        <TableCell className="text-right">{item.weight?.toLocaleString() || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">No cargo details provided.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button><Edit className="w-4 h-4 mr-2" /> Edit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
const BerthingRequests = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);

  const { getUserId } = useAuth();

  // useQuery now expects `any[]` implicitly
  const { data: berthings, isLoading, isError, error } = useQuery({
    queryKey: ['berthings'],
    queryFn: () => berthingService.getBerthings(),
    staleTime: 5 * 60 * 1000,
  });

  const filteredBerthings = berthings?.filter((berthing: any) => {
    if (selectedStatus !== 'all' && berthing.status !== selectedStatus) {
      return false;
    }
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const shipName = berthing.ship?.name?.toLowerCase() || '';
    const imoNumber = berthing.ship?.imoNumber?.toLowerCase() || '';
    return shipName.includes(searchLower) || imoNumber.includes(searchLower) || berthing._id?.toLowerCase().includes(searchLower);
  }) || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { 
      id: string; 
      status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled'; 
      reason?: string 
    }) => {
      if (status === 'rejected' && !reason) {
        return Promise.reject(new Error('Rejection reason is required'));
      }
      return status === 'rejected'
        ? berthingService.rejectBerthing(id,{ reason,userId:getUserId()})
        : berthingService.updateBerthing(id, { status: status,userId:getUserId() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['berthings'] });
      toast.success('Berthing status updated successfully');
      setShowRejectDialog(false);
      setIsDetailsPopupOpen(false); // Close popup on success
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleStatusUpdate = (id: string, status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled') => {
    if (isDetailsPopupOpen) setIsDetailsPopupOpen(false);

    if (status === 'rejected') {
      setSelectedRequest(berthings?.find((b: any) => b._id === id) || null);
      setShowRejectDialog(true);
    } else {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleRejectConfirm = () => {
    if (!selectedRequest || !rejectionReason) return;
    updateStatusMutation.mutate({
      id: selectedRequest._id,
      status: 'rejected',
      reason: rejectionReason,
    });
  };

  const handleViewDetails = (berthing: any) => {
    setSelectedRequest(berthing);
    setIsDetailsPopupOpen(true);
  };

  if (isError) {
    // --- Error UI remains the same ---
    return <div>Error: {error.message}</div>
  }

  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Berthing Requests</h2>
          <p className="text-sm text-muted-foreground">Manage and monitor all berthing requests</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ships, IMO..."
              className="pl-8 sm:w-[200px] md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="all"
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <TabsList className="grid grid-cols-3 sm:flex">
              {['all', 'pending', 'approved', 'in_progress', 'completed', 'rejected'].map((status) => (
                <TabsTrigger key={status} value={status} className="text-xs sm:text-sm capitalize">
                  {statusLabels[status as keyof typeof statusLabels] || 'All'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="overflow-hidden bg-transparent shadow-none border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium text-white">Ship</TableHead>
                  <TableHead className="font-medium text-white">IMO</TableHead>
                  <TableHead className="font-medium text-white">Arrival</TableHead>
                  <TableHead className="font-medium text-white">Departure</TableHead>
                  <TableHead className="font-medium text-white">Status</TableHead>
                  <TableHead className="font-medium text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array(5).fill(0).map((_, i) => <TableSkeleton key={i} />)
                  : filteredBerthings.length > 0
                    ? filteredBerthings.map((berthing: any) => (
                        <TableRow key={berthing._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => handleViewDetails(berthing)}>
                          <TableCell className="border-b border-gray-100/50">
                            <div className="flex items-center">
                              <Ship className="w-4 h-4 mr-2 text-muted-foreground" />
                              <span>{berthing.ship?.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="border-b border-gray-100/50">{berthing.ship?.imoNumber || 'N/A'}</TableCell>
                          <TableCell className="border-b border-gray-100/50">
                            {berthing.arrivalDate ? format(new Date(berthing.arrivalDate), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="border-b border-gray-100/50">
                            {berthing.departureDate ? format(new Date(berthing.departureDate), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell className="border-b border-gray-100/50">
                            <Badge
                              variant="outline"
                              className={`${statusVariant[berthing.status as keyof typeof statusVariant] || 'bg-gray-50'} capitalize text-xs font-medium py-1 px-2 border h-auto`}
                            >
                              {statusIcons[berthing.status as keyof typeof statusIcons] || statusIcons.pending}
                              {statusLabels[berthing.status as keyof typeof statusLabels] || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="border-b border-gray-100/50">
                            <div className="flex justify-end pr-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenuItem onSelect={() => handleViewDetails(berthing)}>
                                    View Details
                                  </DropdownMenuItem>
                                  {berthing.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onSelect={() => handleStatusUpdate(berthing._id, 'approved')}>Approve</DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => handleStatusUpdate(berthing._id, 'rejected')}>Reject</DropdownMenuItem>
                                    </>
                                  )}
                                  {/* ... other status actions */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">No berthing requests found.</TableCell>
                        </TableRow>
                      )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Berthing Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this berthing request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Reason for Rejection
              </label>
              <textarea
                id="rejectionReason"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Berthing Details Popup */}
      <BerthingDetailsPopup 
        berthing={selectedRequest} 
        isOpen={isDetailsPopupOpen} 
        onClose={() => setIsDetailsPopupOpen(false)} 
      />
    </div>
  );
};

export default BerthingRequests;