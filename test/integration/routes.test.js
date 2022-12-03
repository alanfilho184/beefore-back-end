const axios = require('axios').default
const { Client } = require('pg')
const { io } = require("socket.io-client");
require('dotenv').config()

const client = new Client({
    connectionString: process.env.TEST_DATABASE_URL
})

let memberToken
let coordinatorToken

beforeAll(async () => {
    await client.connect()
    await client.query(`
    DELETE FROM public."Authorization";
    DELETE FROM public."Relatory";
    DELETE FROM public."User" WHERE id NOT BETWEEN 118 AND 119;
    `)

    try {
        request = await axios.post('http://localhost:3001/auth/login', {
            email: 'member@email.com',
            password: '12345678'
        })

        memberToken = request.data.token
    }
    catch (err) {
        console.log(err.response)
    }

    try {
        request = await axios.post('http://localhost:3001/auth/login', {
            email: 'coordinator@email.com',
            password: '12345678'
        })

        coordinatorToken = request.data.token
    }
    catch (err) {
        console.log(err.response)
    }
})

describe('POST /user/', () => {
    it('Created 201 (Member -> Authorization)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/user/', {
                cardid: '0000000003',
                name: 'Test route',
                email: 'test@email.com',
                password: '12345678',
                type: 'Member',
            })
        }
        catch (err) {
            console.error(err.response)
            request = err.response
        }

        expect(request.status).toEqual(201)

        const { rows } = await client.query(`SELECT data FROM public."Authorization" where id = ${request.data.id}`)
        expect(rows[0].data.name == 'Test route').toBeTruthy()

        try {
            await axios.put('http://localhost:3001/authorization/', {
                id: request.data.id,
                status: "Approved"
            },
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.error(err.response)
        }
    })

    it('Bad Request 400', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/user/')
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(400)
    })
})

describe('GET /user/', () => {
    it('OK 200 (Member self data)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user/',
                {
                    headers: {
                        Authorization: memberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.name).toBe('Member')
    })

    it('OK 200 (Coordinator self data)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user/',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.name).toBe('Coordinator')
    })

    it('OK 200 (Coordinator get Member data)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user?email=member@email.com',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.name).toBe('Member')
    })

    it('OK 200 (Member try get coordinator data)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user?email=coordinator@email.com',
                {
                    headers: {
                        Authorization: memberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.name).toBe('Member')
    })

    it('OK 200 (Coordinator get all users)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user?getAll=true',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.length).toBeGreaterThanOrEqual(2)
    })

    it('Not Found 404 (Coordinator try get missing data)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/user?email=missing@email.com',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(404)
    })
})

