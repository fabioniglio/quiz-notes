import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    updatedAt: v.number(),
    api: v.optional(
      v.object({
        encryptedKey: v.array(v.number()), // For Uint8Array storage
        initializationVector: v.array(v.number()), // initialization vector for encryption
      })
    ),
  }).index('by_email', ['email']),

  quizzes: defineTable({
    userId: v.id('users'),
    title: v.string(), // AI-generated title
    notes: v.string(), // Notes we'll use for prompt
    context: v.optional(v.string()),
    numQuestions: v.number(),
    optionsPerQuestion: v.number(),
    createdAt: v.number(),
    progress: v.object({
      currentQuestionIndex: v.number(), // Which question user is on
      answers: v.array(
        v.object({
          questionId: v.id('questions'),
          selectedOptionId: v.optional(v.string()), // Optional because user may not have answered yet
        })
      ),
      lastUpdated: v.number(), // Timestamp for activity tracking
    }),
    questions: v.array(
      v.object({
        id: v.string(), // Generate a unique ID for each question
        question: v.string(),
        options: v.array(
          v.object({
            id: v.string(), // Generate a unique ID for each option
            text: v.string(),
            isCorrect: v.boolean(),
          })
        ),
        explanation: v.string(), // Explanation of why the correct answer is correct
      })
    ),
  })
    .index('by_userId', ['userId'])
    .index('by_createdAt', ['createdAt']),

  quizResults: defineTable({
    quizId: v.id('quizzes'),
    userId: v.id('users'),
    completedAt: v.number(),
    score: v.number(), // Percentage correct
    answers: v.array(
      v.object({
        questionId: v.string(),
        selectedOptionId: v.string(),
      })
    ),
    incorrectQuestionIds: v.array(v.string()),
    feedback: v.string(), // AI-generated feedback
  })
    .index('by_userId', ['userId'])
    .index('by_quizId', ['quizId'])
    .index('by_completedAt', ['completedAt']),
})

export default schema
