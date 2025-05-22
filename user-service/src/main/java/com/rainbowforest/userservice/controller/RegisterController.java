package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.*;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.repository.PendingUserRepository;
import com.rainbowforest.userservice.security.JwtUtil;
import com.rainbowforest.userservice.service.EmailService;
import com.rainbowforest.userservice.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import javax.transaction.Transactional;

@RestController
public class RegisterController {

    @Autowired
    private PasswordEncoder passwordEncoder;

	@Autowired
	private UserService userService;

	@Autowired
	private PendingUserRepository pendingUserRepository;

	@Autowired
	private HeaderGenerator headerGenerator;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private EmailService emailService;

    RegisterController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

	@PostMapping(value = "/registration")
	public ResponseEntity<RegisterResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest,
			HttpServletRequest request) {
		System.out.println(">>> user-service: Received registration request: " + registerRequest);
		try {
			// Kiểm tra email và số điện thoại
			if (userService.existsByEmail(registerRequest.getEmail()) ||
					pendingUserRepository.existsByEmail(registerRequest.getEmail())) {
				return ResponseEntity
						.status(HttpStatus.BAD_REQUEST)
						.body(new RegisterResponse(null, null, null, "Email đã được sử dụng"));
			}
			if (userService.existsByPhoneNumber(registerRequest.getPhoneNumber()) ||
					pendingUserRepository.existsByPhoneNumber(registerRequest.getPhoneNumber())) {
				return ResponseEntity
						.status(HttpStatus.BAD_REQUEST)
						.body(new RegisterResponse(null, null, null, "Số điện thoại đã được sử dụng"));
			}

			// Lưu vào bảng PendingUser
			PendingUser pendingUser = new PendingUser();
			pendingUser.setUserName(registerRequest.getUserName());
			pendingUser.setUserPassword(passwordEncoder.encode(registerRequest.getUserPassword())); // Encode password
			pendingUser.setFirstName(registerRequest.getFirstName());
			pendingUser.setLastName(registerRequest.getLastName());
			pendingUser.setEmail(registerRequest.getEmail());
			pendingUser.setPhoneNumber(registerRequest.getPhoneNumber());

			// Tạo OTP
			String otpCode = String.format("%06d", new Random().nextInt(999999));
			pendingUser.setOtpCode(otpCode);
			pendingUser.setCreatedAt(LocalDateTime.now());
			pendingUser.setExpiresAt(LocalDateTime.now().plusMinutes(10));

			pendingUserRepository.save(pendingUser);

			// Gửi email OTP
			emailService.sendOtpEmail(registerRequest.getEmail(), otpCode);

			// Tạo response
			RegisterResponse response = new RegisterResponse();
			response.setUserName(registerRequest.getUserName());
			response.setMessage("Vui lòng kiểm tra email để nhận mã OTP!");
			System.out.println(">>> user-service: Sending response: " + response);
			return new ResponseEntity<>(response,
					headerGenerator.getHeadersForSuccessPostMethod(request, null), HttpStatus.OK);
		} catch (Exception e) {
			System.err.println(">>> user-service: Error: " + e.getMessage());
			e.printStackTrace();
			return new ResponseEntity<>(new RegisterResponse(null, null, null, "Đăng ký thất bại: " + e.getMessage()),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping(value = "/verify-otp")
	@Transactional
	public ResponseEntity<RegisterResponse> verifyOtp(@RequestBody Map<String, String> requestBody,
			HttpServletRequest request) {
		try {
			String otpCode = requestBody.get("otpCode");
			String userName = requestBody.get("userName");
			if (otpCode == null || otpCode.isEmpty() || userName == null || userName.isEmpty()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(new RegisterResponse(null, null, null, "Mã OTP và tên người dùng không được để trống"));
			}

			Optional<PendingUser> pendingUserOpt = pendingUserRepository.findByOtpCode(otpCode);
			if (!pendingUserOpt.isPresent() || !pendingUserOpt.get().getUserName().equals(userName)) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(new RegisterResponse(null, null, null, "Mã OTP hoặc tên người dùng không hợp lệ"));
			}

			PendingUser pendingUser = pendingUserOpt.get();
			if (pendingUser.getExpiresAt().isBefore(LocalDateTime.now())) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body(new RegisterResponse(null, null, null, "Mã OTP đã hết hạn"));
			}

			// Tạo user chính thức
			User user = new User();
			user.setUserName(pendingUser.getUserName());
			user.setUserPassword(pendingUser.getUserPassword());
			UserDetails userDetails = new UserDetails();
			userDetails.setFirstName(pendingUser.getFirstName());
			userDetails.setLastName(pendingUser.getLastName());
			userDetails.setEmail(pendingUser.getEmail());
			userDetails.setPhoneNumber(pendingUser.getPhoneNumber());
			user.setUserDetails(userDetails);
			user.setEmailVerified(true);

			User savedUser = userService.saveUser(user);

			// Tạo JWT token
			org.springframework.security.core.userdetails.UserDetails userDetailsSecurity = userDetailsService
					.loadUserByUsername(user.getUserName());
			String token = jwtUtil.generateToken(userDetailsSecurity);

			// Xóa bản ghi trong PendingUser
			pendingUserRepository.deleteByUserName(user.getUserName());

			// Tạo response
			RegisterResponse response = new RegisterResponse();
			response.setUserId(savedUser.getId());
			response.setUserName(savedUser.getUserName());
			response.setToken(token);
			response.setMessage("Xác thực email thành công! Tài khoản đã được tạo.");

			return new ResponseEntity<>(response,
					headerGenerator.getHeadersForSuccessPostMethod(request, savedUser.getId()),
					HttpStatus.OK);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<>(
					new RegisterResponse(null, null, null, "Xác thực OTP thất bại: " + e.getMessage()),
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@PostMapping(value = "/resend-otp")
    @Transactional
    public ResponseEntity<RegisterResponse> resendOtp(@RequestBody Map<String, String> requestBody,
                                                     HttpServletRequest request) {
        try {
            String userName = requestBody.get("userName");
            if (userName == null || userName.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse(null, null, null, "Tên người dùng không được để trống"));
            }

            Optional<PendingUser> pendingUserOpt = pendingUserRepository.findByUserName(userName);
            if (!pendingUserOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new RegisterResponse(null, null, null, "Yêu cầu đăng ký không tồn tại"));
            }

            PendingUser pendingUser = pendingUserOpt.get();

            // Tạo OTP mới
            String otpCode = String.format("%06d", new Random().nextInt(999999));
            pendingUser.setOtpCode(otpCode);
            pendingUser.setCreatedAt(LocalDateTime.now());
            pendingUser.setExpiresAt(LocalDateTime.now().plusMinutes(10));
            pendingUserRepository.save(pendingUser);

            // Gửi email OTP
            emailService.sendOtpEmail(pendingUser.getEmail(), otpCode);

            // Tạo response
            RegisterResponse response = new RegisterResponse();
            response.setUserName(userName);
            response.setMessage("Đã gửi lại mã OTP. Vui lòng kiểm tra email!");

            return new ResponseEntity<>(response, headerGenerator.getHeadersForSuccessPostMethod(request, null),
                    HttpStatus.OK);
        } catch (Exception e) {
            System.err.println(">>> user-service: Lỗi gửi lại OTP: " + e.getMessage());
            e.printStackTrace();
            // Chỉ trả về 503 nếu thực sự là lỗi dịch vụ không khả dụng
            if (e.getMessage() != null && (e.getMessage().contains("mail server") || e.getMessage().contains("database"))) {
                return new ResponseEntity<>(
                        new RegisterResponse(null, null, null, "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau."),
                        HttpStatus.SERVICE_UNAVAILABLE);
            }
            return new ResponseEntity<>(
                    new RegisterResponse(null, null, null, "Gửi lại OTP thất bại: " + e.getMessage()),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}