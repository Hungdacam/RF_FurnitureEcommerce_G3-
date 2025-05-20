package com.rainbowforest.cartservice.dto;

public class UserDto {
        private Long id;
    private String userName;
    private String roleName;
    private UserDetailsDto userDetails;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getRoleName() {
        return roleName;
    }
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
     public UserDetailsDto getUserDetails() {
        return userDetails;
    }
    public void setUserDetails(UserDetailsDto userDetails) {
        this.userDetails = userDetails;
    }
}
