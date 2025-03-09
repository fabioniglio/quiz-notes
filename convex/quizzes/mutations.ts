import { ConvexError, v } from 'convex/values'
import { Doc, Id } from '../_generated/dataModel'
import {
  internalMutation,
  internalQuery,
  mutation,
  MutationCtx,
  QueryCtx,
} from '../_generated/server'
import { QuizSchema } from '../schema'
import { requireCurrentUser } from '../users'

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

export const previousQuestion = mutation({
  args: {
    quizId: v.id('quizzes'),
  },
  handler: async (ctx, args) => {
    const { quiz } = await quizAuthCheckFunc({ quizId: args.quizId, ctx })

    const currentQuestionIndex = quiz.progress.currentQuestionIndex

    // safety net to make sure we don't go below 0
    const newQuestionIndex = Math.max(currentQuestionIndex - 1, 0)

    await ctx.db.patch(args.quizId, {
      progress: {
        ...quiz.progress,
        currentQuestionIndex: newQuestionIndex,
      },
    })

    const newQuestion = quiz.questions[newQuestionIndex]

    return newQuestion.id
  },
})

type Answer = Doc<'quizzes'>['progress']['answers'][number]
type Progress = Doc<'quizzes'>['progress']

export const nextQuestion = mutation({
  args: { quizId: v.id('quizzes'), selectedOptionId: v.string() },
  handler: async (ctx, args) => {
    const { quiz } = await quizAuthCheckFunc({ quizId: args.quizId, ctx })

    const currentIndex = quiz.progress?.currentQuestionIndex || 0
    const currentQuestion = quiz.questions[currentIndex]

    // Math.min is just safety net
    const newIndex = Math.min(currentIndex + 1, quiz.questions.length - 1)
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId: args.selectedOptionId,
    }

    const newProgress: Progress = {
      ...quiz.progress,
      currentQuestionIndex: newIndex,
      lastUpdated: Date.now(),
      answers: [...quiz.progress.answers, newAnswer],
    }

    await ctx.db.patch(args.quizId, {
      progress: newProgress,
    })

    return newAnswer
  },
})

export const storeQuiz = internalMutation({
  args: QuizSchema.validator,
  handler: async (ctx, args) => {
    return await ctx.db.insert('quizzes', args)
  },
})

export const storeQuizResult = internalMutation({
  args: {
    quizId: v.id('quizzes'),
    userId: v.id('users'),
    completedAt: v.number(),
    score: v.number(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedOptionId: v.string(),
      })
    ),
    incorrectQuestionIds: v.array(v.string()),
    feedback: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('quizResults', args)
  },
})

export const getResultById = internalQuery({
  args: { id: v.id('quizResults') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const updateQuiz = internalMutation({
  args: { id: v.id('quizzes'), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isCompleted: args.isCompleted })
  },
})
