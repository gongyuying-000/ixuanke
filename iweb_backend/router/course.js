const express =require('express')
// 连接池
const pool=require('../pool.js')
// 创建路由
let router=express.Router()
// 导出路由
module.exports=router




/**
 * 2.2获取课程列表
接口URL
{{url}}/course/list?pageNum=1&typeId=3
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
pageNum	1	可选	-当前页码
typeId	3	可选	-课程分类id
成功响应示例
{
    "pageNum": "1",
    "pageSize": 3,
    "pageCount": 2,
    "totalCount": 4,
    "list": [
        {
            "cid": 12,
            "typeId": 3,
            "title": "12HTML零基础入门",
            "teacherId": 4,
            "cLength": "1天",
            "startTime": "每周一开课",
            "address": "i前端各校区 ",
            "pic": "img-course\/01.png",
            "price": 399,
            "tpid": 3,
            "tpname": "进阶课程",
            "tid": 4,
            "tname": "纪盈鑫",
            "maincourse": "JS框架专家",
            "tpic": "img-teacher\/zzl.jpg"
        },
       .....
    ]
}
 * 
 * 
 */

router.get("/list",(req,res,next)=>{
	//1 读取请求数据
	let pageNum=req.query.pageNum;
	if(!pageNum){//客户端未提交页码,默认显示第1页
		pageNum=1;
	}else{   //将提交的页号转换为INT形式
		pageNum=parseInt(pageNum)
	}
	let typeId=req.query.typeId;
	if(!typeId){  ///客户端未提交想要显示那种课程,默认全部显示
		typeId=0
	}else{
		typeId=parseInt(typeId); //客户端提交了向现实的课程类编号
	}
	
	//2 执行数据库操作
	let output={
		pageNum:pageNum,
		pageSize:4, //页面大小每页要显示的记录条数
		pageCount:0,  //符合条件的总页数
		totalCount:0,  //符合条件的总记录数
		list:[], //符合条件的记录总数
		
	}
	let condition='';
	let placeholder=[];//为?z占位符提供的数据
	if(typeId!==0){
		condition += 'AND typeId=?'
		placeholder.push(typeId);
	}
	//if(teacherId!==0){}
	//
	let sql1='SELECT COUNT(*) AS c FROM course WHERE 1 '+condition;
	pool.query(sql1,placeholder,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		//总共有result个数据
		output.totalCount=result[0].c;
		//每页的数量
		output.pageCount=Math.ceil( output.totalCount/output.pageSize);
		// let sql2="SELECT cid,typeId,title,teacherId,cLength,startTime,address,pic,price,tpid,tpname,tid,tname,maincourse,tpic  FROM course AS c,type AS t,teacher AS h WHERE c.typeId=t.tpid AND c.teacherId=h.tid "+condition+' ORDER BY cid DESC LIMIT ?,?';
		let sql2='SELECT cid,typeId,title,teacherId,cLength,startTime,address, pic, price,tpid,tpname,tid,tname, maincourse,tpic FROM course AS c ,type AS t,teacher AS h WHERE c.typeId=t.tpid AND c.teacherId=h.tid  '+condition+' ORDER BY cid DESC LIMIT ?,? '
		placeholder.push((output.pageNum-1)*output.pageSize);
		placeholder.push(output.pageSize);
		//limit后的第一个? 表示从那一条记录开始读取,第二个? 表示一次最多读取的记录数量
  		/*
		  第1页: 从0开始要3条
		  2: 从3开始要3条
		  n:从 (n-1)*pageSize开始要3条
		*/
		
		pool.query(sql2,placeholder,(err,result)=>{
			if(err){
				next(err);
				return;
			}
			output.list=result;
			res.send(output);
		})
		
	})
	
	//3 想客户端输出响应消息
	
})


