"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, Info, Plus, Trash2, User, Phone, Hash, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";

const safariOptions = [
  {
    id: "T1",
    name: "Standard Expedition (T1)",
    description: "Traditional forest exploration through the main buffer zones.",
    features: ["2-Hour duration", "Experienced Spotter", "Open Gypsy"],
    price: 45,
    isRecommended: false,
  },
  {
    id: "T2",
    name: "Tiger Trail Exclusive (T2)",
    description: "Deep jungle access focusing on big cat sightings during dawn.",
    features: ["4-Hour duration", "Premium Route", "Tea & Snacks"],
    price: 85,
    isRecommended: true,
  },
  {
    id: "T3",
    name: "Elite Wilderness (T3)",
    description: "Maximum conservation area access with photography equipment.",
    features: ["6-Hour duration", "Private Naturalist", "Luxury Gypsy"],
    price: 150,
    isRecommended: false,
  },
];

export default function WorkspaceForm() {
  const [formData, setFormData] = useState({
    uid: "",
    mobile: "",
    safariType: safariOptions[1].id,
    names: [""],
  });

  const totalPrice = useMemo(() => {
    const option = safariOptions.find((o) => o.id === formData.safariType);
    const count = formData.names.filter((n) => n.trim() !== "").length || 1;
    return (option ? option.price : 0) * count;
  }, [formData.safariType, formData.names]);

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
      // 1. Create the ticket record in DB first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ticket/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: formData.uid,
          mobile: formData.mobile,
          safariType: formData.safariType,
          paymentStatus: false,
          name: formData.names,
        }),
      });

      const ticketData = await response.json();
      if (!response.ok) {
        return alert("Request Failed: " + ticketData.message);
      }

      // 2. Get PayU Hash
      const hashResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/hash`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice,
          productinfo: formData.safariType,
          firstname: formData.names[0],
          email: "test@example.com", // Static for now, can be made dynamic
          phone: formData.mobile,
          uid: formData.uid,
        }),
      });

      const hashData = await hashResponse.json();
      if (!hashResponse.ok) {
        return alert("Payment initialization failed");
      }

      // 3. Redirect to PayU
      const payuData = {
        key: hashData.key,
        txnid: hashData.txnid,
        amount: hashData.amount,
        firstname: hashData.firstname,
        email: hashData.email,
        phone: hashData.phone,
        productinfo: hashData.productinfo,
        surl: `${process.env.NEXT_PUBLIC_API_URL}/payment/success`,
        furl: `${process.env.NEXT_PUBLIC_API_URL}/payment/failure`,
        hash: hashData.hash,
        service_provider: "payu_paisa",
      };

      const form = document.createElement("form");
      form.method = "POST";
      form.action = hashData.action;

      for (const key in payuData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = payuData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      alert("Error connecting to server");
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 md:p-12 bg-background text-foreground animate-in fade-in duration-700">
      <form onSubmit={handleSubmit} className="w-full max-w-6xl">
        <div className="mb-12 text-center space-y-3">
          <Badge variant="outline" className="border-bark bg-bark/5 text-bark font-black tracking-[0.4em] px-5 py-2 uppercase text-[10px] rounded-full">
            Forest Reserve Management
          </Badge>
          <h3 className="text-5xl font-black tracking-tighter text-bark">Booking Portal</h3>
          <p className="text-muted-foreground font-bold max-w-md mx-auto">Register your group for an authentic safari experience in the heart of the reserve.</p>
        </div>

        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          {/* Main Form Fields */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="mobile" className="text-[11px] font-black uppercase tracking-[0.25em] text-bark">Primary Contact</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bark opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <Input 
                      id="mobile" 
                      type="number"
                      placeholder="9876543210" 
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="pl-12 h-14 bg-card border-2 border-transparent focus:border-bark/20 shadow-[0_4px_20px_rgba(74,60,49,0.05)] focus:ring-0 rounded-2xl font-bold"
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="uid" className="text-[11px] font-black uppercase tracking-[0.25em] text-bark">Expedition Ref ID</Label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bark opacity-40 group-focus-within:opacity-100 transition-opacity" />
                    <Input 
                      id="uid" 
                      placeholder="UID-X99" 
                      value={formData.uid}
                      onChange={(e) => setFormData({...formData, uid: e.target.value})}
                      className="pl-12 h-14 bg-card border-2 border-transparent focus:border-bark/20 shadow-[0_4px_20px_rgba(74,60,49,0.05)] focus:ring-0 rounded-2xl font-bold"
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-bark/10 pb-4">
                  <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-bark">Personnel Details</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleAddName}
                    className="text-bark hover:bg-bark/10 h-9 px-4 rounded-full gap-2 text-xs font-black transition-all"
                  >
                    <Plus className="h-4 w-4" /> Add Person
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.names.map((name, index) => (
                    <div key={index} className="flex gap-4 group">
                      <div className="flex-1 relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bark opacity-30 group-focus-within:opacity-100 transition-all font-black" />
                        <Input 
                          placeholder={index === 0 ? "Lead Naturalist/Visitor" : `Personnel Name ${index + 1}`}
                          value={name}
                          onChange={(e) => handleNameChange(index, e.target.value)}
                          className="pl-12 h-14 bg-card border-2 border-transparent focus:border-bark/20 shadow-[0_4px_15px_rgba(74,60,49,0.03)] focus:ring-0 rounded-2xl transition-all font-bold text-foreground"
                          required
                        />
                      </div>
                      {formData.names.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveName(index)}
                          className="h-14 w-14 text-bark/40 hover:text-destructive hover:bg-destructive/5 rounded-2xl"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Safari Package Section */}
            <div className="space-y-8 pt-4 text-foreground">
              <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-bark underline underline-offset-8 decoration-bark/10">Operational Packages</h4>
              <RadioGroup
                value={formData.safariType}
                onValueChange={(value) => setFormData({ ...formData, safariType: value })}
                className="grid grid-cols-1 gap-6"
              >
                {safariOptions.map((option) => (
                  <label
                    key={option.id}
                    htmlFor={option.id}
                    className={cn(
                      "relative block cursor-pointer rounded-3xl border-2 p-6 transition-all",
                      formData.safariType === option.id
                        ? "border-bark bg-card ring-8 ring-bark/5 shadow-xl scale-[1.02]"
                        : "border-transparent bg-card/60 hover:bg-card hover:border-bark/10 text-foreground"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-6">
                        <RadioGroupItem value={option.id} id={option.id} className="mt-1 border-bark text-bark h-5 w-5" />
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <p className="text-xl font-black text-bark tracking-tight">{option.name}</p>
                            {option.isRecommended && (
                              <Badge className="bg-bark text-ivory rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest border-none">
                                RECOMMENDED
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg font-bold">{option.description}</p>
                          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                            {option.features.map((feat, i) => (
                              <li key={i} className="flex items-center gap-2 text-[10px] font-black text-bark/80 uppercase tracking-wider">
                                <div className="h-1.5 w-1.5 rounded-full bg-bark" />
                                {feat}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-bark tracking-tighter">${option.price}</span>
                        <p className="text-[10px] font-black text-bark/60 uppercase tracking-widest mt-1">Per Head</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-5">
            <Card className="bg-bark border-none shadow-2xl rounded-[2.5rem] overflow-hidden sticky top-12 text-ivory">
              <CardContent className="p-10 space-y-10">
                <div className="space-y-2">
                  <h4 className="text-3xl font-black tracking-tighter text-ivory">Summary</h4>
                  <div className="h-1 w-12 bg-ivory/20 rounded-full"></div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-ivory/5 p-5 rounded-3xl border border-ivory/10 group hover:bg-ivory/10 transition-all">
                    <span className="text-xs font-black uppercase tracking-widest text-ivory/50">Package</span>
                    <span className="text-lg font-bold text-ivory">{formData.safariType} Exclusive</span>
                  </div>
                  
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xs font-black uppercase tracking-widest text-ivory/50">Personnel</span>
                    <span className="text-base font-bold text-ivory">{formData.names.filter(n => n.trim() !== "").length || 1} Person(s)</span>
                  </div>

                  <Separator className="bg-ivory/10" />
                  
                  <div className="flex justify-between items-end px-4 pt-4">
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-widest text-ivory/80">Est. Quote</span>
                      <p className="text-[10px] text-ivory/40 italic font-bold tracking-tight">Verified upon arrival</p>
                    </div>
                    <div className="text-6xl font-black tracking-tighter text-ivory tabular-nums drop-shadow-md">
                      ${totalPrice}
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-ivory/5 border border-ivory/10 space-y-4">
                  <p className="text-xs text-ivory/70 leading-relaxed font-bold">
                    Upon confirmation, you will receive a digital token. RFID allocation 
                    is conducted at the reserve entry point. Total distance estimate: 120km.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 text-xl font-black bg-ivory hover:bg-white text-bark rounded-3xl transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 border-none"
                >
                  Confirm Request
                  <ArrowRight className="h-5 w-5" strokeWidth={4} />
                </Button>
                
                <p className="text-[10px] text-center text-ivory font-black uppercase tracking-[0.3em] opacity-30">
                  Government Approved Portal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
