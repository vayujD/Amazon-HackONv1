
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { RoleBasedSidebar } from "@/components/layout/role-based-sidebar";
import { MarketplaceDashboard } from "@/components/dashboard/marketplace-dashboard";
import { AdminOperations } from "@/components/dashboard/admin-operations";
import { ReviewAnalytics } from "@/components/dashboard/review-analytics";
import { SellerDashboard } from "@/components/dashboard/seller-dashboard";
import { SellerManagement } from "@/components/dashboard/seller-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, TrendingUp } from "lucide-react";

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }

    // Set default tab based on user role
    if (userRole === 'seller') {
      setActiveTab("seller");
    } else if (userRole === 'admin') {
      setActiveTab("dashboard");
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon-orange mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect in useEffect
  }

  const renderContent = () => {
    // Sellers can only access the seller dashboard
    if (userRole === 'seller') {
      return <SellerDashboard />;
    }

    // Admins can access all admin screens
    if (userRole === 'admin') {
      switch (activeTab) {
        case "dashboard":
          return <MarketplaceDashboard />;
        case "admin":
          return <AdminOperations />;
        case "analytics":
          return <ReviewAnalytics />;
        case "seller-management":
          return <SellerManagement />;
        case "alerts":
          return (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Alert Management</h1>
                <p className="text-muted-foreground">
                  Manage and respond to marketplace integrity alerts
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">12</div>
                    <p className="text-xs text-muted-foreground">Requires immediate action</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                    <Bell className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">45</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <p className="text-xs text-muted-foreground">+15% from yesterday</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        default:
          return <MarketplaceDashboard />;
      }
    }

    return <div>Unauthorized access</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <RoleBasedSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
