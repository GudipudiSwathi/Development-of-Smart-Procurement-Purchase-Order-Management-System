package com.eps.enterpriseprocurementsystem.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;


    // =====================================================
    // PLAIN TEXT EMAIL
    // =====================================================

    @Async
    public void sendEmail(
            String to,
            String subject,
            String body) {

        try {

            if (to == null || to.trim().isEmpty()) {

                System.err.println(
                        "EMAIL NOT SENT: recipient email is empty."
                );

                return;
            }

            System.out.println(
                    "ASYNC EMAIL: Sending plain-text email to "
                            + to
            );

            SimpleMailMessageWrapper.send(
                    mailSender,
                    to,
                    subject,
                    body
            );

            System.out.println(
                    "ASYNC EMAIL: Plain-text email sent successfully to "
                            + to
            );

        } catch (Exception e) {

            // Email failure must NEVER affect the
            // purchase request/payment/business operation.
            System.err.println(
                    "ASYNC EMAIL ERROR: Failed to send email to "
                            + to
                            + " | "
                            + e.getMessage()
            );

            e.printStackTrace();
        }
    }


    // =====================================================
    // HTML EMAIL
    // =====================================================

    @Async
    public void sendHtmlEmail(
            String to,
            String subject,
            String htmlBody) {

        try {

            if (to == null || to.trim().isEmpty()) {

                System.err.println(
                        "HTML EMAIL NOT SENT: recipient email is empty."
                );

                return;
            }

            System.out.println(
                    "ASYNC EMAIL: Sending HTML email to "
                            + to
            );

            MimeMessage message =
                    mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(
                            message,
                            true,
                            "UTF-8"
                    );

            helper.setTo(to);
            helper.setSubject(subject);

            helper.setText(
                    htmlBody,
                    true
            );

            mailSender.send(message);

            System.out.println(
                    "ASYNC EMAIL: HTML email sent successfully to "
                            + to
            );

        } catch (MessagingException e) {

            System.err.println(
                    "ASYNC HTML EMAIL ERROR: Failed to send HTML email to "
                            + to
                            + " | "
                            + e.getMessage()
            );

            e.printStackTrace();

        } catch (Exception e) {

            System.err.println(
                    "ASYNC HTML EMAIL ERROR: "
                            + e.getMessage()
            );

            e.printStackTrace();
        }
    }


    // =====================================================
    // HELPER FOR PLAIN TEXT EMAIL
    // =====================================================

    private static class SimpleMailMessageWrapper {

        static void send(
                JavaMailSender mailSender,
                String to,
                String subject,
                String body) {

            org.springframework.mail.SimpleMailMessage message =
                    new org.springframework.mail.SimpleMailMessage();

            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        }
    }
}