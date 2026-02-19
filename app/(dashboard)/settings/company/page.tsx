"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Upload,
  Loader2,
  Save,
  FileText,
  Percent,
  Calendar,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import CompanySettingsLoading from "./loading";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanyLogo {
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  website: string | null;
  taxRegistrationNumber: string | null;
  logo: CompanyLogo | null;
  defaultTerms: string | null;
  defaultValidityDays: number;
  defaultTaxRate: number;
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [defaultTerms, setDefaultTerms] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    taxNumber: "",
    defaultValidityDays: 30,
    defaultTaxRate: 0,
  });

  // Fetch company profile on mount
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch("/api/company");

        if (response.status === 404) {
          // Company not set up yet
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch company profile");
        }

        const data: CompanyProfile = await response.json();
        setCompanyData({
          name: data.name,
          email: data.email,
          phone: data.contactNumber || "",
          address: data.address || "",
          website: data.website || "",
          taxNumber: data.taxRegistrationNumber || "",
          defaultValidityDays: data.defaultValidityDays,
          defaultTaxRate: data.defaultTaxRate,
        });

        if (data.logo?.url) {
          setLogoUrl(data.logo.url);
        }

        if (data.defaultTerms) {
          // Parse terms from string (stored as newline-separated)
          const terms = data.defaultTerms.split("\n").filter((t) => t.trim());
          if (terms.length > 0) {
            setDefaultTerms(terms);
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load company profile. Please try again.",
          variant: "destructive",
        });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [router]);

  // Terms drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTerms = [...defaultTerms];
    const draggedItem = newTerms[draggedIndex];
    newTerms.splice(draggedIndex, 1);
    newTerms.splice(index, 0, draggedItem);
    setDefaultTerms(newTerms);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleTermChange = (index: number, value: string) => {
    const newTerms = [...defaultTerms];
    newTerms[index] = value;
    setDefaultTerms(newTerms);
  };

  const addTerm = () => {
    setDefaultTerms([...defaultTerms, ""]);
  };

  const removeTerm = (index: number) => {
    setDefaultTerms(defaultTerms.filter((_, i) => i !== index));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "logo");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to upload logo",
          variant: "destructive",
        });
        return;
      }

      setLogoUrl(data.url);
      toast({
        title: "Logo Uploaded",
        description: "Click 'Save Changes' to apply.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    if (!logoUrl) return;

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: logoUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Remove Failed",
          description: data.error || "Failed to remove logo",
          variant: "destructive",
        });
        return;
      }

      setLogoUrl(null);
      toast({
        title: "Logo Removed",
        description: "Click 'Save Changes' to apply.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Remove Failed",
        description: "Failed to remove logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Prepare company data for API
      const payload = {
        name: companyData.name,
        email: companyData.email,
        contactNumber: companyData.phone || null,
        address: companyData.address || null,
        website: companyData.website || null,
        taxRegistrationNumber: companyData.taxNumber || null,
        logo: logoUrl
          ? { url: logoUrl, filename: logoUrl.split("/").pop() || "logo" }
          : null,
        defaultTerms: defaultTerms.filter((t) => t.trim()).join("\n") || null,
        defaultValidityDays: companyData.defaultValidityDays,
        defaultTaxRate: companyData.defaultTaxRate,
      };

      const response = await fetch("/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        toast({
          title: "Save Failed",
          description: data.error || "Failed to save company profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Saved",
        description: "Company profile saved successfully",
        variant: "success",
      });
    } catch {
      toast({
        title: "Network Error",
        description: "Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <CompanySettingsLoading />;
  }

  return (
    <div className="space-y-6  max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">
          This information will appear on your quotations
        </p>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Logo</CardTitle>
          <CardDescription>
            Upload your company logo (recommended: 1080x1080px, max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-32 w-32 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="logo" className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Logo
                </span>
              </Label>
              <input
                ref={fileInputRef}
                id="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={isUploading}
              />
              {logoUrl && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-destructive"
                  onClick={handleRemoveLogo}
                  disabled={isUploading}
                >
                  Remove logo
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WEBP. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Information</CardTitle>
          <CardDescription>
            Your company details for quotations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                value={companyData.name}
                onChange={(e) =>
                  setCompanyData({ ...companyData, name: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyEmail">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyData.email}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, email: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyPhone"
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, phone: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyAddress"
                value={companyData.address}
                onChange={(e) =>
                  setCompanyData({ ...companyData, address: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyWebsite"
                  type="url"
                  value={companyData.website}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, website: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxNumber">Tax Registration Number</Label>
              <Input
                id="taxNumber"
                value={companyData.taxNumber}
                onChange={(e) =>
                  setCompanyData({ ...companyData, taxNumber: e.target.value })
                }
                placeholder="GST/VAT number"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotation Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quotation Defaults</CardTitle>
          <CardDescription>Default settings for new quotations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="validityDays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Default Validity (days)
              </Label>
              <NumericInput
                id="validityDays"
                mode="integer"
                value={companyData.defaultValidityDays}
                onValueChange={(val) =>
                  setCompanyData({
                    ...companyData,
                    defaultValidityDays: val || 30,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Default Tax Rate (%)
              </Label>
              <NumericInput
                id="taxRate"
                value={companyData.defaultTaxRate}
                onValueChange={(val) =>
                  setCompanyData({
                    ...companyData,
                    defaultTaxRate: val || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Default Terms & Conditions
              </Label>
              <Button size="sm" onClick={addTerm}>
                <Plus className="h-4 w-4 mr-1" />
                Add Term
              </Button>
            </div>
            <div className="space-y-2">
              {defaultTerms.map((term, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 p-2 rounded-md border bg-background transition-colors ${
                    draggedIndex === index
                      ? "border-primary bg-primary/5"
                      : "border-input"
                  }`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-4 w-4" />
                  </div>
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <Input
                    value={term}
                    onChange={(e) => handleTermChange(index, e.target.value)}
                    className="flex-1"
                    placeholder="Enter term..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeTerm(index)}
                    disabled={defaultTerms.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Drag items to reorder. These terms will be pre-filled on new
              quotations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quotation Header Preview</CardTitle>
          <CardDescription>
            How your company info will appear on quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {companyData.name || "Company Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {companyData.address || "Company Address"}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p>{companyData.phone || "-"}</p>
                <p>{companyData.email || "-"}</p>
                {companyData.website && (
                  <p className="text-primary">{companyData.website}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
