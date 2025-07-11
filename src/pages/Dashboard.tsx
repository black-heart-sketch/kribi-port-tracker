import DashboardStats from '@/components/DashboardStats';
import ShipStatus from '@/components/ShipStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, Users, FileText, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const notifications = [
    {
      type: "urgent",
      message: "New berthing request from MSC Felicia requires immediate approval",
      time: "2 minutes ago",
      icon: AlertTriangle
    },
    {
      type: "info",
      message: "Atlantic Pioneer has completed cargo loading operations",
      time: "15 minutes ago",
      icon: FileText
    },
    {
      type: "warning",
      message: "Dock B-3 maintenance scheduled for tomorrow 06:00",
      time: "1 hour ago",
      icon: Calendar
    }
  ];

  const recentActivity = [
    "Maritime Agent J. Mballa submitted berthing request #BK-2024-158",
    "Administrator approved berthing for Kribi Express",
    "Customs Broker updated status for 3 cargo containers",
    "New user registration: Cargo Owner - SOCAPALM Ltd",
    "Document uploaded for MSC Marianna berthing"
  ];

  return (
    <div className="min-h-screen bg-gradient-ocean">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Port Authority Dashboard</h1>
            <p className="text-muted-foreground">Real-time port operations overview</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-primary text-primary-foreground">3</Badge>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ship Status - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ShipStatus />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Alerts</span>
                </CardTitle>
                <CardDescription>Important port notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification, index) => {
                  const Icon = notification.icon;
                  const typeColors = {
                    urgent: "text-destructive",
                    warning: "text-warning",
                    info: "text-primary"
                  };
                  
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <Icon className={`w-4 h-4 mt-0.5 ${typeColors[notification.type]}`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
                      {activity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/60 backdrop-blur border-border/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common port operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-wave">
                  New Berthing Request
                </Button>
                <Button variant="outline" className="w-full">
                  View All Ships
                </Button>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;