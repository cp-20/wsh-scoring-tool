-- @param {DateTime} $1:before
-- @param {DateTime} $2:after
SELECT
  `Submission`.`userId` AS `userId`,
  `User`.`url` AS `url`,
  `User`.`disqualified` AS `disqualified`,
  `Submission`.`score` AS `score`
FROM
  `Submission`
  JOIN `User` ON `Submission`.`userId` = `User`.`id`
  JOIN (
    SELECT
      `userId`,
      MAX(`createdAt`) AS `latestSubmission`
    FROM
      `Submission`
    WHERE
      `createdAt` >= ?
      AND `createdAt` <= ?
    GROUP BY
      `userId`
  ) AS `LatestSubmissions` ON `Submission`.`userId` = `LatestSubmissions`.`userId`
  AND `Submission`.`createdAt` = `LatestSubmissions`.`latestSubmission`
ORDER BY
  `Submission`.`score` DESC;
