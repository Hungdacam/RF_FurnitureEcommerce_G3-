package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	// @NotNull: chỉ kiểm tra khác null.
	// @NotBlank: kiểm tra khác null, khác rỗng, không chỉ toàn khoảng trắng.

	@Column(name = "product_name", columnDefinition = "NVARCHAR(255)")
	@NotBlank(message = "Product name must not be blank")
	private String productName;

	@Column(name = "price")
	@NotNull(message = "Price must not be null")
	@DecimalMin(value = "1", inclusive = true, message = "Price must be greater than 0")
	private BigDecimal price;

	@Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
	@NotBlank(message = "Description must not be blank")
	private String description;

	@Column(name = "category",  columnDefinition = "NVARCHAR(255)")
	@NotBlank(message = "Category must not be blank")
	private String category;

	@Column(name = "quantity")
	@NotNull(message = "Quantity must not be null")
	@Min(value = 0, message = "Quantity must be greater than or equal to 0")
	private int quantity;

	@Column(name = "image_url")
	private String imageUrl;

	public Product() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getProductName() {
		return productName;
	}

	public void setProductName(String productName) {
		this.productName = productName;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public int getQuantity() {
		return quantity;
	}

	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
}