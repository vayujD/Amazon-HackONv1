import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  CheckCircle,
  Bell,
  FileText,
  Shield,
} from "lucide-react";
import SellerRiskDashboard from "./seller-risk-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api.service";

const performanceData = [
  { month: "Jan", sales: 45000, violations: 2 },
  { month: "Feb", sales: 52000, violations: 1 },
  { month: "Mar", sales: 48000, violations: 3 },
  { month: "Apr", sales: 61000, violations: 0 },
  { month: "May", sales: 55000, violations: 1 },
  { month: "Jun", sales: 67000, violations: 2 },
];

const recentViolations = [
  { type: "Product Listing", description: "Misleading product title", date: "2024-01-14", status: "Resolved", severity: "Medium" },
  { type: "Review Policy", description: "Incentivized reviews detected", date: "2024-01-10", status: "Under Review", severity: "High" },
  { type: "Image Quality", description: "Low quality product images", date: "2024-01-08", status: "Resolved", severity: "Low" },
];

const realTimeAlerts = [
  { message: "Unusual spike in negative reviews for Product #12345", time: "5 min ago", type: "warning" },
  { message: "Your seller rating has improved to 4.8/5", time: "1 hour ago", type: "success" },
  { message: "New policy update: Review guidelines changed", time: "2 hours ago", type: "info" },
  { message: "Potential counterfeit report for Product #67890", time: "3 hours ago", type: "error" },
];

export function SellerDashboard() {
  const { user } = useAuth();
  const sellerId = (user as any)?.sellerId || (user as any)?.id || 'default-seller';

  // State for delivery violations count
  const [violationCount, setViolationCount] = useState<number | null>(null);
  const [loadingViolations, setLoadingViolations] = useState(false);
  const [violationError, setViolationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchViolations() {
      setLoadingViolations(true);
      setViolationError(null);
      try {
        const res = await apiService.getSellerDeliveryViolations(sellerId);
        setViolationCount(res.pagination?.total ?? 0);
      } catch (err: any) {
        setViolationError("Could not fetch violations");
        setViolationCount(null);
      } finally {
        setLoadingViolations(false);
      }
    }
    if (sellerId) fetchViolations();
  }, [sellerId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your performance, compliance, and receive real-time alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button className="bg-amazon-orange hover:bg-amazon-orange-dark">
            <Shield className="mr-2 h-4 w-4" />
            Request Review
          </Button>
        </div>
      </div>

      {/* Tabs for different dashboard views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Alert Banner */}
          <Alert className="border-warning bg-warning-light">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Action Required:</strong> You have 2 pending compliance issues that need attention. 
              Please review and resolve them within 5 days to maintain your seller status.
            </AlertDescription>
          </Alert>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Risk Score"
              value="Medium"
              icon={Shield}
              className="border-warning"
            />
            <StatsCard
              title="Policy Violations"
              value={loadingViolations ? "..." : violationCount !== null ? violationCount.toString() : "-"}
              icon={AlertTriangle}
              trend={{ value: -2, label: "from last month" }}
            />
            <StatsCard
              title="Review Trend"
              value="4.6/5"
              icon={TrendingUp}
              trend={{ value: 8, label: "from last month" }}
            />
            <StatsCard
              title="Compliance Score"
              value="87%"
              icon={CheckCircle}
              trend={{ value: 5, label: "from last month" }}
            />
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance & Violations Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="sales" fill="#22c55e" name="Sales ($)" />
                  <Line yAxisId="right" type="monotone" dataKey="violations" stroke="#ef4444" strokeWidth={2} name="Violations" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Real-time Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Real-Time Alerts
              </CardTitle>
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {realTimeAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-l-red-500 bg-red-50' :
                    alert.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    alert.type === 'success' ? 'border-l-green-500 bg-green-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                      <Badge variant={
                        alert.type === 'error' ? 'destructive' :
                        alert.type === 'warning' ? 'secondary' :
                        alert.type === 'success' ? 'default' :
                        'outline'
                      }>
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seller Response Section */}
          <Card>
            <CardHeader>
              <CardTitle>Required Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">Product Image Compliance</h3>
                      <p className="text-sm text-muted-foreground">
                        Update product images for 5 listings to meet quality standards
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Due: January 20, 2024</p>
                    </div>
                    <Button size="sm" className="bg-amazon-orange hover:bg-amazon-orange-dark">
                      Take Action
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">Review Policy Violation</h3>
                      <p className="text-sm text-muted-foreground">
                        Respond to policy violation regarding incentivized reviews
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Due: January 18, 2024</p>
                    </div>
                    <Button size="sm" variant="destructive">
                      Respond Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <SellerRiskDashboard sellerId={sellerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
