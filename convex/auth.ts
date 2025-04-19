import { Password } from "@convex-dev/auth/providers/Password";
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub, Password<DataModel>()],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      console.log("createOrUpdateUser", args);
      if (args.existingUserId) {
        return args.existingUserId;
      }
      console.log("createOrUpdateUser", args);
      // First create the user
      const userId = await ctx.db.insert("users", {
        email: args.profile.email!,
        updatedAt: Date.now(),
      });

      return userId;
    },
  },
});
