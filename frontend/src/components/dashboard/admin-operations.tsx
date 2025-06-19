
import { StatsCard } from "@/components/ui/stats-card";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const operationsData = [
  { category: "Electronics", riskscore: "High", region: "US-East", actions: "Suspend", flagged: 45 },
  { category: "Clothing", riskscore: "Medium", region: "EU-West", actions: "Review", flagged: 23 },
  { category: "Books", riskscore: "Low", region: "US-West", actions: "Monitor", flagged: 8 },
  { category: "Home", riskscore: "High", region: "Asia", actions: "Suspend", flagged: 67 },
];

const flaggedProducts = [
  { name: "iPhone 14 Clone", seller: "TechDeals99", reason: "Counterfeit", status: "Under Review", date: "2024-01-15" },
  { name: "Fake Rolex Watch", seller: "LuxuryItems", reason: "Trademark Violation", status: "Suspended", date: "2024-01-14" },
  { name: "Knockoff Nike Shoes", seller: "ShoesPlus", reason: "Copyright Infringement", status: "Pending", date: "2024-01-13" },
  { name: "Copied AirPods", seller: "AudioWorld", reason: "Counterfeit", status: "Resolved", date: "2024-01-12" },
];

const flaggedSellers = [
  { name: "TechDeals99", violations: 15, joindate: "2023-12-01", status: "Suspended", riskscore: "High" },
  { name: "LuxuryItems", violations: 8, joindate: "2023-11-15", status: "Under Review", riskscore: "High" },
  { name: "ShoesPlus", violations: 3, joindate: "2024-01-05", status: "Active", riskscore: "Medium" },
  { name: "AudioWorld", violations: 12, joindate: "2023-10-20", status: "Flagged", riskscore: "High" },
];

const flaggedReviews = [
  { product: "iPhone 14 Pro", reviewer: "john_smith", reason: "Fake Review Pattern", status: "Removed", date: "2024-01-15" },
  { product: "Samsung Galaxy", reviewer: "review_bot_1", reason: "Bot Activity", status: "Under Review", date: "2024-01-14" },
  { product: "MacBook Air", reviewer: "fake_user_99", reason: "Suspicious Activity", status: "Flagged", date: "2024-01-13" },
];

export function AdminOperations() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Operations Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage marketplace violations and take enforcement actions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="bg-amazon-orange hover:bg-amazon-orange-dark">
            <Shield className="mr-2 h-4 w-4" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Violations"
          value="234"
          icon={AlertTriangle}
          trend={{ value: -8, label: "from yesterday" }}
        />
        <StatsCard
          title="Cases Resolved"
          value="1,456"
          icon={CheckCircle}
          trend={{ value: 15, label: "this week" }}
        />
        <StatsCard
          title="Pending Reviews"
          value="89"
          icon={Clock}
          trend={{ value: 5, label: "from yesterday" }}
        />
        <StatsCard
          title="Suspended Accounts"
          value="67"
          icon={XCircle}
          trend={{ value: 12, label: "this month" }}
        />
      </div>

      {/* Operations Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Operations Dashboard</CardTitle>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by category, region..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
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
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="us-east">US-East</SelectItem>
                <SelectItem value="us-west">US-West</SelectItem>
                <SelectItem value="eu-west">EU-West</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            title=""
            columns={["Category", "Risk Score", "Region", "Actions", "Flagged"]}
            data={operationsData}
          />
        </CardContent>
      </Card>

      {/* Flagged Content Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable
          title="Flagged Products"
          columns={["Name", "Seller", "Reason", "Status", "Date"]}
          data={flaggedProducts}
        />
        <DataTable
          title="Flagged Sellers"
          columns={["Name", "Violations", "Join Date", "Status", "Risk Score"]}
          data={flaggedSellers}
        />
      </div>

      {/* Flagged Reviews */}
      <DataTable
        title="Flagged Reviews"
        columns={["Product", "Reviewer", "Reason", "Status", "Date"]}
        data={flaggedReviews}
      />
    </div>
  );
}
