package com.qlearo.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DoubtSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    public DoubtSchemaInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        alterIfPossible("ALTER TABLE doubts MODIFY COLUMN audio_uri LONGTEXT NULL");
        alterIfPossible("ALTER TABLE doubts MODIFY COLUMN video_uri LONGTEXT NULL");
        alterIfPossible("ALTER TABLE doubts MODIFY COLUMN answer_audio LONGTEXT NULL");
        alterIfPossible("ALTER TABLE doubts MODIFY COLUMN answer_video LONGTEXT NULL");
        alterIfPossible("ALTER TABLE student_notifications MODIFY COLUMN recipient_id VARCHAR(255) NULL");
    }

    private void alterIfPossible(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception exception) {
            System.err.println("Schema update skipped: " + sql + " -> " + exception.getMessage());
        }
    }
}
