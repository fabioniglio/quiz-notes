import { QuizNotFound } from "@/components/quiz-not-found";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrefetchQuery } from "@/hooks/use-prefetch-query";
import { ROUTES } from "@/lib/constants";
import { useNavigate } from "react-router";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { generatePath, Link, useParams } from "react-router";
import { QuestionReview } from "./components/question-review";
import { ResultsSkeleton } from "./components/results-skeleton";
import { handlePromise } from "@/lib/utils";
import { toast } from "sonner";

export function QuizResultsPage() {
  const navigate = useNavigate();

  const { quizId } = useParams<{ quizId: string }>();
  const resetQuiz = useMutation(api.quizzes.mutations.resetQuiz);

  const results = useQuery(api.quizzes.queries.getQuizResults, {
    quizId: quizId as Id<"quizzes">,
  });

  const prefetchQuizHomeQuery = usePrefetchQuery(
    api.quizzes.queries.listQuizzesWithProgress,
  );

  const handleRetakeQuiz = async () => {
    if (!quizId) return;

    const [, error] = await handlePromise(
      resetQuiz({ quizId: quizId as Id<"quizzes"> }),
    );

    if (error) {
      toast.error("Failed to reset quiz");
      return;
    }

    // Navigate to the quiz page
    void navigate(generatePath(ROUTES.quizDetail, { quizId }));
  };

  const handlePrefetch = () => {
    prefetchQuizHomeQuery({});
  };

  if (results === undefined) {
    return <ResultsSkeleton />;
  }

  if (results === null) {
    return <QuizNotFound />;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Quiz Results: {results.title}</h1>
        <p className="text-muted-foreground">
          You scored {results.correctCount} out of {results.questions.length}{" "}
          questions correctly.
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
                <span className="text-5xl font-bold">{results.score}%</span>
              </div>
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted fill-none"
                  strokeWidth="7"
                  cx="50"
                  cy="50"
                  r="40"
                />
                <circle
                  className="stroke-primary fill-none"
                  strokeWidth="7"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  strokeDasharray={`${results.score * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-2xl">Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-primary mb-3 text-xl font-bold"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-primary mt-4 mb-2 text-lg font-semibold"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-md text-primary/90 mt-3 mb-2 font-medium"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p className="mb-3 leading-relaxed" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="mb-3 list-disc space-y-1 pl-5" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="mb-3 list-decimal space-y-1 pl-5" {...props} />
                ),
                li: ({ ...props }) => <li className="mb-1" {...props} />,
                a: ({ ...props }) => (
                  <a
                    className="text-primary hover:text-primary/80 underline transition-colors"
                    {...props}
                  />
                ),
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-primary/30 my-3 border-l-4 pl-4 italic"
                    {...props}
                  />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                em: ({ ...props }) => (
                  <em className="text-primary/80 italic" {...props} />
                ),
                code: ({ ...props }) => (
                  <code
                    className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm"
                    {...props}
                  />
                ),
                pre: ({ ...props }) => (
                  <pre
                    className="bg-muted mb-4 overflow-x-auto rounded-md p-3 font-mono text-sm"
                    {...props}
                  />
                ),
              }}
            >
              {results.feedback}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Question Review</h2>

        {results.questions.map((question) => (
          <QuestionReview key={question.id} question={question} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => void handleRetakeQuiz()}
          size="lg"
          variant="outline"
          className="mr-5"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Retake Quiz
        </Button>
        <Button asChild size="lg">
          <Link
            to={ROUTES.quizHome}
            className="flex items-center gap-2"
            onMouseEnter={handlePrefetch}
          >
            Create Another Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
