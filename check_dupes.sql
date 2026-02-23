SELECT word, COUNT(*) as count 
FROM Vocabulary 
GROUP BY LOWER(word), userId 
HAVING count > 1;
