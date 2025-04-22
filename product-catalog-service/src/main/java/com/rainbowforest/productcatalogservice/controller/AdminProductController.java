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

import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@RestController
@CrossOrigin(origins = "http://localhost:5173", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
        RequestMethod.DELETE, RequestMethod.OPTIONS }, allowedHeaders = "*", allowCredentials = "true")
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
                "cloud_name", "dbjqhaayj", // Thay bằng cloud_name của bạn
                "api_key", "768372645321588", // Thay bằng API Key
                "api_secret", "Kji8OdwCTNIcOTbP4erdeBuYmhU" // Thay bằng API Secret
        ));
    }

    @RequestMapping(value = "/products", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/products", consumes = { "multipart/form-data" })
    private ResponseEntity<Product> addProduct(
            @RequestPart("product_name") String productName,
            @RequestPart("category") String category,
            @RequestPart("description") String description,
            @RequestPart("price") String price,
            @RequestPart("quantity") String quantity,
            @RequestPart("image") MultipartFile image,
            HttpServletRequest request) {
        try {
            // Upload hình ảnh lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "upload_preset", "KTPM_G3" // Thay bằng upload preset của bạn
            ));
            String imageUrl = (String) uploadResult.get("secure_url");

            // Tạo đối tượng Product
            Product product = new Product();
            product.setProductName(productName);
            product.setCategory(category);
            product.setDiscription(description);
            product.setPrice(new BigDecimal(price));
            product.setQuantity(Integer.parseInt(quantity));
            product.setImageUrl(imageUrl);

            // Lưu sản phẩm vào database
            productService.addProduct(product);

            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
                    HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping(value = "/products/{id}")
    private ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id) {
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
    private ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestPart("product_name") String productName,
            @RequestPart("category") String category,
            @RequestPart("discription") String discription,
            @RequestPart("price") String price,
            @RequestPart("quantity") String quantity,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest request) {

        try {
            Product existingproduct = productService.getProductById(id);
            if (existingproduct == null) {
                return new ResponseEntity<Product>(headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND);
            }
            String imageUrl = existingProduct.getImageUrl();
            if (image != null && !image.isEmpty()) {
                Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                        "upload_preset", "KTPM_G3"));
                imageUrl = (String) uploadResult.get("secure_url");
            }

            Product product = new Product();
            product.setProductName(productName);
            product.setCategory(category);
            product.setDiscription(discription);
            product.setPrice(new BigDecimal(price));
            product.setQuantity(Integer.parseInt(quantity));
            product.setImageUrl(imageUrl);
            Product updatedProduct = productService.updateProduct(id, product);
            if (updatedProduct != null) {
                return new ResponseEntity<Product>(
                        updatedProduct,
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK);
            } else {
                return new ResponseEntity<Product>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}