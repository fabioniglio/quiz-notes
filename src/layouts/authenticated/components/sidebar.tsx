import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/lib/constants'
import { cn, handlePromise } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@convex/_generated/api'
import { Doc } from '@convex/_generated/dataModel'
import { useAction, useQuery } from 'convex/react'
import { BookOpen, LogOut, Plus, Settings } from 'lucide-react'
import { useActionState, useEffect, useState } from 'react'
import { generatePath, Link, useLocation } from 'react-router'
import { toast } from 'sonner'

function QuizLinkItem({ quiz }: { quiz: Doc<'quizzes'> }) {
  const pathname = useLocation().pathname
  const quizPath = `/quiz/${quiz._id}`

  return (
    <Link
      key={quiz._id}
      to={generatePath(ROUTES.quizDetail, {
        quizId: quiz._id,
      })}
      className={cn('rounded-md px-3 py-2 text-sm', {
        'bg-muted font-medium': pathname === quizPath,
        'hover:bg-muted/50': pathname !== quizPath,
      })}
    >
      {quiz.title}
    </Link>
  )
}

export function Sidebar() {
  const quizzes = useQuery(api.quizzes.getAllQuizzesByUserId)
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)

  const { signOut } = useAuthActions()

  return (
    <div className="bg-background sticky top-0 left-0 flex h-screen w-64 flex-col border-r">
      <div className="p-5">
        <Link to={ROUTES.quizHome}>
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
            <Link to={ROUTES.quizHome}>
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

      <div className="mt-auto border-t p-5">
        <div className="flex flex-col items-center gap-4">
          <SettingsDialog
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
          />

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
  )
}

type FormState =
  | {
      status: 'error'
      error: string
    }
  | {
      status: 'success'
    }
  | {
      status: 'idle'
    }

const API_KEY_FORM_NAME = 'api-key'

function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const user = useQuery(api.users.getCurrentUser)
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false)
  const getApiKey = useAction(api.key.getApiKey)
  const storeApiKey = useAction(api.key.storeApiKey)

  const [apiKey, setApiKey] = useState('')
  const [fetchExistingKeyStatus, setFetchExistingKeyStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('idle')
  const [fetchExistingKeyErrorMessage, setFetchExistingKeyErrorMessage] =
    useState('')

  const hasUserApiKey = Boolean(user?.api)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const apiKey = formData.get(API_KEY_FORM_NAME) as string

      const [, error] = await handlePromise(storeApiKey({ apiKey }))

      if (error) {
        return {
          status: 'error',
          error: 'Failed to save API key. Please try again.',
        }
      }

      toast.success('API key saved successfully')
      onOpenChange(false)

      return {
        status: 'success',
      }
    },
    { status: 'idle' }
  )

  useEffect(() => {
    if (open && hasUserApiKey) {
      // Fetch API key when dialog opens and user has api key
      setFetchExistingKeyStatus('loading')
      getApiKey()
        .then((key) => {
          if (key) setApiKey(key)
          setFetchExistingKeyStatus('success')
        })
        .catch(() => {
          setFetchExistingKeyErrorMessage(
            'Failed to fetch existing API key. Please try again.'
          )
          setFetchExistingKeyStatus('error')
        })
    }
  }, [open, getApiKey, hasUserApiKey])

  const isApiKeyEmpty = apiKey === ''

  const isError = fetchExistingKeyStatus === 'error' || state.status === 'error'
  const errorMessage =
    fetchExistingKeyStatus === 'error'
      ? fetchExistingKeyErrorMessage
      : state.status === 'error'
        ? state.error
        : ''

  const isFetchingExistingKey = fetchExistingKeyStatus === 'loading'
  const placeholder = isFetchingExistingKey
    ? 'Fetching existing API key...'
    : 'sk-...'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onOpenChange(true)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your{' '}
              <a
                href="https://openai.com/index/openai-api/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                OpenAI API key
              </a>{' '}
              for quiz generation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Label htmlFor={API_KEY_FORM_NAME}>API Key</Label>
            <div className="flex items-center gap-2">
              <InputWithFeedback
                id={API_KEY_FORM_NAME}
                type={isApiKeyVisible ? 'text' : 'password'}
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
                className="h-full"
              >
                {isApiKeyVisible ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              onClick={() => onOpenChange(false)}
              isLoading={isPending}
              disabled={isPending || isApiKeyEmpty}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
