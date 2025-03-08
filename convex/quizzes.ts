import { createOpenAI } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { ConvexError, v } from 'convex/values'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { api, internal } from './_generated/api'
import { Id } from './_generated/dataModel'
import { action, internalMutation, query } from './_generated/server'
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

export const createQuiz = action({
  args: {
    notes: v.string(),
    context: v.optional(v.string()),
    numQuestions: v.number(),
    optionsPerQuestion: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx)

    const apiKey = await ctx.runAction(api.key.getApiKey)

    if (!user) {
      // Shouldn't happen otherwise user should be redirected
      throw new ConvexError('Unauthorized. Please login to create a quiz.')
    }

    if (!apiKey) {
      throw new ConvexError('No API key found. Please create an API key.')
    }

    const openai = createOpenAI({
      apiKey,
    })

    // Generate quiz with title and questions
    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: z.object({
        title: z
          .string()
          .describe(
            'A catchy, descriptive title for the quiz based on the notes'
          ),
        questions: z
          .array(
            z.object({
              question: z
                .string()
                .describe('A question with a single correct answer'),
              options: z
                .array(
                  z
                    .object({
                      text: z.string(),
                      isCorrect: z.boolean(),
                    })
                    .describe(
                      'An option with text and a boolean indicating if it is correct'
                    )
                )
                .describe('An array of options')
                .length(args.optionsPerQuestion),
              explanation: z
                .string()
                .describe('Explanation of why the correct answer is correct'),
            })
          )
          .describe('An array of questions with options and explanations')
          .length(args.numQuestions),
      }),
      prompt: `Generate a quiz based on the following notes:\n\n${args.notes}\n\n${
        args.context ? `Additional context: ${args.context}\n\n` : ''
      }Create ${args.numQuestions} challenging questions with ${args.optionsPerQuestion} options each.
      Ensure exactly one option is correct for each question.
      Include a brief explanation for each correct answer.
      Also generate a descriptive title for this quiz.`,
    })

    // Add unique IDs to questions and options
    const questionsWithIds = object.questions.map((q) => ({
      ...q,
      id: nanoid(),
      options: q.options.map((o) => ({
        ...o,
        id: nanoid(),
      })),
    }))

    const quizId: Id<'quizzes'> = await ctx.runMutation(
      internal.quizzes.storeQuiz,
      {
        userId: user._id,
        title: object.title,
        notes: args.notes,
        context: args.context,
        numQuestions: args.numQuestions,
        optionsPerQuestion: args.optionsPerQuestion,
        createdAt: Date.now(),
        questions: questionsWithIds,
        progress: {
          currentQuestionIndex: 0,
          answers: [],
          lastUpdated: Date.now(),
        },
      }
    )

    return { quizId }
  },
})

export const storeQuiz = internalMutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    notes: v.string(),
    context: v.optional(v.string()),
    numQuestions: v.number(),
    optionsPerQuestion: v.number(),
    createdAt: v.number(),
    questions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        options: v.array(
          v.object({
            id: v.string(),
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
        explanation: v.string(),
      })
    ),
    progress: v.object({
      currentQuestionIndex: v.number(), // Which question user is on
      answers: v.array(
        v.object({
          questionId: v.string(),
          selectedOptionId: v.optional(v.string()), // Optional because user may not have answered yet
        })
      ),
      lastUpdated: v.number(), // Timestamp for activity tracking
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('quizzes', args)
  },
})

export const getQuizById = internalMutation({
  args: { id: v.id('quizzes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const listQuizzes = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('quizzes')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect()
  },
})
