const { usersModel } = require("../models");
const { jwt, sign } = require("jsonwebtoken")
const { SECRET } = require("../config/config");

const signUp = async (req, res) => {
    try {
        const {
            name,
            lastname,
            nickname,
            email,
            password,
            type,
            posts,
            projects,
            favourites,
            status,
            avatar
        } = req.body

        const findUser = await usersModel.find({ email })
        if (!findUser.length) {    
            const newUser = {
                name,
                lastname,
                nickname,
                email,
                password: await usersModel.encryptPassword(password),
                type,
                status,
                avatar : "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"

            }

            console.log(newUser)
            const addUser = await usersModel.create(newUser)
            const token = sign({ id: addUser._id }, `${SECRET}`, { expiresIn: 86400 })
            const userId = addUser._id
            const userType = addUser.type
            const userAvatar = addUser.avatar
            const userMail = addUser.email
            const userName = addUser.name
            const favourites = addUser.favourites
            const projects = addUser.projects
            const posts = addUser.posts 
           res.send({token, userId, userType, userAvatar, userMail, userName,favourites,projects,posts})

        }else{
            return res.status(400).send({error:"User already registered"})
        }
    } catch (error) {
        console.log(error)
    }
}




const logIn = async (req, res) => {
    const{email, password}= req.body
    try {
       const findUser = await usersModel.findOne({email})
       
       if(!findUser)return res.status(400).send({errEmail: "Couldn´t find the user"})
       
       const matches = await usersModel.comparePassword(password, findUser.password)

       if(!matches) return res.status(400).send({errPassword: "Invalid password"})
       
       const token = sign({ id: findUser._id }, `${SECRET}`, { expiresIn: 86400 })
        const userId = findUser._id
        const userType = findUser.type
        const userAvatar = "https://cdn-icons-png.flaticon.com/512/1946/1946429.png"
        const userMail = findUser.email
        const userName = findUser.name
        const favourites = findUser.favourites
        const projects = findUser.projects
        const posts = findUser.posts 

       res.status(200).json({token, userId, userType, userAvatar, userMail, userName,favourites,projects,posts})

    } catch (err) {
        res.status(400).json({err: err.message})
    }
}


const googleLogin = async(req,res)=>{
    const {email, avatar, name, lastname}= req.body
    const findUser = await usersModel.findOne({email})
   
    try {
        if(!findUser){
            const newUser = {
                name: name,
                lastname: lastname,
                email: email,
                avatar : avatar,
                type :"user",
                nickname: email
            }
            const addUser = await usersModel.create(newUser)
            const token = sign({ id: addUser._id }, `${SECRET}`, { expiresIn: 86400 })
            
            const userId = addUser._id
            const userType = addUser.type
            const userAvatar = addUser.avatar
            const userMail = addUser.email
            const userName = addUser.name
            
           res.status(200).send({token, userId, userType, userAvatar, userMail, userName})
        }else{
 
             const token = sign({ id: findUser._id }, `${SECRET}`, { expiresIn: 86400 })
             const userId = findUser._id
             const userType = findUser.type
             const userAvatar = avatar
             const userMail = findUser.email
             const userName = findUser.name
            const userLastname = findUser.lastname
             res.status(200).send({token, userId, userType, userAvatar, userMail, userName, userLastname})
        }
    } catch (error) {
        console.log(error)
    }
}


module.exports = { signUp, logIn, googleLogin }