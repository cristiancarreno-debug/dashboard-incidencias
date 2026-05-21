import { z } from 'zod'

/** Schema Zod para una issue individual de Jira. */
export const JiraIssueSchema = z.object({
  key: z.string().regex(/^[A-Z][A-Z0-9]+-\d+$/),
  fields: z.object({
    summary: z.string(),
    assignee: z
      .object({
        displayName: z.string(),
        accountId: z.string(),
      })
      .nullable(),
    status: z.object({
      name: z.string(),
    }),
    created: z.string().datetime({ offset: true }),
    issuetype: z.object({
      name: z.string(),
    }),
    parent: z
      .object({
        key: z.string(),
        fields: z.object({
          summary: z.string(),
        }),
      })
      .nullable()
      .optional(),
    timespent: z.number().nullable().optional(),
    worklog: z.object({ total: z.number(), maxResults: z.number(), worklogs: z.array(z.object({ author: z.object({ displayName: z.string(), accountId: z.string() }), timeSpentSeconds: z.number(), started: z.string() })) }).optional(),  }),
})

/** Schema Zod para la respuesta paginada de búsqueda de Jira. */
export const JiraSearchResponseSchema = z.object({
  issues: z.array(JiraIssueSchema),
  nextPageToken: z.string().nullable().optional(),
  isLast: z.boolean().optional(),
})
