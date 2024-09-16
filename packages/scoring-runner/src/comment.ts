import { getInput } from '@actions/core';
import { context, getOctokit } from '@actions/github';

const token = getInput('token');
const octokit = getOctokit(token);

const contextCommentId = context.payload.comment?.id;
if (contextCommentId === undefined) {
  throw new Error('contextCommentId is undefined');
}

export const isRegister = async () => {
  return context.eventName === 'issues' && context.payload.action === 'opened';
};

export const isRetry = async () => {
  const comment = await getContextComment();
  if (comment.user !== context.issue.owner) return false;
  if (comment.body.trim() !== '/retry') return false;
  return true;
};

export const getContextComment = async () => {
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

export const replyReaction = async () => {
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
