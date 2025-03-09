import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react'
import { Link, useParams } from 'react-router'

export function QuizResultsPage() {
  const { quizId } = useParams<{ quizId: string }>()

  const results = useQuery(api.quizzes.queries.getQuizResults, {
    quizId: quizId as Id<'quizzes'>,
  })

  if (!results) {
    return (
      <div className="mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground animate-pulse">
            Loading your quiz results...
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
                  <div className="bg-muted h-16 w-16 animate-pulse rounded-full"></div>
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
                    className="stroke-muted-foreground/30 animate-pulse fill-none"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    strokeDasharray="80 251"
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
            <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
            <div className="bg-muted mt-2 h-4 w-3/4 animate-pulse rounded"></div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Question Review</h2>

          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <div className="bg-muted mt-1 h-5 w-5 animate-pulse rounded-full"></div>
                  <div className="bg-muted h-5 w-full animate-pulse rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="text-sm">
                  <span className="font-medium">Your answer: </span>
                  <span className="bg-muted inline-block h-4 w-20 animate-pulse rounded"></span>
                </div>

                <div className="pt-2 text-sm">
                  <p className="font-medium">Explanation:</p>
                  <div className="bg-muted mt-1 h-4 w-full animate-pulse rounded"></div>
                  <div className="bg-muted mt-1 h-4 w-5/6 animate-pulse rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="bg-muted h-10 w-48 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  console.log('results', results)

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
          <Card
            key={question.id}
            className={
              question.isCorrect ? 'border-green-200' : 'border-red-200'
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                {question.isCorrect ? (
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-500" />
                ) : (
                  <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />
                )}
                <CardTitle className="text-base">{question.question}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <div className="text-sm">
                <span className="font-medium">Your answer: </span>
                <span
                  className={
                    question.isCorrect ? 'text-green-600' : 'text-red-600'
                  }
                >
                  Option {question.userSelectedId?.toUpperCase()}
                </span>
              </div>

              {!question.isCorrect && (
                <div className="text-sm">
                  <span className="font-medium">Correct answer: </span>
                  <span className="text-green-600">
                    Option {question.correctAnswer?.toUpperCase()}
                  </span>
                </div>
              )}

              <div className="pt-2 text-sm">
                <p className="font-medium">Explanation:</p>
                <p className="text-muted-foreground">{question.explanation}</p>
              </div>
            </CardContent>
          </Card>
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
