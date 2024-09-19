import { createUser, createUserSubmission, fetchUserUrl } from './gateway';
import { getContextComment, getContextIssue, isRegister, isRetry } from './github';
import { measure2024 } from './scoring/2024';

if (await isRegister()) {
  const issue = await getContextIssue();
  const name = issue.user;
  if (name === undefined) {
    throw new Error('name is undefined');
  }
  const url = issue.body.match(/計測対象の URL \{\{url\}\}\n\n([a-zA-Z0-9:\/\-_.]+)/)?.[1];
  if (url === undefined) {
    throw new Error('url is undefined');
  }
  await createUser(name, url);
  const score = await measure2024(url);
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
  const score = await measure2024(url);
  await createUserSubmission(name, score);
}
