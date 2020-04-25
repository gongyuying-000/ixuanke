const express =require('express')
// 连接池
const pool=require('../pool.js')
// 创建路由
let router=express.Router()
// 导出路由
module.exports=router;

router.get("/list",(req,res,next)=>{
	var sql="SELECT tid,tname,maincourse,experience,style FROM teacher ";
	pool.query(sql,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		let output={
			state:200,
			msg:result
		}
		res.send(output);
	})
})
