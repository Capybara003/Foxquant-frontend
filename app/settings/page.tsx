"use client"

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { accountAPI } from "@/services/api";

export default function SettingsPage() {
  const { user, setUser } = useAuthLogic();
  const [alpacaPaperApiKey, setAlpacaPaperApiKey] = useState(user?.alpacaPaperApiKey || "");
  const [alpacaPaperSecretKey, setAlpacaPaperSecretKey] = useState(user?.alpacaPaperSecretKey || "");
  const [alpacaLiveApiKey, setAlpacaLiveApiKey] = useState(user?.alpacaLiveApiKey || "");
  const [alpacaLiveSecretKey, setAlpacaLiveSecretKey] = useState(user?.alpacaLiveSecretKey || "");
  const [alpacaEnv, setAlpacaEnv] = useState<'paper' | 'live'>(user?.alpacaEnv || 'paper');
  const [showKeys, setShowKeys] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await accountAPI.updateAlpacaKeys(
        alpacaPaperApiKey,
        alpacaPaperSecretKey,
        alpacaLiveApiKey,
        alpacaLiveSecretKey,
        alpacaEnv
      );
      if (res.success) {
        setSuccess("Alpaca keys updated successfully.");
        setIsEditing(false);
        setUser(res.user);
      } else {
        setError(res.error || "Failed to update keys");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update keys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await accountAPI.removeAlpacaKeys();
      if (res.success) {
        setSuccess("Alpaca keys removed.");
        setAlpacaPaperApiKey("");
        setAlpacaPaperSecretKey("");
        setAlpacaLiveApiKey("");
        setAlpacaLiveSecretKey("");
        setAlpacaEnv('paper');
        setUser(res.user);
      } else {
        setError(res.error || "Failed to remove keys");
      }
    } catch (err: any) {
      setError(err.message || "Failed to remove keys");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-8">
        <Card title="Account Settings" subtitle="Manage your Alpaca API keys and environment">
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Paper API Key:</span>
              <span className="text-gray-900">
                {user?.alpacaPaperApiKey
                  ? showKeys
                    ? user.alpacaPaperApiKey
                    : user.alpacaPaperApiKey.replace(/.(?=.{4})/g, "*")
                  : <span className="text-gray-400">Not set</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Live API Key:</span>
              <span className="text-gray-900">
                {user?.alpacaLiveApiKey
                  ? showKeys
                    ? user.alpacaLiveApiKey
                    : user.alpacaLiveApiKey.replace(/.(?=.{4})/g, "*")
                  : <span className="text-gray-400">Not set</span>}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Environment:</span>
              <span className="text-gray-900 capitalize">{user?.alpacaEnv || 'paper'}</span>
            </div>
            {(user?.alpacaPaperApiKey || user?.alpacaLiveApiKey) && (
              <button
                className="text-xs text-primary-600 underline"
                onClick={() => setShowKeys((v) => !v)}
              >
                {showKeys ? "Hide" : "Show"}
              </button>
            )}
          </div>
          {isEditing ? (
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <label className="block text-xs font-medium text-gray-600">Paper API Key</label>
                <input
                  type="text"
                  value={alpacaPaperApiKey}
                  onChange={e => setAlpacaPaperApiKey(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Paper Secret Key</label>
                <input
                  type="password"
                  value={alpacaPaperSecretKey}
                  onChange={e => setAlpacaPaperSecretKey(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Live API Key</label>
                <input
                  type="text"
                  value={alpacaLiveApiKey}
                  onChange={e => setAlpacaLiveApiKey(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Live Secret Key</label>
                <input
                  type="password"
                  value={alpacaLiveSecretKey}
                  onChange={e => setAlpacaLiveSecretKey(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Environment</label>
                <select
                  value={alpacaEnv}
                  onChange={e => setAlpacaEnv(e.target.value as 'paper' | 'live')}
                  className="mt-1 block w-full border-gray-300 rounded-md"
                >
                  <option value="paper">Paper</option>
                  <option value="live">Live</option>
                </select>
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && <div className="text-green-600 text-sm">{success}</div>}
              <div className="flex gap-2">
                <Button type="submit" isLoading={isLoading}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(true)}>Update Keys</Button>
              {(user?.alpacaPaperApiKey || user?.alpacaLiveApiKey) && (
                <Button variant="outline" onClick={handleRemove} isLoading={isLoading}>Disconnect Alpaca</Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
} 