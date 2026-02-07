
const checkRole = ( requiredRole) => {
    return (req , res , next) => {
        console.log(req.user);
    const {role} = req.user;
   
    
    if(role !== requiredRole) {
        return res.status(401).json({
            message: "Forbidden request!!"
        })
    }
    next()
}
}

export {checkRole};