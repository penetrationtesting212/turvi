import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreateSegmentDialogProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export const CreateSegmentDialog = ({ onSuccess, children }: CreateSegmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const criteria = {
        age: { min: ageMin ? parseInt(ageMin) : null, max: ageMax ? parseInt(ageMax) : null },
        location: location || null
      };

      const { error } = await supabase
        .from("email_segments")
        .insert([{
          user_id: user.id,
          name,
          description,
          criteria
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Email segment created successfully",
      });

      setOpen(false);
      setName("");
      setDescription("");
      setAgeMin("");
      setAgeMax("");
      setLocation("");
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
        {children || <Button className="bg-gradient-primary">Create Segment</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Email Segment</DialogTitle>
          <DialogDescription>
            Define criteria to segment your email audience
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Segment Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., High-Value Customers"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this segment..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageMin">Min Age</Label>
              <Input
                id="ageMin"
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="18"
              />
            </div>
            <div>
              <Label htmlFor="ageMax">Max Age</Label>
              <Input
                id="ageMax"
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="65"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., United States"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Segment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};