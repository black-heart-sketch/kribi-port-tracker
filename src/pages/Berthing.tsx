import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Anchor, Search, Plus, Clock, Ship, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Berthing = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const berthings = [
    {
      id: "BK-2024-158",
      ship: "MSC Marianna",
      agent: "J. Mballa",
      status: "pending",
      dock: "Dock A-1",
      arrivalDate: "2024-01-16 08:00",
      departureDate: "2024-01-17 16:00",
      cargoDetails: "2,400 TEU containers - Electronics, Textiles",
      submitted: "2024-01-15 14:30",
      documents: 3
    },
    {
      id: "BK-2024-157",
      ship: "Atlantic Pioneer",
      agent: "M. Kouam",
      status: "approved",
      dock: "Dock B-2",
      arrivalDate: "2024-01-15 16:45",
      departureDate: "2024-01-17 09:30",
      cargoDetails: "45,000 tons grain - Export to Nigeria",
      submitted: "2024-01-14 09:15",
      documents: 5,
      approvedBy: "Admin K. Ngolle",
      approvedAt: "2024-01-14 11:20"
    },
    {
      id: "BK-2024-156",
      ship: "Kribi Express",
      agent: "P. Fotso",
      status: "in_progress",
      dock: "Dock C-1",
      arrivalDate: "2024-01-14 11:20",
      departureDate: "2024-01-15 18:00",
      cargoDetails: "Mixed cargo - Machinery, Food products",
      submitted: "2024-01-13 16:45",
      documents: 4
    },
    {
      id: "BK-2024-155",
      ship: "Ocean Breeze",
      agent: "L. Simo",
      status: "rejected",
      dock: "N/A",
      arrivalDate: "2024-01-18 10:00",
      departureDate: "2024-01-19 14:00",
      cargoDetails: "Incomplete documentation",
      submitted: "2024-01-12 08:30",
      documents: 1,
      rejectedBy: "Admin K. Ngolle",
      rejectedAt: "2024-01-13 09:15",
      rejectionReason: "Missing cargo manifest and customs clearance"
    }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          color: 'bg-warning text-warning-foreground',
          icon: AlertCircle
        };
      case 'approved':
        return {
          label: 'Approved',
          color: 'bg-success text-success-foreground',
          icon: CheckCircle
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          color: 'bg-primary text-primary-foreground',
          icon: Clock
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: 'bg-destructive text-destructive-foreground',
          icon: XCircle
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-muted text-muted-foreground',
          icon: AlertCircle
        };
    }
  };

  const filteredBerthings = berthings.filter(berthing =>
    berthing.ship.toLowerCase().includes(searchTerm.toLowerCase()) ||
    berthing.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    berthing.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBerthingsByStatus = (status) => {
    return filteredBerthings.filter(berthing => berthing.status === status);
  };

  const BerthingCard = ({ berthing }) => {
    const statusInfo = getStatusInfo(berthing.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Card className="bg-card/60 backdrop-blur border-border/50 hover:bg-card/80 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-foreground">{berthing.id}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Ship className="w-4 h-4" />
                <span>{berthing.ship}</span>
                <span>•</span>
                <span>Agent: {berthing.agent}</span>
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Arrival</p>
              <p className="text-foreground font-medium">{berthing.arrivalDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Departure</p>
              <p className="text-foreground font-medium">{berthing.departureDate}</p>
            </div>
          </div>

          {/* Dock Assignment */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Assigned Dock</p>
            <p className="text-foreground font-medium">{berthing.dock}</p>
          </div>

          {/* Cargo Details */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Cargo Details</p>
            <p className="text-foreground text-sm">{berthing.cargoDetails}</p>
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Documents:</span>
              <span className="text-foreground font-medium">{berthing.documents} files</span>
            </div>
            <Button variant="outline" size="sm">
              View Documents
            </Button>
          </div>

          {/* Additional Info */}
          {berthing.status === 'approved' && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-success">
                Approved by {berthing.approvedBy} on {berthing.approvedAt}
              </p>
            </div>
          )}

          {berthing.status === 'rejected' && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive mb-1">
                Rejected by {berthing.rejectedBy} on {berthing.rejectedAt}
              </p>
              <p className="text-xs text-muted-foreground">
                Reason: {berthing.rejectionReason}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-3 border-t border-border/30">
            <Button variant="outline" size="sm" className="flex-1">
              View Details
            </Button>
            {berthing.status === 'pending' && (
              <>
                <Button size="sm" className="bg-success text-success-foreground">
                  Approve
                </Button>
                <Button variant="destructive" size="sm">
                  Reject
                </Button>
              </>
            )}
            {berthing.status === 'approved' && (
              <Button variant="outline" size="sm">
                Modify
              </Button>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground pt-2">
            Submitted: {berthing.submitted}
          </p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Berthing Management</h1>
            <p className="text-muted-foreground">Track and manage vessel berthing requests</p>
          </div>
          <Button className="bg-gradient-wave mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            New Berthing Request
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search berthing requests by ID, ship name, or agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/60 backdrop-blur border-border/50"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/60 backdrop-blur">
            <TabsTrigger value="all">All ({filteredBerthings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getBerthingsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({getBerthingsByStatus('approved').length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({getBerthingsByStatus('in_progress').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getBerthingsByStatus('rejected').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredBerthings.map((berthing) => (
                <BerthingCard key={berthing.id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getBerthingsByStatus('pending').map((berthing) => (
                <BerthingCard key={berthing.id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getBerthingsByStatus('approved').map((berthing) => (
                <BerthingCard key={berthing.id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="in_progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getBerthingsByStatus('in_progress').map((berthing) => (
                <BerthingCard key={berthing.id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getBerthingsByStatus('rejected').map((berthing) => (
                <BerthingCard key={berthing.id} berthing={berthing} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {filteredBerthings.length === 0 && (
          <div className="text-center py-12">
            <Anchor className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No berthing requests found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Berthing;