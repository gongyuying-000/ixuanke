// 路由地址中,所有以/user开头的请求
const express = require('express')
const pool = require('../pool')
let router = express.Router()
// 注意这里必须是module.exports,只修改exports是没用的>
module.exports = router



/**
 *1.3检测用户名是否存在
 * 接口URL
{{url}}/user/check_uname
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
uname	zhangsan	必填	-用户名
成功响应示例
{
    "code": 200,
    "msg": "exists"
}
失败响应示例
{
    "code": 401,
    "msg": "non-exists"
}
 */
// 在路由处理过程中使用错误处理中间件的步骤,不能使用throw err;
router.get("/check_uname", (req, res, next) => {
	// 不同浏览器请求小时是不同的 , 因此不能用 浏览器来测试是否请求成功
	// 后台数据API接口测试专业工具-Postman
	//1.读取客户端提交的请求数据
	let uname = req.query.uname;
	if (!uname) {//如果客户端未提交uname
		let output = {
			code: 400,
			msg: "uname required"
		}
		res.send(output);
		return;
	}
	//2.执行数据库操作
	//对于SELECT语句,result永远是个数组
	pool.query("SELECT uid FROM user WHERE uname =? ", [uname], (err, result) => {
		// 开发测试时可以用throw err,但是项目推出或者上传到新浪云,不能抛出错误
		if (err) {
			// throw err
			//使用express异常处理中间件,应该放在路由处理函数之后-后置中间件,错误处理中间件在index.js最后
			//next()的参数为err时.就找下一个可以处理err的中间件
			next(err);//不要抛出错误,把错误交给下一个的"错误处理中间件";
			return;//next(err)中有res.send(),返回只能由一个res.send,因此这里要 return;
		};
		// console.log("数据库的检查结果是",result);
		if (result.length == 0) {
			let output = {
				code: 401,
				msg: "non-exists"
			}
			res.send(output);			
		} else {
			let output = {
				code: 200,
				msg: "exists"
			}
			res.send(output);	
		}

		// console.log(result);
		
		
	})
	//3.向客户端输出响应消息
});


/**  文档注释
 * 1.1	用户注册
接口URL
{{url}}/user/register
请求方式
POST
请求 Content-Type
application/json     
 注意:当前的企业中使用XHR发起请求数据,数据格式一般不再采用表单时代常用的  application/x-www-form-urlencoded k=v&v=k

请求Body参数
参数	示例值	必填	参数描述
uname	zhangsan	必填	-用户名
upwd	123456	必填	-密码
phone	13333333333	必填	-手机号
captcha	ad31	必填	-验证码
成功响应示例
{
    "code": 200,
    "msg": "register success",
    "uid": 7
}
 */
// 注意:这里参数顺序req,res 不能乱,别忘了参数next
router.post("/register", (req, res, next) => {
	//这里使用body中间件,在Index.js中配置.
	let uname = req.body.uname;
	if (!uname) {
		let output = {
			code: 401,
			msg: "uname required"
		}
		res.send(output);
		return;
	}
	let upwd = req.body.upwd;
	if (!upwd) {
		let output = {
			code: 402,
			msg: "upwd required"
		}
		res.send(output);
		return;
	};
	let phone = req.body.phone;
	if (!phone) {
		let output = {
			code: 403,
			msg: "phone required"
		}
		res.send(output);
		return;
	}
	let captcha=req.body.captcha;
	if(!captcha){
		let output={
			code:404,
			msg:"captcha required"
		}
		res.send(output);
		return;
	// 如果相等,继续比较,如果不相等直接报验证码错误,不再向下比较
	}else if(req.session.registerCaptcha!=captcha.toLowerCase()){
		 res.send({
			 code:405,
			 msg:"captcha errror "
		 });
		 return;
	 }
	// console.log("三个值",uname,upwd,phone);
	//2.执行数据库插入操作
	// 只要用户名或者电话其中一个被占用,就不能再用了
	var sql1 = "SELECT uid FROM user WHERE uname=? OR phone=?";

	//我竟然把pool写成 了 poo1...找了20分钟
	pool.query(sql1, [uname, phone], (err, result) => {
		if (err) {
			next(err);
			return;
		}
		// console.log(result);
		if (result.length > 0) {
			let output = {
				code: 400,
				msg: "uname or phone already taken"
			};
			res.send(output);
			return;
		} else {
			//这里的sql2语句中,在表名后面没哟指定列.那么,value后 的值就和数据库中的值一样
			//如果在表名后面指定列名时,列名可以与数据库不一致(upwd,phone,uname)
			var sql2 = "INSERT INTO user(uname,upwd,phone)  VALUES(?,?,?)"
			pool.query(sql2, [uname, upwd, phone], (err, result) => {
				if (err) {
					next(err);
					return;
				}
				if (result.affectedRows > 0) {
					let output = {
						code: 200,
						msg: "register succ",
						uid: result.insertId
					}
					res.send(output);
				}

			})
		}

	});

})


