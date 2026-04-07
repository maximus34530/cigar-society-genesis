import Layout from "@/components/Layout";
import { RequireAuth } from "@/components/RequireAuth";
import { Seo } from "@/components/Seo";
import SectionHeading from "@/components/SectionHeading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <RequireAuth>
      <Layout>
        <Seo title="Dashboard" description="Your account dashboard." path="/dashboard" />
        <section className="section-padding">
          <div className="container mx-auto max-w-5xl">
            <SectionHeading title="Dashboard" subtitle="A quick overview of your activity." />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base">Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base">Upcoming events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
              <Card className="bg-card/40 border-border/60">
                <CardHeader>
                  <CardTitle className="font-heading text-base">Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </Layout>
    </RequireAuth>
  );
};

export default Dashboard;

