// 启动服务器

const express = require("express")
const bodyParser = require("body-parser")
const connection = require("./db") // 创建连接实例


const {  port } = require("./config") // 获取配置端口信息
const {changeInfo, filter, filterData} = require("./tools")
const cors = require('cors');


const app = express() // 创建express实例


app.use(cors());

// 解析数据的中间件
app.use(bodyParser.json())
app.use(express.urlencoded({extended: false}))
const path = require('path');



// 静态文件路径
const staticFilePath = path.join(__dirname, 'dist');

// 配置静态文件
app.use(express.static(staticFilePath));

// 管理员账户

app.get("/admin", (req, res)=>{
    const info_ = req.query
    const info = filter(info_)

    var sql = "select * from admins where username=? and password=?"

    connection.query(sql, [info.username, info.password], (err, suc) => {
      
        if(err){
            return res.send({
                message: err.message
            })
        }

        return res.send({
            message: "OK",
            data: suc
        })
    })

})


// select 可以通过id查询
app.get("/admin/list", (req, res) =>{

    // 获取id
    const info_ = req.query

    const info = filter(info_)

    console.log(info)

    var sql = "select * from admins "
    
    if(Object.keys(info).length !== 0){
        sql += "where admin_id=?"
    }

    console.log(sql)

    connection.query(sql, [info.admin_id], (err, suc) =>{
        if(err){
            return res.send({
                message: err.message
            })
        }

        return res.send({
            message: "OK",
            data: suc
        })
    })

})

// insert
app.post("/admin/insert", (req, res) =>{

    const info_ = req.body

    const info = filter(info_)

    const sql = " insert into admins set ? "

    connection.query(sql, info, (err, suc) =>{
        if(err){
            return res.send({
                message: err.message
            })
        }

        return res.send({
            message: "OK",
            data: suc
        })

    })

})

// delete
app.get("/admin/delete", (req, res) =>{
    const info_ = req.query
    const info = filter(info_)
    const sql = 'delete from admins where admin_id = ?'

    connection.query(sql, info.admin_id, (err, suc) =>{
        if(err){
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "OK",
            data: suc
        })
    })
})


// update
app.post("/admin/update", (req, res) =>{
    const info_ = req.body
    const info = filter(info)

    const sql = "update admins set ? where admin_id = ?"

    connection.query(sql, [info, info.admin_id], (err, suc)=>{
        if(err){
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "OK",
            data: suc
        })
    })

})


// 医生

// 查找
app.get('/doctor/list', (req, resp) => {

    console.log("多表联查")

    const info_ = req.query

    const info = filter(info_)

    console.log(info)


    var sql = ` select * from doctors 
    left  join 
    professional_titles
    on doctors.professional_title_id = professional_titles.id
    where (doctor_id=? or ?='') and (name like '%${changeInfo(info.name)}%' or ?='') `

    // console.log(info.name)

   
    connection.query(sql, [changeInfo(info.doctor_id), changeInfo(info.doctor_id), changeInfo(info.name)], (err, results) => {
        if(err){
            return resp.send({
                status: 1,
                message: "查找失败"
            })
        }
        else{
            // console.log(results)
          return resp.send({
            status: 0,
            message: "查找成功",
            data: results
          })
        }
    })
})


// update
app.post("/doctor/update", (req, res) =>{
    console.log("更新医生信息")
    // 要修改的字段
    const Info = req.body
    
    const updateInfo_ = filter(Info)

    const updateInfo = filterData(updateInfo_,  ['doctor_id', 'job_number', 'password', 'name', 'avatar', 'phone', 'email', 'introduction', 'registration_fee', 'entry_date', 'department_id', 'professional_title_id'])

    // 更新
    console.log(updateInfo)

    // 定义sql语句
    const sql = "update doctors set ? where doctor_id=?"

    connection.query(sql, [updateInfo, updateInfo.doctor_id], (err, results) =>{
        if(err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }

        if(results.affectedRows !== 1){
            return res.send({
                status: 1,
                message: "数据更新失败"
            })
        }

        return res.send({
            status: 0,
            message: "数据更新成功",
            data: results
        })

    })

})




