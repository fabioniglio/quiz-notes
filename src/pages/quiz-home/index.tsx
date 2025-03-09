import { QuizForm } from './components/quiz-form'
import { QuizList } from './components/quiz-list'

export function QuizHomePage() {
  return (
    <div className="mx-auto flex flex-col gap-10">
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
