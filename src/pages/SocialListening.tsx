import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Ear, TrendingUp, TrendingDown, Minus, AlertTriangle, Flame, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SocialListening = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [monitors, setMonitors] = useState<any[]>([]);
  const [mentions, setMentions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadMonitors();
    loadMentions();
    loadAlerts();
  }, []);

  const loadMonitors = async () => {
    const { data } = await supabase
      .from('brand_monitors')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setMonitors(data);
  };

  const loadMentions = async () => {
    const { data } = await supabase
      .from('mentions')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);
    
    if (data) setMentions(data);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (data) setAlerts(data);
  };

  const handleCreateMonitor = async () => {
    if (!brandName || !keywords) {
      toast({
        title: "Missing information",
        description: "Please enter brand name and keywords",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const keywordArray = keywords.split(',').map(k => k.trim());
      
      const { data: monitor, error } = await supabase
        .from('brand_monitors')
        .insert([{
          user_id: user.id,
          brand_name: brandName,
          keywords: keywordArray as any,
          platforms: ['twitter', 'facebook', 'instagram', 'linkedin'] as any,
          alert_settings: {
            viral_threshold: 1000,
            crisis_keywords: ['complaint', 'issue', 'problem', 'terrible']
          } as any,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Immediately start monitoring
      const { data: monitorData, error: monitorError } = await supabase.functions.invoke(
        'monitor-social-mentions',
        {
          body: {
            monitorId: monitor.id,
            searchQuery: keywordArray.join(' OR ')
          }
        }
      );

      if (monitorError) throw monitorError;

      toast({
        title: "Monitoring started! 👂",
        description: `Now tracking mentions of "${brandName}" across social platforms`,
      });

      setBrandName("");
      setKeywords("");
      await loadMonitors();
      await loadMentions();
      await loadAlerts();
    } catch (error) {
      console.error('Error creating monitor:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create monitor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScanNow = async (monitorId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('monitor-social-mentions', {
        body: { monitorId }
      });

      if (error) throw error;

      toast({
        title: "Scan complete!",
        description: "Found new mentions",
      });

      await loadMentions();
      await loadAlerts();
    } catch (error) {
      console.error('Error scanning:', error);
      toast({
        title: "Error",
        description: "Failed to scan for mentions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-primary mb-4">
            <Ear className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Social Listening & Brand Monitoring</h1>
          <p className="text-lg text-muted-foreground">
            Track brand mentions, sentiment, and respond in real-time
          </p>
        </div>

        {alerts.length > 0 && (
          <Card className="mb-6 border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-5 w-5" />
                {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                  <div className="flex items-center gap-3">
                    {alert.alert_type === 'viral' ? (
                      <Flame className="h-5 w-5 text-orange-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup Monitor</TabsTrigger>
            <TabsTrigger value="mentions">Mentions ({mentions.length})</TabsTrigger>
            <TabsTrigger value="monitors">Active Monitors ({monitors.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Create Brand Monitor</CardTitle>
                <CardDescription>
                  Set up real-time tracking for your brand across social platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="Your Brand Name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="product name, #hashtags, @mentions"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleCreateMonitor}
                  disabled={loading}
                  className="w-full bg-gradient-primary"
                >
                  {loading ? "Creating Monitor..." : "Start Monitoring"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentions" className="space-y-4">
            {mentions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No mentions found yet. Set up a monitor to start tracking.
                </CardContent>
              </Card>
            ) : (
              mentions.map((mention) => (
                <Card key={mention.id} className="shadow-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {mention.platform}
                        </Badge>
                        <Badge className={getSentimentColor(mention.sentiment)}>
                          {getSentimentIcon(mention.sentiment)}
                          <span className="ml-1 capitalize">{mention.sentiment}</span>
                        </Badge>
                        {mention.is_viral && (
                          <Badge variant="default" className="bg-orange-500">
                            <Flame className="h-3 w-3 mr-1" />
                            Viral
                          </Badge>
                        )}
                        {mention.is_crisis && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Crisis
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(mention.detected_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm mb-4">{mention.content}</p>

                    {mention.ai_response_suggestion && (
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">AI Suggested Response:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {mention.ai_response_suggestion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="monitors" className="space-y-4">
            {monitors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No active monitors. Create one to start tracking your brand.
                </CardContent>
              </Card>
            ) : (
              monitors.map((monitor) => (
                <Card key={monitor.id} className="shadow-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{monitor.brand_name}</CardTitle>
                        <CardDescription>
                          Tracking: {monitor.keywords.join(', ')}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleScanNow(monitor.id)}
                        disabled={loading}
                      >
                        Scan Now
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {monitor.platforms.map((platform: string) => (
                        <Badge key={platform} variant="outline">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SocialListening;