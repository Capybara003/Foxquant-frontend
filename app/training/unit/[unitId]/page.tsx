"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ArrowLeft, Check, X, RotateCcw, Star, BookOpen } from "lucide-react";
import { trainingAPI } from "@/services/api";

interface UnitContent {
  id: string;
  title: string;
  content: string;
  unitType: string;
  progress: any;
  module?: {
    id: string;
    title: string;
  };
}

export default function UnitPage() {
  const params = useParams();
  const router = useRouter();
  const [unit, setUnit] = useState<UnitContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  // Matching specific state: term index -> definition index mapping
  const [matchingAssignments, setMatchingAssignments] = useState<
    Record<number, number | null>
  >({});
  const [draggingDefIndex, setDraggingDefIndex] = useState<number | null>(null);
  const [selectedDefIndex, setSelectedDefIndex] = useState<number | null>(null);
  const [shuffledDefinitions, setShuffledDefinitions] = useState<string[]>([]);
  const [definitionMapping, setDefinitionMapping] = useState<
    Record<number, number>
  >({});
  // DnD sensors must be declared at the top level to preserve hook order
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  // Initialize matching slots when a matching unit loads
  useEffect(() => {
    if (!unit) return;
    if (unit.unitType !== "matching") return;
    try {
      const content = JSON.parse(unit.content);
      if (
        Array.isArray(content?.terms) &&
        Array.isArray(content?.definitions)
      ) {
        const init: Record<number, number | null> = {};
        content.terms.forEach((_t: any, idx: number) => {
          if (matchingAssignments[idx] === undefined) init[idx] = null;
        });
        if (Object.keys(init).length)
          setMatchingAssignments({ ...matchingAssignments, ...init });

        // Shuffle definitions and create mapping
        const shuffled = [...content.definitions].sort(
          () => Math.random() - 0.5
        );
        setShuffledDefinitions(shuffled);

        // Create mapping from shuffled index to original index
        const mapping: Record<number, number> = {};
        shuffled.forEach((shuffledDef, shuffledIndex) => {
          const originalIndex = content.definitions.indexOf(shuffledDef);
          mapping[shuffledIndex] = originalIndex;
        });
        setDefinitionMapping(mapping);
      }
    } catch {}
  }, [unit]);

  useEffect(() => {
    if (params.unitId) {
      fetchUnit(params.unitId as string);
    }
  }, [params.unitId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const fetchUnit = async (unitId: string) => {
    try {
      const data = await trainingAPI.getUnit(unitId);
      setUnit(data);
    } catch (error) {
      console.error("Error fetching unit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!unit) return;

    try {
      const tokensEarned = calculateTokensEarned();

      await trainingAPI.updateUnitProgress(unit.id, {
        completed: true,
        timeSpent,
        tokensEarned,
        score: requiresSubmission(unit.unitType) ? calculateScore() : undefined,
      });

      router.push(`/training/module/${unit.module?.id}`);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const calculateTokensEarned = () => {
    let tokens = 10;

    if (timeSpent > 300) {
      tokens += 5;
    }

    if (requiresSubmission(unit?.unitType || "") && showResults) {
      const score = calculateScore();
      if (score >= 90) tokens += 10;
      else if (score >= 80) tokens += 5;
    }

    return tokens;
  };

  const calculateScore = () => {
    if (!unit) return 0;
    const content = JSON.parse(unit.content);
    if (unit.unitType === "quiz") {
      const total = content.questions.length;
      const correct = content.questions.reduce(
        (acc: number, q: any, idx: number) => {
          return acc + (userAnswers[idx] === q.correctAnswer ? 1 : 0);
        },
        0
      );
      return Math.round((correct / total) * 100);
    }
    if (unit.unitType === "fill_blank") {
      const total = content.questions.length;
      const normalize = (s: string) =>
        (s || "").toString().trim().toLowerCase();
      const correct = content.questions.reduce(
        (acc: number, q: any, idx: number) => {
          return (
            acc + (normalize(userAnswers[idx]) === normalize(q.answer) ? 1 : 0)
          );
        },
        0
      );
      return Math.round((correct / total) * 100);
    }
    if (unit.unitType === "matching") {
      const total = content.terms.length;
      const correct = content.terms.reduce(
        (acc: number, _t: any, idx: number) => {
          // Check if the assigned definition (shuffled index) maps to the correct original index
          const assignedShuffledIndex = matchingAssignments[idx];
          if (
            assignedShuffledIndex === null ||
            assignedShuffledIndex === undefined
          )
            return acc;
          const originalDefinitionIndex =
            definitionMapping[assignedShuffledIndex];
          return acc + (originalDefinitionIndex === idx ? 1 : 0);
        },
        0
      );
      return Math.round((correct / total) * 100);
    }
    return 0;
  };

  const allAnswered = () => {
    if (!unit) return false;
    const content = JSON.parse(unit.content);
    if (unit.unitType === "quiz") {
      return content.questions.every(
        (_q: any, idx: number) => userAnswers[idx] !== undefined
      );
    }
    if (unit.unitType === "fill_blank") {
      return content.questions.every(
        (_q: any, idx: number) =>
          (userAnswers[idx] || "").toString().trim().length > 0
      );
    }
    if (unit.unitType === "matching") {
      return content.terms.every(
        (_t: any, idx: number) =>
          matchingAssignments[idx] !== undefined &&
          matchingAssignments[idx] !== null
      );
    }
    return true;
  };

  const requiresSubmission = (type: string) =>
    ["quiz", "fill_blank", "matching"].includes(type);

  const handleSubmit = () => {
    if (!unit) return;
    if (!allAnswered()) return;
    setIsSubmitting(true);
    setShowResults(true);
    // small timeout to allow UI state change; not required for backend
    setTimeout(() => setIsSubmitting(false), 150);
  };

  const renderContent = () => {
    if (!unit) return null;

    const content = JSON.parse(unit.content);

    switch (unit.unitType) {
      case "definition":
        return renderDefinition(content);
      case "example":
        return renderExample(content);
      case "fill_blank":
        return renderFillBlank(content);
      case "matching":
        return renderMatching(content);
      case "flashcard":
        return <FlashcardContent content={content} />;
      case "quiz":
        return renderQuiz(content);
      default:
        return renderDefault(content);
    }
  };

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
  );

  const renderExample = (content: any) => (
    <div className="space-y-4">
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Real-World Example
        </h3>
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
  );

  const renderFillBlank = (content: any) => (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          Fill in the Blanks
        </h3>
        <div className="space-y-4">
          {content.questions.map((question: any, index: number) => (
            <div key={index} className="space-y-2">
              <p className="text-yellow-800 flex items-center justify-between">
                <span>{question.text}</span>
                {showResults && (
                  <span
                    className={
                      (userAnswers[index] || "")
                        .toString()
                        .trim()
                        .toLowerCase() ===
                      (question.answer || "").toString().trim().toLowerCase()
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {(userAnswers[index] || "")
                      .toString()
                      .trim()
                      .toLowerCase() ===
                    (question.answer || "").toString().trim().toLowerCase()
                      ? "Correct"
                      : `Answer: ${question.answer}`}
                  </span>
                )}
              </p>
              <Input
                placeholder="Your answer"
                value={userAnswers[index] || ""}
                onChange={(e) =>
                  setUserAnswers({ ...userAnswers, [index]: e.target.value })
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!allAnswered() || isSubmitting}
          >
            Submit Answers
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMatching = (content: any) => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">
          Matching Exercise
        </h3>
        <p className="text-purple-700 mb-4">
          Drag the definitions from the pool below to match with the terms on
          the left.
        </p>
        <DndContext
          sensors={sensors}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (!active || !over) return;
            const defMatch = String(active.id).match(/^def-(\d+)$/);
            const termMatch = String(over.id).match(/^term-(\d+)$/);
            if (!defMatch || !termMatch) return;
            const defIndex = parseInt(defMatch[1], 10);
            const termIndex = parseInt(termMatch[1], 10);
            setMatchingAssignments({
              ...matchingAssignments,
              [termIndex]: defIndex,
            });
            setSelectedDefIndex(null);
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Terms Column */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">Terms</h4>
              <div className="space-y-3">
                {content.terms.map((term: string, index: number) => (
                  <DroppableTerm
                    key={index}
                    index={index}
                    termLabel={`${index + 1}. ${term}`}
                    assignedIndex={matchingAssignments[index]}
                    showResults={showResults}
                    definitionMapping={definitionMapping}
                    shuffledDefinitions={shuffledDefinitions}
                    onClick={() => {
                      if (selectedDefIndex === null) return;
                      setMatchingAssignments({
                        ...matchingAssignments,
                        [index]: selectedDefIndex,
                      });
                      setSelectedDefIndex(null);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Definitions Pool */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">
                Definitions Pool
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {shuffledDefinitions.map((def: string, index: number) => (
                  <DraggableDef
                    key={index}
                    index={index}
                    label={`${String.fromCharCode(65 + index)}. ${def}`}
                    selected={selectedDefIndex === index}
                    onClick={() =>
                      setSelectedDefIndex(
                        selectedDefIndex === index ? null : index
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </DndContext>
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!allAnswered() || isSubmitting}
          >
            Submit Matches
          </Button>
          {selectedDefIndex !== null && (
            <span className="ml-3 text-sm text-purple-700">
              Selected: {String.fromCharCode(65 + selectedDefIndex)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  function DraggableDef({
    index,
    label,
    selected,
    onClick,
  }: {
    index: number;
    label: string;
    selected: boolean;
    onClick: () => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: `def-${index}` });
    const style: any = {
      transform: CSS.Translate.toString(transform),
      opacity: isDragging ? 0.8 : 1,
      touchAction: "none",
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`p-2 bg-white rounded border cursor-move ${
          selected ? "ring-2 ring-purple-400" : ""
        }`}
        onClick={onClick}
      >
        {label}
      </div>
    );
  }

  function DroppableTerm({
    index,
    termLabel,
    assignedIndex,
    showResults,
    definitionMapping,
    shuffledDefinitions,
    onClick,
  }: {
    index: number;
    termLabel: string;
    assignedIndex: number | null | undefined;
    showResults: boolean;
    definitionMapping: Record<number, number>;
    shuffledDefinitions: string[];
    onClick: () => void;
  }) {
    const { isOver, setNodeRef } = useDroppable({ id: `term-${index}` });

    // Get the assigned definition text if there's an assignment
    const assignedDefinition =
      assignedIndex !== null && assignedIndex !== undefined
        ? shuffledDefinitions[assignedIndex]
        : null;

    // Check if the assignment is correct
    const isCorrect =
      showResults && assignedIndex !== null && assignedIndex !== undefined
        ? definitionMapping[assignedIndex] === index
        : null;

    return (
      <div
        ref={setNodeRef}
        className={`p-3 bg-white rounded-lg border-2 transition-colors ${
          showResults
            ? isCorrect
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50"
            : isOver
            ? "border-purple-400 bg-purple-50"
            : "border-gray-200 hover:border-purple-300"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{termLabel}</span>
          <span className="text-sm text-gray-500">
            {assignedIndex !== undefined && assignedIndex !== null
              ? String.fromCharCode(65 + (assignedIndex as number))
              : "—"}
          </span>
        </div>
        {assignedDefinition && (
          <div className="mt-2 text-sm text-gray-600">{assignedDefinition}</div>
        )}
        {showResults && isCorrect !== null && (
          <div className="mt-2 text-xs font-medium">
            {isCorrect ? (
              <span className="text-green-600">✓ Correct</span>
            ) : (
              <span className="text-red-600">✗ Incorrect</span>
            )}
          </div>
        )}
      </div>
    );
  }

  function FlashcardContent({ content }: { content: any }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
      <div className="space-y-4">
        <div className="bg-orange-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">
            \ Flashcard
          </h3>
          <div className="relative">
            <div
              className="bg-white p-8 rounded-lg shadow-lg cursor-pointer transform transition-transform duration-300"
              style={{
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">
                  {isFlipped ? "Answer" : "Question"}
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
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                {isFlipped ? "Show Question" : "Show Answer"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
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
                  <label
                    key={optionIndex}
                    className={`flex items-center space-x-2 cursor-pointer ${
                      showResults
                        ? optionIndex === question.correctAnswer
                          ? "text-green-700"
                          : userAnswers[index] === optionIndex
                          ? "text-red-700"
                          : ""
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optionIndex}
                      checked={userAnswers[index] === optionIndex}
                      onChange={(e) =>
                        setUserAnswers({
                          ...userAnswers,
                          [index]: parseInt(e.target.value),
                        })
                      }
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
            onClick={handleSubmit}
            disabled={!allAnswered() || isSubmitting}
          >
            Submit Quiz
          </Button>
          {showResults && (
            <span className="ml-4 font-semibold text-gray-800">
              Score: {calculateScore()}%
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderDefault = (content: any) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700">{content.text}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!unit) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Unit not found
          </h2>
        </div>
      </DashboardLayout>
    );
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
              className="flex items-center"
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
        <Card className="p-6">{renderContent()}</Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex justify-center items-center"
          >
            Back to Module
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={requiresSubmission(unit.unitType) && !showResults}
            className="flex justify-center items-center"
          >
            <Check className="h-4 w-4 mr-1" />
            Complete Unit
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
