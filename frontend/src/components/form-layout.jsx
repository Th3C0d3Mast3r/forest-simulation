"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus, Trash2, User } from "lucide-react";
import { useState } from "react";

export default function WorkspaceForm() {
  const [formData, setFormData] = useState({
    uid: "",
    mobile: "",
    safariType: "T1",
    paymentStatus: "false",
    names: [""],
  });

  const handleAddName = () => {
    setFormData({ ...formData, names: [...formData.names, ""] });
  };

  const handleRemoveName = (index) => {
    if (formData.names.length > 1) {
      const newNames = formData.names.filter((_, i) => i !== index);
      setFormData({ ...formData, names: newNames });
    }
  };

  const handleNameChange = (index, value) => {
    const newNames = [...formData.names];
    newNames[index] = value;
    setFormData({ ...formData, names: newNames });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/ticket/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: formData.uid,
          mobile: formData.mobile,
          safariType: formData.safariType,
          paymentStatus: formData.paymentStatus === "true",
          name: formData.names,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registration Successful!");
        console.log("Success:", data);
      } else {
        alert("Registration Failed: " + data.message);
        console.error("Error:", data);
      }
    } catch (error) {
      alert("Error connecting to server");
      console.error("Fetch error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl bg-card rounded-xl border border-border shadow-[0_8px_40px_rgba(25,39,13,0.7)] overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Safari Registration
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Fill in the details for your forest adventure.
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1 border-primary/40 text-primary font-mono tracking-wide">
              New Booking
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* UID & Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="uid" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  UID
                </Label>
                <Input
                  id="uid"
                  placeholder="Enter UID"
                  value={formData.uid}
                  onChange={(e) => setFormData({ ...formData, uid: e.target.value })}
                  className="bg-background/20 border-white/5 focus:border-accent/50 transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="number"
                  placeholder="Phone number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="bg-background/20 border-white/5 focus:border-accent/50 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Safari Type & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="safariType" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Safari Type
                </Label>
                <Select value={formData.safariType} onValueChange={(val) => setFormData({ ...formData, safariType: val })}>
                  <SelectTrigger id="safariType" className="bg-background/20 border-white/5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">Type 1 (T1)</SelectItem>
                    <SelectItem value="T2">Type 2 (T2)</SelectItem>
                    <SelectItem value="T3">Type 3 (T3)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentStatus" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Payment Status
                </Label>
                <Select value={formData.paymentStatus} onValueChange={(val) => setFormData({ ...formData, paymentStatus: val })}>
                  <SelectTrigger id="paymentStatus" className="bg-background/20 border-white/5">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Paid</SelectItem>
                    <SelectItem value="false">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Names Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Passengers
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddName}
                  className="h-8 gap-1 text-xs border-accent/20 hover:bg-accent/10 text-accent transition-all"
                >
                  <Plus className="h-3 w-3" /> Add Person
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.names.map((name, index) => (
                  <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/5 bg-white/[0.02]">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      placeholder={`Person ${index + 1} Name`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="bg-background/20 border-white/5 focus:border-accent/50 transition-colors"
                      required
                    />
                    {formData.names.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveName(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-4">
              <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground">
                Cancel
              </Button>
              <Button type="submit" className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_24px_rgba(129,140,60,0.25)] transition-all active:scale-95">
                Register Booking
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