/**
 * 1.2	用户登录
接口URL
{{url}}/user/login
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
uname	lisi	必填	-用户名
upwd	abc123	必填	-密码
成功响应示例
{
    "code": 200,
    "msg": "login success",
    "sessionUser": {
        "uid": 5,
        "uname": "ranran@tedu.cn",
        "nickname": "然然"    
    }
}

 */
router.post("/login", (req, res, next) => {
	let uname = req.body.uname;
	if (!uname) {
		let output = {
			code: 401,
			msg: "uname required"
		}
		res.send(output);
		return;
	}
	let upwd = req.body.upwd;
	if (!upwd) {
		let output = {
			code: 402,
			msg: "upwd required"
		}
		res.send(output);
		return;
	}

	let sql = "SELECT uid,uname,nickname FROM user WHERE uname=? AND upwd=?";
	pool.query(sql, [uname, upwd], (err, result) => {
		if (err) {
			next(err);
			return;
		}
		// console.log("result", result);
		if (result.length > 0) {
			let output = {
				code: 200,
				msg: "success!!",
				userInfo: result[0]
			}
			res.send(output);
			//!!!登录成功以后， 在当前客户端保存在服务器上的session 空间内存储自己的数据
			//	console.log("SESSION",req.session)
			//把这个数据也顺带给服务器带过去
			req.session.userInfo =result[0];
			req.session.save();//手动保存session数据的修改-登录状态
			
		} else {
			let output = {
				code: 400,
				msg: "uname or upwd error"
				// 返回客户信息
			}
			res.send(output);
			
		}
	})
})

/**
 * 1.4检测手机号是否存在
 * 接口URL
{{url}}/user/check_phone
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
phone	13333333333	必填	-手机号
成功响应示例
{
    "code": 200,
    "msg": "exists"
}
失败响应示例
{
    "code": 402,
    "msg": "non-exists"
}
 * 
 * 
 */
router.get("/check_phone", (req, res, next) => {
	// 不同浏览器请求小时是不同的 , 因此不能用 浏览器来测试是否请求成功
	// 后台数据API接口测试专业工具-Postman
	//1.读取客户端提交的请求数据
	let phone = req.query.phone;
	if (!phone) {//如果客户端未提交uname
		let output = {
			code: 400,
			msg: "phonerequired"
		}
		res.send(output);
		return;
	}
	//2.执行数据库操作
	//对于SELECT语句,result永远是个数组
	pool.query("SELECT uid FROM user WHERE phone =? ", [phone], (err, result) => {
		// 开发测试时可以用throw err,但是项目推出或者上传到新浪云,不能抛出错误
		if (err) {
			// throw err
			//使用express异常处理中间件,应该放在路由处理函数之后-后置中间件,错误处理中间件在index.js最后
			//next()的参数为err时.就找下一个可以处理err的中间件
			next(err);//不要抛出错误,把错误交给下一个的"错误处理中间件";
			return;//next(err)中有res.send(),返回只能由一个res.send,因此这里要 return;
		};
		if (result.length === 0) {
			let output = {
				code: 401,
				msg: "non-exists"
			}
			res.send(output);
		} else {
			let output = {
				code: 200,
				msg: "exists"
			}
			//3.向客户端输出响应消息
			res.send(output);
		}

		// console.log(result);
		
	})
	
});




