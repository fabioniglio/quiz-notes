import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { ROUTES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { useActionState, useId, useState } from 'react'
import { generatePath, Link } from 'react-router'

const OPTIONS_PER_QUESTION = [
  { value: '2', label: '2 Options' },
  { value: '3', label: '3 Options' },
  { value: '4', label: '4 Options' },
  { value: '5', label: '5 Options' },
  { value: '6', label: '6 Options' },
]

type QuizWithProgress = FunctionReturnType<
  typeof api.quizzes.listQuizzesWithProgress
>[number]

type FormState =
  | {
      status: 'error'
      errors: {
        email: string
      }
    }
  | {
      status: 'success'
    }

function QuizItem({ quiz }: { quiz: QuizWithProgress }) {
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

function QuizItemSkeleton() {
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

function QuizList() {
  const recentQuizzes = useQuery(api.quizzes.listQuizzesWithProgress)

  // loading
  if (recentQuizzes === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <QuizItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  // empty
  if (recentQuizzes.length === 0) {
    return (
      <div className="mt-10 flex items-center justify-center">
        <p className="text-muted-foreground">No quizzes yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recentQuizzes.map((quiz) => (
        <QuizItem key={quiz._id} quiz={quiz} />
      ))}
    </div>
  )
}

function QuizForm() {
  const id = useId()
  const [numberOfQuestions, setNumberOfQuestions] = useState(10)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      console.log(Object.fromEntries(formData))
    },
    { status: 'error', errors: { email: '' } }
  )

  return (
    <form className="flex flex-col gap-12" action={formAction}>
      <div className="flex flex-col gap-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Your Study Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Paste your study notes here..."
          name="notes"
          className="min-h-[200px] resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="context" className="text-sm font-medium">
          Additional Context (Optional)
        </label>
        <Input
          id="context"
          placeholder="E.g., Lecture name, book title, or specific topic"
          name="context"
        />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Number of Questions:{' '}
            <span className="font-bold">{numberOfQuestions}</span>
          </label>
          <Slider
            value={[numberOfQuestions]}
            onValueChange={(value) => setNumberOfQuestions(value[0])}
            min={5}
            max={20}
            step={1}
            name="numberOfQuestions"
            className="mt-2"
          />
        </div>

        <div className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Options per Question</legend>
          <RadioGroup
            className="grid grid-cols-3 gap-2"
            defaultValue="4"
            name="optionsPerQuestion"
          >
            {OPTIONS_PER_QUESTION.map((item) => (
              <label
                key={`${id}-${item.value}`}
                className="border-input has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/10 relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border px-2 py-3 text-center shadow-sm shadow-black/5 outline-offset-2 transition-colors"
              >
                <RadioGroupItem
                  id={`${id}-${item.value}`}
                  value={item.value}
                  className="sr-only after:absolute after:inset-0"
                />
                <p className="text-foreground text-sm leading-none font-medium">
                  {item.label}
                </p>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          size="lg"
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          Generate Quiz
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

export function QuizHome() {
  return (
    <div className="mx-auto flex flex-col gap-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Create a New Quiz</h1>
        <p className="text-muted-foreground">
          Enter your study notes and we&apos;ll generate a quiz to help you
          learn.
        </p>
      </div>

      <QuizForm />

      <div className="border-t pt-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Recent Quizzes</h2>
          <QuizList />
        </div>
      </div>
    </div>
  )
}
