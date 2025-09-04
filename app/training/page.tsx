'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import GamificationPanel from '@/components/GamificationPanel'
import { BookOpen, Lock, CheckCircle, Play, Trophy, Star, Flame, Users, Award } from 'lucide-react'
import { trainingAPI } from '@/services/api'

interface Module {
  id: string
  title: string
  description: string
  phase: string
  order: number
  progress: number
  completedUnits: number
  totalUnits: number
  isUnlocked: boolean
}

interface UserProgress {
  totalTokens: number
  completedUnits: number
  totalUnits: number
  completedQuizzes: number
  currentPhase: string
  streakDays: number
  achievements: number
  badges: number
  recentAchievements: any[]
  earnedBadges: any[]
}

export default function TrainingPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showGamification, setShowGamification] = useState(false)
  const router = useRouter()
  useEffect(() => {
    fetchModules()
    fetchProgress()
  }, [])

  const fetchModules = async () => {
    try {
      const data = await trainingAPI.getModules()
      setModules(data)
    } catch (error) {
      console.error('Error fetching modules:', error)
    }
  }

  const fetchProgress = async () => {
    try {
      const data = await trainingAPI.getProgress()
      setProgress(data)
    } catch (error) {
      console.error('Error fetching progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'fundamentals':
        return 'bg-green-100 text-green-800'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'fundamentals':
        return <BookOpen className="h-4 w-4" />
      case 'intermediate':
        return <Star className="h-4 w-4" />
      case 'advanced':
        return <Trophy className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Modules</h1>
            <p className="text-gray-600 mt-2">
              Master the fundamentals of trading and investing through our comprehensive learning modules
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {progress && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-600">{progress.totalTokens}</div>
                <div className="text-sm text-gray-500">Tokens Earned</div>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowGamification(true)}
              className='flex flex-col items-center'
            >
              <Trophy className="h-4 w-4 mr-2" />
              Gamification
            </Button>
          </div>
        </div>

        {progress && (
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{progress.completedUnits}</div>
                <div className="text-sm text-gray-500">Units Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.completedQuizzes}</div>
                <div className="text-sm text-gray-500">Quizzes Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((progress.completedUnits / progress.totalUnits) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 capitalize">{progress.currentPhase}</div>
                <div className="text-sm text-gray-500">Current Phase</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-500 mr-1" />
                  <div className="text-2xl font-bold text-orange-600">{progress.streakDays}</div>
                </div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{progress.achievements}</div>
                <div className="text-sm text-gray-500">Achievements</div>
              </div>
            </div>
          </Card>
        )}

        {progress && progress.recentAchievements.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="flex space-x-4 overflow-x-auto">
              {progress.recentAchievements.map((achievement: any) => (
                <div key={achievement.id} className="flex-shrink-0 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{achievement.achievement.icon}</span>
                    <div>
                      <div className="font-semibold text-green-800">{achievement.achievement.name}</div>
                      <div className="text-sm text-green-600">+{achievement.tokensAwarded} tokens</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getPhaseIcon(module.phase)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(module.phase)}`}>
                    {module.phase}
                  </span>
                </div>
                {!module.isUnlocked && (
                  <Lock className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{module.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{module.completedUnits}/{module.totalUnits} units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex space-x-2">
                {module.isUnlocked ? (
                  <>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-1 flex items-center justify-center"
                      onClick={() => router.push(`/training/module/${module.id}`)}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {module.progress > 0 ? 'Continue' : 'Start'}
                    </Button>
                    {module.progress === 100 && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 flex justify-center items-center"
                    disabled
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Locked
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Phases</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Fundamentals</h4>
              <p className="text-sm text-green-600">Modules 1-3: Basic concepts and portfolio management</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Intermediate</h4>
              <p className="text-sm text-blue-600">Modules 4-6: Strategy building and analysis</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Advanced</h4>
              <p className="text-sm text-purple-600">Modules 7-10: Advanced strategies and risk management</p>
            </div>
          </div>
        </Card>

        {showGamification && (
          <GamificationPanel onClose={() => setShowGamification(false)} />
        )}
      </div>
    </DashboardLayout>
  )
} 