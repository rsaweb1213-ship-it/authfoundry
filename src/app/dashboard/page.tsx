"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accounts: { provider: string }[];
}

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name || "" });
    }
  }, [profile, profileForm]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data.user);
    } catch {
      addToast("Failed to load profile", "error");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSaveProfile = async (data: ProfileFormData) => {
    setIsSavingProfile(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to update profile", "error");
        return;
      }

      setProfile((prev) =>
        prev ? { ...prev, name: result.user.name } : prev
      );
      await updateSession({ name: result.user.name });
      addToast("Profile updated successfully!", "success");
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to change password", "error");
        return;
      }

      addToast("Password changed successfully!", "success");
      passwordForm.reset();
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and profile.
        </p>
      </div>

      {/* Profile Overview */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar
              src={profile?.image}
              alt={profile?.name || ""}
              fallback={profile?.name || profile?.email || "U"}
              size="lg"
            />
            <div>
              <CardTitle>{profile?.name || "User"}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={profile?.role === "admin" ? "default" : "secondary"}
            >
              {profile?.role}
            </Badge>
            <Badge
              variant={profile?.isVerified ? "success" : "destructive"}
            >
              {profile?.isVerified ? "Verified" : "Unverified"}
            </Badge>
            <Badge
              variant={profile?.isActive ? "success" : "destructive"}
            >
              {profile?.isActive ? "Active" : "Inactive"}
            </Badge>
            {profile?.accounts?.map((account) => (
              <Badge key={account.provider} variant="outline">
                {account.provider}
              </Badge>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Member since{" "}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your display name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register("name")}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-gray-50 dark:bg-gray-900"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed. Contact an admin if needed.
              </p>
            </div>
            <Button type="submit" isLoading={isSavingProfile}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword" required>
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register("currentPassword")}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPassword" required>
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register("newPassword")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" required>
                Confirm New Password
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                placeholder="Repeat your new password"
                autoComplete="new-password"
                error={
                  passwordForm.formState.errors.confirmNewPassword?.message
                }
                {...passwordForm.register("confirmNewPassword")}
              />
            </div>
            <Button type="submit" isLoading={isChangingPassword}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
