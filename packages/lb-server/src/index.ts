import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
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

const publicDir = process.env.PUBLIC_DIR;
if (publicDir === undefined) {
  throw new Error('環境変数 PUBLIC_DIR が設定されていません');
}

const headerKeyName = 'x-secret-key';

const app = new Hono();

const rankingQuerySchema = z
  .object({
    before: z.coerce.date(),
    after: z.coerce.date()
  })
  .partial();

const submissionSchema = z.object({
  name: z.string(),
  score: z.number()
});

const createUserSchema = z.object({
  name: z.string(),
  url: z.string().url()
});

const route = app
  .get('/api/ranking', zValidator('query', rankingQuerySchema), async (c) => {
    const query = c.req.valid('query');
    try {
      const result = await getRanking(query);
      return c.json(result);
    } catch (err) {
      console.error(err);
      return c.json({ message: 'Internal server error' }, 500);
    }
  })
  .get('/api/timeline', zValidator('query', z.object({ name: z.array(z.string()) })), async (c) => {
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
    '/api/submissions',
    zValidator('json', submissionSchema),
    zValidator('header', z.object({ [headerKeyName]: z.string() })),
    async (c) => {
      if (c.req.valid('header')[headerKeyName] !== secretKey) {
        return c.json({ message: 'Invalid secret key' }, 403);
      }

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
    '/api/users',
    zValidator('json', createUserSchema),
    zValidator('header', z.object({ [headerKeyName]: z.string() })),
    async (c) => {
      if (c.req.valid('header')[headerKeyName] !== secretKey) {
        return c.json({ message: 'Invalid secret key' }, 403);
      }

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
  .get('/api/users/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
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

app.use(serveStatic({ root: publicDir }));

export default {
  port: 3000,
  fetch: app.fetch
};

export type AppType = typeof route;
