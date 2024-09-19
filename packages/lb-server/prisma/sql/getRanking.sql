-- @param {DateTime} $1:before
-- @param {DateTime} $2:after
SELECT
  `Submission`.`userId` AS `userId`,
  `User`.`url` AS `url`,
  `User`.`disqualified` AS `disqualified`,
  MAX(`Submission`.`score`) AS `score`
FROM
  `Submission`
  JOIN `User` ON `Submission`.`userId` = `User`.`id`
WHERE
  `Submission`.`createdAt` >= ?
  AND `Submission`.`createdAt` <= ?
GROUP BY
  `userId`
ORDER BY
  MAX(`Submission`.`score`) DESC;
