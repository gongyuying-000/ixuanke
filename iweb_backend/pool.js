// 数据库连接池
const mysql=require("mysql");

let pool=mysql.createPool({
	host:"127.0.0.1",
	port:'3306',
	user:'root',
	password:'',
	database:"iweb",
	connectionLimit:15
})

// 输出Pool无法验证数据库是否连接成功
// 通过查询验证数据库是否连接成功
// pool.query("SELECT 1+2",(err,res)=>{
// 	if(err){throw err};
// 	console.log(res);
// } )

module.exports=pool;