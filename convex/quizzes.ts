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
