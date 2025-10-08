import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ConnectSocialAccountDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const ConnectSocialAccountDialog = ({ onSuccess, children }: ConnectSocialAccountDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("");
  const { toast } = useToast();

  // Twitter credentials
  const [twitterData, setTwitterData] = useState({
    account_name: "",
    consumer_key: "",
    consumer_secret: "",
    access_token: "",
    access_token_secret: "",
  });

  // Facebook credentials
  const [facebookData, setFacebookData] = useState({
    account_name: "",
    page_id: "",
    access_token: "",
  });

  // LinkedIn credentials
  const [linkedinData, setLinkedinData] = useState({
    account_name: "",
    person_urn: "",
    access_token: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let credentials = {};
      let accountName = "";

      switch (platform) {
        case "twitter":
          credentials = {
            consumer_key: twitterData.consumer_key,
            consumer_secret: twitterData.consumer_secret,
            access_token: twitterData.access_token,
            access_token_secret: twitterData.access_token_secret,
          };
          accountName = twitterData.account_name;
          break;
        case "facebook":
          credentials = {
            page_id: facebookData.page_id,
            access_token: facebookData.access_token,
          };
          accountName = facebookData.account_name;
          break;
        case "linkedin":
          credentials = {
            person_urn: linkedinData.person_urn,
            access_token: linkedinData.access_token,
          };
          accountName = linkedinData.account_name;
          break;
      }

      const { error } = await supabase
        .from("social_accounts")
        .insert([{
          user_id: user.id,
          platform,
          account_name: accountName,
          credentials,
          is_active: true,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${platform} account connected successfully`,
      });

      setOpen(false);
      onSuccess?.();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Connect Social Account</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect Social Media Account</DialogTitle>
          <DialogDescription>
            Connect your social media accounts to start posting directly
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={platform} onValueChange={setPlatform}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="twitter">X/Twitter</TabsTrigger>
            <TabsTrigger value="facebook">Facebook</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          </TabsList>

          <TabsContent value="twitter">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="twitter_name">Account Name</Label>
                <Input
                  id="twitter_name"
                  value={twitterData.account_name}
                  onChange={(e) => setTwitterData({ ...twitterData, account_name: e.target.value })}
                  placeholder="My Twitter Account"
                  required
                />
              </div>
              <div>
                <Label htmlFor="consumer_key">API Key (Consumer Key)</Label>
                <Input
                  id="consumer_key"
                  value={twitterData.consumer_key}
                  onChange={(e) => setTwitterData({ ...twitterData, consumer_key: e.target.value })}
                  placeholder="Your API Key"
                  required
                />
              </div>
              <div>
                <Label htmlFor="consumer_secret">API Secret (Consumer Secret)</Label>
                <Input
                  id="consumer_secret"
                  type="password"
                  value={twitterData.consumer_secret}
                  onChange={(e) => setTwitterData({ ...twitterData, consumer_secret: e.target.value })}
                  placeholder="Your API Secret"
                  required
                />
              </div>
              <div>
                <Label htmlFor="access_token">Access Token</Label>
                <Input
                  id="access_token"
                  value={twitterData.access_token}
                  onChange={(e) => setTwitterData({ ...twitterData, access_token: e.target.value })}
                  placeholder="Your Access Token"
                  required
                />
              </div>
              <div>
                <Label htmlFor="access_token_secret">Access Token Secret</Label>
                <Input
                  id="access_token_secret"
                  type="password"
                  value={twitterData.access_token_secret}
                  onChange={(e) => setTwitterData({ ...twitterData, access_token_secret: e.target.value })}
                  placeholder="Your Access Token Secret"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Connect Twitter"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="facebook">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fb_name">Page Name</Label>
                <Input
                  id="fb_name"
                  value={facebookData.account_name}
                  onChange={(e) => setFacebookData({ ...facebookData, account_name: e.target.value })}
                  placeholder="My Facebook Page"
                  required
                />
              </div>
              <div>
                <Label htmlFor="page_id">Page ID</Label>
                <Input
                  id="page_id"
                  value={facebookData.page_id}
                  onChange={(e) => setFacebookData({ ...facebookData, page_id: e.target.value })}
                  placeholder="Your Page ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fb_token">Page Access Token</Label>
                <Input
                  id="fb_token"
                  type="password"
                  value={facebookData.access_token}
                  onChange={(e) => setFacebookData({ ...facebookData, access_token: e.target.value })}
                  placeholder="Your Page Access Token"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Connect Facebook"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="linkedin">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="li_name">Account Name</Label>
                <Input
                  id="li_name"
                  value={linkedinData.account_name}
                  onChange={(e) => setLinkedinData({ ...linkedinData, account_name: e.target.value })}
                  placeholder="My LinkedIn"
                  required
                />
              </div>
              <div>
                <Label htmlFor="person_urn">Person URN</Label>
                <Input
                  id="person_urn"
                  value={linkedinData.person_urn}
                  onChange={(e) => setLinkedinData({ ...linkedinData, person_urn: e.target.value })}
                  placeholder="urn:li:person:..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="li_token">Access Token</Label>
                <Input
                  id="li_token"
                  type="password"
                  value={linkedinData.access_token}
                  onChange={(e) => setLinkedinData({ ...linkedinData, access_token: e.target.value })}
                  placeholder="Your Access Token"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Connecting..." : "Connect LinkedIn"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
