import { api } from '@convex/_generated/api'
import { FunctionReturnType } from 'convex/server'

export type QuizResults = NonNullable<
  FunctionReturnType<typeof api.quizzes.queries.getQuizResults>
>

export type QuestionFromQuizResult = QuizResults['questions'][number]
