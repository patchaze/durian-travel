import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        h1: z.string().optional(),
        description: z.string(),
        pubDate: z.coerce.date(),
        modDate: z.coerce.date().optional(),
        author: z.string().default('Durian Travel Editorial Team'),
        tags: z.array(z.string()).default([]),
        ogImage: z.string().optional(),
        readTime: z.number().default(5),
        draft: z.boolean().default(false),
        keywords: z.string().optional(),
        seoTitle: z.string().optional(),
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
    }),
});

const destinationsCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        metaTitle: z.string(),
        metaDescription: z.string(),
        keywords: z.string().optional(),
    }),
});

export const collections = {
    blog: blogCollection,
    destinations: destinationsCollection,
};
