import { createUser, createUserSubmission, fetchUserUrl } from './gateway';
import { getContextComment, getContextIssue, isRegister, isRetry, replyReaction } from './comment';
import { measure } from './scoring/2024';

if (await isRegister()) {
  const issue = await getContextIssue();
  const name = issue.user;
  if (name === undefined) {
    throw new Error('name is undefined');
  }
  const url = issue.body.match(/計測対象の URL \{\{url\}\}\n\n([a-zA-Z0-9:\/-_.]+)/)?.[1];
  console.log(issue.body, url);
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
  if (comment === undefined) {
    throw new Error('comment is undefined');
  }
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
