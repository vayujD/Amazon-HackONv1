
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Store, Users, BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amazon-navy to-amazon-navy-light">
      {/* Header */}
      <header className="border-b border-gray-200/20 bg-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-amazon-orange" />
              <div>
                <h1 className="text-xl font-bold text-white">Amazon MIP</h1>
                <p className="text-xs text-gray-300">Marketplace Integrity Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Amazon Marketplace 
            <span className="text-amazon-orange block">Integrity Platform</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Advanced platform for tracking marketplace integrity, managing seller compliance, 
            and ensuring customer trust through comprehensive monitoring and analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
              onClick={() => window.location.href = '/admin-login'}
            >
              <Shield className="mr-2 h-5 w-5" />
              Administrator Portal
            </Button>
            <Button 
              size="lg" 
              className="bg-amazon-orange hover:bg-amazon-orange-dark text-white px-8 py-4 text-lg"
              onClick={() => window.location.href = '/seller-login'}
            >
              <Store className="mr-2 h-5 w-5" />
              Seller Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Comprehensive tools for marketplace integrity management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-gray-200/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Admin Operations</CardTitle>
              <CardDescription className="text-gray-300">
                Complete administrative control over marketplace integrity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Violation monitoring
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Seller management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Bulk enforcement actions
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-amazon-orange rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Analytics & Insights</CardTitle>
              <CardDescription className="text-gray-300">
                Advanced analytics for marketplace performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Review analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Performance metrics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Trend analysis
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Seller Dashboard</CardTitle>
              <CardDescription className="text-gray-300">
                Dedicated tools for seller compliance and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Compliance tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Real-time alerts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Performance insights
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-2xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-amazon-orange mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-4">
            Secure Access Required
          </h3>
          <p className="text-gray-300 mb-6">
            This platform requires authentication. Please choose your role to access the appropriate portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => window.location.href = '/admin-login'}
            >
              Admin Access
            </Button>
            <Button 
              className="bg-amazon-orange hover:bg-amazon-orange-dark"
              onClick={() => window.location.href = '/seller-login'}
            >
              Seller Access
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
