const express = require('express');
const { getDb, saveDb } = require('./db.js')
const app = new express();


// 配置解析表单请求体：application/json
app.use(express.json())

// 解析表单请求体：application/x-www-form-urlencoded
app.use(express.urlencoded())

// 查询列表
app.get('/todos', async (req, res) => {
    try {
        const db = await getDb()
        res.status(200).json(db.todos)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

// 根据 id 查询单个
app.get('/todos/:id', async (req, res) => {
    try {
        const db = await getDb()
        const todo = db.todos.find(todo => todo.id === Number.parseInt(req.params.id));
        if(!todo) {
            return res.status(404).end()
        }
        res.status(200).json(todo)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

// 添加
app.post('/add', async (req, res) => {
    try {
        // 获取客户端请求体参数
        const todo = req.body
        // 数据验证
        if(!todo.title) {
            return res.status(422).json({
                error: 'The field title is required.'
            })
        }
        // 数据验证通过，把数据存储到 db 中
        const db = await getDb();
        const lastTodo = db.todos[db.todos.length - 1]
        todo.id = lastTodo ? lastTodo.id + 1 : 1;
        db.todos.push(todo)
        await saveDb(db)
        // 发送响应
        res.status(201).json(db)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

// 更新
app.patch('/patch/:id', async (req, res) => {
    try {
        // 获取客户端请求体参数
        const todo = req.body
        // 查找到要修改的任务项
        const db = await getDb();
        const ret = db.todos.find(todo => todo.id === Number.parseInt(req.params.id));
        if(!ret) {
            return res.status(404).end();
        }
        // 利用浅拷贝，ret 指针指向 db
        Object.assign(ret, todo);
        await saveDb(db)
        res.status(200).json(ret)
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

// 删除
app.delete('/delete/:id', async (req, res) => {
    try {
        const todoId = Number.parseInt(req.params.id);
        const db = await getDb()
        const index = db.todos.findIndex(todo => todo.id === todoId)
        if(index === -1) {
            return res.status(404).end()
        }
        db.todos.splice(index, 1)
        await saveDb(db)
        res.status(204).end()
    } catch(err) {
        res.status(500).json({
            error: err.message
        })
    }
});

app.listen(3000, () => {
    console.log('港湾已经开启')
})