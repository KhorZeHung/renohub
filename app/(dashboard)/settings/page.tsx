"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Key,
  Bell,
  Shield,
  Loader2,
  Save,
  Camera,
  Phone,
} from "lucide-react";
import ProfileSettingsLoading from "./loading";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  contactNumber: string | null;
  emailVerified: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    image: null as string | null,
  });

  const [originalEmail, setOriginalEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showEmailChange, setShowEmailChange] = useState(false);

  const [notifications, setNotifications] = useState({
    emailQuotations: true,
    emailLeads: true,
    emailReminders: false,
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user");

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data: UserProfile = await response.json();
        setProfileData({
          name: data.name,
          email: data.email,
          contactNumber: data.contactNumber || "",
          image: data.image,
        });
        setOriginalEmail(data.email);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          contactNumber: profileData.contactNumber || null,
          image: profileData.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        toast({
          title: "Save Failed",
          description: data.error || "Failed to save profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Saved",
        description: "Profile saved successfully",
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Upload Failed",
          description: data.error || "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      setProfileData({ ...profileData, image: data.url });
      toast({
        title: "Photo Uploaded",
        description: "Click 'Save Changes' to apply.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profileData.image) return;

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: profileData.image }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast({
          title: "Remove Failed",
          description: data.error || "Failed to remove image",
          variant: "destructive",
        });
        return;
      }

      setProfileData({ ...profileData, image: null });
      toast({
        title: "Photo Removed",
        description: "Click 'Save Changes' to apply.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Remove Failed",
        description: "Failed to remove image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || newEmail === originalEmail) {
      toast({
        title: "Invalid Email",
        description: "Please enter a different email address",
        variant: "destructive",
      });
      return;
    }

    setIsChangingEmail(true);

    try {
      const response = await fetch("/api/user/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Email Change Failed",
          description: data.error || "Failed to change email",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification Sent",
        description: data.message,
        variant: "success",
      });
      setShowEmailChange(false);
      setNewEmail("");
    } catch {
      toast({
        title: "Network Error",
        description: "Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  if (isLoading) {
    return <ProfileSettingsLoading />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal account settings
        </p>
      </div>

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
          <CardDescription>Update your profile photo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </label>
              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
            <div>
              <p className="font-medium">{profileData.name}</p>
              <p className="text-sm text-muted-foreground">
                {profileData.email}
              </p>
              {profileData.image && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                >
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profileData.email}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            {!showEmailChange ? (
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => setShowEmailChange(true)}
              >
                Change email address
              </Button>
            ) : (
              <div className="space-y-2 p-3 border rounded-lg">
                <Label htmlFor="newEmail">New Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter new email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleChangeEmail}
                    disabled={isChangingEmail}
                  >
                    {isChangingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Send Verification"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEmailChange(false);
                      setNewEmail("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  A verification link will be sent to your new email address
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="contactNumber"
                type="tel"
                placeholder="Enter your contact number"
                value={profileData.contactNumber}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    contactNumber: e.target.value,
                  })
                }
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
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
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-destructive/10">
            <div>
              <p className="font-medium text-sm">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
