const express =require('express')
// 连接池
const pool=require('../pool.js')
// 创建路由
let router=express.Router()
// 导出路由
module.exports=router

/**
 * 2.1获取课程分类
接口URL
{{url}}/type
请求方式
GET
成功响应示例
 [
        {
            "tpid": 1,
            "tpname": "基础课程"
        },
        {
            "tpid": 2,
            "tpname": "核心课程"
        },
        {
            "tpid": 3,
            "tpname": "进阶课程"
        }
]
 * 
 */

router.get("/",(req,res,next)=>{
	let sql="SELECT tpid,tpname FROM type ORDER BY tpid";
	pool.query(sql,(err,result)=>{
		if(err){
			next(err)
			return;
		}
		res.send(result);
	})
	
})

