import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getSkeletonOptionsPerQuestionKey } from '../lib/utils'

const DEFAULT_SKELETON_OPTIONS_PER_QUESTION = 5

export function QuizLoadingPlaceholder({ quizId }: { quizId: string }) {
  const localStorageOptionsPerQuestion = localStorage.getItem(
    getSkeletonOptionsPerQuestionKey(quizId)
  )

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <Skeleton className="mb-2 h-8 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-2 flex-1" />
          <Skeleton className="h-5 w-16" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-full" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {Array(
              localStorageOptionsPerQuestion
                ? parseInt(localStorageOptionsPerQuestion)
                : DEFAULT_SKELETON_OPTIONS_PER_QUESTION
            )
              .fill(0)
              .map((_, i) => (
                <div key={i} className="cursor-default rounded-md border p-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button disabled>Next</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
