import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePrefetchQuery } from "@/hooks/use-prefetch-query";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@convex/api";
import { Doc } from "@convex/dataModel";
import { useQuery } from "convex/react";
import { BookOpen, LogOut, Plus, Settings } from "lucide-react";
import { useState } from "react";
import { generatePath, Link, useLocation } from "react-router";
import { SettingsDialog } from "./settings-dialog";

function QuizLinkItem({ quiz }: { quiz: Doc<"quizzes"> }) {
  const pathname = useLocation().pathname;
  const quizPath = quiz.isCompleted
    ? generatePath(ROUTES.quizDetailResults, { quizId: quiz._id })
    : generatePath(ROUTES.quizDetail, { quizId: quiz._id });

  const prefetchResultsQuery = usePrefetchQuery(
    api.quizzes.queries.getQuizResults,
  );

  const prefetchQuizDetailQuery = usePrefetchQuery(
    api.quizzes.queries.getQuizById,
  );

  const handlePrefetch = () => {
    if (quiz.isCompleted) {
      prefetchResultsQuery({ quizId: quiz._id });
    } else {
      prefetchQuizDetailQuery({ id: quiz._id });
    }
  };

  return (
    <Link
      key={quiz._id}
      to={quizPath}
      onMouseEnter={handlePrefetch}
      className={cn("rounded-md px-3 py-2 text-sm", {
        "bg-muted font-medium": pathname === quizPath,
        "hover:bg-muted/50": pathname !== quizPath,
      })}
    >
      {quiz.title}
    </Link>
  );
}

export function Sidebar() {
  const quizzes = useQuery(api.quizzes.queries.getAllQuizzesByUserId);
  const user = useQuery(api.users.getCurrentUser);

  const hasApikey = Boolean(user?.api);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const prefetchQuizHomeQuery = usePrefetchQuery(
    api.quizzes.queries.listQuizzesWithProgress,
  );

  const handlePrefetch = () => {
    prefetchQuizHomeQuery({});
  };

  const { signOut } = useAuthActions();

  return (
    <>
      <div className="bg-background sticky top-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r">
        <div className="p-5">
          <Link to={ROUTES.quizHome} onMouseEnter={handlePrefetch}>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <h1 className="text-xl font-bold">Notes to Quiz</h1>
            </div>
          </Link>
        </div>

        <Separator />

        <div className="flex-1 overflow-auto p-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="mb-4 flex w-full items-center justify-between hover:bg-transparent"
            >
              <Link to={ROUTES.quizHome} onMouseEnter={handlePrefetch}>
                <span className="text-sm font-semibold">Your Quizzes</span>
                <Plus className="h-4 w-4" />
              </Link>
            </Button>

            {quizzes && quizzes.length > 0 && (
              <div className="flex flex-col gap-2">
                {quizzes.map((quiz) => (
                  <QuizLinkItem key={quiz._id} quiz={quiz} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-auto border-t p-5">
          {/* Indicator for users who don't have an API key */}
          {/* Could be better UX, but ok for now */}
          {!hasApikey && (
            <span className="absolute top-1.5 right-1.5 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-red-500"></span>
            </span>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSettingsDialogOpen(true)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="outline"
              className="flex w-full items-center justify-center"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {isSettingsDialogOpen && (
        <SettingsDialog
          open={isSettingsDialogOpen}
          onOpenChange={setIsSettingsDialogOpen}
        />
      )}
    </>
  );
}
