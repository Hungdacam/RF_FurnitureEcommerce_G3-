import React from 'react'
import "../css/ProfileUser.css"; 
import useAuthStore from '../stores/useAuthStore';
const ProfileUser = () => {
    const { authUser } = useAuthStore();
    if(!authUser) {
        return <div>Vui lòng đăng nhập để xem thông tin người dùng.</div>;
    }
  return (
    <div className='profile-container'>

    <h1>Thông tin người dùng</h1>
    <div className="user-info">
      
      <p><strong>Họ tên:</strong> {authUser.userDetails?.firstName} {authUser.userDetails?.lastName}</p>
      <p><strong>Vai trò:</strong> {authUser?.roles?.includes('ROLE_ADMIN') ? "NGƯỜI QUẢN LÍ" : "KHÁCH HÀNG"}</p>
      <p><strong>Email:</strong> {authUser.userDetails?.email}</p>
      <p><strong>Số điện thoại:</strong> {authUser.userDetails?.phoneNumber}</p>
      <p><strong>Địa chỉ:</strong> {authUser.userDetails?.street}</p>
      
    </div>
    </div>
  )
}

export default ProfileUser