// insert
app.post("/doctor/insert", (req, res) =>{
    // 先取到要增加的字段值
  const info_ = req.body

  const addInfor_ = filter(info_)

  const addInfor = filterData(addInfor_  ['doctor_id', 'job_number', 'password', 'name', 'avatar', 'phone', 'email', 'introduction', 'registration_fee', 'entry_date', 'department_id', 'professional_title_id'])


  // 定义sql语句
  const sql = "insert into doctors set ? "


  // 执行sql语句,第二个参数代表sql语句中？的值
  /**
   * 如果增加的字段和数据库中的字段不是一一对应的
   * 将addInfor换成{name: addInfor.name, age: addInfor.age}
   * name代表数据库中的字段，addInfor.name代表他要增加的值
   */
  connection.query(sql, addInfor, (err,results)=>{

    // sql语句执行失败
    if(err) {
      return res.send({status: 1, message: err.message})
    }
    // 数据库语句执行成功，但影响的条数不等于1，没有增加，也属于失败
    if(results.affectedRows !== 1) {
      return res.send({status: 1, message: '数据添加失败'})
    }
    // sql语句执行成功，影响条数也等于1
    return res.send({status:0, message: '添加成功', data:results})
  })

})

// delete
app.get("/doctor/delete", (req, res) =>{

    console.log("删除医生")
    const info_ = req.query

    const info = filter(info_)
    const sql = 'delete from doctors where doctor_id = ?'
    console.log(info)
    connection.query(sql, [info.doctor_id], (err, suc) =>{
        if(err){
            console.log(err.message)
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "OK",
            data: suc
        })
    })
})


// 科室
// 查找
app.get('/department/list', (req, resp) => {

    const info_ = req.query

    const info = filter(info_)

    console.log("department select", info)

    var sql = `select * from departments where (department_id=? or ?='') and (department_name like '%${changeInfo(info.department_name)}%' or ?='')`

    // console.log("select info", info)

    connection.query(sql, [changeInfo(info.department_id), changeInfo(info.department_id), changeInfo(info.department_name)], (err, results) => {
        if(err){
            return resp.send({
                status: 1,
                message: "查找失败"
            })
        }
        else{
          return resp.send({
            status: 0,
            message: "查找成功",
            data: results
          })
        }
    })
})


// update
app.post("/department/update", (req, res) =>{
    
    // 要修改的字段
    const updateInfo_ = req.body
    const updateInfo = filter(updateInfo_)
    // console.log("updateinfo department", updateInfo)
    // 定义sql语句
    const sql = "update departments set ? where department_id=?"

    connection.query(sql, [updateInfo, updateInfo.department_id], (err, results) =>{
        if(err) {
            return res.send({
                status: 1,
                message: err.message
            })
        }

        if(results.affectedRows !== 1){
            return res.send({
                status: 1,
                message: "数据更新失败"
            })
        }

        return res.send({
            status: 0,
            message: "数据更新成功",
            data: results
        })

    })

})


// insert
app.post("/department/insert", (req, res) =>{
    // 先取到要增加的字段值

    const info_ = req.body

      const addInfor = filter(info_)

//   console.log("addinfo", addInfor)

  // 定义sql语句
  const sql = "insert into departments set ? "
  // 执行sql语句,第二个参数代表sql语句中？的值
  /**
   * 如果增加的字段和数据库中的字段不是一一对应的
   * 将addInfor换成{name: addInfor.name, age: addInfor.age}
   * name代表数据库中的字段，addInfor.name代表他要增加的值
   */
  connection.query(sql, [addInfor], (err,results)=>{

    // sql语句执行失败
    if(err) {
      return res.send({status: 1, message: err.message})
    }
    // 数据库语句执行成功，但影响的条数不等于1，没有增加，也属于失败
    if(results.affectedRows !== 1) {
      return res.send({status: 1, message: '数据添加失败'})
    }
    // sql语句执行成功，影响条数也等于1
    return res.send({status:0, message: '添加成功', data:results})
  })

})

// delete
app.get("/department/delete", (req, res) =>{
    const info_ = req.query

    const info = filter(info_)
    const sql = 'delete from departments where department_id = ?'

    connection.query(sql, info.department_id, (err, suc) =>{
        if(err){
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "OK",
            data: suc
        })
    })
})



/**
 * 
 * 患者
 * 
 */
// 查找
app.get('/patient/list', (req, resp) => {
    const info_ = req.query

    const info = filter(info_);
    var sql = "select * from patients where (patient_id=? or ?='') and (name=? or ?='')";

    console.log("patient info", info)

    connection.query(sql, [changeInfo(info.patient_id), changeInfo(info.patient_id), changeInfo(info.name), changeInfo(info.name)], (err, results) => {
        if (err) {
            return resp.send({
                status: 1,
                message: "查找失败"
            });
        } else {
            // console.log(results)
            return resp.send({
                status: 0,
                message: "查找成功",
                data: results
            });
        }
    });
});

// 更新
app.post("/patient/update", (req, res) => {
    // 要修改的字段
    const updateInfo_ = req.body;

    const updateInfo = filter(updateInfo_)

    // 定义sql语句
    const sql = "update patients set ? where patient_id=?";

    connection.query(sql, [updateInfo, updateInfo.patient_id], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: "数据更新失败"
            });
        }

        return res.send({
            status: 0,
            message: "数据更新成功",
            data: results
        });
    });
});

