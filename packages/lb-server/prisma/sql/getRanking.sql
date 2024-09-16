SELECT
  `Submission`.`userId` AS `userId`,
  `User`.`url` AS `url`,
  `User`.`disqualified` AS `disqualified`,
  MAX(`Submission`.`score`) AS `score`
FROM
  `Submission`
  JOIN `User` ON `Submission`.`userId` = `User`.`id`
GROUP BY
  `userId`
ORDER BY
  MAX(`Submission`.`score`) DESC;
