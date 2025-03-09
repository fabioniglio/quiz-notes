import { AnimatePresence } from 'motion/react'
import { QuizWithProgress } from '..'
import { QuizItem, QuizItemSkeleton } from './quiz-item'

type QuizListProps = {
  quizzes: Array<QuizWithProgress> | undefined
}

export function QuizList({ quizzes }: QuizListProps) {
  // loading
  if (quizzes === undefined) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <QuizItemSkeleton key={index} />
        ))}
      </div>
    )
  }

  // empty
  if (quizzes.length === 0) {
    return (
      <div className="mt-10 flex items-center justify-center">
        <p className="text-muted-foreground">No quizzes yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {quizzes.map((quiz) => (
          <QuizItem key={quiz._id} quiz={quiz} />
        ))}
      </AnimatePresence>
    </div>
  )
}
