package com.rainbowforest.orderservice.entity.order_service.service;

import java.io.File;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.rainbowforest.orderservice.entity.order_service.dto.ProductDTO;
import com.rainbowforest.orderservice.entity.order_service.entity.Order;
import com.rainbowforest.orderservice.entity.order_service.entity.OrderItem;
import com.rainbowforest.orderservice.entity.order_service.entity.OrderStatus;
import com.rainbowforest.orderservice.entity.order_service.repository.OrderRepository;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    private static final String API_GATEWAY_URL = "http://localhost:8900/api/catalog";

    @Override
    @Transactional
    public Order createOrder(String userName, String fullName, String phoneNumber, String buyerPhoneNumber, String address, String note,
            String paymentMethod, double totalAmount, List<OrderItem> items) {
        Order order = new Order();
        order.setUserName(userName);
        order.setFullName(fullName);
        order.setPhoneNumber(phoneNumber);
        order.setBuyerPhoneNumber(buyerPhoneNumber); // Thêm số điện thoại người mua
        order.setAddress(address);
        order.setNote(note);
        order.setPaymentMethod(paymentMethod);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);
        order.setItems(items);

        String invoiceCode = generateInvoiceCode(order.getOrderDate());
        order.setInvoiceCode(invoiceCode);

        return orderRepository.save(order);
    }

    private String generateInvoiceCode(LocalDateTime orderDate) {
        String datePart = orderDate.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        LocalDate today = orderDate.toLocalDate();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        long count = orderRepository.countOrdersInDay(start, end);
        String sequence = String.format("%03d", count + 1); 
        return "INV-" + datePart + "-" + sequence;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserName(String userName) {
        return orderRepository.findByUserName(userName);
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        if (newStatus == OrderStatus.SHIPPING) {
            generateInvoice(savedOrder);
        }
        return savedOrder;
    }

    @Override
    @Transactional
    public Order cancelOrder(Long orderId, String jwtToken) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận!");
        }

        // Hoàn lại số lượng sản phẩm trong kho
        for (OrderItem item : order.getItems()) {
            Long productId = item.getProductId();
            int quantityToRestore = item.getQuantity();

            try {
                // Lấy thông tin sản phẩm hiện tại
                ProductDTO product = restTemplate.getForObject(
                        API_GATEWAY_URL + "/products/" + productId,
                        ProductDTO.class);
                if (product == null) {
                    throw new RuntimeException("Sản phẩm " + productId + " không tồn tại!");
                }

                // Cập nhật số lượng (tăng lại)
                MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
                map.add("product_name", product.getProductName());
                map.add("category", product.getCategory());
                map.add("description", product.getDescription() != null ? product.getDescription() : "");
                map.add("price", product.getPrice().toString());
                map.add("quantity", String.valueOf(product.getQuantity() + quantityToRestore));

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.MULTIPART_FORM_DATA);
                if (jwtToken != null) {
                    headers.set("Authorization", "Bearer " + jwtToken);
                }

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(map, headers);

                restTemplate.put(API_GATEWAY_URL + "/admin/products/" + productId, requestEntity);
                System.out.println("Hoàn lại " + quantityToRestore + " sản phẩm ID " + productId + " vào kho");
            } catch (Exception e) {
                System.err.println("Lỗi khi hoàn lại sản phẩm " + productId + ": " + e.getMessage());
                throw new RuntimeException("Lỗi khi hoàn lại sản phẩm " + productId + ": " + e.getMessage());
            }
        }

        // Cập nhật trạng thái đơn hàng
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    private void generateInvoice(Order order) {
        try {
            String invoicesDir = "invoices";
            File dir = new File(invoicesDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = invoicesDir + "/invoice_" + order.getId() + "_"
                    + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            PdfWriter writer = new PdfWriter(fileName);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            document.add(
                    new Paragraph("HÓA ĐƠN ĐẶT HÀNG").setTextAlignment(TextAlignment.CENTER).setBold().setFontSize(16));
            document.add(new Paragraph("Mã hóa đơn: " + order.getInvoiceCode()));
            document.add(new Paragraph("Mã đơn hàng: " + order.getId()));
            document.add(new Paragraph("Ngày đặt hàng: "
                    + order.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))));
            document.add(new Paragraph("Khách hàng: " + order.getFullName()));
            document.add(new Paragraph("Số điện thoại người mua: " + order.getBuyerPhoneNumber()));
            document.add(new Paragraph("Số điện thoại người nhận: " + order.getPhoneNumber()));
            document.add(new Paragraph("Địa chỉ: " + order.getAddress()));
            if (order.getNote() != null && !order.getNote().isEmpty()) {
                document.add(new Paragraph("Lời nhắn: " + order.getNote()));
            }
            document.add(new Paragraph("Phương thức thanh toán: " + order.getPaymentMethod()));
            document.add(new Paragraph("\n"));

            float[] columnWidths = { 50, 200, 80, 80, 100 };
            Table table = new Table(columnWidths);
            table.addCell("STT");
            table.addCell("Sản phẩm");
            table.addCell("Giá");
            table.addCell("Số lượng");
            table.addCell("Tổng");

            int index = 1;
            for (OrderItem item : order.getItems()) {
                table.addCell(String.valueOf(index++));
                table.addCell(item.getProductName());
                table.addCell(String.format("$%.2f", item.getPrice()));
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell(String.format("$%.2f", item.getPrice() * item.getQuantity()));
            }

            document.add(table);
            document.add(new Paragraph("Tổng cộng: $" + String.format("%.2f", order.getTotalAmount())).setBold()
                    .setTextAlignment(TextAlignment.RIGHT));

            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo hóa đơn: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> findOrdersByInvoiceCode(String invoiceCode) {
        return orderRepository.findByInvoiceCode(invoiceCode);
    }
}