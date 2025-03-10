import { createOpenAI } from '@ai-sdk/openai'
import { generateObject, generateText } from 'ai'
import { ConvexError, v } from 'convex/values'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import { api, internal } from '../_generated/api'
import { Doc, Id } from '../_generated/dataModel'
import { action, internalQuery } from '../_generated/server'
import { ALPHABET_MAP } from '../constants'
import { requireCurrentUser } from '../users'
import { handlePromise, quizAuthCheckFunc } from '../utils'

export const createQuiz = action({
  args: {
    notes: v.string(),
    context: v.optional(v.string()),
    numQuestions: v.number(),
    optionsPerQuestion: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx)

    const [apiKey, error] = await handlePromise(
      ctx.runAction(api.key.getApiKey)
    )

    if (error) {
      throw new ConvexError('No API key found. Please create an API key.')
    }

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
            'A catchy, descriptive title for the quiz based on the notes. Do not use words like "Mastering" or "Exploring". Try to be creative.'
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
    const questionsWithIds = object.questions.map((question) => ({
      ...question,
      id: nanoid(),
      options: question.options.map((option, optionIndex) => ({
        ...option,
        id: ALPHABET_MAP[optionIndex],
      })),
    }))

    const quizId: Id<'quizzes'> = await ctx.runMutation(
      internal.quizzes.mutations.storeQuiz,
      {
        userId: user._id,
        title: object.title,
        notes: args.notes,
        context: args.context,
        numQuestions: args.numQuestions,
        optionsPerQuestion: args.optionsPerQuestion,
        createdAt: Date.now(),
        questions: questionsWithIds,
        isCompleted: false,
        progress: {
          currentQuestionIndex: 0,
          answers: [],
          lastUpdated: Date.now(),
        },
      }
    )

    return quizId
  },
})

type QuestionResult = {
  question: string
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation: string
}

const zodAnswer = z.object({
  questionId: z.string(),
  selectedOptionId: z.string(),
})

export const quizAuthCheck = internalQuery({
  args: { quizId: v.id('quizzes') },
  handler: async (ctx, args) => {
    return await quizAuthCheckFunc({ quizId: args.quizId, ctx })
  },
})

export const completeQuiz = action({
  args: { quizId: v.id('quizzes'), selectedOptionId: v.string() },
  handler: async (ctx, args) => {
    const [apiKey, error] = await handlePromise(
      ctx.runAction(api.key.getApiKey)
    )

    // If no API key, do nothing to avoid ruining state of DB!

    if (error) {
      throw new ConvexError('No API key found. Please create an API key.')
    }

    if (!apiKey) {
      throw new ConvexError('No API key found. Please create an API key.')
    }

    const user = await requireCurrentUser(ctx)

    // If user is not found, throw an error
    if (!user) {
      throw new ConvexError('Unauthenticated. Please login to submit a quiz.')
    }

    const quizForAuthCheck: Doc<'quizzes'> | null = await ctx.runQuery(
      api.quizzes.queries.getQuizById,
      {
        id: args.quizId,
      }
    )

    // If quiz is not found, throw an error
    if (!quizForAuthCheck) {
      throw new ConvexError('Quiz not found')
    }

    if (quizForAuthCheck.userId !== user._id) {
      throw new ConvexError('Unauthorized. You have no access to this quiz.')
    }

    // Make sure we add the new answer to the progress
    await ctx.runMutation(api.quizzes.mutations.nextQuestion, {
      quizId: args.quizId,
      selectedOptionId: args.selectedOptionId,
    })

    const quiz = await ctx.runQuery(api.quizzes.queries.getQuizById, {
      id: args.quizId,
    })

    if (!quiz) {
      throw new ConvexError('Quiz not found')
    }

    const answers = quiz.progress.answers || []

    // Calculate results
    let correctCount = 0
    const incorrectQuestionIdsMap: Record<string, boolean> = {}

    const questionResults: Array<QuestionResult> = []

    for (const answer of answers) {
      const question = quiz.questions.find(
        (question) => question.id === answer.questionId
      )

      if (!question) {
        throw new ConvexError(
          'A question was not found in the quiz. Something went wrong.'
        )
      }

      const selectedOption = question.options.find(
        (option) => option.id === answer.selectedOptionId
      )

      if (!selectedOption) {
        throw new ConvexError(
          'An option was not found in the question. Something went wrong.'
        )
      }

      const correctOption = question.options.find((option) => option.isCorrect)

      if (selectedOption.isCorrect) {
        correctCount++
      } else {
        incorrectQuestionIdsMap[question.id] = true
      }

      questionResults.push({
        question: question.question,
        selectedAnswer: selectedOption.text,
        isCorrect: selectedOption.isCorrect,
        correctAnswer: correctOption?.text || '',
        explanation: question.explanation,
      })
    }

    const score = Math.round((correctCount / quiz.questions.length) * 100)

    const openai = createOpenAI({
      apiKey,
    })

    // Generate feedback
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `The user took a quiz titled "${quiz.title}" based on these notes:

      ${quiz.notes}

      ${quiz.context ? `Additional context: ${quiz.context}` : ''}

      They scored ${score}% (${correctCount}/${quiz.questions.length} correct).

      Here's how they performed on each question:
      ${questionResults
        .map(
          (r) =>
            `Question: ${r.question}
         Their answer: ${r.selectedAnswer}
         Correct answer: ${r.correctAnswer}
         ${r.isCorrect ? '✓ Correct' : '✗ Incorrect'}
         Explanation: ${r.explanation}`
        )
        .join('\n\n')}

      Please provide:
      1. A concise analysis of their strengths (what concepts they understand well)
      2. Specific concepts they need to review further
      3. 2-3 targeted recommendations for improving their understanding
      4. A brief, motivational conclusion
      5. Make sure to talk TO the user in a "you" tone, not "the user" or "the quiz taker".
      6. Use a simple langauge. It should be easy to read and slightly causal. Don't use the word "crucial" and try to not repeat same words.

      Format your response in markdown with clear headings.`,
    })

    // Store results
    const quizResultId: Id<'quizResults'> = await ctx.runMutation(
      internal.quizzes.mutations.storeQuizResult,
      {
        quizId: args.quizId,
        userId: user._id,
        completedAt: Date.now(),
        score,
        correctCount,
        answers: zodAnswer.array().parse(answers),
        incorrectQuestionIdsMap,
        feedback: text,
      }
    )

    await ctx.runMutation(internal.quizzes.mutations.updateQuiz, {
      id: args.quizId,
      isCompleted: true,
    })

    return quizResultId
  },
})
