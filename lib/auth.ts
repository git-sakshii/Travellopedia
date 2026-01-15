import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import getClientPromise from '@/lib/mongodb'
import { compare, hash } from 'bcryptjs'

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
          name: { label: 'Name', type: 'text' },
          isSignUp: { label: 'Is Sign Up', type: 'text' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          const client = await getClientPromise()
          const db = client.db('travelai')
          const usersCollection = db.collection('users')

          const isSignUp = credentials.isSignUp === 'true'

          if (isSignUp) {
            // Sign Up Flow
            const existingUser = await usersCollection.findOne({ 
              email: credentials.email 
            })
            
            if (existingUser) {
              throw new Error('User already exists')
            }

            const hashedPassword = await hash(credentials.password, 12)
            
            const result = await usersCollection.insertOne({
              email: credentials.email,
              password: hashedPassword,
              name: credentials.name || credentials.email.split('@')[0],
              createdAt: new Date(),
            })

            return {
              id: result.insertedId.toString(),
              email: credentials.email,
              name: credentials.name || credentials.email.split('@')[0],
            }
          } else {
            // Sign In Flow
            const user = await usersCollection.findOne({ 
              email: credentials.email 
            })
            
            if (!user) {
              throw new Error('No user found with this email')
            }

            const isValid = await compare(credentials.password, user.password)
            
            if (!isValid) {
              throw new Error('Invalid password')
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            }
          }
        },
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    pages: {
      signIn: '/auth/signin',
    },
    callbacks: {
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub || ''
        }
        return session
      },
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id
        }
        return token
      },
    },
  }
}
