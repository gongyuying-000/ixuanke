/*Node.js+Express服务器端应用*/
const express = require('express')

let port = 9090;
let app = express()
//启动Web服务器
app.listen(port, ()=>{
	console.log('Server Listening on PORT: ' + port)
})

/*一、请求正式处理前的前置中间件*/
// 1.请求主体的处理中间件
let bodyParser= require ("body-parser");
app.use(bodyParser.json())//处理请求主体中的Json数据,保存到req.body属性中
// 2.CORS跨域处理中间件
let cors=require("cors");
app.use(cors({
//修改Access-Control-Allow-Origin头部的值,--跨域session 不允许在此处进行
	origin:['http://127.0.0.1:8080','http://localhost:8080'],
	//修改access-control-allow-credentials:true  运行客户端请求携带身份认证信息
	credentials:true
	
}));
// 3.处理客户端上传文件的中间件
// 4.服务器端session处理中间件
let session =require("express-session");
app.use(session({
	secret:"iwebsecrect123", //指定生成sid所用的加密米哟啊,秘钥生长期-随机数种子
	saveUninitialized:true,//是否保存未初始化的session数据
	resave:true//是否重新保存session 数据
}))


/*二、处理请求路由&路由器*/
// 1.处理所有以/user开头的请求的路由器
const userRouter = require('./router/user')
app.use('/user', userRouter)
// 2.处理所有以/favorite开头的请求的路由器

const loginCheckMiddleWare=require("./middleware/loginCheck.js");
app.use("/favorite",loginCheckMiddleWare);//收藏夹之前建立中间件,进行登录检查

const favoriteRouter = require('./router/favorite')
app.use('/favorite', favoriteRouter)
// 3./type
const typeRouter=require("./router/type.js");
app.use("/type",typeRouter);
//4. /course
const courseRouter=require("./router/course.js");
app.use("/course",courseRouter);
//5.teacher
const teacherRouter=require("./router/teacher.js")
app.use("/teacher",teacherRouter);
//6.cart
app.use("/cart",loginCheckMiddleWare);
const cartRouter=require("./router/cart.js");//购物车前进行登录检查
app.use("/cart",cartRouter);



/*三、请求处理完成后的后置中间件*/

//1.异常处理中间件-处理路由执行过程中所有错误
//声明自定义的错误处理中间件,错误处理中间件的第一个参数是"err"
app.use((err,req,res,next)=>{
	//处理错误
	res.status(500);
	let output={
		code:500,
		msg:"err中间件服务器崩溃了Error occured during serve running ",
		err:err
	}
	res.send(output);
	
})