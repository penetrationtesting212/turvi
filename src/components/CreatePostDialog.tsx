import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";

interface CreatePostDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const CreatePostDialog = ({ onSuccess, children }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("");
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSocialAccounts();
    }
  }, [open]);

  const fetchSocialAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;
      setSocialAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching social accounts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the post
      const { data: post, error: postError } = await supabase
        .from("social_posts")
        .insert([{
          user_id: user.id,
          content,
          platform,
          status: publishNow ? "publishing" : "draft",
          platform_account_id: selectedAccount || null,
        }])
        .select()
        .single();

      if (postError) throw postError;

      // If publish now and account selected, post to platform
      if (publishNow && selectedAccount) {
        const { error: publishError } = await supabase.functions.invoke('post-to-social', {
          body: {
            platform_account_id: selectedAccount,
            content,
            post_id: post.id,
          },
        });

        if (publishError) {
          toast({
            title: "Warning",
            description: "Post saved but failed to publish: " + publishError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      toast({
        title: "Success",
        description: publishNow ? "Post published successfully" : "Social post created successfully",
      });

      setOpen(false);
      setContent("");
      setPlatform("");
      setSelectedAccount("");
      setPublishNow(false);
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
        {children || <Button className="bg-gradient-primary">Create New Post</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Social Post</DialogTitle>
          <DialogDescription>
            Schedule a new social media post
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={setPlatform} required>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {socialAccounts.filter(acc => acc.platform === platform).length > 0 && (
            <>
              <div>
                <Label htmlFor="account">Connected Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {socialAccounts
                      .filter(acc => acc.platform === platform)
                      .map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.account_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAccount && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publish-now"
                    checked={publishNow}
                    onCheckedChange={setPublishNow}
                  />
                  <Label htmlFor="publish-now">Publish immediately</Label>
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="content">Post Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (publishNow ? "Publishing..." : "Creating...") : (publishNow ? "Publish Now" : "Create Post")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};