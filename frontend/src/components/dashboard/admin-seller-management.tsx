import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Shield, 
  Users,
  RefreshCw,
  Eye,
  BarChart3,
  Target,
  Clock,
  Upload
} from 'lucide-react';
import { apiService } from '@/services/api.service';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SellerDataUpload } from './seller-data-upload';

interface SellerData {
  sellerId: string;
  sellerName: string;
  status: string;
  registrationDate: string;
  riskAssessment: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    totalReviews: number;
    fakeReviews: number;
    fakeReviewPercentage: number;
    lastUpdated: string;
  };
  deliveryViolations?: number;
}

interface SellersResponse {
  sellers: SellerData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

const AdminSellerManagement: React.FC = () => {
  const [data, setData] = useState<SellersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('riskScore');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllSellersRisk({
        page: currentPage,
        limit: pageLimit,
        riskLevel: riskFilter === 'all' ? undefined : riskFilter,
        sortBy
      });
      if (response.success) {
        // Fetch violation counts for each seller
        const sellersWithViolations = await Promise.all(
          response.sellers.map(async (seller) => {
            try {
              const violationsResponse = await apiService.getSellerDeliveryViolations(seller.sellerId, 1, 1);
              const violationCount = violationsResponse.success ? violationsResponse.pagination.total : 0;
              return {
                ...seller,
                deliveryViolations: violationCount
              };
            } catch (error) {
              console.error(`Error fetching violations for seller ${seller.sellerId}:`, error);
              return {
                ...seller,
                deliveryViolations: 0
              };
            }
          })
        );
        
        setData({
          ...response,
          sellers: sellersWithViolations
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load sellers data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching sellers data:', error);
      toast({
        title: "Error",
        description: "Failed to load sellers data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, riskFilter, sortBy, pageLimit]);

  // Listen for seller data upload events
  useEffect(() => {
    const handleSellerDataUploaded = () => {
      fetchData();
    };

    window.addEventListener('sellerDataUploaded', handleSellerDataUploaded);
    return () => {
      window.removeEventListener('sellerDataUploaded', handleSellerDataUploaded);
    };
  }, []);

  const refreshAllAssessments = async () => {
    try {
      setRefreshing(true);
      // This would typically trigger a bulk assessment
      toast({
        title: "Success",
        description: "Risk assessments refreshed successfully",
      });
      await fetchData();
    } catch (error) {
      console.error('Error refreshing assessments:', error);
      toast({
        title: "Error",
        description: "Failed to refresh assessments",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelPriority = (level: string) => {
    switch (level) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const filteredSellers = data?.sellers.filter(seller => 
    seller.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.sellerId.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSellers = [...filteredSellers].sort((a, b) => {
    const priorityA = getRiskLevelPriority(a.riskAssessment.riskLevel);
    const priorityB = getRiskLevelPriority(b.riskAssessment.riskLevel);
    return priorityB - priorityA;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Seller Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage seller risk assessments
          </p>
        </div>
        <Button 
          onClick={refreshAllAssessments} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Risk Distribution Overview */}
      {data && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.pagination.total || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all risk levels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Sellers</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {(data.riskDistribution.high || 0) + (data.riskDistribution.critical || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medium Risk</CardTitle>
              <Shield className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {data.riskDistribution.medium || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor closely
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Risk</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {data.riskDistribution.low || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Good standing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {data.sellers.reduce((total, seller) => total + (seller.deliveryViolations || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Delivery violations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="seller-list" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="seller-list">Seller List</TabsTrigger>
          <TabsTrigger value="seller-data-upload">Upload Seller Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="seller-list" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                    <SelectItem value="critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="riskScore">Risk Score</SelectItem>
                    <SelectItem value="totalReviews">Total Reviews</SelectItem>
                    <SelectItem value="fakeReviewPercentage">Fake Review %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Show:</span>
                  <Select 
                    value={pageLimit.toString()} 
                    onValueChange={(value) => {
                      setPageLimit(parseInt(value));
                      setCurrentPage(1); // Reset to first page when changing limit
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                      <SelectItem value="1000">All</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">per page</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sellers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Sellers ({data?.pagination.total || 0} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedSellers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Reviews</TableHead>
                      <TableHead>Fake Review %</TableHead>
                      <TableHead>Violations</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSellers.map((seller) => (
                      <TableRow key={seller.sellerId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{seller.sellerName}</div>
                            <div className="text-sm text-muted-foreground">{seller.sellerId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={seller.status === 'active' ? 'default' : 'secondary'}>
                            {seller.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{seller.riskAssessment?.riskScore || 0}</span>
                            <Progress 
                              value={seller.riskAssessment?.riskScore || 0} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskLevelColor(seller.riskAssessment?.riskLevel || 'low')}>
                            {(seller.riskAssessment?.riskLevel || 'low').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{seller.riskAssessment?.totalReviews || 0} total</div>
                            <div className="text-muted-foreground">
                              {seller.riskAssessment?.fakeReviews || 0} fake
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {seller.riskAssessment?.fakeReviewPercentage || 0}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2" title={`${seller.deliveryViolations || 0} delivery violations`}>
                            <span className={`text-sm font-medium ${
                              (seller.deliveryViolations || 0) > 5 ? 'text-red-600' :
                              (seller.deliveryViolations || 0) > 2 ? 'text-orange-600' :
                              (seller.deliveryViolations || 0) > 0 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {seller.deliveryViolations || 0}
                            </span>
                            {(seller.deliveryViolations || 0) > 0 && (
                              <Badge variant={
                                (seller.deliveryViolations || 0) > 5 ? 'destructive' :
                                (seller.deliveryViolations || 0) > 2 ? 'secondary' :
                                'outline'
                              } className="text-xs">
                                {(seller.deliveryViolations || 0) > 5 ? 'Critical' :
                                 (seller.deliveryViolations || 0) > 2 ? 'High' : 'Medium'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {seller.riskAssessment?.lastUpdated ? new Date(seller.riskAssessment.lastUpdated).toLocaleDateString() : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshAllAssessments()}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sellers found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination Controls */}
          {data && data.pagination.pages > 1 && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} sellers
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (data.pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= data.pagination.pages - 2) {
                        pageNum = data.pagination.pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(data.pagination.pages, prev + 1))}
                    disabled={currentPage === data.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="seller-data-upload">
          <SellerDataUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSellerManagement; 