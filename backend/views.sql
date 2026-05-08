USE recroot;

-- ---------------------------------------------------------------
-- VIEW 1: Ranked Applicants (all jobs)
-- ---------------------------------------------------------------
CREATE VIEW v_ranked_applicants AS
SELECT 
    j.title AS job_title,
    u.full_name AS candidate_name,
    a.ai_score,
    c.experience_years,
    a.status,
    (0.60 * COALESCE(a.ai_score, 0)) +
    (0.20 * LEAST(COALESCE(c.experience_years, 0) * 10, 100)) +
    (0.10 * CASE WHEN c.education IS NOT NULL AND c.education LIKE '%BS%' THEN 80
                  WHEN c.education IS NOT NULL THEN 60 ELSE 0 END) +
    (0.10 * 50) AS weighted_score
FROM applications a
JOIN candidates c ON a.candidate_id = c.candidate_id
JOIN users u ON c.user_id = u.user_id
JOIN jobs j ON a.job_id = j.job_id
ORDER BY j.job_id, weighted_score DESC;

-- ---------------------------------------------------------------
-- VIEW 2: Job Statistics
-- ---------------------------------------------------------------
CREATE VIEW v_job_stats AS
SELECT 
    j.job_id,
    j.title,
    c.company_name,
    COUNT(a.application_id) AS total_applications,
    AVG(a.ai_score) AS avg_ai_score,
    SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
    SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
    SUM(CASE WHEN a.status = 'interview_scheduled' THEN 1 ELSE 0 END) AS interview_count
FROM jobs j
JOIN companies c ON j.company_id = c.company_id
LEFT JOIN applications a ON j.job_id = a.job_id
GROUP BY j.job_id, j.title, c.company_name;

-- ---------------------------------------------------------------
-- VIEW 3: Candidate Dashboard
-- ---------------------------------------------------------------
CREATE VIEW v_candidate_dashboard AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    c.skills,
    c.experience_years,
    c.education,
    COUNT(a.application_id) AS total_applications,
    SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
    SUM(CASE WHEN a.status = 'interview_scheduled' THEN 1 ELSE 0 END) AS interviews
FROM users u
JOIN candidates c ON u.user_id = c.user_id
LEFT JOIN applications a ON c.candidate_id = a.candidate_id
WHERE u.role = 'candidate'
GROUP BY u.user_id, u.full_name, u.email, c.skills, c.experience_years, c.education;

-- ---------------------------------------------------------------
-- TRIGGER: Log notification when application status changes
-- ---------------------------------------------------------------
DELIMITER //
CREATE TRIGGER trg_application_status_change
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO notifications (user_id, message)
        SELECT c.user_id, 
               CONCAT('Status changed from ', OLD.status, ' to ', NEW.status, ' for application #', NEW.application_id)
        FROM candidates c
        WHERE c.candidate_id = NEW.candidate_id;
    END IF;
END //
DELIMITER ;