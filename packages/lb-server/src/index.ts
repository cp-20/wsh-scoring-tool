import { Hono } from 'hono';
import {
  createSubmission,
  createUser,
  getRanking,
  getTimeline,
  getUser
} from './database/repository';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const secretKey = process.env.SECRET_KEY;
if (secretKey === undefined) {
  throw new Error('環境変数 SECRET_KEY が設定されていません');
}

const app = new Hono();

const submissionSchema = z.object({
  name: z.string(),
  score: z.number()
});

const createUserSchema = z.object({
  name: z.string(),
  url: z.string().url()
});

const route = app
  .get('/ranking', async (c) => {
    try {
      const result = await getRanking();
      return c.json(result);
    } catch (err) {
      console.error(err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  })
  .get('/timeline', zValidator('query', z.object({ name: z.array(z.string()) })), async (c) => {
    const names = c.req.valid('query').name;
    if (names.length === 0) {
      return c.json({ message: 'userId is required' }, 400);
    }

    try {
      const result = await getTimeline(names);
      return c.json(result);
    } catch (err) {
      console.error(err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  })
  .post(
    '/submissions',
    zValidator('header', z.object({ 'X-Secret-Key': z.enum([secretKey]) })),
    zValidator('json', submissionSchema),
    async (c) => {
      const body = c.req.valid('json');
      try {
        const { name, score } = body;
        await createSubmission({ name, score });
        return c.json({ message: 'Submission created' });
      } catch (err) {
        console.error(err);
        return c.json({ message: 'Internal server error' }, 500);
      }
    }
  )
  .post(
    '/users',
    zValidator('header', z.object({ 'X-Secret-Key': z.enum([secretKey]) })),
    zValidator('json', createUserSchema),
    async (c) => {
      const body = c.req.valid('json');

      try {
        const { name, url } = body;
        await createUser({ name, url });
        return c.json({ message: 'User created' });
      } catch (err) {
        console.error(err);
        return c.json({ message: 'Internal server error' }, 500);
      }
    }
  )
  .get('/users/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
    const userId = c.req.valid('param').id;

    try {
      const result = await getUser(userId);
      if (result === undefined) {
        return c.json({ message: 'Not found' }, 404);
      }
      return c.json(result);
    } catch (err) {
      console.error(err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  });

export default {
  port: 3000,
  fetch: app.fetch
};

export type AppType = typeof route;
