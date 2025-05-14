package com.rainbowforest.cartservice.cartservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
public class CartserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CartserviceApplication.class, args);
	}

}
