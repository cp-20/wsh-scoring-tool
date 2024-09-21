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
  console.log('isRetry', comment, context.issue);
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
    user: issue.user?.login,
    createdAt: new Date(issue.created_at)
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
    user: comment.user?.login,
    createdAt: new Date(comment.created_at)
  };
};

let replyCommentId: number | null = null;

export const updateComment = async (comment: string) => {
  if (replyCommentId === null) {
    const { data: postedComment } = await octokit.request(
      'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
      {
        owner: context.issue.owner,
        repo: context.issue.repo,
        issue_number: context.issue.number,
        body: comment
      }
    );
    replyCommentId = postedComment.id;
  } else {
    await octokit.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
      owner: context.issue.owner,
      repo: context.issue.repo,
      comment_id: replyCommentId,
      body: comment
    });
  }
};
