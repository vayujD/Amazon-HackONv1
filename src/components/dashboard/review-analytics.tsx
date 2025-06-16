
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Star,
  Eye,
  Download,
} from "lucide-react";

const reviewBurstData = [
  { date: "Jan 1", reviews: 45, fake: 12 },
  { date: "Jan 2", reviews: 52, fake: 8 },
  { date: "Jan 3", reviews: 48, fake: 15 },
  { date: "Jan 4", reviews: 61, fake: 22 },
  { date: "Jan 5", reviews: 55, fake: 18 },
  { date: "Jan 6", reviews: 67, fake: 25 },
  { date: "Jan 7", reviews: 59, fake: 14 },
];

const sentimentData = [
  { sentiment: "Very Positive", count: 45, color: "#22c55e" },
  { sentiment: "Positive", count: 32, color: "#84cc16" },
  { sentiment: "Neutral", count: 28, color: "#f59e0b" },
  { sentiment: "Negative", count: 15, color: "#ef4444" },
  { sentiment: "Very Negative", count: 8, color: "#dc2626" },
];

const transparencyData = [
  { metric: "Verified Purchase Rate", percentage: 87, status: "Good" },
  { metric: "Review Authenticity", percentage: 92, status: "Excellent" },
  { metric: "Reviewer Credibility", percentage: 78, status: "Fair" },
  { metric: "Review Timing Pattern", percentage: 65, status: "Needs Attention" },
];

const suspiciousPatterns = [
  { pattern: "Burst Reviews", detected: 23, products: 8, severity: "High" },
  { pattern: "Copy-Paste Reviews", detected: 45, products: 15, severity: "Medium" },
  { pattern: "Bot Activity", detected: 12, products: 5, severity: "Critical" },
  { pattern: "Fake Accounts", detected: 67, products: 22, severity: "High" },
];

export function ReviewAnalytics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Review Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics for review patterns, sentiment analysis, and fraud detection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Analytics
          </Button>
          <Button className="bg-amazon-orange hover:bg-amazon-orange-dark">
            <Eye className="mr-2 h-4 w-4" />
            Deep Analysis
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reviews Analyzed"
          value="1,234,567"
          icon={MessageSquare}
          trend={{ value: 15, label: "from last month" }}
        />
        <StatsCard
          title="Fake Reviews Detected"
          value="23,456"
          icon={AlertTriangle}
          trend={{ value: -8, label: "from last month" }}
        />
        <StatsCard
          title="Average Rating"
          value="4.2"
          icon={Star}
          trend={{ value: 2, label: "from last month" }}
        />
        <StatsCard
          title="Detection Accuracy"
          value="94.7%"
          icon={TrendingUp}
          trend={{ value: 3, label: "from last month" }}
        />
      </div>

      {/* Review Bursts Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Review Bursts Detection</CardTitle>
          <p className="text-sm text-muted-foreground">
            Daily review volume and fake review detection patterns
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={reviewBurstData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="reviews"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Total Reviews"
              />
              <Area
                type="monotone"
                dataKey="fake"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.8}
                name="Fake Reviews"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Analysis and Transparency */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Transparency Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transparencyData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.percentage}%</span>
                      <Badge variant={
                        item.status === 'Excellent' ? 'default' :
                        item.status === 'Good' ? 'secondary' :
                        item.status === 'Fair' ? 'secondary' :
                        'destructive'
                      }>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.percentage >= 90 ? 'bg-green-500' :
                        item.percentage >= 80 ? 'bg-yellow-500' :
                        item.percentage >= 70 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspicious Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Review Patterns Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {suspiciousPatterns.map((pattern, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{pattern.pattern}</h3>
                  <Badge variant={
                    pattern.severity === 'Critical' ? 'destructive' :
                    pattern.severity === 'High' ? 'destructive' :
                    'secondary'
                  }>
                    {pattern.severity}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Detected: {pattern.detected} instances</p>
                  <p>Products affected: {pattern.products}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
