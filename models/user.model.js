
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    town: {
      type: String,
      required: true
    },
    zipcode: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    panier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Command"
    }
}, { timestamps: true });

userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10)
  }
  next()
})

userSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();

  if (update.password) {
    const hashed = await bcrypt.hash(update.password, 10);

    this.setUpdate({
      ...update,
      password: hashed
    });
  }
  next()
})

export default mongoose.model('User', userSchema);
