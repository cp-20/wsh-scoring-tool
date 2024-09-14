import { Hono } from "hono";
import {
  createSubmission,
  getRanking,
  getTimeline,
} from "./database/repository";
import { z } from "zod";

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
  const secret = c.header("X-Secret-Key");
  if (secret !== process.env.SECRET_KEY) {
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

export default app;
