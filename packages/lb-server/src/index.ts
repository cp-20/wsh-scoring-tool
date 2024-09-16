import { Hono } from "hono";
import {
  createSubmission,
  createUser,
  getRanking,
  getTimeline,
  getUser,
} from "./database/repository";
import { z } from "zod";

const secretKey = process.env.SECRET_KEY;
if (secretKey === undefined) {
  throw new Error("環境変数 SECRET_KEY が設定されていません");
}

const app = new Hono();

app.get("/ranking", async (c) => {
  try {
    const result = await getRanking();
    return c.json(result);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

app.get("/timeline", async (c) => {
  const names = c.req.queries("name");
  if (names === undefined || names.length === 0) {
    return c.json({ message: "userId is required" }, 400);
  }

  try {
    const result = await getTimeline(names);
    return c.json(result);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

const submissionSchema = z.object({
  name: z.string(),
  score: z.number(),
});

app.post("/submissions", async (c) => {
  const secret = c.req.header("X-Secret-Key");
  if (secret === undefined) {
    return c.json({ message: "X-Secret-Key is required" }, 400);
  }
  if (secret !== secretKey) {
    return c.json({ message: "Invalid secret key" }, 403);
  }

  const body = await c.req.parseBody();
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "Invalid submission" }, 400);
  }

  try {
    const { name, score } = parsed.data;
    await createSubmission({ name, score });
    return c.json({ message: "Submission created" });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

const createUserSchema = z.object({
  name: z.string(),
  url: z.string().url(),
});

app.post("/users", async (c) => {
  const secret = c.req.header("X-Secret-Key");
  if (secret === undefined) {
    return c.json({ message: "X-Secret-Key is required" }, 400);
  }
  if (secret !== secretKey) {
    return c.json({ message: "Invalid secret key" }, 403);
  }

  const body = c.req.parseBody();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "Invalid submission" }, 400);
  }

  try {
    const { name, url } = parsed.data;
    await createUser({ name, url });
    return c.json({ message: "User created" });
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

app.get("/users/:id", async (c) => {
  const userId = c.req.param("id");

  try {
    const result = await getUser(userId);
    if (result === undefined) {
      return c.json({ message: "Not found" }, 404);
    }
    return c.json(result);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Internal server error" }, 500);
  }
});

export default app;
