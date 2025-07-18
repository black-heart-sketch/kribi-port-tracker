import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/dashboard.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  BarElement, 
  CategoryScale, 
  Chart as ChartJS, 
  Legend, 
  LinearScale, 
  Title, 
  Tooltip,
  ArcElement
} from 'chart.js';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { 
  Ship, 
  Anchor, 
  Package, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  Activity
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalShips: number;
  activeBerthings: number;
  totalCargo: number;
  totalUsers: number;
  cargoByStatus: { [key: string]: number };
  berthingsByMonth: { month: string; count: number }[];
  recentActivities: Array<{
    id: string;
    action: string;
    timestamp: string;
    status?: string;
    user?: {
      _id: string;
      name: string;
      email: string;
    };
    details?: {
      notes?: string;
    };
  }>;
}

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchOnWindowFocus: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const renderStatCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => {
    const IconComponent = React.cloneElement(icon as React.ReactElement, { 
      className: `h-4 w-4 text-${color}-600 dark:text-${color}-400` 
    });
    
    return (
      <Card className="flex-1 min-w-[200px]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-md bg-${color}-100 dark:bg-${color}-900/30`}>
            {IconComponent}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-3/4" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </CardContent>
      </Card>
    );
  };

  const cargoStatusChart = {
    labels: stats?.cargoByStatus ? Object.keys(stats.cargoByStatus).map(key => 
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    ) : [],
    datasets: [
      {
        label: 'Cargo Status',
        data: stats?.cargoByStatus ? Object.values(stats.cargoByStatus) : [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const berthingsChart = {
    labels: stats?.berthingsByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Berthings',
        data: stats?.berthingsByMonth?.map(item => item.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const ShipStatus = ({ status }: { status: string }) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', label: 'Pending' },
      in_progress: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200', label: 'In Progress' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', label: 'Completed' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', label: 'Cancelled' },
    };

    const statusInfo = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>Last updated: {format(new Date(), 'MMM d, yyyy hh:mm a')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {renderStatCard('Total Ships', stats?.totalShips?.toString() || '0', <Ship />, 'indigo')}
        {renderStatCard('Active Berthings', stats?.activeBerthings?.toString() || '0', <Anchor />, 'blue')}
        {renderStatCard('Total Cargo', stats?.totalCargo?.toString() || '0', <Package />, 'emerald')}
        {renderStatCard('Total Users', stats?.totalUsers?.toString() || '0', <Users />, 'amber')}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cargo Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Pie data={cargoStatusChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berthings by Month</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <Bar data={berthingsChart} options={chartOptions} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => {
                const status = activity.status || '';
                const statusDisplay = status
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 mb-4">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary flex-shrink-0">
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : status === 'in_progress' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{activity.action}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {format(new Date(activity.timestamp), 'MMM d, hh:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground truncate">
                          By {activity.user?.name || 'System'}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : status === 'in_progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {statusDisplay}
                        </span>
                      </div>
                      {activity.details?.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {activity.details.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent activities</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
