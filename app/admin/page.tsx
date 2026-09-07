import { checkAdminSession } from "@/lib/actions/admin-auth";
import { getComponents } from "@/lib/actions/components";
import { getAllOrders } from "@/lib/actions/orders";
import { getPaymentConfig } from "@/lib/actions/payment";
import { getProjects } from "@/lib/actions/projects";
import { getSiteStats } from "@/lib/actions/site-stats";
import { formatPrice } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComponentsClient } from "./components-client";
import { OrdersClient } from "./orders-client";
import { PaymentQrManager } from "./payment-qr-manager";
import { ProjectsManager } from "./projects-manager";
import { StatsManager } from "./stats-manager";
import AdminLoginPage from "./login/page";
import { Cpu, ShoppingBag, Clock, CheckCircle2, IndianRupee, QrCode, Trophy, Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh inventory & orders

export default async function AdminDashboardPage() {
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const [components, orders, paymentConfig, projects, siteStats] = await Promise.all([
    getComponents(),
    getAllOrders(),
    getPaymentConfig(),
    getProjects(),
    getSiteStats(),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const completedOrders = orders.filter((o) => o.status === "Completed").length;

  return (
    <div className="space-y-8">
      {/* -- Metric Summary Cards ------------------------------------- */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Monitor your electronics inventory, incoming orders, and fulfillment workflow.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-6">
          {/* Total Components */}
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Components</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Cpu className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-foreground">
                  {components.length}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Available in Catalog
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Orders</span>
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-foreground">
                  {orders.length}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Placed by Customers
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Pending Orders</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-amber-600">
                  {pendingOrders}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Needs Fulfillment
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Completed</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-emerald-600">
                  {completedOrders}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Fulfilled Orders
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Legacy & Projects */}
          <Card className="rounded-2xl border bg-card shadow-sm">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Legacy Projects</span>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-foreground">
                  {projects.length}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Showcase Builds
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="rounded-2xl border bg-card shadow-sm col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Total Revenue</span>
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-foreground">
                  {formatPrice(totalRevenue)}
                </span>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Order Value
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* -- Main Operations Tabs (Inventory & Orders & Projects) ----- */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl h-12 inline-flex">
          <TabsTrigger
            value="inventory"
            className="rounded-lg h-10 px-5 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Cpu className="h-4 w-4 mr-2" />
            Inventory Management
          </TabsTrigger>

          <TabsTrigger
            value="orders"
            className="rounded-lg h-10 px-5 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm relative"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Customer Orders
            {pendingOrders > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                {pendingOrders}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="projects"
            className="rounded-lg h-10 px-5 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Legacy & Projects
          </TabsTrigger>

          <TabsTrigger
            value="payment"
            className="rounded-lg h-10 px-5 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <QrCode className="h-4 w-4 mr-2" />
            Payment QR Code
          </TabsTrigger>

          <TabsTrigger
            value="stats"
            className="rounded-lg h-10 px-5 text-xs sm:text-sm font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Homepage Highlights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="outline-none focus:outline-none">
          <ComponentsClient initialComponents={components} />
        </TabsContent>

        <TabsContent value="orders" className="outline-none focus:outline-none">
          <OrdersClient initialOrders={orders} />
        </TabsContent>

        <TabsContent value="projects" className="outline-none focus:outline-none">
          <ProjectsManager initialProjects={projects} />
        </TabsContent>

        <TabsContent value="payment" className="outline-none focus:outline-none">
          <PaymentQrManager initialConfig={paymentConfig} />
        </TabsContent>

        <TabsContent value="stats" className="outline-none focus:outline-none">
          <StatsManager initialStats={siteStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
