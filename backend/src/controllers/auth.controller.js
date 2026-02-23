const prisma = require("../provider/database/client");
const bcrypt = require("bcryptjs");
const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  // ปรับการรับค่าให้ตรงกับ Schema (firstName, lastName)
  const { firstName, lastName, email, password, tel, role } = req.body;

  const allowedRoles = ["ADMIN", "USER"];

  const userRole = allowedRoles.includes(role) ? role : "USER";



  try {
    if (!password || password.length < 4) {
      return res.status(400).json({
        error:
          "Password must be at least 4 characters long and contain both letters and numbers",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        tel,
        role: userRole,
      },
    });

    res.json({
      status: "success",
      message: "Register successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tel: user.tel,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = authService.generateToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      status: "success",
      message: "Login successfully",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        tel: user.tel,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};