// Require admin login
exports.requireAdminLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    // Optionally clear any lingering session data related to the admin
    req.session.admin = null; // Or use req.session.destroy() if you want to destroy the entire session
    res.redirect("/admin/login");
  }
};
