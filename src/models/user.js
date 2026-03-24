import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema= new mongoose.Schema({


name:{
   type: String,
      required: [true, 'Naam zaroori hai'],
      trim: true,

},
email:{
  type:String,
  required:[true,'Email zarori hai'],
  unique:true,
  lowercase:true,
  trim:true,

},
password:{
type: String,
      required: [true, 'Password zaroori hai'],
      minlength: [6, 'Password kam se kam 6 characters ka hona chahiye'],
},
role:{
 type: String,
      enum: ['jobseeker', 'recruiter'],
      default: 'jobseeker',
},
},
{

  timestamps:true,//creatAt aur updateAt automatic ban jayega
}
);

//password a=save hone se phle encrypt kro --
userSchema.pre('save',async function(){//agar pasword change nhi hua hai to skip krdo
  if(!this.isModified('password'))
     return ;

  //password ko hash karo 
  const salt=await bcrypt.genSalt(10);

  this.password=await bcrypt.hash(this.password,salt );

}
);

// ─── Login Mein Password Check Karne Ka Method ───
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);//this keyword bhar ke recent user or data ko refer krdete hai
};

const User = mongoose.model('User', userSchema);

export default User;
