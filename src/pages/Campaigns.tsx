import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Calendar, Target, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Campaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
      if (data && data.length > 0) {
        setSelectedCampaign(data[0]);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'paused': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => navigate('/campaign-autopilot')}
              className="gap-2 bg-gradient-primary shadow-glow"
            >
              <Sparkles className="h-4 w-4" />
              Create New Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Campaigns</h1>
          <p className="text-lg text-muted-foreground">
            View and manage your AI-powered marketing campaigns
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </CardContent>
          </Card>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No campaigns yet. Create your first AI-powered campaign!</p>
              <Button onClick={() => navigate('/campaign-autopilot')} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Campaign List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaigns ({campaigns.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedCampaign?.id === campaign.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-1">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {campaign.campaign_type} • {campaign.channels?.length || 0} channels
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Campaign Details */}
            <div className="lg:col-span-2">
              {selectedCampaign && (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="strategy">AI Strategy</TabsTrigger>
                    <TabsTrigger value="channels">Channels</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {selectedCampaign.name}
                        </CardTitle>
                        <CardDescription>Campaign Overview</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground mb-1">Campaign Type</p>
                            <p className="font-semibold capitalize">{selectedCampaign.campaign_type}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <Badge className={getStatusColor(selectedCampaign.status)}>
                              {selectedCampaign.status}
                            </Badge>
                          </div>
                        </div>

                        {selectedCampaign.target_audience && (
                          <div className="p-4 rounded-lg border border-border">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Target Audience
                            </h4>
                            <div className="space-y-2 text-sm">
                              {selectedCampaign.target_audience.age && (
                                <p><strong>Age:</strong> {selectedCampaign.target_audience.age}</p>
                              )}
                              {selectedCampaign.target_audience.location && (
                                <p><strong>Location:</strong> {selectedCampaign.target_audience.location}</p>
                              )}
                              {selectedCampaign.target_audience.interests && (
                                <p><strong>Interests:</strong> {selectedCampaign.target_audience.interests.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedCampaign.ai_recommendations && (
                          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              AI Recommendations
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedCampaign.ai_recommendations.strategy_summary}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="strategy" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          AI-Generated Strategy
                        </CardTitle>
                        <CardDescription>Complete marketing strategy created by AI</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                            {selectedCampaign.content?.strategy || 'No strategy generated yet'}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="channels" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Marketing Channels
                        </CardTitle>
                        <CardDescription>Channel configuration and budget allocation</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedCampaign.channels?.map((channel: string) => (
                            <div key={channel} className="p-4 rounded-lg border border-border">
                              <h4 className="font-semibold capitalize mb-2">{channel}</h4>
                              {selectedCampaign.ai_recommendations?.budget_allocation?.[channel] && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <DollarSign className="h-4 w-4" />
                                  Budget: ${selectedCampaign.ai_recommendations.budget_allocation[channel]}
                                </div>
                              )}
                              {selectedCampaign.schedule?.channels?.find((c: any) => c.channel === channel) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Calendar className="h-4 w-4" />
                                  Frequency: {selectedCampaign.schedule.channels.find((c: any) => c.channel === channel).frequency}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {selectedCampaign.schedule?.channels && (
                          <div className="p-4 rounded-lg bg-muted/50">
                            <h4 className="font-semibold mb-3">Optimal Posting Times</h4>
                            <div className="space-y-2 text-sm">
                              {selectedCampaign.schedule.channels.map((channelSchedule: any) => (
                                <div key={channelSchedule.channel}>
                                  <strong className="capitalize">{channelSchedule.channel}:</strong>{' '}
                                  {channelSchedule.optimalTimes?.join(', ') || 'Not set'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Campaigns;
