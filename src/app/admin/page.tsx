"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  accounts: { provider: string }[];
  _count: { sessions: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Edit user modal
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [editPassword, setEditPassword] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirmation
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verify/unverify
  const [verifyUser, setVerifyUser] = useState<AdminUser | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Impersonate
  const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "20",
        });
        if (debouncedSearch) params.set("search", debouncedSearch);

        const response = await fetch(`/api/admin/users?${params}`);
        if (!response.ok) {
          if (response.status === 403) {
            addToast("Admin access required", "error");
            router.push("/dashboard");
            return;
          }
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        addToast("Failed to load users", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [debouncedSearch, router, addToast]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role);
    setEditPassword("");
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setIsSavingEdit(true);
    try {
      const body: Record<string, unknown> = {
        name: editName,
        email: editEmail,
        role: editRole,
      };
      if (editPassword) body.password = editPassword;

      const response = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to update user", "error");
        return;
      }

      addToast("User updated successfully!", "success");
      setEditUser(null);
      fetchUsers(pagination.page);
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to delete user", "error");
        return;
      }

      addToast("User deleted successfully!", "success");
      setDeleteUser(null);
      fetchUsers(pagination.page);
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVerify = async () => {
    if (!verifyUser) return;
    setIsVerifying(true);
    try {
      const response = await fetch(
        `/api/admin/users/${verifyUser.id}/verify`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to verify user", "error");
        return;
      }

      addToast("User verified successfully!", "success");
      setVerifyUser(null);
      fetchUsers(pagination.page);
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImpersonate = async (userId: string) => {
    setIsImpersonating(userId);
    try {
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        addToast(result.error || "Failed to impersonate user", "error");
        return;
      }

      addToast(
        `Impersonating ${result.user.name || result.user.email}`,
        "success"
      );
      // Sign in as the target user (simplified approach)
      // In a real app, this would use a special impersonation flow
      await signIn("impersonation", {
        impersonationToken: result.impersonationToken,
        redirect: true,
        callbackUrl: "/dashboard",
      });
    } catch {
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsImpersonating(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage users, verify accounts, and configure settings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{pagination.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Page</CardDescription>
            <CardTitle className="text-3xl">
              {pagination.page} / {pagination.totalPages}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((u) => u.isVerified).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Admins</CardDescription>
            <CardTitle className="text-3xl">
              {users.filter((u) => u.role === "admin").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search users
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {debouncedSearch
                  ? "No users match your search"
                  : "No users found"}
              </p>
              {debouncedSearch && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auth</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.image}
                            alt={user.name || ""}
                            fallback={user.name || user.email || "U"}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.name || "Unnamed"}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              user.isActive ? "success" : "destructive"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge
                            variant={
                              user.isVerified ? "success" : "outline"
                            }
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.accounts?.length > 0 ? (
                            user.accounts.map((a) => (
                              <Badge key={a.provider} variant="outline">
                                {a.provider}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Email</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            Edit
                          </Button>
                          {!user.isVerified && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setVerifyUser(user)}
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleImpersonate(user.id)}
                            isLoading={isImpersonating === user.id}
                          >
                            Impersonate
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 dark:text-red-400"
                            onClick={() => setDeleteUser(user)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchUsers(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchUsers(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        {editUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" required>
                  Name
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email" required>
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role" required>
                  Role
                </Label>
                <Select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  options={[
                    { label: "User", value: "user" },
                    { label: "Admin", value: "admin" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">
                  New Password{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} isLoading={isSavingEdit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        {deleteUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-medium">
                  {deleteUser.name || deleteUser.email}
                </span>
                ? This action cannot be undone. All related data (sessions,
                accounts) will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Verify Confirmation Modal */}
      <Dialog
        open={!!verifyUser}
        onOpenChange={(open) => !open && setVerifyUser(null)}
      >
        {verifyUser && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify User</DialogTitle>
              <DialogDescription>
                Mark{" "}
                <span className="font-medium">
                  {verifyUser.name || verifyUser.email}
                </span>{" "}
                as email verified. This will bypass the email verification
                process.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setVerifyUser(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleToggleVerify} isLoading={isVerifying}>
                Verify User
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
