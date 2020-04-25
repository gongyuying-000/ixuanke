const express =require('express')
// 连接池
const pool=require('../pool.js')
// 创建路由
let router=express.Router()
// 导出路由
module.exports=router;

/**
 * 3.1添加购物车
接口URL
{{url}}/cart/add
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
uid	2	必需	-用户id，从服务器端session中获取的用户编号
cid	10	必填	-课程id
count	1	非必填	购买数量(默认为1)
成功响应示例
{
    "code": 200,
    "msg": "success"
}
 * 
 * 
 */
router.post("/add",(req,res,next)=>{
	let uid=req.body.uid;
	let cid=req.body.cid;
	let count=req.body.count;
	let sql="INSERT INTO cart VALUES(NULL,uid,cid,count)";
	pool.query(sql,[uid,cid,count],(result,err)=>{
		if(err){
			next(err);
			return;
		}
		console.log("查询结果是",result);
	})
})



/**

 * 3.2查询购物车
接口URL
{{url}}/cart/list
请求参数
参数	示例值	必填	参数描述
uid	2	必需	-用户id，从服务器端session中读取的用户编号
成功响应示例
 [
        {
            "ctid": 1,
            "courseid": 10,
            "count": 1,
            "title": "10HTML零基础入门",
            "pic": "img-course\/03.png",
            "price": 399
        }
]
 * 
 * 
 */


/**
 * 
 * 3.3更新购物车
接口URL
{{url}}/cart/update
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
ctid	3	必填	-购物车中的课程id
count	1	必填	-购买数量
uid	2	必需	-用户id，从服务器端session中读取的用户编号
成功响应示例
{
    "code": 200,
    "msg": "success"
}
失败响应示例
{
    "code": 410,
    "msg": "failed"
}
 * 
 * 
 */


/**
 * 
 * 3.4清空购物车
接口URL
{{url}}/cart/clear
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
uid	2	必需	-用户id，从服务器端session读取的用户编号
成功响应示例
{
    "code": 200,
    "msg": "success"
}
失败响应示例
{
    "code":411,
    "msg":'uid required'
}

 * 
 */


/**
 * 
 * 3.5删除购物车商品
接口URL
{{url}}/cart/delete
请求方式
POST
请求 Content-Type
application/json
请求Body参数
参数	示例值	必填	参数描述
ctid	4	必填	-购物车中的课程id
uid	2	必需	用户id，从服务器端session中读取的用户编号
cid	8	必填	课程id
成功响应示例
{
    "code": 200,
    "msg": "success"
}
失败响应示例
{
    "code": 412,
    "msg": "failed"
}

 * 
 */