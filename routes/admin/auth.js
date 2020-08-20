const express = require("express");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post("/signup", async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) {
    return res.send("Email already in use");
  }

  if (password !== passwordConfirmation) {
    return res.send("Passwords must match");
  }

  // Creates a user in the repo to represent the person
  const user = await usersRepo.create({ email, password });

  // Stores the id of the user inside the users cookie
  req.session.userId = user.id;

  res.send("Account created!");
});

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("You have been logged out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate());
});

// post request
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });

  if (!user) {
    return res.send("Email not found");
  }

  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );

  if (!validPassword) {
    return res.send("Invalid password");
  }
  req.session.userId = user.id;

  res.send("You are signed in");
});

module.exports = router;
