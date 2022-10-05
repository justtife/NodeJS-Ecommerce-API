const tokenUser = (user) => {
  return { name: user.name.first, userID: user._id, role: user.role };
};
module.exports = tokenUser;
