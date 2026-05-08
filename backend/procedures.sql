USE recroot;

-- ---------------------------------------------------------------
-- PROCEDURE 1: Submit Application (Atomic Transaction)
-- ---------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_submit_application(
    IN p_candidate_id INT,
    IN p_job_id INT,
    IN p_resume_id INT,
    IN p_ai_score DECIMAL(5,2),
    IN p_ai_feedback TEXT
)
BEGIN
    DECLARE exit handler FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Application submission failed';
    END;

    START TRANSACTION;
    
    INSERT INTO applications (candidate_id, job_id, resume_id, status, ai_score, ai_feedback)
    VALUES (p_candidate_id, p_job_id, p_resume_id, 'pending', p_ai_score, p_ai_feedback);
    
    INSERT INTO notifications (user_id, message)
    SELECT c.user_id, CONCAT('Your application for job #', p_job_id, ' has been submitted.')
    FROM candidates c WHERE c.candidate_id = p_candidate_id;
    
    COMMIT;
END //
DELIMITER ;

-- ---------------------------------------------------------------
-- PROCEDURE 2: Update Application Status (with notification)
-- ---------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_update_status(
    IN p_application_id INT,
    IN p_new_status ENUM('pending','shortlisted','rejected','interview_scheduled')
)
BEGIN
    DECLARE v_candidate_id INT;
    DECLARE v_job_id INT;
    DECLARE v_user_id INT;
    
    -- Update the status
    UPDATE applications SET status = p_new_status 
    WHERE application_id = p_application_id;
    
    -- Get candidate and job info
    SELECT candidate_id, job_id INTO v_candidate_id, v_job_id
    FROM applications WHERE application_id = p_application_id;
    
    SELECT user_id INTO v_user_id FROM candidates WHERE candidate_id = v_candidate_id;
    
    -- Send notification
    INSERT INTO notifications (user_id, message)
    VALUES (v_user_id, CONCAT('Your application #', p_application_id, ' status changed to: ', p_new_status));
END //
DELIMITER ;

-- ---------------------------------------------------------------
-- PROCEDURE 3: Get Ranked Candidates for a Job
--    Weighted formula: 0.60*AI_score + 0.20*experience + 0.10*education + 0.10*keyword match
-- ---------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE sp_get_ranked_candidates(
    IN p_job_id INT
)
BEGIN
    SELECT 
        a.application_id,
        u.full_name AS candidate_name,
        a.ai_score,
        c.experience_years,
        c.education,
        -- Weighted ranking formula
        (0.60 * COALESCE(a.ai_score, 0)) +
        (0.20 * LEAST(COALESCE(c.experience_years, 0) * 10, 100)) +
        (0.10 * CASE WHEN c.education IS NOT NULL AND c.education LIKE '%BS%' THEN 80
                      WHEN c.education IS NOT NULL THEN 60 ELSE 0 END) +
        (0.10 * 50) AS weighted_score,
        a.status,
        a.ai_feedback
    FROM applications a
    JOIN candidates c ON a.candidate_id = c.candidate_id
    JOIN users u ON c.user_id = u.user_id
    WHERE a.job_id = p_job_id
    ORDER BY weighted_score DESC;
END //
DELIMITER ;