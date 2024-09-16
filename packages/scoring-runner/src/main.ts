import { createUser, createUserSubmission, fetchUserUrl } from './gateway';
import { getContextComment, isRegister, isRetry, replyReaction } from './comment';
import { measure } from './scoring/2024';

if (await isRegister()) {
  const comment = await getContextComment();
  const name = comment.user;
  if (name === undefined) {
    throw new Error('name is undefined');
  }
  const url = comment.body.match(/### 計測対象の URL \{\{url\}\}\n\n([a-zA-Z:\/-_]+)$/)?.[1];
  if (url === undefined) {
    throw new Error('url is undefined');
  }
  await createUser(name, url);
  await replyReaction();
  const score = await measure(url);
  await createUserSubmission(name, score);
}

if (await isRetry()) {
  const comment = await getContextComment();
  const name = comment.user;
  if (name === undefined) {
    throw new Error('name is undefined');
  }
  const url = await fetchUserUrl(name);
  if (url === undefined) {
    throw new Error('url is undefined');
  }
  await replyReaction();
  const score = await measure(url);
  await createUserSubmission(name, score);
}