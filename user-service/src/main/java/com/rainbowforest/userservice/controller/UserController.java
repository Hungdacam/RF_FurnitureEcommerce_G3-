package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.dto.UserDetailsDto;
import com.rainbowforest.userservice.dto.UserDto;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.http.header.HeaderGenerator;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private HeaderGenerator headerGenerator;
    
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
	@GetMapping (value = "/users/{id}")
	public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
		User user = userService.getUserById(id);
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

	@PostMapping (value = "/users")
	public ResponseEntity<User> addUser(@RequestBody User user, HttpServletRequest request){
		if(user != null)
			try {
				userService.saveUser(user);
				return new ResponseEntity<User>(
						user,
						headerGenerator.getHeadersForSuccessPostMethod(request, user.getId()),
						HttpStatus.CREATED);
			}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<User>(HttpStatus.INTERNAL_SERVER_ERROR);
			}
		return new ResponseEntity<User>(HttpStatus.BAD_REQUEST);
	}
}