// 插入
app.post("/patient/insert", (req, res) => {
    // 先取到要增加的字段值
    const addInfo_ = req.body;
    
    const addInfo = filter(addInfo_) 

    // 定义sql语句
    const sql = "insert into patients set ?";
    // 执行sql语句
    connection.query(sql, [addInfo], (err, results) => {
        // sql语句执行失败
        if (err) {
            return res.send({ status: 1, message: err.message });
        }
        // 数据库语句执行成功，但影响的条数不等于1，没有增加，也属于失败
        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: '数据添加失败' });
        }
        // sql语句执行成功，影响条数也等于1
        return res.send({ status: 0, message: '添加成功', data: results });
    });
});

// 删除
app.get("/patient/delete", (req, res) => {
    const info_ = req.query

    const info = filter(info_);
    const sql = 'delete from patients where patient_id = ?';

    connection.query(sql, info.patient_id, (err, suc) => {
        if (err) {
            return res.send({
                message: err.message
            });
        }
        return res.send({
            message: "OK",
            data: suc
        });
    });
});


/**
 * 
 * 公告
 * 
 */


// 查找公告
app.get('/announcement/list', (req, resp) => {
    const info_ = req.query

    const info = filter(info_);
    var sql = `select * from announcement where (announcement_id=? or ?='') and (title like '%${changeInfo(info.title)}%' or ?='') and (creator like '%${changeInfo(info.creator)}%' or ?='')  `;
    console.log("查找公告！")
    connection.query(sql, [changeInfo(info.announcement_id), changeInfo(info.announcement_id),  changeInfo(info.title), changeInfo(info.creator)], (err, results) => {
        if (err) {
            console.log("查找失败", err)
            return resp.send({
                status: 1,
                message: "查找失败"
            });
        } else {
            console.log("查找成功", results)
            return resp.send({
                status: 0,
                message: "查找成功",
                data: results
            });
        }
    });
});

// 更新公告
app.post("/announcement/update", (req, res) => {
    const updateInfo_ = req.body;

    const updateInfo = filter(updateInfo_)

    const sql = "update announcement set ? where announcement_id=?";

    connection.query(sql, [updateInfo, updateInfo.announcement_id], (err, results) => {
        if (err) {
            return res.send({
                status: 1,
                message: err.message
            });
        }

        if (results.affectedRows !== 1) {
            return res.send({
                status: 1,
                message: "数据更新失败"
            });
        }

        return res.send({
            status: 0,
            message: "数据更新成功",
            data: results
        });
    });
});

// 插入公告
app.post("/announcement/insert", (req, res) => {
    const addInfo_ = req.body;

    const addInfo = filter(addInfo_)

    const sql = "insert into announcement set ?";

    console.log("addinfo insert ament", addInfo)

    connection.query(sql, [addInfo], (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }
        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: '数据添加失败' });
        }
        return res.send({ status: 0, message: '添加成功', data: results });
    });
});

// 删除公告
app.get("/announcement/delete", (req, res) => {
    const info_ = req.query

    const info = filter(info_);

    const sql = 'delete from announcement where announcement_id = ?';

    connection.query(sql, info.announcement_id, (err, suc) => {
        if (err) {
            return res.send({
                message: err.message
            });
        }
        return res.send({
            message: "OK",
            data: suc
        });
    });
});


/**
 * 
 * 排班
 * 
 */


// 查找排班
app.get('/schedule/list', (req, res) => {
    const info_ = req.query

    const info = filter(info_);
    const sql = "SELECT * FROM doctor_schedule WHERE (schedule_id = ? OR ? = '') AND (doctor_id = ? OR ? = '')";

    // console.log("排班查询成功！info ", info)

    connection.query(sql, [info.schedule_id || '', info.schedule_id || '', info.doctor_id || '', info.doctor_id || ''], (err, results) => {
        if (err) {
            return res.send({ status: 1, message: "查找失败" });
        }
        return res.send({ status: 0, message: "查找成功", data: results });
    });
});

// 更新排班
app.post('/schedule/update', (req, res) => {
    const updateInfo_ = req.body;
    const updateInfo__ = filter(updateInfo_)

    const updateInfo = filterData(updateInfo__, [
        "schedule_id",
        "doctor_id",
        "date",
        "shift_time",
        "department_id",  
        "is_available",
        "visit_count",
        "remarks"
    ])

    const sql = "UPDATE doctor_schedule SET ? WHERE schedule_id = ?";

    connection.query(sql, [updateInfo, updateInfo.schedule_id], (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }

        if (results.affectedRows !== 1) {
            return res.send({ status: 1, message: "数据更新失败" });
        }

        return res.send({ status: 0, message: "数据更新成功", data: results });
    });
});

