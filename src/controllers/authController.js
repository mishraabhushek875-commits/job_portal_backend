import User from '../models/user.js'
import jwt from 'jsonwebtoken'

//____jwt token Banao _______//
const generateToken=(userId)=>{
  return jwt.sign(
    {id:userId},
    process.env.JWT_SECRET,
    {expiresIn:process.env.JWT_EXPIRE}
  );
};

//______REGISTER________//
// POST/API/AUTH/REGISTER

export const registerUser=async(req,res)=>{
  try{
    const {name,email,password,role}=req.body;

    //check kro email phle se register to nhi hai 
    const userExist=await User.findOne({email});

    if(userExist){
      return res.status(400).json({ success:false, message:"user already register"})
    }
//user bnao 
    const user =await User.create({name,email,password,role})
    //token generate kro
    const token=generateToken(user._id);
    //response bhejo
    res.status(201).json({
      success:true,
      token,
      user:{
        id:user._id,
        name:user.name,
          email: user.email,
        role: user.role,
      },
    });

  }catch(error){
 res.status(500).json({ message: error.message });
  }
};

// ─── LOGIN ───
// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User dhundo email se
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email  galat hai' });
    }

    // pasword check kro
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: ' password galat hai' });
    }
    
    // 3. Token banao
    const token = generateToken(user._id);

    // 4. Response bhejo
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
     } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET PROFILE ───
// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    // req.user middleware se aayega — baad mein samjhenge
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
    
