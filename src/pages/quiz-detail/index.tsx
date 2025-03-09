import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ROUTES } from '@/lib/constants'
import { Status } from '@/lib/schemas'
import { cn, handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { useAction, useMutation, useQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useActionState, useEffect, useState } from 'react'
import { generatePath, Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { QuizNotFound } from '../../components/quiz-not-found'
import { QuizLoadingPlaceholder } from './components/quiz-skeleton'

const formSchema = z.object({
  selectedOption: z.string(),
})

type FormState =
  | {
      status: 'error'
      errorMessage: string
    }
  | {
      status: 'success'
    }
  | {
      status: 'init'
    }

export function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const user = useQuery(api.users.getCurrentUser)

  const quiz = useQuery(api.quizzes.queries.getQuizById, {
    id: quizId as Id<'quizzes'>,
  })

  const nextQuestion = useMutation(api.quizzes.mutations.nextQuestion)
  const previousQuestion = useMutation(api.quizzes.mutations.previousQuestion)
  const completeQuiz = useAction(api.quizzes.actions.completeQuiz)

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [movePreviousQuestionStatus, setMovePreviousQuestionStatus] =
    useState<Status>('idle')

  // move to next question or finish quiz
  const [, formAction, isMovingToNextQuestion] = useActionState<
    FormState,
    FormData
  >(
    async (_, formData) => {
      const { selectedOption: selectedOptionId } = formSchema.parse(
        Object.fromEntries(formData)
      )

      if (!quiz) {
        throw new Error('Quiz not found')
      }

      const isLastQuestion = normalizedIndex === quiz.questions.length

      if (isLastQuestion) {
        const [, error] = await handlePromise(
          completeQuiz({
            quizId: quiz._id,
            selectedOptionId,
          })
        )

        if (error) {
          if (error instanceof ConvexError) {
            toast.error(error.message)
            return { status: 'error', errorMessage: error.message }
          }

          toast.error('An unknown error occurred')
          return { status: 'error', errorMessage: 'An unknown error occurred' }
        }

        setSelectedOptionId(null)
        return { status: 'success' }
      } else {
        const [, error] = await handlePromise(
          nextQuestion({
            quizId: quiz._id,
            selectedOptionId,
          })
        )

        if (error) {
          if (error instanceof ConvexError) {
            toast.error(error.message)
            return { status: 'error', errorMessage: error.message }
          }

          toast.error('An unknown error occurred')
          return { status: 'error', errorMessage: 'An unknown error occurred' }
        }

        setSelectedOptionId(null)
        return { status: 'success' }
      }
    },
    { status: 'init' }
  )

  const handlePreviousQuestion = async () => {
    if (!quiz) {
      throw new Error('Quiz not found')
    }

    setMovePreviousQuestionStatus('loading')

    const [, error] = await handlePromise(
      previousQuestion({
        quizId: quiz._id,
      })
    )

    if (error) {
      if (error instanceof ConvexError) {
        toast.error(error.message)
        setMovePreviousQuestionStatus('error')
        return
      }

      toast.error('An unknown error occurred')
      setMovePreviousQuestionStatus('error')
      return
    }

    setMovePreviousQuestionStatus('success')
  }

  useEffect(() => {
    if (user && quiz && quiz.userId !== user._id) {
      toast.error('Unauthorized to work on this quiz.')
      void navigate(generatePath(ROUTES.quizHome))
    }
  }, [navigate, quiz, user])

  // We always want this to run when question changes
  useEffect(() => {
    // If user went backwards - we wanna check if they've already answered the question
    if (quiz) {
      const currentQuestion = quiz.questions[quiz.progress.currentQuestionIndex]
      const existingAnswer = quiz.progress.answers.find(
        (answer) => answer.questionId === currentQuestion.id
      )

      if (!existingAnswer || !existingAnswer.selectedOptionId) return

      setSelectedOptionId(existingAnswer.selectedOptionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.progress.currentQuestionIndex])

  if (quiz === undefined) {
    return <QuizLoadingPlaceholder quizId={quizId!} />
  }

  if (quiz === null) {
    return <QuizNotFound />
  }

  const currentIndex = quiz.progress.currentQuestionIndex || 0
  const currentQuestion = quiz.questions[currentIndex]

  const normalizedIndex = currentIndex + 1
  const progress = (normalizedIndex / quiz?.questions.length) * 100
  const isLastQuestion = normalizedIndex === quiz.questions.length
  const isFirstQuestion = normalizedIndex === 1

  const isMovingToPreviousQuestion = movePreviousQuestionStatus === 'loading'

  const isPreviousButtonDisabled = Boolean(
    isMovingToPreviousQuestion || isFirstQuestion || quiz.isCompleted
  )
  const isNextButtonDisabled = Boolean(
    selectedOptionId === null || isMovingToNextQuestion || quiz.isCompleted
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm font-medium">
            {normalizedIndex} of {quiz.questions.length}
          </span>
        </div>
      </div>

      <form action={formAction}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedOptionId || ''}
              onValueChange={(value) => setSelectedOptionId(value)}
              className="flex flex-col gap-4"
              name="selectedOption"
            >
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'cursor-pointer rounded-md border p-4 transition-colors',
                    {
                      'border-primary bg-primary/5':
                        selectedOptionId === option.id,
                      'hover:bg-muted': selectedOptionId !== option.id,
                    }
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                        {
                          'border-primary bg-primary text-primary-foreground':
                            selectedOptionId === option.id,
                          'border-muted-foreground':
                            selectedOptionId !== option.id,
                        }
                      )}
                    >
                      {option.id.toUpperCase()}
                    </div>
                    <div className="text-sm">{option.text}</div>
                    <RadioGroupItem
                      value={option.id}
                      className="sr-only after:absolute after:inset-0"
                    />
                  </div>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              disabled={isPreviousButtonDisabled}
              variant="outline"
              type="button"
              onClick={handlePreviousQuestion}
            >
              Previous
            </Button>
            <Button
              disabled={isNextButtonDisabled}
              type="submit"
              isLoading={isMovingToNextQuestion}
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next'}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {quiz.isCompleted && (
        <div className="mt-10 flex justify-center">
          <Button size="lg" asChild>
            <Link
              to={generatePath(ROUTES.quizDetailResults, {
                quizId: quizId!,
              })}
            >
              View Results
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
