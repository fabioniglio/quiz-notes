import { api } from "@convex/api";
import { FunctionReturnType } from "convex/server";
import { QuizForm } from "./components/quiz-form";
import { QuizListSection } from "./components/quiz-list-section";

export type QuizWithProgress = FunctionReturnType<
  typeof api.quizzes.queries.listQuizzesWithProgress
>[number];

export function QuizHomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Create a New Quiz</h1>
        <p className="text-muted-foreground">
          Enter your study notes and we&apos;ll generate a quiz to help you
          learn.
        </p>
      </div>

      <QuizForm />

      <QuizListSection />
    </div>
  );
}
