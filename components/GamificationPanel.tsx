"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Trophy, Star, Flame, Users, Target, Award, Check } from "lucide-react";
import { gamificationAPI } from "@/services/api";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tokensReward: number;
  earned: boolean;
  earnedAt: string | null;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  phase: string | null;
  earned: boolean;
  earnedAt: string | null;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  tokens: number;
  currentPhase: string;
  completedUnits: number;
  achievements: number;
  badges: number;
}

interface GamificationPanelProps {
  onClose: () => void;
}

export default function GamificationPanel({ onClose }: GamificationPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "achievements" | "badges" | "leaderboard"
  >("achievements");
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const [achievementsData, badgesData, leaderboardData] = await Promise.all(
        [
          gamificationAPI.getAchievements(),
          gamificationAPI.getBadges(),
          gamificationAPI.getLeaderboard(),
        ]
      );

      setAchievements(achievementsData);
      setBadges(badgesData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Error fetching gamification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "fundamentals":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-blue-100 text-blue-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Gamification Center
          </h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "achievements"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("achievements")}
          >
            <Trophy className="h-4 w-4 inline mr-2" />
            Achievements
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "badges"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("badges")}
          >
            <Award className="h-4 w-4 inline mr-2" />
            Badges
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "leaderboard"
                ? "text-primary-600 border-b-2 border-primary-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("leaderboard")}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Achievements ({achievements.filter((a) => a.earned).length}/
                {achievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.earned
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {achievement.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            +{achievement.tokensReward} tokens
                          </span>
                        </div>
                      </div>
                      {achievement.earned && (
                        <div className="text-green-600">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Badges ({badges.filter((b) => b.earned).length}/{badges.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border ${
                      badge.earned
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {badge.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {badge.description}
                        </p>
                        {badge.phase && (
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getPhaseColor(
                              badge.phase
                            )}`}
                          >
                            {badge.phase}
                          </span>
                        )}
                      </div>
                      {badge.earned && (
                        <div className="text-blue-600">
                          <Check className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leaderboard
              </h3>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {entry.name}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(
                              entry.currentPhase
                            )}`}
                          >
                            {entry.currentPhase}
                          </span>
                          <span>• {entry.completedUnits} units</span>
                          <span>• {entry.achievements} achievements</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {entry.tokens}
                      </div>
                      <div className="text-sm text-gray-500">tokens</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
