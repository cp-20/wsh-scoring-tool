import { createUser, fetchUserUrl } from "./gateway";
import { parseArgs } from "util";

export const parseArg = async () => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      url: { type: "string" },
      name: { type: "string" },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.name === undefined) {
    console.error("--name フラグを指定してください");
    process.exit(1);
  }

  const registeredUrl = await fetchUserUrl(values.name);
  if (registeredUrl === undefined) {
    if (values.url === undefined) {
      console.error("--url フラグを指定してください");
      process.exit(1);
    }
    try {
      await createUser(values.name, values.url);
    } catch (err) {
      console.error("予期せぬエラーが発生しました");
      process.exit(1);
    }
  }

  return {
    name: values.name,
    url: registeredUrl ?? values.url as string,
  };
};
