import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreateSegmentDialog } from "@/components/CreateSegmentDialog";
import { CreateWorkflowDialog } from "@/components/CreateWorkflowDialog";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { emailTemplates } from "@/data/emailTemplates";

const EmailMarketing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [campaignsRes, segmentsRes, workflowsRes] = await Promise.all([
        supabase.from("email_campaigns").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("email_segments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("email_workflows").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      ]);

      if (campaignsRes.data) setCampaigns(campaignsRes.data);
      if (segmentsRes.data) setSegments(segmentsRes.data);
      if (workflowsRes.data) setWorkflows(workflowsRes.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Email Marketing</h1>
              <p className="text-muted-foreground">Create and manage email campaigns</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{campaigns.filter(c => c.status !== 'draft').length}</CardTitle>
                  <CardDescription>Active Campaigns</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + (c.open_rate || 0), 0) / campaigns.length).toFixed(1) : 0}%</CardTitle>
                  <CardDescription>Avg Open Rate</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{campaigns.length > 0 ? (campaigns.reduce((acc, c) => acc + (c.click_rate || 0), 0) / campaigns.length).toFixed(1) : 0}%</CardTitle>
                  <CardDescription>Avg Click Rate</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{segments.reduce((acc, s) => acc + (s.subscriber_count || 0), 0)}</CardTitle>
                  <CardDescription>Total Subscribers</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Email Campaigns</CardTitle>
                  <CardDescription>Your email marketing campaigns</CardDescription>
                </div>
                <CreateCampaignDialog onSuccess={fetchData} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading campaigns...</p>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No campaigns yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-smooth">
                        <Send className="h-8 w-8 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {campaign.status} • Sent: {campaign.sent_count || 0}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Pre-designed templates for your campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="group cursor-pointer">
                      <div className="aspect-[4/3] rounded-lg border border-border/50 bg-gradient-to-br from-muted/30 to-muted/70 mb-3 group-hover:shadow-glow transition-all flex items-center justify-center">
                        <span className="text-6xl">{template.thumbnail}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{template.name}</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => {
                            toast({
                              title: "Template Preview",
                              description: `Subject: ${template.subject}`,
                            });
                          }}
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Audience Segments</CardTitle>
                    <CardDescription>Manage and segment your email lists</CardDescription>
                  </div>
                </div>
                <CreateSegmentDialog onSuccess={fetchData} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading segments...</p>
                ) : segments.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No segments yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {segments.map((segment) => (
                      <Card key={segment.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{segment.name}</CardTitle>
                          <CardDescription>{segment.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Subscribers: {segment.subscriber_count || 0}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Email Workflows</CardTitle>
                    <CardDescription>Automated email workflows</CardDescription>
                  </div>
                </div>
                <CreateWorkflowDialog onSuccess={fetchData} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading workflows...</p>
                ) : workflows.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No workflows yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workflows.map((workflow) => (
                      <Card key={workflow.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{workflow.name}</CardTitle>
                              <CardDescription>{workflow.description}</CardDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm ${workflow.is_active ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-600'}`}>
                              {workflow.is_active ? 'Active' : 'Inactive'}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Trigger: {workflow.trigger_type}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailMarketing;
