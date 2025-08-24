(function() {
  function handleLoginFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Ensure only our logic controls submit behavior
    loginForm.onsubmit = null;

    // Attach a capturing listener so we can stop any previously attached bubble listeners
    loginForm.addEventListener(
      'submit',
      async function (e) {
        try {
          e.preventDefault();
          // Stop other listeners from running (bubble/capture safe-guard)
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
        } catch (_) {}

        const formData = new FormData(loginForm);
        const email = (formData.get('email') || '').trim();
        const password = formData.get('password') || '';

        // Minimal validation for login (no unnecessary password length gate)
        if (!email || !password) {
          alert('Please enter your email and password.');
          return;
        }

        // Call backend API
        let response;
        try {
          response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
        } catch (err) {
          alert('Unable to reach the server. Please ensure the backend is running.');
          return;
        }

        let data = {};
        try { data = await response.json(); } catch (_) {}

        if (!response.ok) {
          alert(data.error || 'Invalid credentials');
          return;
        }

        // Store token and user name
        if (data.token) localStorage.setItem('authToken', data.token);
        if (data.name) localStorage.setItem('userName', data.name);

        // Redirect to Request Approval page
        window.location.href = 'request-approval.html';
      },
      true // capture
    );
  }

  // Override any earlier definition and initialize on DOMContentLoaded
  window.handleLoginFormSubmission = handleLoginFormSubmission;
  document.addEventListener('DOMContentLoaded', handleLoginFormSubmission);
})();
