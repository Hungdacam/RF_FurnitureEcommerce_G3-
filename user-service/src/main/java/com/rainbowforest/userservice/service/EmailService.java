package com.rainbowforest.userservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Async
    public void sendOtpEmail(String to, String otpCode) {
        try {
            logger.info("Bắt đầu gửi email OTP đến: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Xác thực Email - Mã OTP");
            message.setText("Mã OTP của bạn là: " + otpCode + "\nVui lòng nhập mã này để xác thực email của bạn. Mã có hiệu lực trong 10 phút.");
            mailSender.send(message);
            logger.info("Gửi email OTP thành công đến: {}", to);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email OTP đến {}: {}", to, e.getMessage());
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage(), e);
        }
    }
}