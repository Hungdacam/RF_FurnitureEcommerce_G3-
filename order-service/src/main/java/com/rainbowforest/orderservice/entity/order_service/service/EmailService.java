package com.rainbowforest.orderservice.entity.order_service.service;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;
import org.springframework.stereotype.Service;
import com.rainbowforest.orderservice.entity.order_service.dto.OrderDto;
import com.rainbowforest.orderservice.entity.order_service.dto.OrderItemDto;

@Service
public class EmailService {

    private final String senderEmail = "buikhacthang910.42@gmail.com"; 
    private final String senderPassword = "sbra hamq wdey cxns"; 

    private Properties getMailProperties() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        return props;
    }

    public void sendOrderConfirmationEmail(String recipientEmail, OrderDto order) {
        try {
            Properties props = getMailProperties();
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(senderEmail, senderPassword);
                }
            });

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(senderEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("Xác nhận đặt hàng #" + order.getId());

            StringBuilder emailContent = new StringBuilder();
            emailContent.append("<h2>Xin chào ").append(order.getFullName()).append(",</h2>");
            emailContent.append("<p>Cảm ơn bạn đã đặt hàng! Dưới đây là chi tiết đơn hàng của bạn:</p>");
            emailContent.append("<p><strong>Mã hóa đơn:</strong> ").append(order.getInvoiceCode()).append("</p>");
            emailContent.append("<p><strong>Ngày đặt hàng:</strong> ").append(order.getOrderDate()).append("</p>");
            emailContent.append("<p><strong>Địa chỉ giao hàng:</strong> ").append(order.getAddress()).append("</p>");
            emailContent.append("<p><strong>Số điện thoại người nhận:</strong> ").append(order.getPhoneNumber()).append("</p>");
            emailContent.append("<h3>Danh sách sản phẩm:</h3>");
            emailContent.append("<ul>");
            for (OrderItemDto item : order.getItems()) {
                emailContent.append("<li>")
                    .append(item.getProductName())
                    .append(" - Số lượng: ").append(item.getQuantity())
                    .append(" - Giá: $").append(String.format("%.2f", item.getPrice()))
                    .append(" - Tổng: $").append(String.format("%.2f", item.getPrice() * item.getQuantity()))
                    .append("</li>");
            }
            emailContent.append("</ul>");
            emailContent.append("<p><strong>Tổng tiền:</strong> $").append(String.format("%.2f", order.getTotalAmount())).append("</p>");
            emailContent.append("<p>Chúng tôi sẽ thông báo khi đơn hàng được xử lý. Cảm ơn bạn rất nhiều!</p>");

            message.setContent(emailContent.toString(), "text/html; charset=UTF-8");

            Transport.send(message);
            System.out.println("Gửi email xác nhận đơn hàng tới: " + recipientEmail);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi email xác nhận đơn hàng: " + e.getMessage());
            throw new RuntimeException("Lỗi gửi email xác nhận đơn hàng", e);
        }
    }

    public void sendOrderCancellationEmail(String recipientEmail, OrderDto order) {
        try {
            Properties props = getMailProperties();
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(senderEmail, senderPassword);
                }
            });

            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(senderEmail));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("Thông báo hủy đơn hàng #" + order.getId());

            StringBuilder emailContent = new StringBuilder();
            emailContent.append("<h2>Xin chào ").append(order.getFullName()).append(",</h2>");
            emailContent.append("<p>Đơn hàng của bạn đã được hủy theo yêu cầu. Dưới đây là thông tin:</p>");
            emailContent.append("<p><strong>Mã hóa đơn:</strong> ").append(order.getInvoiceCode()).append("</p>");
            emailContent.append("<p><strong>Ngày đặt hàng:</strong> ").append(order.getOrderDate()).append("</p>");
            emailContent.append("<p><strong>Tổng tiền:</strong> $").append(String.format("%.2f", order.getTotalAmount())).append("</p>");
            emailContent.append("<p>Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ. Cảm ơn bạn!</p>");

            message.setContent(emailContent.toString(), "text/html; charset=UTF-8");

            Transport.send(message);
            System.out.println("Gửi email hủy đơn hàng tới: " + recipientEmail);
        } catch (MessagingException e) {
            System.err.println("Lỗi gửi email hủy đơn hàng: " + e.getMessage());
            throw new RuntimeException("Lỗi gửi email hủy đơn hàng", e);
        }
    }
}