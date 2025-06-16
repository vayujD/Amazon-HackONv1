
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const sellerSummaryData = [
  { name: "TechStore123", riskscore: "High", verified: "No", joindate: "2023-12-01", violations: 15, revenue: "$125K" },
  { name: "ShoesWorld", riskscore: "Medium", verified: "Yes", joindate: "2023-11-15", violations: 5, revenue: "$89K" },
  { name: "ElectroHub", riskscore: "Low", verified: "Yes", joindate: "2024-01-05", violations: 1, revenue: "$156K" },
  { name: "AppleDeals", riskscore: "High", verified: "No", joindate: "2023-10-20", violations: 22, revenue: "$98K" },
  { name: "FashionPlus", riskscore: "Medium", verified: "Yes", joindate: "2023-09-15", violations: 8, revenue: "$112K" },
];

const recentViolations = [
  { seller: "TechStore123", violation: "Counterfeit Products", date: "2024-01-15", action: "Suspended" },
  { seller: "AppleDeals", violation: "Fake Reviews", date: "2024-01-14", action: "Warning Issued" },
  { seller: "FashionPlus", violation: "Misleading Descriptions", date: "2024-01-13", action: "Under Review" },
  { seller: "GadgetWorld", violation: "Price Manipulation", date: "2024-01-12", action: "Flagged" },
];

const riskDistribution = [
  { risk: "Low", count: 145, color: "#22c55e" },
  { risk: "Medium", count: 89, color: "#f59e0b" },
  { risk: "High", count: 34, color: "#ef4444" },
  { risk: "Critical", count: 12, color: "#dc2626" },
];

export function SellerManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller-Specific Customer Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive seller management and risk assessment platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button className="bg-amazon-orange hover:bg-amazon-orange-dark">
            <UserCheck className="mr-2 h-4 w-4" />
            Bulk Verify
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sellers"
          value="1,234"
          icon={Users}
          trend={{ value: 12, label: "from last month" }}
        />
        <StatsCard
          title="Verified Sellers"
          value="987"
          icon={UserCheck}
          trend={{ value: 8, label: "from last month" }}
        />
        <StatsCard
          title="High Risk Sellers"
          value="46"
          icon={AlertTriangle}
          trend={{ value: -15, label: "from last month" }}
        />
        <StatsCard
          title="Monthly Growth"
          value="5.2%"
          icon={TrendingUp}
          trend={{ value: 2, label: "from last month" }}
        />
      </div>

      {/* Risk Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="risk" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF9900" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Seller Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Summary</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sellers..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title=""
            columns={["Name", "Risk Score", "Verified", "Join Date", "Violations", "Revenue"]}
            data={sellerSummaryData}
          />
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <DataTable
        title="Recent Violations"
        columns={["Seller", "Violation", "Date", "Action"]}
        data={recentViolations}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          View Detailed Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <UserX className="h-4 w-4" />
          Bulk Suspend
        </Button>
        <Button className="bg-amazon-orange hover:bg-amazon-orange-dark flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
        </Button>
      </div>
    </div>
  );
}
