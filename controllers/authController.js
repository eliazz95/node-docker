const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res) => {
    const {username, password} = req.body
    const hashedPassword = await bcrypt.hash(password, 12)
    try {
        const newUser = await User.create({
            username,
            password: hashedPassword
        })
        req.session.user = newUser
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail'
        })
    }
}

exports.login = async (req, res) => {
    const {username, password} = req.body

    try {
        const user = await User.findOne({username})

        if(!user) {
            res.status(404).json({
                status: 'fail',
                message: 'User not found'
            })
        }

        const isCorrect = await bcrypt.compare(password, user.password)
        req.session.user = user
        if(isCorrect){
            res.status(200).json({
                status: 'success'
            })
        } else {
            res.status(400).json({
                status: 'fail',
                message: 'Incorrect username or password'
            })
        }
    } catch (error) {
        res.status(400).json({
            status: 'fail'
        })
    }
}