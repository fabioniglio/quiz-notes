import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { usePrefetchQuery } from "@/hooks/use-prefetch-query";
import { ROUTES } from "@/lib/constants";
import { cn, handlePromise } from "@/lib/utils";
import { api } from "@convex/api";
import { Doc, Id } from "@convex/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import ReactConfetti from "react-confetti";
import { flushSync } from "react-dom";
import { generatePath, Link, useNavigate, useParams } from "react-router";
import useMeasure from "react-use-measure";
import { toast } from "sonner";
import { z } from "zod";
import { QuizNotFound } from "@/components/quiz-not-found";
import { QuizLoadingPlaceholder } from "./components/quiz-skeleton";

type Direction = "forwards" | "backwards";

// We use 110% to make it really look like it's either coming in or going out
const formVariants = {
  initial: (direction: Direction) => ({
    opacity: 0,
    // How should it come in?
    // If we're moving forwards, it should come in from the right
    // If we're moving backwards, it should come in from the left
    x: direction === "forwards" ? "110%" : "-110%",
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: Direction) => ({
    opacity: 0,
    // When exiting, where are we going?
    // If we're going forwards, the current step should move backwards and be hidden
    // If we're going backwards, it means the current step should animate out through the right side
    x: direction === "forwards" ? "-110%" : "110%",
  }),
};

const formSchema = z.object({
  selectedOption: z.string(),
});

type FormState =
  | {
      status: "error";
      errorMessage: string;
    }
  | {
      status: "success";
    }
  | {
      status: "init";
    };

export function QuizDetailPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const user = useQuery(api.users.getCurrentUser);

  const quiz = useQuery(api.quizzes.queries.getQuizById, {
    id: quizId as Id<"quizzes">,
  });

  const [ref, bounds] = useMeasure();

  const nextQuestion = useMutation(
    api.quizzes.mutations.nextQuestion,
  ).withOptimisticUpdate((localStore, args) => {
    const { quizId, selectedOptionId } = args;

    // Get the current quiz data from localStore
    const quiz = localStore.getQuery(api.quizzes.queries.getQuizById, {
      id: quizId,
    });

    if (!quiz) return;

    // Only proceed if we have the quiz data
    const currentIndex = quiz.progress?.currentQuestionIndex || 0;
    const currentQuestion = quiz.questions[currentIndex];

    // Math.min is just safety net (same as in the mutation)
    const newIndex = Math.min(currentIndex + 1, quiz.questions.length - 1);

    // Create new answer object
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedOptionId: selectedOptionId,
    };

    // Check if an answer for this question already exists
    const existingAnswerIndex = quiz.progress.answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id,
    );

    let updatedAnswers;
    const hasExistingAnswer = existingAnswerIndex !== -1;
    if (hasExistingAnswer) {
      // Update existing answer
      updatedAnswers = [...quiz.progress.answers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
      // Add new answer
      updatedAnswers = [...quiz.progress.answers, newAnswer];
    }

    // Create new progress object (don't mutate existing objects)
    const newProgress = {
      ...quiz.progress,
      currentQuestionIndex: newIndex,
      lastUpdated: Date.now(),
      answers: updatedAnswers,
    };

    // Create updated quiz object
    const updatedQuiz: Doc<"quizzes"> = {
      ...quiz,
      progress: newProgress,
    };

    console.log("setting updated quiz", updatedQuiz);

    // Update the query result in localStore
    localStore.setQuery(
      api.quizzes.queries.getQuizById,
      { id: quizId },
      updatedQuiz,
    );
  });

  const previousQuestion = useMutation(
    api.quizzes.mutations.previousQuestion,
  ).withOptimisticUpdate((localStore, args) => {
    const { quizId } = args;

    const quiz = localStore.getQuery(api.quizzes.queries.getQuizById, {
      id: quizId,
    });

    if (!quiz) return;

    const currentIndex = quiz.progress?.currentQuestionIndex || 0;

    const newIndex = Math.max(currentIndex - 1, 0);

    const newProgress = {
      ...quiz.progress,
      currentQuestionIndex: newIndex,
    };

    const updatedQuiz: Doc<"quizzes"> = {
      ...quiz,
      progress: newProgress,
    };

    localStore.setQuery(
      api.quizzes.queries.getQuizById,
      { id: quizId },
      updatedQuiz,
    );
  });

  const completeQuiz = useAction(api.quizzes.actions.completeQuiz);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("forwards");

  // complete quiz, we check before actually submitting
  const [, formAction, isCompletingQuiz] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const { selectedOption: selectedOptionId } = formSchema.parse(
        Object.fromEntries(formData),
      );

      if (!quiz) {
        throw new Error("Quiz not found");
      }

      const [, error] = await handlePromise(
        completeQuiz({
          quizId: quiz._id,
          selectedOptionId,
        }),
      );

      if (error) {
        if (error instanceof ConvexError) {
          toast.error(error.message);
          return { status: "error", errorMessage: error.message };
        }

        toast.error("An unknown error occurred");
        return { status: "error", errorMessage: "An unknown error occurred" };
      }

      setSelectedOptionId(null);
      return { status: "success" };
    },
    { status: "init" },
  );

  const handlePreviousQuestion = async () => {
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    setDirection("backwards");

    const [, error] = await handlePromise(
      previousQuestion({
        quizId: quiz._id,
      }),
    );

    if (error) {
      if (error instanceof ConvexError) {
        toast.error(error.message);
        return;
      }

      toast.error("An unknown error occurred");
      return;
    }
  };

  const handleNextQuestion = async () => {
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // mainly about setting selected option id to null before optimistically moving forward
    flushSync(() => {
      setDirection("forwards");
      setSelectedOptionId(null);
    });

    const [, error] = await handlePromise(
      nextQuestion({
        quizId: quiz._id,
        selectedOptionId: selectedOptionId!,
      }),
    );

    if (error) {
      if (error instanceof ConvexError) {
        toast.error(error.message);
        return;
      }

      toast.error("An unknown error occurred");
      return;
    }
  };

  // check if user is authorized to work on this quiz
  useEffect(() => {
    if (user && quiz && quiz.userId !== user._id) {
      toast.error("Unauthorized to work on this quiz.");
      void navigate(generatePath(ROUTES.quizHome));
    }
  }, [navigate, quiz, user]);

  // We always want this to run when question changes
  useEffect(() => {
    // If user went backwards - we wanna check if they've already answered the question
    if (quiz) {
      const currentQuestion =
        quiz.questions[quiz.progress.currentQuestionIndex];
      const existingAnswer = quiz.progress.answers.find(
        (answer) => answer.questionId === currentQuestion.id,
      );

      if (!existingAnswer || !existingAnswer.selectedOptionId) return;

      setSelectedOptionId(existingAnswer.selectedOptionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?.progress.currentQuestionIndex]);

  const prefetchResultsQuery = usePrefetchQuery(
    api.quizzes.queries.getQuizResults,
  );

  useEffect(() => {
    if (quiz && quiz.isCompleted) {
      prefetchResultsQuery({ quizId: quiz._id });
    }
  }, [prefetchResultsQuery, quiz]);

  // reset selected option id when quiz changes
  useEffect(() => {
    if (quiz) {
      setSelectedOptionId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz?._id]);

  if (quiz === undefined) {
    return <QuizLoadingPlaceholder quizId={quizId!} />;
  }

  if (quiz === null) {
    return <QuizNotFound />;
  }

  const currentIndex = quiz.progress.currentQuestionIndex || 0;
  const currentQuestion = quiz.questions[currentIndex];

  const answeredQuestionsCount = quiz.progress.answers.length;
  const progress = (answeredQuestionsCount / quiz.questions.length) * 100;
  const isLastQuestion = currentIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentIndex === 0;

  const isPreviousButtonDisabled = Boolean(
    isFirstQuestion || quiz.isCompleted || isCompletingQuiz,
  );
  const isNextButtonDisabled = Boolean(
    selectedOptionId === null || isCompletingQuiz || quiz.isCompleted,
  );

  return (
    <div className="mx-auto max-w-3xl">
      {quiz.isCompleted && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          numberOfPieces={250}
          gravity={0.4}
        />
      )}

      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-4">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm font-medium">
            {answeredQuestionsCount} of {quiz.questions.length}
          </span>
        </div>
      </div>

      <MotionConfig transition={{ type: "spring", bounce: 0, duration: 0.3 }}>
        <motion.div
          animate={{ height: bounds.height }}
          className="relative"
          style={{ width: "100%" }}
        >
          <form action={formAction} ref={ref}>
            <Card className="relative overflow-hidden">
              <span className="absolute top-4 right-4 z-10">
                {currentIndex + 1}
              </span>
              <AnimatePresence
                initial={false}
                mode="popLayout"
                custom={direction}
              >
                <motion.div
                  key={currentQuestion.id}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  custom={direction}
                  className="bg-background flex flex-col gap-6"
                  transition={{
                    type: "spring",
                    damping: 28,
                    stiffness: 250,
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {currentQuestion.question}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <RadioGroup
                      value={selectedOptionId || ""}
                      onValueChange={(value) => setSelectedOptionId(value)}
                      className="flex flex-col gap-4"
                      name="selectedOption"
                    >
                      {currentQuestion.options.map((option) => (
                        <label
                          key={option.id}
                          className={cn(
                            "cursor-pointer rounded-md border p-4 transition-colors",
                            {
                              "border-primary bg-primary/5":
                                selectedOptionId === option.id,
                              "hover:bg-muted": selectedOptionId !== option.id,
                            },
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                                {
                                  "border-primary bg-primary text-primary-foreground":
                                    selectedOptionId === option.id,
                                  "border-muted-foreground":
                                    selectedOptionId !== option.id,
                                },
                              )}
                            >
                              {option.id.toUpperCase()}
                            </div>
                            <div className="text-sm">{option.text}</div>
                            <RadioGroupItem
                              value={option.id}
                              className="sr-only after:absolute after:inset-0"
                            />
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </motion.div>
              </AnimatePresence>

              <motion.div layout>
                <CardFooter className="flex justify-between">
                  <Button
                    disabled={isPreviousButtonDisabled}
                    variant="outline"
                    type="button"
                    onClick={handlePreviousQuestion}
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={isNextButtonDisabled}
                    // Only properly submit if last question
                    // Otherwise move forward with optimistic update
                    type={isLastQuestion ? "submit" : "button"}
                    onClick={isLastQuestion ? undefined : handleNextQuestion}
                    isLoading={isCompletingQuiz}
                  >
                    {isLastQuestion ? "Finish Quiz" : "Next"}
                  </Button>
                </CardFooter>
              </motion.div>
            </Card>
          </form>
        </motion.div>
      </MotionConfig>

      {quiz.isCompleted && (
        <div className="mt-10 flex justify-center">
          <Button size="lg" asChild>
            <Link
              to={generatePath(ROUTES.quizDetailResults, {
                quizId: quizId!,
              })}
            >
              View Results
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
