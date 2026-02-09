import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

const handler = NextAuth({
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                await connectDB();

                const user = await User.findOne({ email: credentials?.email });
                if (!user) throw new Error("User not found");

                const isValid = await bcrypt.compare(
                    credentials!.password,
                    user.password
                );

                if (!isValid) throw new Error("Invalid password");

                return {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.role = token.role as string;
            return session;
        },
    },
});

export { handler as GET, handler as POST };
