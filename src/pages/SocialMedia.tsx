import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Calendar, BarChart3, MessageSquare, ArrowLeft, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { ConnectSocialAccountDialog } from "@/components/ConnectSocialAccountDialog";
import { Badge } from "@/components/ui/badge";

const SocialMedia = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPosts(data);
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
    fetchPosts();
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching social accounts:", error);
    }
  };

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
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Social Media Manager</h1>
              <p className="text-muted-foreground">Manage all your social platforms in one place</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{posts.length}</CardTitle>
                  <CardDescription>Total Posts</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{posts.reduce((acc, p) => acc + (p.engagement_score || 0), 0)}</CardTitle>
                  <CardDescription>Total Engagement</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">{new Set(posts.map(p => p.platform)).size}</CardTitle>
                  <CardDescription>Active Platforms</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Social Posts</CardTitle>
                  <CardDescription>Your social media posts</CardDescription>
                </div>
                <CreatePostDialog onSuccess={fetchPosts} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading posts...</p>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Share2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No posts yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-smooth">
                        <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Share2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{post.platform}</Badge>
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                          </div>
                          <p className="font-medium line-clamp-1">{post.content}</p>
                          <p className="text-sm text-muted-foreground">
                            Engagement: {post.engagement_score || 0}
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

          <TabsContent value="scheduler">
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>Content Scheduler</CardTitle>
                    <CardDescription>Schedule posts across platforms</CardDescription>
                  </div>
                </div>
                <CreatePostDialog onSuccess={fetchPosts} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading scheduled posts...</p>
                ) : posts.filter(p => p.scheduled_time).length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No scheduled posts yet. Create one now!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.filter(p => p.scheduled_time).map((post) => (
                      <Card key={post.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{post.platform}</Badge>
                              <p className="font-medium line-clamp-1">{post.content}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.scheduled_time).toLocaleDateString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Analytics Dashboard</CardTitle>
                </div>
                <CardDescription>Track your social media performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Detailed analytics and insights coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your social media account connections
                </p>
              </div>
              <ConnectSocialAccountDialog onSuccess={fetchSocialAccounts}>
                <Button>
                  <Link className="mr-2 h-4 w-4" />
                  Connect Account
                </Button>
              </ConnectSocialAccountDialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {socialAccounts.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      No accounts connected yet. Connect your first account to start posting!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                socialAccounts.map((account) => (
                  <Card key={account.id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        {account.account_name}
                        <Badge variant={account.is_active ? "default" : "secondary"}>
                          {account.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {account.platform}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Connected {new Date(account.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialMedia;