describe('PATCH /user/', () => {
    it('OK 200 (Member patch self)', async () => {
        let request, tempMemberToken
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'test@email.com',
                password: '12345678'
            })

            tempMemberToken = request.data.token
        }
        catch (err) {
            console.log(err.response)
        }

        try {
            request = await axios.patch('http://localhost:3001/user/',
                {
                    modify: {
                        id: 1,
                        name: "Member Patched"
                    }
                },
                {
                    headers: {
                        Authorization: tempMemberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        const { rows } = await client.query(`SELECT * FROM public."User" where email = 'test@email.com'`)
        expect(rows[0].name == 'Member Patched').toBeTruthy()
    })

    it('Bad Request 400 (Member try patch self)', async () => {
        let request, tempMemberToken
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'test@email.com',
                password: '12345678'
            })

            tempMemberToken = request.data.token
        }
        catch (err) {
            console.log(err.response)
        }

        try {
            request = await axios.patch('http://localhost:3001/user/',
                {
                    modify: {
                        id: 1,
                        email: "member@email.com"
                    }
                },
                {
                    headers: {
                        Authorization: tempMemberToken
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(400)
    })
})

describe('DELETE /user/', () => {
    it('OK 200 (Member delete self)', async () => {
        let request, tempMemberToken
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'test@email.com',
                password: '12345678'
            })

            tempMemberToken = request.data.token
        }
        catch (err) {
            console.log(err.response)
        }

        try {
            request = await axios.delete('http://localhost:3001/user/',
                {
                    headers: {
                        Authorization: tempMemberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
            request = err.response
        }

        expect(request.status).toEqual(200)
        const { rows } = await client.query(`SELECT * FROM public."User" where email = 'test@email.com'`)
        expect(rows.length == 0).toBeTruthy()
    })
})

describe('POST /auth/login', () => {
    it('OK 200 (Coordinator login)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'coordinator@email.com',
                password: '12345678'
            })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
        expect(request.data.token).toBeTruthy()
        coordinatorToken = request.data.token
    })

    it('OK 200 (Member login)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'member@email.com',
                password: '12345678'
            })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
        expect(request.data.token).toBeTruthy()
        memberToken = request.data.token
    })

    it('Bad Request 400 (Member login missing data)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'member@email.com'
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(400)
        expect(request.data.error).toBeTruthy()
    })

    it('Unauthorized 401 (Member login with incorrect password)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'member@email.com',
                password: '12345670'
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(401)
        expect(request.data.error).toBeTruthy()
    })

    it('Not Found 404 (Incorrect email)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/login', {
                email: 'missing@email.com',
                password: '12345678'
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(404)
        expect(request.data.error).toBeTruthy()
    })
})

describe('POST /auth/token', () => {
    it('OK 200 (Coordinator verify/refresh token)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/token', {}, {
                headers: {
                    Authorization: coordinatorToken
                }
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.token).toBeTruthy()
        expect(request.data.user.type).toBe("Coordinator")
    })

    it('OK 200 (Member verify/refresh token)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/token', {}, {
                headers: {
                    Authorization: memberToken
                }
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(200)
        expect(request.data.token).toBeTruthy()
        expect(request.data.user.type).toBe("Member")
    })

    it('Unauthorized 401 (Invalid token)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/auth/token', {}, {
                headers: {
                    Authorization: memberToken + "ab12"
                }
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(401)
        expect(request.data.error).toBeTruthy()
    })
})

describe('GET /authorization/', () => {
    it('OK 200 (Coordinator get all items)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/authorization', {
                headers: {
                    Authorization: coordinatorToken
                }
            })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })

    it('Forbidden 403 (Member try get authorizations)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/authorization', {
                headers: {
                    Authorization: memberToken
                }
            })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(403)
    })
})

