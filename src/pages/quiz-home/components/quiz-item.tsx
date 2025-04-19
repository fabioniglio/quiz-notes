import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { usePrefetchQuery } from "@/hooks/use-prefetch-query";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { api } from "@convex/api";
import { FunctionReturnType } from "convex/server";
import { format } from "date-fns";
import { useAtom } from "jotai";
import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { generatePath, Link } from "react-router";
import { isSelectModeAtom, selectedQuizIdsAtom } from "../lib/atoms";

type QuizWithProgress = FunctionReturnType<
  typeof api.quizzes.queries.listQuizzesWithProgress
>[number];

export function QuizItem({ quiz }: { quiz: QuizWithProgress }) {
  const quizPath = quiz.isCompleted
    ? generatePath(ROUTES.quizDetailResults, { quizId: quiz._id })
    : generatePath(ROUTES.quizDetail, { quizId: quiz._id });

  const [isSelectMode] = useAtom(isSelectModeAtom);
  const [selectedQuizIds, setSelectedQuizIds] = useAtom(selectedQuizIdsAtom);

  const isSelected = selectedQuizIds.has(quiz._id);

  const toggleSelection = () => {
    const newSelection = new Set(selectedQuizIds);
    if (isSelected) {
      newSelection.delete(quiz._id);
    } else {
      newSelection.add(quiz._id);
    }
    setSelectedQuizIds(newSelection);
  };

  const prefetchResultsQuery = usePrefetchQuery(
    api.quizzes.queries.getQuizResults,
  );

  const prefetchQuizDetailQuery = usePrefetchQuery(
    api.quizzes.queries.getQuizById,
  );

  const handleClick = (event: React.MouseEvent) => {
    if (isSelectMode) {
      event.preventDefault(); // Prevent navigation when in select mode
      toggleSelection();
    }
  };

  const handlePrefetch = () => {
    if (quiz.isCompleted) {
      prefetchResultsQuery({ quizId: quiz._id });
    } else {
      prefetchQuizDetailQuery({ id: quiz._id });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={quizPath} onClick={handleClick} onMouseEnter={handlePrefetch}>
        <Card className="h-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex">
                {isSelectMode && (
                  <div>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection()}
                      className="h-5 w-5 border-2"
                    />
                  </div>
                )}

                <CardTitle
                  className={cn("line-clamp-2 h-16 text-lg", {
                    "pl-6": isSelectMode,
                  })}
                >
                  {quiz.title}
                </CardTitle>
              </div>

              {quiz.isCompleted && (
                <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
              )}
            </div>
            <CardDescription>
              {format(quiz.createdAt, "MMM d, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>
                  {quiz.progressCount} / {quiz.totalQuestions} questions
                </span>
              </div>
              <Progress
                value={(quiz.progressCount / quiz.totalQuestions) * 100}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export function QuizItemSkeleton() {
  return (
    <div className="block">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="h-16 w-full max-w-[90%]">
              {/* Title skeleton - two lines */}
              <div className="bg-muted h-5 w-full animate-pulse rounded-md"></div>
              <div className="bg-muted mt-2 h-5 w-3/4 animate-pulse rounded-md"></div>
            </div>
            {/* Potential check icon skeleton */}
            <div className="bg-muted mt-1 h-5 w-5 flex-shrink-0 animate-pulse rounded-full"></div>
          </div>
          {/* Date skeleton */}
          <div className="bg-muted mt-2 h-4 w-24 animate-pulse rounded-md"></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              {/* Progress text skeleton */}
              <div className="bg-muted h-4 w-16 animate-pulse rounded-md"></div>
              {/* Questions count skeleton */}
              <div className="bg-muted h-4 w-28 animate-pulse rounded-md"></div>
            </div>
            {/* Progress bar skeleton */}
            <div className="bg-muted h-2 w-full animate-pulse rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
