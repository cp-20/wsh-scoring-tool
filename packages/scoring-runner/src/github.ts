import { context, getOctokit } from '@actions/github';

const token = process.env.GITHUB_TOKEN;
if (token === undefined) {
  throw new Error('環境変数 GITHUB_TOKEN が設定されていません');
}
const octokit = getOctokit(token);

const contextCommentId = context.payload.comment?.id;

export const isRegister = async () => {
  return context.eventName === 'issues' && context.payload.action === 'opened';
};

export const isRetry = async () => {
  const comment = await getContextComment();
  if (comment === undefined) return false;
  if (comment.user !== context.issue.owner) return false;
  if (comment.body.trim() !== '/retry') return false;
  return true;
};

export const getContextIssue = async () => {
  const { data: issue } = await octokit.request('GET /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: context.issue.owner,
    repo: context.issue.repo,
    issue_number: context.issue.number
  });
  if (issue.body === undefined || issue.body === null) {
    throw new Error('issue.body is undefined or null');
  }

  return {
    body: issue.body,
    user: issue.user?.login
  };
};

export const getContextComment = async () => {
  if (contextCommentId === undefined) return undefined;

  const { data: comment } = await octokit.request(
    'GET /repos/{owner}/{repo}/issues/comments/{comment_id}',
    {
      owner: context.issue.owner,
      repo: context.issue.repo,
      comment_id: contextCommentId
    }
  );
  if (comment.body === undefined) {
    throw new Error('comment.body is undefined');
  }

  return {
    body: comment.body,
    user: comment.user?.login
  };
};

export const replyReactionToIssue = async () => {
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/reactions', {
    owner: context.issue.owner,
    repo: context.issue.repo,
    issue_number: context.issue.number,
    content: 'rocket'
  });
};

export const replyReactionToComment = async () => {
  if (contextCommentId === undefined) {
    throw new Error('contextCommentId is undefined');
  }

  await octokit.request('POST /repos/{owner}/{repo}/comments/{comment_id}/reactions', {
    owner: context.issue.owner,
    repo: context.issue.repo,
    comment_id: contextCommentId,
    content: '+1'
  });
};

let replyCommentId = null;

export const updateComment = async (comment: string) => {
  if (replyCommentId === null) {
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: context.issue.owner,
      repo: context.issue.repo,
      issue_number: context.issue.number,
      body: comment
    });
  } else {
    await octokit.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
      owner: context.issue.owner,
      repo: context.issue.repo,
      comment_id: replyCommentId,
      body: comment
    });
  }
};
