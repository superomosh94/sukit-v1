"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? "Failed to change password");
      return;
    }

    setMessage("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure? This will permanently delete your account and all sites.",
      )
    ) return;

    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    if (res.ok) {
      signOut({ callbackUrl: "/" });
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account security
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {message && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-400">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 block w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Update Password
          </button>
        </form>
      </section>

      <section className="space-y-4 rounded-lg border border-destructive/20 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="rounded-lg bg-destructive px-6 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
