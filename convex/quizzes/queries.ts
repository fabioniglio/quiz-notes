import { v } from 'convex/values'
import { internalQuery, query } from '../_generated/server'
import { requireCurrentUser } from '../users'
import { quizAuthCheckFunc } from '../utils'

export const getQuizById = query({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const listQuizzes = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('quizzes')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})

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

export const getQuizResults = query({
  args: { quizId: v.id('quizzes') },
  handler: async (ctx, args) => {
    const { quiz } = await quizAuthCheckFunc({ quizId: args.quizId, ctx })

    const results = await ctx.db
      .query('quizResults')
      .withIndex('by_quizId', (q) => q.eq('quizId', args.quizId))
      .first()

    if (!results) {
      return null
    }

    return {
      ...results,
      title: quiz.title,
      questions: quiz.questions.map((question) => {
        const userAnswer = results.answers.find(
          (answer) => answer.questionId === question.id
        )
        return {
          ...question,
          userSelectedId: userAnswer?.selectedOptionId,
          isCorrect: !results.incorrectQuestionIdsMap[question.id],
          correctAnswer: question.options.find((option) => option.isCorrect)
            ?.id,
        }
      }),
    }
  },
})