describe('PUT /authorization/', () => {
    it('OK 200 (Coordinator approve a item)', async () => {
        let authorizationId
        try {
            let request = await axios.post('http://localhost:3001/user/', {
                cardid: '0000000010',
                name: 'Test authorization',
                email: 'testAuthorization@email.com',
                password: '12345678',
                type: 'Member',
            })

            authorizationId = request.data.id
        }
        catch (err) {
            console.error(err.response)
        }

        let request
        try {
            request = await axios.put('http://localhost:3001/authorization',
                {
                    id: authorizationId,
                    status: "Approved"
                },
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })

    it('OK 200 (Coordinator deny a item)', async () => {
        let authorizationId
        try {
            let request = await axios.post('http://localhost:3001/user/', {
                cardid: '0000000020',
                name: 'Test authorization',
                email: 'testAuthorization2@email.com',
                password: '12345678',
                type: 'Member',
            })

            authorizationId = request.data.id
        }
        catch (err) {
            console.error(err.response)
        }

        let request
        try {
            request = await axios.put('http://localhost:3001/authorization', {
                id: authorizationId,
                status: "Denied"
            },
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })

    it('Bad Request 400 (Invalid status)', async () => {
        let authorizationId
        try {
            let request = await axios.post('http://localhost:3001/user/', {
                cardid: '0000000030',
                name: 'Test authorization',
                email: 'testAuthorization3@email.com',
                password: '12345678',
                type: 'Member',
            })

            authorizationId = request.data.id
        }
        catch (err) {
            console.error(err.response)
        }

        let request
        try {
            request = await axios.put('http://localhost:3001/authorization',
                {
                    id: authorizationId,
                    status: "NotApproved"
                },
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(400)
    })

    it('Forbidden 403 (Member try approve a item)', async () => {
        let request
        try {
            request = await axios.put('http://localhost:3001/authorization', {
                id: 1,
                status: "Approved"
            },
                {
                    headers: {
                        Authorization: memberToken
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(403)
    })

    it('Not Found 404 (Invalid authorization id)', async () => {
        let request
        try {
            request = await axios.put('http://localhost:3001/authorization',
                {
                    id: 1,
                    status: "Approved"
                },
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(404)
    })
})

describe('GET /actualUsage/statistics', () => {
    it('OK 200 (Fetch dashboard statistics)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/actualUsage/statistics', {
                headers: {
                    Authorization: memberToken
                }
            })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })
})

jest.setTimeout(10000)
describe('Websocket', () => {
    let socket
    it('Connect to websocket', async () => {
        socket = io("http://localhost:3001", {
            extraHeaders: {
                Authorization: memberToken
            }
        })

        expect(socket.active).toBeTruthy()
    })
    it('Receive updateActualUsage', async () => {
        socket.on('actualUsage', (data) => {
            expect(data).toBeGreaterThanOrEqual(0)
        })
    })
})

describe('POST /relatory', () => {
    it('OK 200 (Register 2 actions of Member)', async () => {
        let request1
        let request2
        try {
            request1 = await axios.post('http://localhost:3001/relatory',
                {
                    cardid: '0000000002'
                },
                {
                    headers: {
                        Authorization: 'secret4'
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        try {
            request2 = await axios.post('http://localhost:3001/relatory',
                {
                    cardid: '0000000002'
                },
                {
                    headers: {
                        Authorization: 'secret4'
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request1.status).toEqual(200)
        expect(request2.status).toEqual(200)
    })

    it('Bad Request 400 (Missing CardId)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/relatory',
                {
                    notCardId: "1"
                },
                {
                    headers: {
                        Authorization: "secret4"
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(400)
    })

    it('Unauthorized 401 (Invalid token)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/relatory',
                {
                    cardid: "1"
                },
                {
                    headers: {
                        Authorization: "invalid"
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(401)
    })

    it('Not Found 404 (Wrong CardId)', async () => {
        let request
        try {
            request = await axios.post('http://localhost:3001/relatory',
                {
                    cardid: "1"
                },
                {
                    headers: {
                        Authorization: "secret4"
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(404)
    })
})

describe('GET /relatory', () => {
    it('OK 200 (Coordinator get all relatorys)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/relatory?getAll=true',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })

    it('OK 200 (Coordinator get Member relatory)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/relatory?id=118',
                {
                    headers: {
                        Authorization: coordinatorToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
        expect(request.data.self).toBeFalsy()
    })

    it('OK 200 (Member get self relatory)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/relatory',
                {
                    headers: {
                        Authorization: memberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
        expect(request.data.self).toBeTruthy()
    })

    it('OK 200 (Member trys get Coordinator relatorys (get self instead))', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/relatory?id=119',
                {
                    headers: {
                        Authorization: memberToken
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
        expect(request.data.self).toBeTruthy()
    })
})

describe('GET /log', () => {
    it('OK 200 (Get today system logs)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/log',
                {
                    headers: {
                        Authorization: 'secret3'
                    }
                })
        }
        catch (err) {
            console.log(err.response)
        }

        expect(request.status).toEqual(200)
    })

    it('Unauthorized 401 (Invalid token)', async () => {
        let request
        try {
            request = await axios.get('http://localhost:3001/log',
                {
                    headers: {
                        Authorization: 'invalid'
                    }
                })
        }
        catch (err) {
            request = err.response
        }

        expect(request.status).toEqual(401)
    })
})

afterAll(() => {
    client.end()
})