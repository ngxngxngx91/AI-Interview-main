import {pgTable, serial, text, varchar} from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    title: varchar('title').notNull(),
    description: text('description'),
    difficulty: varchar('difficulty').notNull(),
    scenario: text('scenario').notNull(),
    customerQuery: text('customerQuery').notNull(),
    expectedResponse: text('expectedResponse').notNull(),
    language: varchar('language').notNull(),
    industry: varchar('industry').notNull(),
    role: varchar('role').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockID: varchar('mockID').notNull(),
    userEmail: varchar('userEmail').notNull(),
})

export const InterviewFeedback = pgTable('interviewFeedback', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    userEmail: varchar('userEmail').notNull(),
    createdAt: varchar('createdAt').notNull(),

    duration: varchar('duration').notNull(),
    totalMessages: varchar('totalMessages').notNull(),
    averageScore: varchar('averageScore').notNull(),

    conversation: text('conversation').notNull(),
    strengths: text('strengths').notNull(),
    weaknesses: text('weaknesses').notNull(),
    detailedFeedback: text('detailedFeedback').notNull(),

    messageAnalysis: text('messageAnalysis').notNull()
})

export const User = pgTable('users', {
    id: serial('id').primaryKey(),
    fullName: varchar('fullName').default(null),
    username: varchar('username').notNull(),
    email: varchar('email').notNull(),
    password: varchar('password').default(null),
})
