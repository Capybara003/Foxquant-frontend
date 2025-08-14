'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ArrowLeft, Check, X, RotateCcw, Star, BookOpen } from 'lucide-react'
import { trainingAPI } from '@/services/api'

interface UnitContent {
  id: string
  title: string
  content: string
  unitType: string
  progress: any
  module?: {
    id: string
    title: string
  }
}

export default function UnitPage() {
  const params = useParams()
  const router = useRouter()
  const [unit, setUnit] = useState<UnitContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [userAnswers, setUserAnswers] = useState<any>({})
  const [showResults, setShowResults] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (params.unitId) {
      fetchUnit(params.unitId as string)
    }
  }, [params.unitId])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const fetchUnit = async (unitId: string) => {
    try {
      const data = await trainingAPI.getUnit(unitId)
      setUnit(data)
    } catch (error) {
      console.error('Error fetching unit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!unit) return

    try {
      const tokensEarned = calculateTokensEarned()
      
      await trainingAPI.updateUnitProgress(unit.id, {
        completed: true,
        timeSpent,
        tokensEarned,
        score: showResults ? calculateScore() : undefined
      })

      router.push(`/training/module/${unit.module?.id}`)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const calculateTokensEarned = () => {
    let tokens = 10

    if (timeSpent > 300) {
      tokens += 5
    }

    if (unit?.unitType === 'quiz' && showResults) {
      const score = calculateScore()
      if (score >= 90) tokens += 10
      else if (score >= 80) tokens += 5
    }

    return tokens
  }

  const calculateScore = () => {
    return 85
  }

  const renderContent = () => {
    if (!unit) return null

    const content = JSON.parse(unit.content)

    switch (unit.unitType) {
      case 'definition':
        return renderDefinition(content)
      case 'example':
        return renderExample(content)
      case 'fill_blank':
        return renderFillBlank(content)
      case 'matching':
        return renderMatching(content)
      case 'flashcard':
        return renderFlashcard(content)
      case 'quiz':
        return renderQuiz(content)
      default:
        return renderDefault(content)
    }
  }

  const renderDefinition = (content: any) => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Definition</h3>
        <p className="text-blue-800">{content.definition}</p>
      </div>
      {content.explanation && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Explanation</h4>
          <p className="text-gray-700">{content.explanation}</p>
        </div>
      )}
    </div>
  )

  const renderExample = (content: any) => (
    <div className="space-y-4">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Real-World Example</h3>
        <p className="text-green-800">{content.example}</p>
      </div>
      {content.keyPoints && (
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">Key Points</h4>
          <ul className="list-disc list-inside text-yellow-800 space-y-1">
            {content.keyPoints.map((point: string, index: number) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const renderFillBlank = (content: any) => (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">Fill in the Blanks</h3>
        <div className="space-y-4">
          {content.questions.map((question: any, index: number) => (
            <div key={index} className="space-y-2">
              <p className="text-yellow-800">{question.text}</p>
              <Input
                placeholder="Your answer"
                value={userAnswers[index] || ''}
                onChange={(e) => setUserAnswers({ ...userAnswers, [index]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMatching = (content: any) => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Matching Exercise</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Terms</h4>
            <div className="space-y-2">
              {content.terms.map((term: string, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {index + 1}. {term}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 mb-2">Definitions</h4>
            <div className="space-y-2">
              {content.definitions.map((def: string, index: number) => (
                <div key={index} className="p-2 bg-white rounded border">
                  {String.fromCharCode(65 + index)}. {def}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderFlashcard = (content: any) => {
    const [isFlipped, setIsFlipped] = useState(false)
    
    return (
      <div className="space-y-4">
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">Flashcard</h3>
          <div className="relative">
            <div 
              className="bg-white p-8 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300"
              style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {isFlipped ? 'Answer' : 'Question'}
                </h4>
                <p className="text-lg text-gray-700">
                  {isFlipped ? content.answer : content.question}
                </p>
              </div>
            </div>
            <div className="text-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFlipped(!isFlipped)}
                className='flex items-center'
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {isFlipped ? 'Show Question' : 'Show Answer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderQuiz = (content: any) => (
    <div className="space-y-4">
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-4">Quiz</h3>
        <div className="space-y-4">
          {content.questions.map((question: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded border">
              <p className="font-semibold text-gray-900 mb-3">
                {index + 1}. {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((option: string, optionIndex: number) => (
                  <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={userAnswers[index] === optionIndex}
                      onChange={(e) => setUserAnswers({ 
                        ...userAnswers, 
                        [index]: parseInt(e.target.value) 
                      })}
                      className="text-primary-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={() => setShowResults(true)}
          >
            Submit Quiz
          </Button>
        </div>
      </div>
    </div>
  )

  const renderDefault = (content: any) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700">{content.text}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!unit) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Unit not found</h2>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className='flex items-center'
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{unit.title}</h1>
              <p className="text-gray-600 mt-1">
                Time spent: {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-sm text-gray-600">
              +{calculateTokensEarned()} tokens
            </span>
          </div>
        </div>

        {/* Content */}
        <Card className="p-6">
          {renderContent()}
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className='flex justify-center items-center'
          >
            Back to Module
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            className='flex justify-center items-center'
          >
            <Check className="h-4 w-4 mr-1" />
            Complete Unit
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
} 