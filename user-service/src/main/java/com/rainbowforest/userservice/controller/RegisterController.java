package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.entity.RegisterRequest;
import com.rainbowforest.userservice.entity.RegisterResponse;
import com.rainbowforest.userservice.security.JwtUtil;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@RestController
public class RegisterController {

	@Autowired
	private UserService userService;

	@Autowired
	private HeaderGenerator headerGenerator;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private UserDetailsService userDetailsService;

	@PostMapping(value = "/registration")
	public ResponseEntity registerUser(@Valid @RequestBody RegisterRequest registerRequest,
									   HttpServletRequest request) {
		try {
			// Chuyển đổi từ RegisterRequest sang User
			User user = new User();
			user.setUserName(registerRequest.getUserName());
			user.setUserPassword(registerRequest.getUserPassword());

			// Thiết lập UserDetails với thông tin cơ bản
			UserDetails userDetails = new UserDetails();
			userDetails.setFirstName(registerRequest.getFirstName());
			userDetails.setLastName(registerRequest.getLastName());
			userDetails.setEmail(registerRequest.getEmail());
			userDetails.setPhoneNumber(registerRequest.getPhoneNumber());

			user.setUserDetails(userDetails);

			// Lưu người dùng
			User savedUser = userService.saveUser(user);

			// Tạo JWT token cho người dùng mới đăng ký
			// Đổi tên biến ở đây để tránh xung đột
			org.springframework.security.core.userdetails.UserDetails userDetailsSecurity = userDetailsService.loadUserByUsername(savedUser.getUserName());
			String token = jwtUtil.generateToken(userDetailsSecurity);

			// Tạo response
			RegisterResponse response = new RegisterResponse();
			response.setUserId(savedUser.getId());
			response.setUserName(savedUser.getUserName());
			response.setToken(token);

			return new ResponseEntity<>(
					response,
					headerGenerator.getHeadersForSuccessPostMethod(request, savedUser.getId()),
					HttpStatus.CREATED
			);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}


}