/**
 * 1.5注册用验证码
 * 接口URL
 * {{url}}/user/register/captcha
 * 请求方式
 * GET
 * 请求参数
 * 无
 * 成功响应示例
 *  <svg>...</svg>
 * 
 * 同时在服务器端session中保存 captcha.register 字段，值为显示给客户端的随机验证码内容。
 */
const svgCaptcha=require("svg-captcha");
// const svgCaptcha=require('svg-captcha');
router.get('/register/captcha',(req,res,next)=>{
 // 使用第三方模块生成验证码
 // let captcha=svgCaptcha.create();
 let option={
  size:5,    //验证码中字符的个数
  ignoreChars:'0O1li', //避免随机出现的字符
  // charPreset:'1234567890',//预设的字符库，默认随机字母
  width:120,  //图片的宽度
  height:38   ,//图片的高度
  fontSize:45,  //验证码字体大小
  noise:2, //干扰线的数量
  color:true,  //验证码的字符颜色是否采用彩色，true：彩色
  background:'#eef' //验证码图片背景颜色
 }
 let captcha=svgCaptcha.create(option);
 // console.log(captcha);
 // res.send(captcha); //{text:'随机文本',data:'SVG图片内容'}
 // 1.服务器端会话中存储此时生成的验证码
 req.session.registerCaptcha=captcha.text.toLowerCase();  //保存小写形式的验证码字符串
 // 2.向客户端输出此验证码图片的内容
 res.type('svg');  //修改Content-Type:image/svg+xml
 res.send(captcha.data);
 
})






/**
 * 
 * 1.6上传用户头像
接口URL
{{url}}/user/upload/avatar
请求方式
POST
请求 Content-Type
multipart/form-data
请求主体数据
参数	示例值	必填	参数描述
avatar		必填	-二进制图片文件数据
成功响应示例
{
    "code": 200,
    "msg": "upload succ",
    "fileName": "/images/avatar/158632317406812345.jpg"
}

 * 
 * 
 */

//使用第三方中间件处理客户端上传的文件/文本域
const multer=require("multer");
//使用fs模块转存文件
const fs=require("fs");
let upload=multer({
	//destination客户端上传的文件临时存储在哪个目录
	//存储到temp中,路径随机
	dest:"./temp/",
})
router.post("/upload/avatar",upload.single('avatar'),(req,res,next)=>{
	console.log('REQ.BODY',req.body);//客户端提交的文本域
	console.log('REQ.FILE',req.file);//客户端提交的文件域
	//在req.file属性中已经保存了客户端提交上来的文件信息-保存在临时目录下
	//需要将临时目录下的且没哟后缀的文件转存到另一个有实际意义的目录下
	//fs.rename(oldname,newname,)
	let oldName=req.file.path;
	let newName= generateNewFilePath(req.file.originalname);
	fs.rename(oldName,newName,(err)=>{
		if(err){
			next(err);
			return;
		}
		let output={
			code:200,
			msg:"upload succ",
			fileName:newName
		}
		res.send(output);	
	})
})

//生成一个新的随机文件名路径
function generateNewFilePath(originalFileName){
	//生成的文件名形如:  ./images/avatar/时间戳+五位随机数+源文件后缀名;
	let path='./images/avatar/';   //目录名称
	path += Date.now();
	// 随机数10000-99999
	path+=Math.floor(Math.random()*90000+10000); //+5位随机数
	let lastDoIndex=originalFileName.lastIndexOf('.') //原文件名中最后一个点的下标
	let extName=originalFileName.substring(lastDoIndex); //源文件中扩展名部分
	path+=extName;
	return path;
}