/**
 * 
 * 2.3根据获取课程详情
接口URL
{{url}}/course/detail?cid=1
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
cid	1	必填	-课程id
成功响应示例
{
        "cid": 1,
        "typeId": 1,
        "title": "01HTML零基础入门",
        "teacherId": 1,
        "cLength": "1天",
        "startTime": "每周一开课",
        "address": "i前端各校区 ",
        "pic": "img-course\/01.png",
        "price": 399,
        "details": "<p>本课程详细讲解了HTML5的各个方面，课程从环境搭建开始，依次讲述了HTML5新元素、Canvas、SVG、Audio、GPS定位、拖拽效果、WEB存储、App Cache、HTML5 多线程和HTML5消息推送等内容。.....<\/p>",
        "tid": 1,
        "tname": "成亮",
        "maincourse": "Web开发讲师",
        "tpic": "img-teacher\/zx.jpg",
        "experience": "达内集团web讲师， 主讲 HTML5、Jquery、 Ajax 等课程。先后在一汽启明、日本インタセクト等公司担任系统开发工程师，从事软件开发和设计工作，迄今已积累5年以上的开发及教学经验，兼具技术和教学两方面的培训能力。",
        "style": "教学思路严谨，课堂气氛活跃。讲解时善于运用生活当中的例子，使学员能够快速理解。着重培养学员的动手能力，奉行实践是检验真理的唯一标准，教学能力受到学员们的一致好评。"
}
 * 
 * 
 */
//course/detail?cid=1
router.get("/detail",(req,res,next)=>{
	let cid=req.query.cid;
	if(!cid){
		let output={
			code:400,
			msg:"cid required"
		}
		res.send(output);
		return;
	}
	let sql="SELECT cid,typeId,title,teacherId,cLength,startTime,address,pic,price,details,tid,tname,maincourse,tpic,experience,style FROM course AS c,teacher AS t WHERE c.teacherId=t.tid AND cid=?";
	pool.query(sql,cid,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		if(result.length>0){
			res.send(result[0])
		}else{
			//根据客户端提交的cid没有查询到相关的课程,返回空对象
			res.send({})
		}
	})
	console.log(cid);
})

/**
 * 
 * 2.4获取最新课程
接口URL
{{url}}/course/newest?count=4
请求方式
GET
请求Query参数
参数	示例值	必填	参数描述
count	4	可选	-返回结果数量，默认为4
成功响应示例
[
		{
			"cid": 12,
			"title": "12HTML零基础入门",
			"pic": "img-course/01.png",
			"price": 399,
			"tname": "纪盈鑫"
		}，
		.......
]
 * 
 */
router.get("/newest",(req,res,next)=>{
	let count=req.query.count;
	if(!count){
		//客户端未提交count
		count=4;
	}else{
		count=parseInt(count);
	}
	let sql="SELECT cid,title,pic,price,tname FROM course AS c,teacher AS t WHERE c.teacherId=t.tid ORDER BY cid DESC LIMIT ? ";
	pool.query(sql,count,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		res.send(result);
	})
})



/**
 * 
 * 2.5获取热门课程
接口URL
{{url}}/course/hottest?count=4
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
count	4	可选	-返回结果数量，默认值为4
成功响应示例
[
		{
			"cid": 12,
			"title": "12HTML零基础入门",
			"pic": "img-course/01.png",
			"price": 399,
			"tname": "纪盈鑫"
		},
		......
]
 * 
 * 
 */
router.get("/hottest",(req,res,next)=>{
	let count=req.query.count;
	if(!count){
		//客户端未提交count
		count=4;
	}else{
		count=parseInt(count);
	}
	//如果将按照时间,和按照热度合并成一个接口.列名buyCount不能用?,因为sql对?为字符串的会自动添加为ORDER BY "buyCount",有引号,语句语法错误
	let sql="SELECT cid,title,pic,price,tname FROM course AS c,teacher AS t WHERE c.teacherId=t.tid ORDER BY buyCount DESC LIMIT ? ";
	pool.query(sql,count,(err,result)=>{
		if(err){
			next(err);
			return;
		}
		res.send(result);
	})
})



/**
 * 2.6获取讲师列表
接口URL
{{url}}/teacher/list?format=short
请求方式
GET
请求查询字符串参数
参数	示例值	必填	参数描述
format	short或full	否	short：默认值，返回简短的讲师列表（不包含经验和风格）
full：返回完整的讲师列表（包含经验和风格）
成功响应示例
[
        {
            "tid": 1,
            "tname": "成亮",
            "maincourse": "Web开发讲师",
            "tpic": "img-teacher\/zx.jpg",
            "experience": "达内集团web讲师， 主讲 HTML5、Jquery、 Ajax 等课程。先后在一汽启明、日本インタセクト等公司担任系统开发工程师，从事软件开发和设计工作，迄今已积累5年以上的开发及教学经验，兼具技术和教学两方面的培训能力。",
            "style": "教学思路严谨，课堂气氛活跃。讲解时善于运用生活当中的例子，使学员能够快速理解。着重培养学员的动手能力，奉行实践是检验真理的唯一标准，教学能力受到学员们的一致好评。"
        },
        .......
]
 * 
 */

