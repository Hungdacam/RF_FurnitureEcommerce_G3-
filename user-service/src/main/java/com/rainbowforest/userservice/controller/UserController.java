package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserDetails;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.service.UserService;
import com.rainbowforest.userservice.dto.UserDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

import com.rainbowforest.userservice.dto.UserDetailsDto;

@RestController
public class UserController {
    private final UserRepository userRepository;

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    
    UserController(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }
    
    @GetMapping (value = "/users")
    public ResponseEntity<List<User>> getAllUsers(){
        List<User> users =  userService.getAllUsers();
        if(!users.isEmpty()) {
        	return new ResponseEntity<List<User>>(
        		users,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<User>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

	@GetMapping(value = "/users", params = "name")
    public ResponseEntity<User> getUserByName(@RequestParam("name") String userName){
    	User user = userService.getUserByName(userName);
    	if(user != null) {
    		return new ResponseEntity<User>(
    				user,
    				headerGenerator.
    				getHeadersForSuccessGetMethod(),
    				HttpStatus.OK);
    	}
        return new ResponseEntity<User>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
@GetMapping(value = "/users/by-username")
public ResponseEntity<UserDto> getUserByUserName(@RequestParam("username") String userName) {
    User user = userService.getUserByName(userName);
    if (user != null) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUserName(user.getUserName());
        userDto.setRoleName(user.getRole().getRoleName());
        

        if (user.getUserDetails() != null) {
            UserDetailsDto detailsDto = new UserDetailsDto();
            detailsDto.setFirstName(user.getUserDetails().getFirstName());
            detailsDto.setLastName(user.getUserDetails().getLastName());
            detailsDto.setEmail(user.getUserDetails().getEmail());
            detailsDto.setPhoneNumber(user.getUserDetails().getPhoneNumber());
            detailsDto.setStreet(user.getUserDetails().getStreet());
            detailsDto.setStreetNumber(user.getUserDetails().getStreetNumber());
            detailsDto.setZipCode(user.getUserDetails().getZipCode());
            detailsDto.setLocality(user.getUserDetails().getLocality());
            detailsDto.setCountry(user.getUserDetails().getCountry());
            userDto.setUserDetails(detailsDto);
        }

        return new ResponseEntity<>(
            userDto,
            headerGenerator.getHeadersForSuccessGetMethod(),
            HttpStatus.OK
        );
    }
    return new ResponseEntity<>(
        headerGenerator.getHeadersForError(),
        HttpStatus.NOT_FOUND
    );
}
     @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUserDetails(
            @PathVariable("id") Long id,
            @RequestBody UserDetailsDto updatedDetails) {
        try {
            // Thêm log để debug
            System.out.println("Nhận request cập nhật user ID: " + id);
            System.out.println("Dữ liệu nhận được: " + updatedDetails);
            if (updatedDetails == null) {
                System.out.println("updatedDetails là null");
                return ResponseEntity.badRequest().build();
            }

            User user = userService.getUserById(id);
            if (user == null) {
                System.out.println("Không tìm thấy user ID: " + id);
                return ResponseEntity.notFound().build();
            }

            if (user.getUserDetails() == null) {
                user.setUserDetails(new UserDetails());
            }

            UserDetails details = user.getUserDetails();
            details.setFirstName(updatedDetails.getFirstName());
            details.setLastName(updatedDetails.getLastName());
            details.setEmail(updatedDetails.getEmail());
            details.setStreet(updatedDetails.getStreet());
            details.setPhoneNumber(updatedDetails.getPhoneNumber());
            details.setStreetNumber(updatedDetails.getStreetNumber());
            details.setZipCode(updatedDetails.getZipCode());
            details.setLocality(updatedDetails.getLocality());
            details.setCountry(updatedDetails.getCountry());

            // Thêm log trước khi lưu
            System.out.println("Đang lưu thông tin user: " + user.getId());
            // Sử dụng phương thức updateUserDetails thay vì saveUser
            userService.updateUserDetails(user);
            System.out.println("Đã lưu thành công user ID: " + user.getId());

            UserDto userDto = new UserDto();
            userDto.setId(user.getId());
            userDto.setUserName(user.getUserName());
            userDto.setRoleName(user.getRole().getRoleName());

            UserDetailsDto dto = new UserDetailsDto();
            dto.setFirstName(details.getFirstName());
            dto.setLastName(details.getLastName());
            dto.setEmail(details.getEmail());
            dto.setPhoneNumber(details.getPhoneNumber());
            dto.setStreet(details.getStreet());
            dto.setStreetNumber(details.getStreetNumber());
            dto.setZipCode(details.getZipCode());
            dto.setLocality(details.getLocality());
            dto.setCountry(details.getCountry());
            userDto.setUserDetails(dto);

            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            System.err.println("Lỗi cập nhật thông tin người dùng: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/users/{id}/password")
    public ResponseEntity<String> updateUserPassword(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> passwordData) {
        try {
            System.out.println("Nhận request cập nhật mật khẩu cho user ID: " + id);
            
            String oldPassword = passwordData.get("oldPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin mật khẩu");
            }

            User user = userService.getUserById(id);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Kiểm tra mật khẩu cũ
            if (!passwordEncoder.matches(oldPassword, user.getUserPassword())) {
                return ResponseEntity.status(400).body("Mật khẩu hiện tại không đúng");
            }

            // Cập nhật mật khẩu mới
            user.setUserPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user); // Lưu trực tiếp hoặc thông qua service

            return ResponseEntity.ok("Đã cập nhật mật khẩu thành công");
        } catch (Exception e) {
            System.err.println("Lỗi khi cập nhật mật khẩu: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi khi cập nhật mật khẩu");
        }
    }

	
}
