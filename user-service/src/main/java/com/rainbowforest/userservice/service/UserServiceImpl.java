package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    public User saveUser(User user) {
        user.setActive(1);
        UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
        if (role == null) {
            throw new RuntimeException("Role ROLE_USER not found");
        }
        user.setRole(role);
        // CHỈ mã hóa nếu mật khẩu chưa mã hóa (tùy trường hợp)
        // Nếu đã mã hóa ở bước trước, KHÔNG mã hóa lại!
        // user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUserDetails(User user) {
        // Lấy user hiện tại từ database để giữ nguyên các thông tin quan trọng
        User existingUser = userRepository.findById(user.getId()).orElse(null);
        if (existingUser == null) {
            return null; // Hoặc throw exception
        }

        // Chỉ cập nhật UserDetails, giữ nguyên các thông tin khác
        if (user.getUserDetails() != null) {
            existingUser.setUserDetails(user.getUserDetails());
        }

        // Giữ nguyên các thông tin quan trọng
        // existingUser.setActive(existingUser.getActive());
        // existingUser.setRole(existingUser.getRole());
        // existingUser.setUserPassword(existingUser.getUserPassword());

        return userRepository.save(existingUser);
    }

    @Override
    public User updateUserPassword(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByUserDetailsEmail(email);
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        return userRepository.existsByUserDetailsPhoneNumber(phoneNumber);
    }
}
