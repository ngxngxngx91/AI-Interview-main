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
    mockID: varchar('mockID').notNull()
})

export const InterviewFeedback = pgTable('interviewFeedback', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    userEmail: varchar('userEmail').notNull(),
    createdAt: varchar('createdAt').notNull(),
    
    // Overall session data
    duration: varchar('duration').notNull(),
    totalMessages: varchar('totalMessages').notNull(),
    averageScore: varchar('averageScore').notNull(),
    
    // Detailed feedback
    conversation: text('conversation').notNull(), // JSON string of all messages
    strengths: text('strengths').notNull(), // JSON array of strengths
    weaknesses: text('weaknesses').notNull(), // JSON array of weaknesses
    detailedFeedback: text('detailedFeedback').notNull(), // JSON array of detailed feedback
    
    // Individual message analysis
    messageAnalysis: text('messageAnalysis').notNull() // JSON array of per-message analysis
})