const http = require('http');
const fs = require('fs/promises');
const path = require('path');


const app = http.createServer(async (req, res) => {
    const METHOD = req.method;
    const pathData = path.resolve('./data.json');
    const dataJSON = JSON.parse(await fs.readFile(pathData, 'utf8'));
    if (METHOD === 'GET') {
        res.write(JSON.stringify(dataJSON))
        res.statusCode = 200;
        res.end()
    }
    else if (METHOD === 'POST') {
        req.on("data", async data => {
            const objectReq = JSON.parse(data);
            if ((objectReq.title.length > 2) && (objectReq.description.length > 2)) {
                const objectReq2 = { ...objectReq, id: getId(dataJSON), state: false }
                dataJSON.push(objectReq2)
                fs.writeFile(pathData, JSON.stringify(dataJSON), error => {
                    console.log(error);
                })
                res.statusCode = 200;
                res.write(JSON.stringify(dataJSON))
                res.end()
            }
        })
    }
    else if (METHOD === 'PUT') {
        req.on("data", data => {
            let noExist = true;
            const objectReq = JSON.parse(data);
            if ((typeof objectReq.id) === 'number') {
                dataJSON.map((res, ind) => {
                    if (res.id === objectReq.id) {
                        dataJSON[ind].state = !dataJSON[ind].state;
                        noExist = false;
                    }
                })
                if (noExist) {
                    res.statusCode = 404;
                    res.write('No existe');
                    res.end();
                }
                else {
                    fs.writeFile(pathData, JSON.stringify(dataJSON), error => {
                        console.log(error);
                    })
                    res.statusCode = 204;
                    res.end();
                }
            }
            else {
                res.statusCode = 404;
                res.write('Ingrese ID valido');
                res.end();
            }
        })

    }
    else if (METHOD === 'DELETE') {
        req.on("data", data => {
            const objectReq = JSON.parse(data);
            if ((typeof objectReq.id) === 'number') {
                const newArray = dataJSON.filter(res => res.id !== objectReq.id)
                if (newArray.length >= 1) {
                    fs.writeFile(pathData, JSON.stringify(newArray), error => {
                        console.log(error);
                    })
                    res.statusCode = 200;
                    res.write('Eliminado correctamente');
                    res.end();
                }else{
                    fs.writeFile(pathData, JSON.stringify([]), error => {
                        console.log(error);
                    })
                    res.statusCode = 200;
                    res.write('No hay más objetos');
                    res.end();
                }
            }
            else {
                res.statusCode = 404;
                res.write('Ingrese ID valido');
                res.end();
            }
        })
    }
})

const PORT = 8000;

app.listen(PORT, () => {
    console.log('escuchando en puerto 8000...');
});

const getId = (array) => {
    if (array.length >= 1) {
        const idMax = array.sort((a, b) => a.id - b.id)
        return parseInt(idMax[idMax.length - 1].id) + 1;
    }
    else {
        return 1
    }
}