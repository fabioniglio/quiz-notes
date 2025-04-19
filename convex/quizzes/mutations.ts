import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
} from "../_generated/server";
import { QuizResultSchema, QuizSchema } from "../schema";
import { quizAuthCheckFunc } from "../utils";

export const previousQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
  },
  handler: async (ctx, args) => {
    const { quiz } = await quizAuthCheckFunc({ quizId: args.quizId, ctx });

    const currentQuestionIndex = quiz.progress.currentQuestionIndex;

    // safety net to make sure we don't go below 0
    const newQuestionIndex = Math.max(currentQuestionIndex - 1, 0);

    await ctx.db.patch(args.quizId, {
      progress: {
        ...quiz.progress,
        currentQuestionIndex: newQuestionIndex,
      },
    });

    const newQuestion = quiz.questions[newQuestionIndex];

    return newQuestion.id;
  },
});

type Answer = Doc<"quizzes">["progress"]["answers"][number];
type Progress = Doc<"quizzes">["progress"];

export const nextQuestion = mutation({
  args: { quizId: v.id("quizzes"), selectedOptionId: v.string() },
  handler: async (ctx, args) => {
    const { quiz } = await quizAuthCheckFunc({ quizId: args.quizId, ctx });

    const currentIndex = quiz.progress?.currentQuestionIndex || 0;
    const currentQuestion = quiz.questions[currentIndex];

    // Math.min is just safety net
    const newIndex = Math.min(currentIndex + 1, quiz.questions.length - 1);
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedOptionId: args.selectedOptionId,
    };

    // Check if an answer for this question already exists
    const existingAnswerIndex = quiz.progress.answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id,
    );

    let updatedAnswers: Array<Answer>;
    const hasExistingAnswer = existingAnswerIndex !== -1;
    if (hasExistingAnswer) {
      // Update existing answer
      updatedAnswers = [...quiz.progress.answers];
      updatedAnswers[existingAnswerIndex] = newAnswer;
    } else {
      // Add new answer
      updatedAnswers = [...quiz.progress.answers, newAnswer];
    }

    const newProgress: Progress = {
      ...quiz.progress,
      currentQuestionIndex: newIndex,
      lastUpdated: Date.now(),
      answers: updatedAnswers,
    };

    await ctx.db.patch(args.quizId, {
      progress: newProgress,
    });

    return newAnswer;
  },
});

export const storeQuiz = internalMutation({
  args: QuizSchema.validator,
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzes", args);
  },
});

export const storeQuizResult = internalMutation({
  args: QuizResultSchema.validator,
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizResults", args);
  },
});

export const getResultById = internalQuery({
  args: { id: v.id("quizResults") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateQuiz = internalMutation({
  args: { id: v.id("quizzes"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isCompleted: args.isCompleted });
  },
});

export const deleteQuizzes = mutation({
  args: { quizIds: v.array(v.id("quizzes")) },
  handler: async (ctx, args) => {
    const deletePromises = args.quizIds.map((quizId) => ctx.db.delete(quizId));

    await Promise.all(deletePromises);
  },
});

export const resetQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    // Check authorization
    await quizAuthCheckFunc({ quizId: args.quizId, ctx });

    // Reset quiz progress and completion status
    await ctx.db.patch(args.quizId, {
      isCompleted: false,
      progress: {
        currentQuestionIndex: 0,
        answers: [],
        lastUpdated: Date.now(),
      },
    });

    // Delete quiz results
    const quizResult = await ctx.db
      .query("quizResults")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .first();

    if (quizResult) {
      await ctx.db.delete(quizResult._id);
    }
  },
});
