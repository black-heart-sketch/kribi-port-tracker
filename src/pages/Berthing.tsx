import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/config/axios.config';
import * as Toast from '@radix-ui/react-toast';
import { X, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Anchor, Search, Plus, Clock, Ship, FileText, CheckCircle, XCircle, AlertCircle, Upload, Calendar as CalendarIcon } from 'lucide-react';
import shipService from '@/services/ships.service';
import dockService from '@/services/dock.service';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import berthingService from '@/services/berthing.service';
import userService from '@/services/user.service';

const Berthing = () => {
  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState({ title: '', description: '' });
  
  // Data State
  const [berthings, setBerthings] = useState<any[]>([]);
  const [ships, setShips] = useState<Array<{_id: string, name: string, imoNumber: string}>>([]);
  const [docks, setDocks] = useState<Array<{_id: string, name: string, status: string}>>([]);
  const [cargoOwners, setCargoOwners] = useState<Array<{_id: string, name: string, email: string}>>([]);
  const [filteredCargoOwners, setFilteredCargoOwners] = useState<Array<{_id: string, name: string, email: string}>>([]);
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch berthings on component mount
  useEffect(() => {
    const fetchBerthings = async () => {
      try {
        setIsLoading(true);
        const response = await berthingService.getBerthings();
        // console.log(response)
        setBerthings(response);
      } catch (err) {
        console.error('Error fetching berthings:', err);
        setError('Failed to load berthing data');
        setToastMessage({
          title: 'Error',
          description: 'Failed to load berthing data. Please try again.'
        });
        setOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBerthings();
  }, []);

  // Handle successful form submission
  const handleSubmissionSuccess = async () => {
    try {
      const response = await berthingService.getBerthings();
      setBerthings(response);
      setIsDialogOpen(false);
      setToastMessage({
        title: 'Success',
        description: 'Berthing request submitted successfully!'
      });
      setOpen(true);
    } catch (err) {
      console.error('Error refreshing berthings:', err);
      setToastMessage({
        title: 'Error',
        description: 'Berthing submitted but failed to refresh the list.'
      });
      setOpen(true);
    }
  };

  // Generate time slots (every 30 minutes from 8:00 to 18:00)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        options.push({
          label: time,
          value: time
        });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();
  
  // Helper function to format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select date';
    return format(date, 'PPP'); // e.g., "April 1st, 2023"
  };

  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    ship: '', // Will store ship ID
    dock: '', // Will store dock ID
    arrivalDate: {
      date: undefined as Date | undefined,
      time: '08:00'
    },
    departureDate: {
      date: undefined as Date | undefined,
      time: '17:00'
    },
    cargoDetails: [{
      description: '',
      type: '',
      weight: '',
      quantity: 1,
      unit: 'TEU',
      notes: '',
      cargoOwnerId: '',
      cargoOwnerName: ''
    }],
    documents: [] as File[],
    specialRequirements: ''
  });
  

  
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOwnerDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter cargo owners based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCargoOwners(cargoOwners);
    } else {
      const filtered = cargoOwners.filter(owner =>
        owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owner.email && owner.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCargoOwners(filtered);
    }
  }, [searchTerm, cargoOwners]);

  // Fetch ships, docks, and cargo owners on dialog open
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch available ships
        const shipsRes = await shipService.getAvailableShips();
        setShips(shipsRes);
        
        // Fetch available docks
        const docksRes = await dockService.getAvailableDocks();
        console.log(docksRes);
        setDocks(docksRes);

        // Fetch cargo owners
        const response = await userService.getUsers();
        console.log('here are the fetched users', response)
        const cargoOwners = response.filter(user => user.role === 'cargo_owner');
        console.log(cargoOwners)
        setCargoOwners(cargoOwners);
        setFilteredCargoOwners(cargoOwners);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);
  
  // Reset form when dialog is closed
  useEffect(() => {
    if (!isDialogOpen) {
      setFormData({
        ship: '',
        dock: '',
        arrivalDate: {
          date: undefined,
          time: '08:00'
        },
        departureDate: {
          date: undefined,
          time: '17:00'
        },
        cargoDetails: [{
          description: '',
          type: '',
          weight: '',
          quantity: 1,
          unit: 'TEU',
          notes: '',
          cargoOwnerId: '',
          cargoOwnerName: ''
        }],
        documents: [],
        specialRequirements: ''
      });
      setSearchTerm('');
      setFilteredCargoOwners(cargoOwners);
    }
  }, [isDialogOpen, cargoOwners]);
  
  const addCargoItem = () => {
    setFormData(prev => ({
      ...prev,
      cargoDetails: [
        ...prev.cargoDetails,
        {
          description: '',
          type: '',
          weight: '',
          quantity: 1,
          unit: 'TEU',
          notes: '',
          cargoOwnerId: '',
          cargoOwnerName: ''
        }
      ]
    }));
  };
  
  const removeCargoItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cargoDetails: prev.cargoDetails.filter((_, i) => i !== index)
    }));
  };
  
  const handleCargoChange = (index: number, fieldOrUpdates: string | Record<string, any>, value?: any) => {
    // If fieldOrUpdates is a string, it's the field name and value is the value
    // Otherwise, it's an object of updates
    const updates = typeof fieldOrUpdates === 'string' 
      ? { [fieldOrUpdates]: value }
      : fieldOrUpdates;
      
    console.log(`Updating cargo ${index} with:`, updates);
    
    setFormData(prev => {
      const updatedCargo = [...prev.cargoDetails];
      updatedCargo[index] = { 
        ...updatedCargo[index],
        ...updates 
      };
      
      console.log('After update:', updatedCargo[index]);
      
      return {
        ...prev,
        cargoDetails: updatedCargo
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.arrivalDate.date || !formData.departureDate.date) {
      setToastMessage({
        title: 'Error',
        description: 'Please select both arrival and departure dates.'
      });
      setOpen(true);
      return;
    }
    
    // Check if departure is after arrival
    if (formData.departureDate.date <= formData.arrivalDate.date) {
      setToastMessage({
        title: 'Error',
        description: 'Departure date must be after arrival date.'
      });
      setOpen(true);
      return;
    }
    
    try {
      // Format dates for submission
      const formatForBackend = (date: Date) => {
        return format(date, 'yyyy-MM-dd');
      };
      
      const arrivalDateStr = formatForBackend(formData.arrivalDate.date);
      const departureDateStr = formatForBackend(formData.departureDate.date);
      
      const arrivalDateTime = `${arrivalDateStr}T${formData.arrivalDate.time}:00.000Z`;
      const departureDateTime = `${departureDateStr}T${formData.departureDate.time}:00.000Z`;
      
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Prepare the berthing data
      const berthingData = {
        ship: formData.ship,
        dock: formData.dock,
        arrivalDate: arrivalDateTime,
        departureDate: departureDateTime,
        specialRequirements: formData.specialRequirements || '',
        cargoDetails: formData.cargoDetails.map(cargo => ({
          ...cargo,
          cargoOwnerId: cargo.cargoOwnerId,
          cargoOwnerName: cargo.cargoOwnerName
        })),
        createdBy: user?.id || ''
      };
      
      console.log('Submitting cargo details:', berthingData.cargoDetails);

      // Add all fields to formData
      Object.entries(berthingData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'cargoDetails') {
            // Stringify array fields
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            // Handle other fields
            formDataToSend.append(key, value as string);
          }
        }
      });
      
      // Add files if any
      formData.documents.forEach((file) => {
        formDataToSend.append('documents', file);
      });
      
      // Submit the form with FormData
      await berthingService.createBerthing(formDataToSend);
      
      // Refresh the berthings list and handle success
      await handleSubmissionSuccess();
      
    } catch (error) {
      console.error('Error submitting berthing request:', error);
      setToastMessage({
        title: 'Error',
        description: 'Failed to submit berthing request. Please try again.'
      });
      setOpen(true);
    }
  };

  // Using berthings state from API

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

  const filteredBerthings = berthings.filter(berthing => {
    const shipName = typeof berthing.ship === 'object' ? berthing.ship?.name : berthing.ship;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (shipName?.toLowerCase()?.includes(searchLower) || false) ||
      (berthing.agent?.toLowerCase()?.includes(searchLower) || false) ||
      (berthing.id?.toLowerCase()?.includes(searchLower) || false)
    );
  });

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
              <CardTitle className="text-lg text-foreground">
                {berthing.ship?.name || 'N/A'}
              </CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Ship className="w-4 h-4" />
                <span>IMO: {berthing.ship?.imoNumber || 'N/A'}</span>
                <span>•</span>
                <span>Type: {berthing.ship?.type || 'N/A'}</span>
              </CardDescription>
            </div>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Ship Information */}
          <div className="p-3 bg-muted/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Ship Information</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p><span className="font-medium">Company:</span> {berthing.ship?.company || 'N/A'}</p>
                <p><span className="font-medium">Flag:</span> {berthing.ship?.flag || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p><span className="font-medium">Length:</span> {berthing.ship?.length || 'N/A'}m</p>
                <p><span className="font-medium">Gross Tonnage:</span> {berthing.ship?.grossTonnage || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Dock Information */}
          <div className="p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Assigned Dock</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="font-medium">{berthing.dock?.name || 'N/A'}</p>
                <p className="text-muted-foreground text-xs">{berthing.dock?.location || 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">
                  <span className="text-muted-foreground">Max Draft: </span>
                  {berthing.dock?.maxDraft || 'N/A'}m
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  <span className="capitalize">{berthing.dock?.status || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Arrival</p>
              <p className="text-foreground font-medium">
                {new Date(berthing.arrivalDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Departure</p>
              <p className="text-foreground font-medium">
                {new Date(berthing.departureDate).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Cargo Details */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Cargo Details</p>
            <div className="space-y-2">
              {Array.isArray(berthing.cargoDetails) ? (
                berthing.cargoDetails.map((cargo, index) => (
                  <div key={cargo._id || index} className="p-2 bg-muted/20 rounded text-sm">
                    <p className="font-medium">{cargo.description || 'Cargo Item'}</p>
                    <p>Type: {cargo.type}</p>
                    <p>Weight: {cargo.weight} {cargo.unit}</p>
                    <p>Quantity: {cargo.quantity}</p>
                    {cargo.cargoOwnerId && <p>Owner ID: {cargo.cargoOwnerId}</p>}
                    {cargo.notes && <p className="text-muted-foreground">Notes: {cargo.notes}</p>}
                  </div>
                ))
              ) : (
                <p className="text-foreground text-sm">No cargo details available</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Documents:</span>
              <span className="text-foreground font-medium">
                {Array.isArray(berthing.documents) ? `${berthing.documents.length} files` : 'No files'}
              </span>
            </div>
            {Array.isArray(berthing.documents) && berthing.documents.length > 0 && (
              <Button variant="outline" size="sm">
                View Documents
              </Button>
            )}
          </div>

          {/* Additional Info */}
          {berthing.status === 'approved' && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-success">
                Approved by {berthing.approvedBy?.name || 'Unknown'} on {new Date(berthing.approvedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {berthing.status === 'rejected' && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive mb-1">
                Rejected by {berthing.rejectedBy?.name || 'Unknown'} on {new Date(berthing.rejectedAt).toLocaleDateString()}
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
              <Button size="sm" className="bg-success text-success-foreground">
                send notification
              </Button>
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
    <Toast.Provider>
      <div className="min-h-screen bg-gradient-ocean">
        <div className="container mx-auto p-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Berthing Management</h1>
              <p className="text-muted-foreground">Track and manage vessel berthing requests</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Berthing Request</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to submit a new berthing request.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ship">Select Vessel *</Label>
                      <Select
                        value={formData.ship}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, ship: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vessel" />
                        </SelectTrigger>
                        <SelectContent>
                          {ships.map((ship) => (
                            <SelectItem key={ship._id} value={ship._id}>
                              {ship.name} (IMO: {ship.imoNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="px-0 text-sm"
                        onClick={() => {
                          // TODO: Open a dialog to add a new ship
                          console.log('Open add ship dialog');
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add New Vessel
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dock">Select Dock *</Label>
                      <Select
                        value={formData.dock}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, dock: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a dock" />
                        </SelectTrigger>
                        <SelectContent>
                          {docks.map((dock) => (
                            <SelectItem 
                              key={dock._id} 
                              value={dock._id}
                              disabled={dock.status !== 'available'}
                            >
                              {dock.name} {dock.status !== 'available' ? '(Unavailable)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Arrival *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${!formData.arrivalDate.date ? 'text-muted-foreground' : ''}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.arrivalDate.date ? formatDate(formData.arrivalDate.date) : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.arrivalDate.date}
                              onSelect={(date) => setFormData(prev => ({
                                ...prev,
                                arrivalDate: { ...prev.arrivalDate, date: date || undefined }
                              }))}
                              initialFocus
                              disabled={(date) => {
                                // Disable dates before today
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={formData.arrivalDate.time}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            arrivalDate: { ...prev.arrivalDate, time: value }
                          }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Departure *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal ${!formData.departureDate.date ? 'text-muted-foreground' : ''}`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.departureDate.date ? formatDate(formData.departureDate.date) : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.departureDate.date}
                              onSelect={(date) => setFormData(prev => ({
                                ...prev,
                                departureDate: { ...prev.departureDate, date: date || undefined }
                              }))}
                              initialFocus
                              disabled={(date) => {
                                // Disable dates before the selected arrival date or today
                                const minDate = formData.arrivalDate.date || new Date();
                                return date < minDate;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <Select
                          value={formData.departureDate.time}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            departureDate: { ...prev.departureDate, time: value }
                          }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Cargo Details *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCargoItem}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Cargo
                      </Button>
                    </div>
                    
                    {formData.cargoDetails.map((cargo, index) => (
                      <div key={index} className="space-y-3 p-4 border rounded-lg relative">
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => removeCargoItem(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input
                              value={cargo.description}
                              onChange={(e) => handleCargoChange(index, 'description', e.target.value)}
                              placeholder="Cargo description"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2 relative" ref={index === 0 ? dropdownRef : null}>
                            <Label>Cargo Owner *</Label>
                            <div className="relative">
                              <div 
                                className="flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-pointer"
                                onClick={() => setIsOwnerDropdownOpen(isOwnerDropdownOpen === index ? null : index)}
                              >
                                <span className={cargo.cargoOwnerId ? 'text-foreground' : 'text-muted-foreground'}>
                                  {cargo.cargoOwnerName || 'Select cargo owner'}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </div>
                              {isOwnerDropdownOpen === index && (
                                <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground shadow-lg rounded-md border border-border overflow-auto max-h-60">
                                  <div className="p-2 border-b border-border">
                                    <Input
                                      placeholder="Search cargo owner..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="h-8"
                                    />
                                  </div>
                                  <div className="py-1">
                                    {filteredCargoOwners.length > 0 ? (
                                      filteredCargoOwners.map((owner) => {
                                        console.log('Owner object:', owner);
                                        return (
                                          <div
                                            key={owner._id || owner.id}
                                            className={`px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between ${cargo.cargoOwnerId === (owner._id || owner.id) ? 'bg-accent' : ''}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const ownerId = owner._id || owner.id;
                                              console.log('Setting cargo owner:', { ownerId, name: owner.name });
                                              handleCargoChange(index, {
                                                cargoOwnerId: ownerId,
                                                cargoOwnerName: owner.name
                                              });
                                              setSearchTerm('');
                                              setIsOwnerDropdownOpen(null);
                                            }}
                                          >
                                            <div>
                                              <div className="font-medium">{owner.name}</div>
                                              {owner.email && (
                                                <div className="text-xs text-muted-foreground">{owner.email}</div>
                                              )}
                                            </div>
                                            {cargo.cargoOwnerId === (owner._id || owner.id) && (
                                              <Check className="h-4 w-4 text-primary" />
                                            )}
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="px-4 py-2 text-sm text-muted-foreground">
                                        No cargo owners found
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Type *</Label>
                            <Select
                              value={cargo.type}
                              onValueChange={(value) => handleCargoChange(index, 'type', value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select cargo type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="container">Container</SelectItem>
                                <SelectItem value="bulk">Bulk Cargo</SelectItem>
                                <SelectItem value="liquid">Liquid Cargo</SelectItem>
                                <SelectItem value="roro">Ro-Ro</SelectItem>
                                <SelectItem value="break_bulk">Break Bulk</SelectItem>
                                <SelectItem value="neobulk">Neo Bulk</SelectItem>
                                <SelectItem value="project_cargo">Project Cargo</SelectItem>
                                <SelectItem value="hazardous">Hazardous</SelectItem>
                                <SelectItem value="reefer">Reefer</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Weight (tons) *</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={cargo.weight}
                              onChange={(e) => handleCargoChange(index, 'weight', e.target.value)}
                              placeholder="Weight in tons"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={cargo.quantity}
                                onChange={(e) => handleCargoChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-20"
                              />
                              <Select
                                value={cargo.unit}
                                onValueChange={(value) => handleCargoChange(index, 'unit', value)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="TEU">TEU</SelectItem>
                                  <SelectItem value="FEU">FEU</SelectItem>
                                  <SelectItem value="tons">Tons</SelectItem>
                                  <SelectItem value="cbm">Cubic Meters</SelectItem>
                                  <SelectItem value="units">Units</SelectItem>
                                  <SelectItem value="barrels">Barrels</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2 md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={cargo.notes}
                              onChange={(e) => handleCargoChange(index, 'notes', e.target.value)}
                              placeholder="Additional notes about this cargo"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Documents</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop files here, or click to select
                        </p>
                        <Input
                          id="documents"
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => document.getElementById('documents')?.click()}
                        >
                          Select Files
                        </Button>
                      </div>
                    </div>

                    {formData.documents.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialRequirements">Special Requirements</Label>
                    <Textarea
                      id="specialRequirements"
                      name="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      placeholder="Any special requirements or additional information..."
                      rows={2}
                    />
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                      {error}
                    </div>
                  )}

                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !formData.ship || !formData.dock || !formData.arrivalDate.date || !formData.departureDate.date}
                    >
                      {isLoading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
      <Toast.Viewport className="fixed bottom-0 right-0 p-4 w-full max-w-sm z-50" />
      
      <Toast.Root 
        className="bg-white rounded-md shadow-lg p-4 border border-gray-200 relative pr-10"
        open={open} 
        onOpenChange={setOpen}
      >
        <Toast.Title className="font-medium text-gray-900">
          {toastMessage.title}
        </Toast.Title>
        <Toast.Description className="text-gray-700 mt-1">
          {toastMessage.description}
        </Toast.Description>
        <Toast.Action asChild altText="Close">
          <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </Toast.Action>
      </Toast.Root>
    </Toast.Provider>
  );
};

export default Berthing;