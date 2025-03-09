import { QuizNotFound } from '@/components/quiz-not-found'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ResultsSkeleton } from './components/results-skeleton'

import { QuestionReview } from './components/question-review'
export function QuizResultsPage() {
  const { quizId } = useParams<{ quizId: string }>()

  const results = useQuery(api.quizzes.queries.getQuizResults, {
    quizId: quizId as Id<'quizzes'>,
  })

  if (results === undefined) {
    return <ResultsSkeleton />
  }

  if (results === null) {
    return <QuizNotFound />
  }

  return (
    <div className="mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Quiz Results: {results.title}</h1>
        <p className="text-muted-foreground">
          You scored {results.correctCount} out of {results.questions.length}{' '}
          questions correctly.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="relative h-48 w-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl font-bold">{results.score}%</span>
              </div>
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted fill-none"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  className="stroke-primary fill-none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray={`${results.score * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{results.feedback}</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Question Review</h2>

        {results.questions.map((question) => (
          <QuestionReview key={question.id} question={question} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link to={ROUTES.quizHome} className="flex items-center gap-2">
            Create Another Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
