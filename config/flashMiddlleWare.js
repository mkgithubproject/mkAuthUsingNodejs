module.exports.setFlash=function(req,res,next){
    // for taking flashes to res object
    res.locals.flash={
        'success':req.flash('success'),
        'error':req.flash('error')
    }
    next();
}
