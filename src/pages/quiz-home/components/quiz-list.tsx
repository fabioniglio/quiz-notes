import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { QuizItem, QuizItemSkeleton } from './quiz-item'

export function QuizList() {
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
