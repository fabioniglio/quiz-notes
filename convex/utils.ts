import { ConvexError } from 'convex/values'
import { Id } from './_generated/dataModel'
import { MutationCtx, QueryCtx } from './_generated/server'
import { requireCurrentUser } from './users'

export async function handlePromise<PromiseResult>(
  promise: Promise<PromiseResult>
): Promise<[PromiseResult, null] | [null, Error]> {
  try {
    const result = await promise
    return [result, null]
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))]
  }
}

export async function quizAuthCheckFunc({
  quizId,
  ctx,
}: {
  quizId: Id<'quizzes'>
  ctx: MutationCtx | QueryCtx
}) {
  const quiz = await ctx.db.get(quizId)
  if (!quiz) {
    throw new ConvexError('Quiz not found')
  }

  const user = await requireCurrentUser(ctx)
  if (!user) {
    throw new ConvexError('Unauthenticated. Please login to continue.')
  }

  if (quiz.userId !== user._id) {
    throw new ConvexError('Unauthorized to work on this quiz.')
  }

  return { quiz, user }
}
