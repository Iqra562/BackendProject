import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {User} from '../models/user.model.js'


const registerUser = asyncHandler(async (req,res)=>{
const {fullName, email,username,password} = req.body;
if([fullName, email,username,password].some((field)=>field?.trim() === "")){
throw new ApiError(400,"All feilds  are required")
}


const existedUser  = await User.findOne({ 
    $or : [{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
    
}

const avatarLocalPath = req.files?.avatar[0]?.path
const coverImageLocalPath = req.files?.coverImage[0]?.path

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is missing")
    
}

// const avatar =  await uploadOnCloudinary(avatarLocalPath)
// let coverImage = ''

// if(coverImageLocalPath){
//     coverImage =  await uploadOnCloudinary(coverImageLocalPath)
// }

let avatar ;
try{
avatar  = await uploadOnCloudinary(avatarLocalPath)
console.log("uploaded avatar ")
}catch(error){
console.log("Error uploading avatar",error)
throw new ApiError(500, "failed to upload avatar")
}

let coverImage ;
try{
coverImage  = await uploadOnCloudinary(coverImageLocalPath)
console.log("uploaded cover image ")
}catch(error){
console.log("Error uploading cover image",error)
throw new ApiError(500, "failed to upload cover image")
}

const user = await  User.create({
    fullName,
    avatar:avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
})
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
)

if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering a user")

}
return res
.status(201)
.json(new ApiResponse(200, createdUser, "User registered successfully"))
})

export {registerUser}