package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/products")
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product,
            HttpServletRequest request) {
        System.out.println(">>> Received POST addProduct");

        try {
            // Validate input
            if (product.getProductName() == null || product.getCategory() == null ||
                    product.getPrice() == null || product.getQuantity() < 0 || product.getImageUrl() == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.BAD_REQUEST);
            }

            // Save product to database
            productService.addProduct(product);

            return new ResponseEntity<Product>(
                    product,
                    headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
                    HttpStatus.CREATED
            );
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<Product>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
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
                        HttpStatus.OK
                );
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<Void>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
        return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/products/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") Long id,
            @RequestBody Product product) {
        try {
            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // Update fields
            existingProduct.setProductName(product.getProductName());
            existingProduct.setCategory(product.getCategory());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setImageUrl(product.getImageUrl());

            Product updatedProduct = productService.updateProduct(id, existingProduct);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}