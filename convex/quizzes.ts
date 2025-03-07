import { query } from './_generated/server'
import { requireCurrentUser } from './users'

export const getAllQuizzesByUserId = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx)

    if (!user) {
      return []
    }

    const quizzes = await ctx.db
      .query('quizzes')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect()

    return quizzes
  },
})

export const listQuizzesWithProgress = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireCurrentUser(ctx)

    if (!user) {
      return []
    }

    const quizzes = await ctx.db
      .query('quizzes')
      .withIndex('by_userId', (q) => q.eq('userId', user._id))
      .collect()

    return quizzes.map((quiz) => {
      const answeredCount = quiz.progress?.answers.length || 0
      return {
        ...quiz,
        progressCount: answeredCount,
        totalQuestions: quiz.questions.length,
        isCompleted: answeredCount === quiz.questions.length,
      }
    })
  },
})
