import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ResultsSkeleton() {
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
