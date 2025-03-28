import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
    id: serial('id').primaryKey(),
    jsonMockResp: text('jsonMockResp').notNull(),
    jobPosition: varchar('jobPosition').notNull(),
    jobDesc: varchar('jobDesc').notNull(),
    jobExperience: varchar('jobExperience').notNull(),
    createdBy: varchar('createdBy').notNull(),
    createdAt: varchar('createdAt'),
    mockID: varchar('mockID').notNull()

})

export const UserAnswer = pgTable('userAnswer', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    question: varchar('question').notNull(),
    suggestAns: text('suggestAns').notNull(),
    userAns: text('userAns').notNull(),
    feedback: text('feedback').notNull(),
    rating: varchar('rating').notNull(),
    userEmail: varchar('userEmail').notNull(),
    createdAt: varchar('createdAt').notNull(),

})

export const OverallFeedback = pgTable('overallFeedback', {
    id: serial('id').primaryKey(),
    mockIdRef: varchar('mockId').notNull(),
    userEmail: varchar('userEmail').notNull(),
    createdAt: varchar('createdAt').notNull(),
    bodyLanguageFeedback: varchar('bodyLanguageFeedback').notNull(),
})