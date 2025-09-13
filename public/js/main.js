const http = require( "http" ),
    fs   = require( "fs" ),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you"re testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require( "mime" ),
    dir  = "public/",
    path = require("path"),
    url = require("url"),
    port = 3000
let items = []
const nowISO = () => new Date().toISOString()
const rid    = () => "id-" + Math.random().toString(36).slice(2, 9)

function withDerived(row) {
    const created = new Date(row.createdAt)
    const respondBy = new Date(created.getTime() + 3*86400000).toISOString()
    return { ...row, respondBy }
}

const server = http.createServer( function( request,response ) {
    if( request.method === "GET" ) {
        handleGet( request, response )
    }else if( request.method === "POST" ){
        handlePost( request, response )
    }else if( request.method === "DELETE" ){
        handleDelete( request, response )
    }else{
        response.writeHead(405)
        response.end("Method Not Allowed")
    }
})

const handleGet = function( request, response ) {
    const { pathname } = url.parse(request.url)
    //
    if (pathname === "/api/items") {
        response.writeHead(200, { "Content-Type": "application/json" })
        return response.end(JSON.stringify(items))
    }
    // https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-js-when-using-es6-modules?newreg=c3d51225aa4a47f281a37888af2de4a5
    const filename = dir + request.url.slice( 1 )
    if( request.url === "/" ) {
        sendFile( response, "public/index.html" )
    }else{
        sendFile( response, filename )
    }
}

const handlePost = function( request, response ) {
    const { pathname } = url.parse(request.url)
    let dataString = ""

    request.on( "data", function( data ) {
        dataString += data
    })

    request.on( "end", function() {
        if (pathname === "/api/items") {
            let data = {}
            try { data = JSON.parse(dataString || "{}") } catch {}
            const { name="", email="", message="" } = data

            if (!name || !email || !message) {
                response.writeHead(400, { "Content-Type": "application/json" })
                return response.end(JSON.stringify({ error: "all fields required" }))
            }

            const row = withDerived({ id: rid(), name, email, message, createdAt: nowISO() })
            items.unshift(row)

            response.writeHead(201, { "Content-Type": "application/json" })
            return response.end(JSON.stringify(row))
        }

        // fallback
        response.writeHead(200, { "Content-Type": "text/plain" })
        response.end("OK")
    })
}

// delete endpoint for /api/items/:id
const handleDelete = function( request, response ) {
    const { pathname } = url.parse(request.url)
    if (pathname.startsWith("/api/items/")) {
        const id = pathname.split("/").pop()
        const before = items.length
        items = items.filter(r => r.id !== id)
        response.writeHead(200, { "Content-Type": "application/json" })
        return response.end(JSON.stringify({ removed: before - items.length }))
    }
    response.writeHead(404)
    response.end("Not Found")
}

const sendFile = function( response, filename ) {
    const safe = path.normalize(filename).replace(/^(\.\.[\/\\])+/, "")
    const type = mime.getType( safe ) || "text/plain"

    fs.readFile( safe, function( err, content ) {
        if( err === null ) {
            response.writeHeader( 200, { "Content-Type": type })
            response.end( content )
        }else{
            response.writeHeader( 404 )
            response.end( "404 Error: File Not Found" )
        }
    })
}

server.listen( process.env.PORT || port )
