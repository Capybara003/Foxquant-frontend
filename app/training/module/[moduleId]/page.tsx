'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { ArrowLeft, Play, CheckCircle, Lock, BookOpen, Clock, Star } from 'lucide-react'
import { trainingAPI } from '@/services/api'

interface Unit {
  id: string
  title: string
  content: string
  order: number
  unitType: string
  progress: any
  isCompleted: boolean
}

interface Module {
  id: string
  title: string
  description: string
  phase: string
  units: Unit[]
}

export default function ModulePage() {
  const params = useParams()
  const router = useRouter()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.moduleId) {
      fetchModule(params.moduleId as string)
    }
  }, [params.moduleId])

  const fetchModule = async (moduleId: string) => {
    try {
      const data = await trainingAPI.getModule(moduleId)
      setModule(data)
    } catch (error) {
      console.error('Error fetching module:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUnitIcon = (unitType: string) => {
    switch (unitType) {
      case 'definition':
        return <BookOpen className="h-4 w-4" />
      case 'example':
        return <Star className="h-4 w-4" />
      case 'fill_blank':
        return <BookOpen className="h-4 w-4" />
      case 'matching':
        return <BookOpen className="h-4 w-4" />
      case 'flashcard':
        return <BookOpen className="h-4 w-4" />
      case 'quiz':
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getUnitTypeLabel = (unitType: string) => {
    switch (unitType) {
      case 'definition':
        return 'Definition'
      case 'example':
        return 'Example'
      case 'fill_blank':
        return 'Fill in the Blank'
      case 'matching':
        return 'Matching'
      case 'flashcard':
        return 'Flashcard'
      case 'quiz':
        return 'Quiz'
      default:
        return 'Content'
    }
  }

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case 'definition':
        return 'bg-blue-100 text-blue-800'
      case 'example':
        return 'bg-green-100 text-green-800'
      case 'fill_blank':
        return 'bg-yellow-100 text-yellow-800'
      case 'matching':
        return 'bg-purple-100 text-purple-800'
      case 'flashcard':
        return 'bg-orange-100 text-orange-800'
      case 'quiz':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (!module) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Module not found</h2>
        </div>
      </DashboardLayout>
    )
  }

  const completedUnits = module.units.filter(unit => unit.isCompleted).length
  const totalUnits = module.units.length
  const progress = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/training')}
            className='flex items-center'
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Training
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
            <p className="text-gray-600 mt-1">{module.description}</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Module Progress</h3>
              <p className="text-sm text-gray-600">
                {completedUnits} of {totalUnits} units completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">{Math.round(progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Units</h2>
          {module.units.map((unit, index) => (
            <Card key={unit.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getUnitIcon(unit.unitType)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUnitTypeColor(unit.unitType)}`}>
                        {getUnitTypeLabel(unit.unitType)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                    {unit.progress && unit.progress.timeSpent && (
                      <p className="text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {Math.round(unit.progress.timeSpent / 60)} minutes spent
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {unit.isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                  <Button
                    variant={unit.isCompleted ? "outline" : "primary"}
                    size="sm"
                    onClick={() => router.push(`/training/unit/${unit.id}`)}
                    disabled={!unit.isCompleted && index > 0 && !module.units[index - 1].isCompleted}
                    className='flex items-center'
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {unit.isCompleted ? 'Review' : 'Start'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {progress === 100 && (
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Module Completed!</h3>
                <p className="text-green-600">
                  Congratulations! You've completed all units in this module. 
                  You can now move on to the next module or take the mastery quiz.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
} 