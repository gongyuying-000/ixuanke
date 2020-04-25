const express =require('express')
// 连接池
const pool=require('../pool.js')
// 创建路由
let router=express.Router()
// 导出路由
module.exports=router


/*
1.7 添加收藏
接口URL
{{url}}/favorite/add
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数 示例值 必填 参数描述
uid 3 必需 -用户id 从服务器端session中读取登录的用户编号
cid 7 必填 -课程id
成功响应示例
{
    "code": 200,
    "msg": "success",
    "fid": 2
}
失败响应示例
{
    "code": 403,
    "msg": "failed"
}

*/




router.post('/add',(req,res,next)=>{
		console.log("req.session.userInfo",req.session.uerInfo);
	// console.log("进入了add");
 // console.log(req.session)
 // 1.读取用户端提交的数据
 //此处使用前置中间件loginCheckMiddleware检查过是否登录,
 //并且赋值let req.uid=req.session.userInfo.uid;
 //创建一个登陆检查的中间件, 查看用户是否登录,多次用到,避免重复
 // if(!req.session.userInfo){  //当前用户没有登陆
 //  let output={
 //   code:499,
 //   msg:'login requlired'
 //  }
 //  res.send(output)
 //  return
 // }
 // let uid=req.session.userInfo.uid;
 let uid=req.uid;
 console.log("uid是",uid);
 let cid=req.body.cid;  //客户端提交的课程编号
 if(!cid){
  let output={
   code:400,
   msg:'cid required'
  }
  res.send(output)
  return
 }

 // console.log("cid",cid);
 // let fTime=new Date().getTime()
 let fTime=Date.now()  //当前系统时间戳
 // 2.执行数据库插入操作
 let sql1='SELECT fid FROM favorite WHERE userId=? AND courseId=?'
 pool.query(sql1,[uid,cid],(err,result)=>{
  if(err){
   next(err)
   return
  }
  // 判断:如果查到了数据就不在进行添加 否则添加收藏
  if(result.length==0){ // 执行添加操作
   let sql2='INSERT INTO favorite VALUES(NULL,?,?,?)'
   pool.query(sql2,[uid,cid,fTime],(err,result)=>{
    if(err){
     next(err)
     return
    }
    let output={
     code:200,
     msg:'add success',
     fid:result.insertId  //INSERT语句生成的自增编号 
    }
    res.send(output)
   })
  }else{   //查到了数据 已经添加过了
   // 更新收藏物品的时间
   let sql3='UPDATE favorite SET fTime=? WHERE fid=?'
   pool.query(sql3,[fTime,result[0].fid],(err,result)=>{
    if(err){
     next(err)
     return
    }
    let output={
     code:201,
     msg:'favorite update success'
    }
    res.send(output)
   })
  }
 })
})


/**
 * 1.8收藏列表
接口URL
{{url}}/favorite/list
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
uid	4	必需	-用户id从session中读取登录的用户编号即可
成功响应示例
 [
        {
            "title": "07HTML零基础入门",
            "pic": "img-course\/06.png",
            "price": 399,
            "courseId": 7,
            "fid": 2,
            "fTime": 1578015036
        },
       ....
]
失败响应示例
[  ]
 * 
 */
router.get("/list",(req,res,next)=>{
	//1.读取客户端数据
	let uid=req.uid;
	//2.执行数据库查询操作 - 跨表查询语句
	let sql="SELECT title,pic,price,courseId,fTime FROM favorite AS f,course AS c WHERE c.cid=f.courseId AND f.userId=?";
	pool.query(sql,uid,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		res.send(result);
		// if(result.length>0){
			
		// }
	})
	
})