// 新增排班
app.post('/schedule/insert', (req, res) => {
    
    const addInfo_ = req.body;

    const addInfo__ = filter(addInfo_)

    const addInfo = filterData(addInfo__, [
        "schedule_id",
        "doctor_id",
        "date",
        "shift_time",
        "department_id",  
        "is_available",
        "visit_count",
        "remarks"
    ])


    const sql = "INSERT INTO doctor_schedule SET ?";

    console.log("insert schedule", addInfo)

    connection.query(sql, [addInfo], (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }

        // if (results.affectedRows !== 1) {
        //     return res.send({ status: 1, message: "数据添加失败" });
        // }
        
        return res.send({ status: 0, message: "添加成功", data: results });
    });
});

// 删除排班
app.get('/schedule/delete', (req, res) => {
    const info_ = req.query

    const info = filter(info_);
    const sql = 'DELETE FROM doctor_schedule WHERE schedule_id = ?';

    connection.query(sql, info.schedule_id, (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }

        return res.send({ status: 0, message: "删除成功", data: results });
    });
});


/**
 * 
 * 职称
 * 
 */

// select
app.get("/title/list", (req, res) => {
    
    const sql = "select * from professional_titles"
    
    connection.query(sql, (err, results) => {
        if(err){
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "ok",
            data: results
        })

    })

})

// 预约记录

app.get("/appointment/status", (req, res) => {
    const sql = `
        select status ,count(status) as total from appointments group by status
    `
    connection.query(sql, (err, results) => {
        if(err){
            return res.send({
                message: err.message
            })
        }
        return res.send({
            message: "ok",
            data: results
        })

    })

})



/**
 * 
 * 测试多表联查
 * 
 */

app.get('/test/multiTable', (req, res) => {
    const info_ = req.query

    const info = filter(info_)
    const sql = `
        select * from
        doctors
        inner join
        professional_titles
        on doctors.department_id = professional_titles.id
    `

    connection.query(sql, [], (err, results) => {
        if(err){
            console.log("err", err)
            return res.send({
                status : 1,
                message: err.message
            })
        }
        return res.send({
            status: 0,
            message: "ok",
            data: results
        })
    })

})

app.get("/test/doubleDpt", (req, res)=>{
    const sql = `
    select * from departments dp1
    left join 
    departments dp2
    on dp1.department_pid = dp2.department_id
    `

    connection.query(sql, (err, results) => {
        if(err){
            console.log("err", err)
            return res.send({
                status : 1,
                message: err.message
            })
        }
        return res.send({
            status: 0,
            message: "ok",
            data: results
        })
    })

})

app.get("/app_doc/list", (req, res) => {
    const sql = `select * from doctor_schedule 
        left join doctors
        on doctor_schedule.doctor_id = doctors.doctor_id
        order by visit_count DESC limit 5 offset 0   
    `
    connection.query(sql, (err, results) => {
        if(err){
            console.log("err", err)
            return res.send({
                status : 1,
                message: err.message
            })
        }
        return res.send({
            status: 0,
            message: "ok",
            data: results
        })
    })

})


app.get("/doc_dpt/list", (req, res) => {
    const sql = `
        select department_name as name, count(doctor_id) as value from doctors 
        left join departments  
          on doctors.department_id = departments.department_id 
          where department_name is not null
          group by department_name
          limit 5
    `
    connection.query(sql, (err, results) => {
        if(err){
            console.log("err", err)
            return res.send({
                status : 1,
                message: err.message
            })
        }
        return res.send({
            status: 0,
            message: "ok",
            data: results
        })
    })

})



app.get("/sch_doc_dpt/list", (req, res) => {

    const info_ = req.query

    const info = filter(info_);
    
    console.log("sch_doc_dpt info", info)

    const sql = `
       select * from doctor_schedule ds
        left JOIN doctors doc on ds.doctor_id = doc.doctor_id
        left JOIN departments dps on ds.department_id = dps.department_id
        WHERE (ds.schedule_id = ? OR ? = '') AND (ds.doctor_id = ? OR ? = '')
    `
    connection.query(sql, [info.schedule_id || '', info.schedule_id || '', info.doctor_id || '', info.doctor_id || ''], (err, results) => {
        if(err){
            console.log("err", err)
            return res.send({
                status : 1,
                message: err.message
            })
        }
        return res.send({
            status: 0,
            message: "ok",
            data: results
        })
    })

})


// 监听端口

app.listen(port, async () =>{
    console.log(`服务器启动成功，访问 http://localhost:${port}/#/login`)
    const open = await import('open');
    open.default(`http://localhost:${port}/#/login`);
})



