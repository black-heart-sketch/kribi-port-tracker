import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export interface HistoryItem {
  _id: string;
  status: string;
  timestamp: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  details?: {
    notes?: string;
  };
  notes?: string;
}

interface ViewHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  isLoading?: boolean;
}

export default function ViewHistoryDialog({ 
  open, 
  onOpenChange, 
  history = [], 
  isLoading = false 
}: ViewHistoryDialogProps) {
  const formatStatus = (status: string) => {
    if (!status) return '';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Clearance History</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No history available
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(item.timestamp), 'MMM d, yyyy hh:mm a')}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'cleared' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'held' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formatStatus(item.status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.user?.name || 'System'}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.user?.email || ''}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.details?.notes || item.notes || 'No notes'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
