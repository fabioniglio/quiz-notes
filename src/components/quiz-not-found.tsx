import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { Link } from 'react-router'

export function QuizNotFound() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-bold">Quiz Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The quiz you are looking for does not exist.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link to={ROUTES.quizHome}>Go to Home</Link>
        </Button>
      </div>
    </div>
  )
}
