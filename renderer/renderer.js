const form = document.getElementById('loginForm');
const errorText = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await window.api.login({ username, password }); // Fixed: Corrected `window.Electron` to `window.electron`

    if (response.success) {
      switch (response.role) {
        case 'employee':
          window.location = 'employee/index.html';
          break;
        case 'admin':
          window.location = 'admin/index.html';
          break;
        case 'it':
          window.location = 'it/index.html';
          break;
        default:
          console.error('Unexpected role:', response.role);
      }
    } else {
      errorText.textContent = response.message;
    }
  } catch (error) {
    console.error('Error during login:', error);
    console.log('window.api:', window.api);
    errorText.textContent = 'An error occurred. Please try again.';
  }
});