import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Token header mein hai?
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2. Token mila nahi toh reject karo
    if (!token) {
      return res.status(401).json({ message: 'Login karo pehle' });
    }

    // 3. Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. User dhundo aur req mein attach karo
    req.user = await User.findById(decoded.id).select('-password');

    next(); // Aage badho

  } catch (error) {
    res.status(401).json({ message: 'Token valid nahi hai' });
  }
};

// ─── Role Check Middleware ───
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `${req.user.role} ko yeh karne ki permission nahi`
      });
    }
    next();
  };
};

/*### Middleware Kaise Kaam Karta Hai?
```
Request aaya — GET /api/jobs/post
      ↓
protect middleware chala
      ↓
Token hai? → Verify kiya → User mila?
      ↓
req.user = user  ← controller mein available hoga
      ↓
next() → Controller chala
      ↓
Response gaya */

