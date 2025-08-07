import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = ({ user = {} }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user.username || 'Not set',
    email: user.email || 'Not set',
    phone: 'Not set',
    address: 'Not set'
  });
  const [editForm, setEditForm] = useState({ ...profile });
  useEffect(() => {
    // Initialize profile with user data from login
    const userProfile = {
      name: user.username || 'Not set',
      email: user.email || 'Not set',
      phone: user.phone || 'Not set',
      address: user.address || 'Not set'
    };
    setProfile(userProfile);
    setEditForm(userProfile);
  }, [user]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ ...profile });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e, overrideData = null) => {
    if (e) e.preventDefault();
    
    try {
      const dataToUpdate = overrideData || {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || '',
        address: editForm.address || ''
      };

      const response = await fetch(`http://localhost:5000/api/profile/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dataToUpdate)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      
      // Update both profile and localStorage
      const updatedUser = {
        ...user,
        username: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        address: updatedProfile.address
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Profile</h1>
        <div className="profile-content">

          
          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="profile-actions">
                <button type="submit" className="save-button">
                  <i className="fas fa-save"></i> Save Changes
                </button>
                <button type="button" className="cancel-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-details">
                <div className="detail-row">
                  <div className="detail-label">Name</div>
                  <div className="detail-value">{profile.name}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{profile.email}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{profile.phone || 'Not set'}</div>
                </div>
                
                <div className="detail-row">
                  <div className="detail-label">Address</div>
                  <div className="detail-value">{profile.address}</div>
                </div>
              </div>
              
              <div className="profile-actions">
                <button className="edit-button" onClick={handleEditProfile}>
                  <i className="fas fa-edit"></i> Edit Profile
                </button>
                <button className="back-button" onClick={() => navigate('/')}>
                  ← Back to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
