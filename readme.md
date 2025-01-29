## Screenshots


<img width="1470" alt="Screenshot 2025-01-28 at 2 51 58 AM" src="https://github.com/user-attachments/assets/3e432eba-7b32-4c59-b2c7-ca23d22cec26" />



  // Logout
  logout: async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Ensure this is false in development if testing locally
    sameSite: "None", // Important for cross-origin requests
  });
