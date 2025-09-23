
const PasswordResetEmail = ({ resetLink }) => {
  return (
    <div>
      <h1>Reset Your Password</h1>
      <p>You have requested to reset your password. Please click the link below to set a new password:</p>
      <a href={resetLink} style={{ 
        backgroundColor: '#4a90e2', 
        color: 'white', 
        padding: '10px 20px', 
        textDecoration: 'none', 
        borderRadius: '5px',
        display: 'inline-block',
        margin: '20px 0'
      }}>
        Reset Password
      </a>
      <p>If you didn't request this password reset, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>Thank you,<br />The NayaBato Team</p>
    </div>
  );
};

export default PasswordResetEmail;
