import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import customsService, { CargoForClearance } from '@/services/customs.service';
import { UpdateStatusDialog, ViewHistoryDialog } from './components';
import type { HistoryItem } from './components/ViewHistoryDialog';

const CustomsClearance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cargoList, setCargoList] = useState<CargoForClearance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCargo, setSelectedCargo] = useState<CargoForClearance | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const fetchCargoForClearance = async () => {
    try {
      setIsLoading(true);
      const data = await customsService.getCargoForClearance();
      setCargoList(data);
      setError('');
    } catch (err) {
      console.error('Error fetching cargo for clearance:', err);
      setError('Failed to load cargo items. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load cargo items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCargoForClearance();
    }
  }, [user]);

  const handleStatusUpdate = async (cargoId: string, status: string, notes?: string) => {
    try {
      await customsService.updateCargoStatus(cargoId, status, notes, user?.id);
      await fetchCargoForClearance();
      toast({
        title: 'Success',
        description: 'Cargo status updated successfully',
      });
      return true;
    } catch (err) {
      console.error('Error updating cargo status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update cargo status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleViewHistory = async (cargo: CargoForClearance) => {
    setSelectedCargo(cargo);
    setHistoryDialogOpen(true);
    
    try {
      const historyData = await customsService.getClearanceHistory(cargo._id);
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
      toast({
        title: 'Error',
        description: 'Failed to load clearance history',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string; label: string }> = {
      not_verified: { variant: 'outline', label: 'Not Verified' },
      in_progress: { variant: 'secondary', label: 'In Progress' },
      verified: { variant: 'info', label: 'Verified' },
      cleared: { variant: 'success', label: 'Cleared' },
      held: { variant: 'destructive', label: 'Held' },
    };

    const statusInfo = statusMap[status] || { variant: 'outline', label: status };
    return (
      <Badge variant={statusInfo.variant as any}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customs Clearance</h1>
        <Button 
          variant="outline" 
          onClick={fetchCargoForClearance}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {cargoList.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Cargo Pending Clearance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">There are no cargo items requiring customs clearance at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cargo Requiring Clearance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ship</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargoList.map((cargo) => (
                  <TableRow key={cargo._id}>
                    <TableCell className="font-medium">
                      {cargo.berthing?.ship?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{cargo.description}</TableCell>
                    <TableCell className="capitalize">
                      {cargo.type?.replace('_', ' ') || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {cargo.quantity} {cargo.unit}
                    </TableCell>
                    <TableCell>{getStatusBadge(cargo.customsStatus)}</TableCell>
                    <TableCell>
                      {cargo.berthing?.arrivalDate
                        ? format(new Date(cargo.berthing.arrivalDate), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCargo(cargo);
                          setShowStatusDialog(true);
                        }}
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewHistory(cargo)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedCargo && (
        <>
          <UpdateStatusDialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
            cargo={selectedCargo}
            onUpdate={handleStatusUpdate}
          />
          <ViewHistoryDialog 
            open={historyDialogOpen} 
            onOpenChange={setHistoryDialogOpen}
            history={history}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default CustomsClearance;
