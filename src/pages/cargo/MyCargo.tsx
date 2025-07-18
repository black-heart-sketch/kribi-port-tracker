import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '@/config/axios.config';

interface CargoItem {
  _id: string;
  description: string;
  type: string;
  weight: number;
  unit: string;
  quantity: number;
  cargoOwnerId: string;
  customsStatus: string;
  notes: string;
  id: string;
}

interface BerthingItem {
  berthingId: string;
  ship: {
    _id: string;
    name: string;
    imoNumber: string;
    type: string;
    id: string;
  };
  dock: {
    _id: string;
    name: string;
    location: string;
    id: string;
  };
  arrivalDate: string;
  departureDate: string;
  status: string;
  cargo: CargoItem[];
}

interface BerthingCargo {
  _id: string;
  description: string;
  type: string;
  weight: number;
  quantity: number;
  unit: string;
  cargoOwnerId: string;
  customsStatus: string;
  notes: string;
  id: string;
}

interface BerthingItem {
  berthingId: string;
  ship: {
    _id: string;
    name: string;
    imoNumber: string;
    type: string;
    id: string;
  };
  dock: {
    _id: string;
    name: string;
    location: string;
    id: string;
  };
  arrivalDate: string;
  departureDate: string;
  status: string;
  cargo: BerthingCargo[];
}

const MyCargo = () => {
  const { user } = useAuth();
  const [berthings, setBerthings] = useState<BerthingItem[]>([]);
  const [selectedCargo, setSelectedCargo] = useState<CargoItem | null>(null);
  const [selectedBerthing, setSelectedBerthing] = useState<BerthingItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewCargo = (berthing: BerthingItem, cargo: CargoItem) => {
    setSelectedBerthing(berthing);
    setSelectedCargo(cargo);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCargo(null);
    setSelectedBerthing(null);
  };

  const fetchMyCargo = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/berthings/user/cargo', {
        params: { userId: user.id }
      });
      setBerthings(response.data.data || []);
    } catch (err) {
      console.error('Error fetching cargo:', err);
      setError('Failed to load your cargo items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCargo();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Transit</Badge>;
      case 'at_port':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">At Port</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Cargo</h1>
      </div>

      {berthings.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Cargo Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You don't have any cargo items yet.</p>
          </CardContent>
        </Card>
      ) : (
        berthings.map((berthing) => (
          <Card key={berthing.berthingId} className="mb-6">
            <CardHeader className=" border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Ship: {berthing.ship?.name || 'N/A'}</CardTitle>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <div>IMO: {berthing.ship?.imoNumber || 'N/A'}</div>
                    <div>Dock: {berthing.dock?.name || 'N/A'}</div>
                    <div>Status: {getStatusBadge(berthing.status || 'pending')}</div>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>Arrival: {formatDate(berthing.arrivalDate)}</div>
                  <div>Departure: {formatDate(berthing.departureDate)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Customs Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {berthing.cargo?.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.description || 'N/A'}</TableCell>
                      <TableCell className="capitalize">
                        {item.type ? item.type.replace('_', ' ') : 'N/A'}
                      </TableCell>
                      <TableCell>{item.weight || '0'}</TableCell>
                      <TableCell>{item.quantity || '0'}</TableCell>
                      <TableCell>{item.unit || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.customsStatus ? item.customsStatus.replace('_', ' ') : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewCargo(berthing, item)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No cargo items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}

      {/* Cargo Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cargo Details</DialogTitle>
          </DialogHeader>
          {selectedCargo && selectedBerthing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Ship Information</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedBerthing.ship?.name || 'N/A'}</p>
                    <p><span className="text-muted-foreground">IMO:</span> {selectedBerthing.ship?.imoNumber || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Type:</span> {selectedBerthing.ship?.type?.replace('_', ' ') || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">Dock Information</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {selectedBerthing.dock?.name || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Location:</span> {selectedBerthing.dock?.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Cargo Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="text-muted-foreground">Description:</span> {selectedCargo.description || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Type:</span> {selectedCargo.type?.replace('_', ' ') || 'N/A'}</p>
                    <p><span className="text-muted-foreground">Weight:</span> {selectedCargo.weight} {selectedCargo.unit || ''}</p>
                  </div>
                  <div>
                    <p><span className="text-muted-foreground">Quantity:</span> {selectedCargo.quantity || '0'}</p>
                    <p><span className="text-muted-foreground">Status:</span> {getStatusBadge(selectedBerthing.status || 'pending')}</p>
                    <p><span className="text-muted-foreground">Customs Status:</span> 
                      <Badge variant="outline" className="ml-1">
                        {selectedCargo.customsStatus ? selectedCargo.customsStatus.replace('_', ' ') : 'N/A'}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="text-muted-foreground">Arrival:</span> {formatDate(selectedBerthing.arrivalDate)}</p>
                    <p><span className="text-muted-foreground">Departure:</span> {formatDate(selectedBerthing.departureDate)}</p>
                  </div>
                </div>
              </div>

              {selectedCargo.notes && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedCargo.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={closeDialog}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCargo;
