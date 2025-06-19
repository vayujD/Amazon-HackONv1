
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  Flag,
  Star,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", flagged: 45, resolved: 38 },
  { month: "Feb", flagged: 52, resolved: 41 },
  { month: "Mar", flagged: 48, resolved: 44 },
  { month: "Apr", flagged: 61, resolved: 52 },
  { month: "May", flagged: 55, resolved: 48 },
  { month: "Jun", flagged: 67, resolved: 58 },
];

const categoryData = [
  { name: "Electronics", value: 35, color: "#FF9900" },
  { name: "Clothing", value: 25, color: "#232F3E" },
  { name: "Home & Garden", value: 20, color: "#146EB4" },
  { name: "Books", value: 12, color: "#22c55e" },
  { name: "Other", value: 8, color: "#f59e0b" },
];

const topProducts = [
  { name: "iPhone 14 Pro", seller: "TechStore123", risk: "High", flagged: "Yes", reports: 45 },
  { name: "Nike Air Max", seller: "ShoesWorld", risk: "Medium", flagged: "No", reports: 12 },
  { name: "Samsung TV 55\"", seller: "ElectroHub", risk: "Low", flagged: "No", reports: 3 },
  { name: "MacBook Pro", seller: "AppleDeals", risk: "High", flagged: "Yes", reports: 67 },
];

const topSellers = [
  { name: "TechStore123", risk: "High", violations: 15, revenue: "$125K", status: "Flagged" },
  { name: "ShoesWorld", risk: "Medium", violations: 5, revenue: "$89K", status: "Active" },
  { name: "ElectroHub", risk: "Low", violations: 1, revenue: "$156K", status: "Verified" },
  { name: "AppleDeals", risk: "High", violations: 22, revenue: "$98K", status: "Flagged" },
];

const recentAlerts = [
  { type: "Product", message: "Suspicious review pattern detected for iPhone 14 Pro", severity: "High", time: "2 min ago" },
  { type: "Seller", message: "New seller with high-risk indicators", severity: "Medium", time: "15 min ago" },
  { type: "Review", message: "Fake review cluster identified", severity: "High", time: "1 hour ago" },
  { type: "Product", message: "Counterfeit product reported", severity: "Critical", time: "2 hours ago" },
];

export function MarketplaceDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of marketplace integrity and fraud detection
          </p>
        </div>
        <Button className="bg-amazon-orange hover:bg-amazon-orange-dark">
          <Flag className="mr-2 h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products Monitored"
          value="1,234,567"
          icon={Package}
          trend={{ value: 12, label: "from last month" }}
        />
        <StatsCard
          title="Active Sellers"
          value="45,678"
          icon={Users}
          trend={{ value: -2, label: "from last month" }}
        />
        <StatsCard
          title="Flagged Items"
          value="892"
          icon={AlertTriangle}
          trend={{ value: 8, label: "from last week" }}
        />
        <StatsCard
          title="Resolution Rate"
          value="94.2%"
          icon={TrendingUp}
          trend={{ value: 3, label: "from last month" }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Flagged vs Resolved Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="flagged" fill="#ef4444" name="Flagged" />
                <Bar dataKey="resolved" fill="#22c55e" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products and Sellers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable
          title="Top Flagged Products"
          columns={["Name", "Seller", "Risk", "Flagged", "Reports"]}
          data={topProducts}
        />
        <DataTable
          title="Top Sellers by Risk"
          columns={["Name", "Risk", "Violations", "Revenue", "Status"]}
          data={topSellers}
        />
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    alert.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                    alert.severity === 'High' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.type} • {alert.time}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  alert.severity === 'Critical' ? 'destructive' :
                  alert.severity === 'High' ? 'destructive' :
                  'secondary'
                }>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
