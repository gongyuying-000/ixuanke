// 登陆检查中间件,如果客户端尚未登陆(即 req.session.userInfo不存在),则输出一个提示响应消息,并结束请求处理过程.否则,在req中添加一个新的属性,req.uid 供后续的请求处理路由来使用

module.exports=(req,res,next)=>{
	//检查session中间件是否存在
	if(!req.session){
		let output={
			code:599,
			msg:"Server Err:session middleware required"
		}
		res.send(output);
		return;
	}
	console.log("req.session.userInfo",req.session.uerInfo);
	//检查用户 是否登录
	if(!req.session.userInfo){
		let output={
			code:499,
			msg:"login required"
		}
		res.send(output);
		return;
	}
	//如果客户已经登陆,那么
	req.uid=req.session.userInfo.uid;
	next();//中间件检查之后放行,继续执行后续的中间件或者路由
}