import { Input } from '@/components/ui/input'
import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { FunctionReturnType } from 'convex/server'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { QuizForm } from './components/quiz-form'
import { QuizList } from './components/quiz-list'

export type QuizWithProgress = FunctionReturnType<
  typeof api.quizzes.queries.listQuizzesWithProgress
>[number]

export function QuizHomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const recentQuizzes = useQuery(api.quizzes.queries.listQuizzesWithProgress)

  const filteredQuizzes = recentQuizzes?.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Quizzes</h2>

            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <Input
                placeholder="Search"
                className="w-full pl-10"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
          <QuizList quizzes={filteredQuizzes} />
        </div>
      </div>
    </div>
  )
}
