import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Ship, Anchor, Clock, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Berthing, berthingService } from '@/services/berthing.service';

export default function CurrentBerthings() {
  const [berthings, setBerthings] = useState<Berthing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBerthings = async () => {
      try {
        setIsLoading(true);
        const response = await berthingService.getBerthings();
        console.log('response', response);
        
        // Filter out rejected and cancelled berthings
        const activeBerthings = response.filter(
          (berthing) => berthing.status !== 'rejected' && berthing.status !== 'cancelled'
        );
        
        console.log('filtered response', activeBerthings.length);
        setBerthings(activeBerthings);
      } catch (error) {
        console.error('Error fetching berthings:', error);
        // Set empty array on error to prevent undefined errors
        setBerthings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerthings();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-green-500 hover:bg-green-600">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Completed</Badge>;
      case 'rejected':
      case 'cancelled':
        return <Badge variant="destructive">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy HH:mm');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Current Berthings</h1>
          <p className="text-muted-foreground">View all current and upcoming vessel berthings</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Berthing Schedule</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vessel</TableHead>
                  <TableHead>IMO Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Dock</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {berthings.length > 0 ? (
                  berthings.map((berthing) => (
                    <TableRow key={berthing._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Ship className="h-4 w-4 text-muted-foreground" />
                          {typeof berthing.ship === 'string' ? berthing.ship : berthing.ship?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Anchor className="h-4 w-4 text-muted-foreground" />
                          {typeof berthing.ship === 'string' ? 'N/A' : berthing.ship?.imoNumber || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(berthing.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(berthing.arrivalDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(berthing.departureDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {typeof berthing.dock === 'string' ? berthing.dock : berthing.dock?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {berthing.cargoDetails?.[0]?.type || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {berthing.cargoDetails?.[0]?.weight 
                          ? `${berthing.cargoDetails[0].weight} ${berthing.cargoDetails[0].unit || 'tons'}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => berthing._id && navigate(`/berthing/${berthing._id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No berthings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
