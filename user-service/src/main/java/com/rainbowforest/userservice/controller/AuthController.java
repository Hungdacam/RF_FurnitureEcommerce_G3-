package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.entity.LoginRequest;
import com.rainbowforest.userservice.entity.LoginResponse;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.security.JwtUtil;
import com.rainbowforest.userservice.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class AuthController {

        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private JwtUtil jwtUtil;

        @Autowired
        private HeaderGenerator headerGenerator;

        @Autowired
        private UserService userService;

        @PostMapping("/login")
        public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest,
                        HttpServletRequest request,
                        HttpServletResponse response) {
                try {
                        // Kiểm tra trạng thái active của người dùng trước khi xác thực
                        User user = userService.getUserByName(loginRequest.getUserName());
                        if (user == null) {
                                // Người dùng không tồn tại
                                return new ResponseEntity<>(null,
                                                headerGenerator.getHeadersForError(),
                                                HttpStatus.UNAUTHORIZED);
                        }
                        // Kiểm tra người dùng có bị khóa không
                        if (user.getActive() == 0) {
                                return new ResponseEntity<>(
                                                null,
                                                headerGenerator.getHeadersForError(),
                                                HttpStatus.FORBIDDEN);
                        }
                        // Xác thực thông tin đăng nhập
                        Authentication authentication = authenticationManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(
                                                        loginRequest.getUserName(),
                                                        loginRequest.getUserPassword()));

                        // Lưu thông tin xác thực vào SecurityContext
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        // Lấy thông tin người dùng và tạo token
                        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                        String token = jwtUtil.generateToken(userDetails);

                        // Lấy danh sách vai trò
                        List<String> roles = userDetails.getAuthorities()
                                        .stream()
                                        .map(authority -> authority.getAuthority())
                                        .collect(Collectors.toList());

                        // Tạo cookie chứa token (HttpOnly để tăng bảo mật)
                        Cookie cookie = new Cookie("token", token);
                        cookie.setHttpOnly(true);
                        cookie.setMaxAge(86400); // 1 ngày
                        cookie.setPath("/");
                        response.addCookie(cookie);

                        // Tạo response
                        LoginResponse loginResponse = new LoginResponse();
                        loginResponse.setToken(token);
                        loginResponse.setUserName(userDetails.getUsername());
                        loginResponse.setRoles(roles); // Thêm vai trò vào phản hồi

                        // Thêm ID người dùng vào phản hồi nếu cần
                        // loginResponse.setId(user.getId());

                        // Thêm thông tin userDetails nếu có
                        if (user.getUserDetails() != null) {
                                // Đây là nơi bạn có thể thêm thông tin chi tiết người dùng vào response
                                // Ví dụ: loginResponse.setUserDetails(...)
                        }

                        return new ResponseEntity<>(
                                        loginResponse,
                                        headerGenerator.getHeadersForSuccessPostMethod(request, 0L),
                                        HttpStatus.OK);
                } catch (BadCredentialsException e) {
                        return new ResponseEntity<>(
                                        null,
                                        headerGenerator.getHeadersForError(),
                                        HttpStatus.UNAUTHORIZED);
                }
        }

        @PostMapping("/logout")
        public ResponseEntity<Void> logout(HttpServletRequest request,
                        HttpServletResponse response,
                        Authentication authentication) {
                // Xóa thông tin xác thực
                SecurityContextLogoutHandler logoutHandler = new SecurityContextLogoutHandler();
                logoutHandler.logout(request, response, authentication);

                // Xóa cookie chứa token
                Cookie cookie = new Cookie("token", null);
                cookie.setMaxAge(0);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                response.addCookie(cookie);

                return new ResponseEntity<>(
                                null,
                                headerGenerator.getHeadersForSuccessGetMethod(),
                                HttpStatus.OK);
        }
}