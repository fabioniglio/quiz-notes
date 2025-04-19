import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Status } from "@/lib/schemas";
import { handlePromise } from "@/lib/utils";
import { api } from "@convex/api";
import { Id } from "@convex/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useAtom } from "jotai";
import { CheckSquare, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isSelectModeAtom, selectedQuizIdsAtom } from "../lib/atoms";
import { DeleteQuizzesAlertDialog } from "./delete-alert-dialog";
import { QuizList } from "./quiz-list";

export function QuizListSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectMode, setIsSelectMode] = useAtom(isSelectModeAtom);
  const [selectedQuizIds, setSelectedQuizIds] = useAtom(selectedQuizIdsAtom);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<Status>("idle");

  const deleteQuizzes = useMutation(api.quizzes.mutations.deleteQuizzes);

  const recentQuizzes = useQuery(api.quizzes.queries.listQuizzesWithProgress);

  const filteredQuizzes = recentQuizzes?.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedQuizIds(new Set());
  };

  const handleDeleteSelected = () => {
    setIsDeleteDialogOpen(true);
  };

  function resetState() {
    setIsDeleteDialogOpen(false);
    setIsSelectMode(false);
    setSelectedQuizIds(new Set());
  }

  const confirmDelete = async () => {
    const [, error] = await handlePromise(
      deleteQuizzes({
        quizIds: Array.from(selectedQuizIds) as Array<Id<"quizzes">>,
      }),
    );

    if (error) {
      toast.error("Something went wrong. Please try again.");
      setDeletionStatus("error");
      resetState();
      return;
    }

    toast.success("Quizzes deleted successfully.");
    setDeletionStatus("success");
    resetState();
  };

  const isDeleting = deletionStatus === "loading";

  return (
    <div className="border-t pt-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Quizzes</h2>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectMode}
              className={isSelectMode ? "bg-primary/10 border-primary" : ""}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {isSelectMode ? "Cancel Selection" : "Select"}
            </Button>

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
        </div>

        <QuizList quizzes={filteredQuizzes} />

        {isSelectMode && selectedQuizIds.size > 0 && (
          <Button
            variant="destructive"
            size="lg"
            className="fixed right-6 bottom-6 z-50 shadow-lg"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedQuizIds.size})
          </Button>
        )}

        <DeleteQuizzesAlertDialog
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          selectedQuizIds={selectedQuizIds}
          confirmDelete={confirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
