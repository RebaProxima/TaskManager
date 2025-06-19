import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h1 className="app-title">🚀 Create Your Account</h1>
        <p className="description">
          Since this is your first time, we wish you all the best.
          <br />
          <strong>Be disciplined</strong> — trust me, you won’t regret it.
          <br />
          Trying is always better than not trying. Failing after you’ve tried is better than failing by doing nothing.
          <br />
          You have a bright future ahead. The real question is: <em>Are you ready to work for it?</em>
        </p>

        <form onSubmit={handleSignUp} className="signup-form">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign Up</button>
          {error && <p className="error-message">{error}</p>}
        </form>

        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
