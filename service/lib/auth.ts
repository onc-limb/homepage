import NextAuth from "next-auth"
import type { Provider } from "next-auth/providers"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"

const providers: Provider[] =
    process.env.NODE_ENV === "development"
        ? [
              Credentials({
                  name: "Dev Login",
                  credentials: {
                      username: { label: "Username", type: "text" },
                  },
                  authorize(credentials) {
                      return {
                          id: "dev-user",
                          name: String(credentials.username ?? "dev"),
                      }
                  },
              }),
          ]
        : [GitHub]

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers,
    callbacks: {
        signIn({ profile, credentials }) {
            // ローカル開発: Credentialsプロバイダーは常に許可
            if (credentials) return true
            // 本番: GitHubの許可ユーザーのみ
            return profile?.login === process.env.ALLOWED_GITHUB_ID
        },
    },
})
