import authService from "./Auth.services";
const register = async (
  req: { body: { userName: any; email: any; password: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { message: string }): any; new (): any };
    };
  },
  next: (arg0: unknown) => void,
) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    await authService.registerUser(userName, email, password);
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: { body: { email: any; password: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: {
          message: string;
          token?: any;
          userId?: {
            id: string;
            email: string;
            userName: string;
            password: string;
          };
        }): any;
        new (): any;
      };
    };
  },
  next: (arg0: unknown) => void,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const { token } = await authService.loginUser(email, password);
    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

const profile = async (
  req: { user: { userId: string } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: {
          message: string;
          profile: {
            id: string;
            email: string;
            userName: string;
            children: {
              id: string;
              name: string;
              userId: string;
              dateOfBirth: Date;
              gender: string;
            }[];
          };
        }): any;
        new (): any;
      };
    };
  },
  next: (arg0: unknown) => void,
) => {
  try {
    const userProfile = await authService.getUserProfile(req.user.userId);
    return res.status(200).json({
      message: "User profile retrieved successfully",
      profile: userProfile,
    });
  } catch (error) {
    next(error);
  }
};

const authController = { register, login, profile };
export default authController;
