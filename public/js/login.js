// Login page functionality
// Check for URL parameters and auto-fill form
const urlParams = new URLSearchParams(window.location.search);
const usernameParam = urlParams.get('username');
const passwordParam = urlParams.get('password');

// Auto-fill form if parameters are present
if (usernameParam) {
  document.getElementById('login-username').value = usernameParam;
}
if (passwordParam) {
  document.getElementById('login-password').value = passwordParam;
}

// Auto-submit if both parameters are present
if (usernameParam && passwordParam) {
  console.log('URL parameters detected, auto-submitting login form');
  setTimeout(() => {
    document.getElementById('login-form').dispatchEvent(new Event('submit'));
  }, 500); // Small delay to ensure page is fully loaded
}

// Form submission handler
document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const errorDiv = document.getElementById('login-error');
  errorDiv.textContent = ''; // Clear previous errors
  
  const payload = {
    username: document.getElementById('login-username').value.trim(),
    password: document.getElementById('login-password').value
  };
  
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json().catch(()=>({}));
    
    if (res.ok) {
      if (data.newAccount) {
        alert('You are now logged in.');
      }
      location.href = "/storage.html";
    } else {
      errorDiv.textContent = data.error || 'Login failed';
    }
  } catch (error) {
    console.error('Login request failed:', error);
    errorDiv.textContent = 'Network error. Please try again.';
  }
};