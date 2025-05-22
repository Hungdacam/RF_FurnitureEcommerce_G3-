package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    // Khởi tạo Cloudinary
    private final Cloudinary cloudinary;

    public AdminProductController() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dbjqhaayj",
                "api_key", "768372645321588",
                "api_secret", "Kji8OdwCTNIcOTbP4erdeBuYmhU"));
    }

    @PostMapping(value = "/products", consumes = { "multipart/form-data" })
    public ResponseEntity<Product> addProduct(
            @RequestPart("product_name") String productName,
            @RequestPart("category") String category,
            @RequestPart("description") String description,
            @RequestPart("price") String price,
            @RequestPart("quantity") String quantity,
            @RequestPart("image") MultipartFile image,
            HttpServletRequest request) {
        System.out.println(">>> Received POST /admin/products");
        System.out.println("Content-Type: " + request.getContentType());
        try {
            // Kiểm tra tên sản phẩm đã tồn tại chưa
            if (productService.getAllProductsByName(productName).size() > 0) {
                return new ResponseEntity<>(null, headerGenerator.getHeadersForError(), HttpStatus.CONFLICT);
            }

            // Upload hình ảnh lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "upload_preset", "KTPM_G3"));
            System.out.println(">>> Cloudinary upload result: " + uploadResult);
            String imageUrl = (String) uploadResult.get("secure_url");

            // Tạo đối tượng Product
            Product product = new Product();
            product.setProductName(productName);
            product.setCategory(category);
            product.setDescription(description);
            product.setPrice(new BigDecimal(price));
            product.setQuantity(Integer.parseInt(quantity));
            product.setImageUrl(imageUrl);

            // Lưu sản phẩm vào database
            productService.addProduct(product);

            System.out.println(">>> Product added successfully, ID: " + product.getId());
            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println(">>> Error adding product: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            try {
                productService.deleteProduct(id);
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/products/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestPart("product_name") String productName,
            @RequestPart("category") String category,
            @RequestPart("description") String description,
            @RequestPart("price") String price,
            @RequestPart("quantity") String quantity,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        try {
            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            String imageUrl = existingProduct.getImageUrl(); // Giữ nguyên URL hình ảnh cũ
            if (image != null && !image.isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                        "upload_preset", "KTPM_G3"));
                imageUrl = (String) uploadResult.get("secure_url");
            }

            existingProduct.setProductName(productName);
            existingProduct.setCategory(category);
            existingProduct.setDescription(description);
            existingProduct.setPrice(new BigDecimal(price));
            existingProduct.setQuantity(Integer.parseInt(quantity));
            existingProduct.setImageUrl(imageUrl);

            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}