/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as http from "../http.js";
import type * as key from "../key.js";
import type * as myFunctions from "../myFunctions.js";
import type * as quizzes_actions from "../quizzes/actions.js";
import type * as quizzes_mutations from "../quizzes/mutations.js";
import type * as quizzes_queries from "../quizzes/queries.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  constants: typeof constants;
  http: typeof http;
  key: typeof key;
  myFunctions: typeof myFunctions;
  "quizzes/actions": typeof quizzes_actions;
  "quizzes/mutations": typeof quizzes_mutations;
  "quizzes/queries": typeof quizzes_queries;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
