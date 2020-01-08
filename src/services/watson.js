const mongoUtils = require('./mongodb')
const AssistantV2 = require('ibm-watson/assistant/v2')
const { IamAuthenticator } = require('ibm-watson/auth')
const assistant = new AssistantV2({
    version: '2019-02-28',
    authenticator: new IamAuthenticator({
        apikey: process.env.ASSISTANT_IAM_APIKEY,
    }),
    url: process.env.ASSISTANT_URL,
})

class Watson {

    createSession(req, res) {
        assistant.createSession({ assistantId: process.env.ASSISTANT_ID }, (err, resp) => {
            if (err) return res.send(err)

            return res.json(resp)
        })
    }

    sendMessage(req, res) {
        mongoUtils.asyncSaveMessage(req.body.message)
        
        let assistantId = process.env.ASSISTANT_ID
        let payload = {
            assistantId: assistantId,
            sessionId: req.body.session_id,
            input: {
                message_type: 'text',
                text: req.body.message,
            },
        }

        assistant.message(payload, (err, data) => {
            if (err) {
                const status = err.code !== undefined && err.code > 0 ? err.code : 500
                return res.status(status).json(err)
            }

            return res.json(data)
        })
    }
}

module.exports = new Watson()