document.addEventListener("DOMContentLoaded", async () => {
  const userTablesContainer = document.getElementById("user-tables");
  const userModal = new bootstrap.Modal(document.getElementById("userModal")); // Bootstrap modal instance
  const userForm = document.getElementById("userForm");
  const addUserBtn = document.getElementById("addUserBtn");

  let editingUserId = null;

  // Load users from the database
  async function loadUsers() {
    const users = await window.api.getAllUsers();
    
    const roles = ["employee", "admin", "it"];
    userTablesContainer.innerHTML = ""; // Clear the container
  
    roles.forEach((role, index) => {
      const filteredUsers = users.filter((u) => u.role === role);
  
      // Create a button to toggle the table
      const toggleButton = document.createElement("button");
      toggleButton.classList.add("btn", "btn", "mt-3", "w-100", `${role.toLocaleLowerCase()}Btn`);
      toggleButton.setAttribute("data-bs-toggle", "collapse");
      toggleButton.setAttribute("data-bs-target", `#table-${index}`);
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.setAttribute("aria-controls", `table-${index}`);
      toggleButton.textContent = `${role.toUpperCase()} (${filteredUsers.length})`;
  
      // Create a collapsible container for the table
      const collapseDiv = document.createElement("div");
      collapseDiv.classList.add("collapse", "mt-2");
      collapseDiv.id = `table-${index}`;
  
      // Create the table
      const table = document.createElement("table");
      table.classList.add("table", "table-striped", "table-bordered", "table-hover", "table-sm", "mb-5");
  
      table.innerHTML = `
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody >
          ${filteredUsers
            .map(
              (user) => `
            <tr>
              <td>${user.id}</td>
              <td>${user.username}</td>
              <td>${user.password}</td>
              <td class="d-flex justify-content-around">
                <button class="btn btn-warning btn-sm" onclick="editUser(${user.id}, '${user.username}', '${user.password}', '${user.role}')">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">Delete</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      `;
  
      // Append the table to the collapsible container
      collapseDiv.appendChild(table);
  
      // Append the toggle button and collapsible container to the main container
      userTablesContainer.appendChild(toggleButton);
      userTablesContainer.appendChild(collapseDiv);
    });
  }

  // Show modal for new user
  addUserBtn.addEventListener("click", () => {
    editingUserId = null;
    userForm.reset();
    userModal.show(); // Show the modal
  });

  // Handle form submit (Add or Edit)
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      role: document.getElementById("role").value,
    };

    if (editingUserId) {
      await window.api.updateUser({ ...userData, id: editingUserId });
    } else {
      await window.api.addUser(userData);
    }

    userModal.hide(); // Hide the modal
    loadUsers();
  });

  window.editUser = (id, username, password, role) => {
    editingUserId = id;
    document.getElementById("username").value = username;
    document.getElementById("password").value = password;
    document.getElementById("role").value = role;
    userModal.show(); // Show the modal
  };

  window.deleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await window.api.deleteUser(id);
      loadUsers();
    }
  };

  // Initial load
  loadUsers();
});

function goBack(){
  window.location.href = "index.html";
}