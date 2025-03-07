import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { FunctionReturnType } from 'convex/server'
import { CheckCircle } from 'lucide-react'
import { generatePath, Link } from 'react-router'

type QuizWithProgress = FunctionReturnType<
  typeof api.quizzes.listQuizzesWithProgress
>[number]

export function QuizItem({ quiz }: { quiz: QuizWithProgress }) {
  return (
    <Link to={generatePath(ROUTES.quizDetail, { quizId: quiz._id })}>
      <Card className="h-full transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="line-clamp-2 h-16 text-lg">
              {quiz.title}
            </CardTitle>
            {quiz.isCompleted && (
              <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
            )}
          </div>
          <CardDescription>{quiz.createdAt}</CardDescription>
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
  )
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
  )
}
