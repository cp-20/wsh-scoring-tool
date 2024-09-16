import { z } from "zod";

const apiUriBase = process.env.API_URI_BASE;
if (apiUriBase === undefined) {
  throw new Error("環境変数 API_URI_BASE が設定されていません");
}

const secretKey = process.env.SECRET_KEY;
if (secretKey === undefined) {
  throw new Error("環境変数 SECRET_KEY が設定されていません");
}

const getUserResultSchema = z.object({
  id: z.string(),
  url: z.string(),
  createdAt: z.coerce.date(),
});

export const fetchUserUrl = async (name: string) => {
  const res = await fetch(`${apiUriBase}/users/${name}`);
  if (!res.ok) return undefined;
  const json = await res.json();
  const data = getUserResultSchema.parse(json);
  return data.url;
};

export const createUser = async (name: string, url: string) => {
  const body = { name, url };
  await fetch(`${apiUriBase}/users`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-Secret-Key": secretKey,
    },
  });
};

export const createUserSubmission = async (name: string, score: number) => {
  const body = { name, score };
  await fetch(`${apiUriBase}/submissions`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "X-Secret-Key": secretKey,
    },
  });
};
