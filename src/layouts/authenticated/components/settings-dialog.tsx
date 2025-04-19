import { InputWithFeedback } from "@/components/input-with-feedback";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { handlePromise } from "@/lib/utils";
import { api } from "@convex/api";
import { useAction, useQuery } from "convex/react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

type FormState =
  | {
      status: "error";
      error: string;
    }
  | {
      status: "success";
    }
  | {
      status: "idle";
    };

const API_KEY_FORM_NAME = "api-key";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const user = useQuery(api.users.getCurrentUser);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const getApiKey = useAction(api.key.getApiKey);
  const storeApiKey = useAction(api.key.storeApiKey);

  const [apiKey, setApiKey] = useState("");
  const [fetchExistingKeyStatus, setFetchExistingKeyStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [fetchExistingKeyErrorMessage, setFetchExistingKeyErrorMessage] =
    useState("");

  const hasUserApiKey = Boolean(user?.api);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const apiKey = formData.get(API_KEY_FORM_NAME) as string;

      const [, error] = await handlePromise(storeApiKey({ apiKey }));

      if (error) {
        return {
          status: "error",
          error: "Failed to save API key. Please try again.",
        };
      }

      toast.success("API key saved successfully");
      onOpenChange(false);

      return {
        status: "success",
      };
    },
    { status: "idle" },
  );

  useEffect(() => {
    if (open && hasUserApiKey) {
      // Fetch API key when dialog opens and user has api key
      setFetchExistingKeyStatus("loading");
      getApiKey()
        .then((key) => {
          if (key) setApiKey(key);
          setFetchExistingKeyStatus("success");
        })
        .catch(() => {
          setFetchExistingKeyErrorMessage(
            "Failed to fetch existing API key. Please try again.",
          );
          setFetchExistingKeyStatus("error");
        });
    }
  }, [open, getApiKey, hasUserApiKey]);

  const isApiKeyEmpty = apiKey === "";

  const isError =
    fetchExistingKeyStatus === "error" || state.status === "error";
  const errorMessage =
    fetchExistingKeyStatus === "error"
      ? fetchExistingKeyErrorMessage
      : state.status === "error"
        ? state.error
        : "";

  const isFetchingExistingKey = fetchExistingKeyStatus === "loading";
  const placeholder = isFetchingExistingKey
    ? "Fetching existing API key..."
    : "sk-...";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your{" "}
              <a
                href="https://openai.com/index/openai-api/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                OpenAI API key
              </a>{" "}
              for quiz generation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Label htmlFor={API_KEY_FORM_NAME}>API Key</Label>
            <div className="flex items-center gap-2">
              <InputWithFeedback
                id={API_KEY_FORM_NAME}
                name={API_KEY_FORM_NAME}
                type={isApiKeyVisible ? "text" : "password"}
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                className="grow"
                placeholder={placeholder}
                errorMessage={errorMessage}
                isError={isError}
                required
                isLoading={isFetchingExistingKey}
                disabled={isFetchingExistingKey}
              />
              <Button
                variant="outline"
                onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                type="button"
                className="h-full"
              >
                {isApiKeyVisible ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              isLoading={isPending}
              disabled={isPending || isApiKeyEmpty}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
