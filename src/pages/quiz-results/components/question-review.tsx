import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { QuestionFromQuizResult } from '../lib/schemas'

export function QuestionReview({
  question,
}: {
  question: QuestionFromQuizResult
}) {
  return (
    <Card
      key={question.id}
      className={question.isCorrect ? 'border-green-200' : 'border-red-200'}
    >
      <CardHeader>
        <div className="flex items-start gap-2">
          {question.isCorrect ? (
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-500" />
          ) : (
            <XCircle className="mt-1 h-5 w-5 shrink-0 text-red-500" />
          )}
          <CardTitle className="text-base">{question.question}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <span className="font-medium">Your answer: </span>
            <span
              className={question.isCorrect ? 'text-green-600' : 'text-red-600'}
            >
              Option {question.userSelectedId?.toUpperCase()}
            </span>
          </div>

          {!question.isCorrect && (
            <div className="text-sm">
              <span className="font-medium">Correct answer: </span>
              <span className="text-green-600">
                Option {question.correctAnswer?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">Explanation:</p>
          <p className="text-muted-foreground">{question.explanation}</p>
        </div>
      </CardContent>
    </Card>
  )
}
