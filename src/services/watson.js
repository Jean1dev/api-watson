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

function buildMessageElements(newPayload) {
    let responses = []
    if (newPayload.hasOwnProperty('output')) {
        if (newPayload.output.hasOwnProperty('generic')) {
            let generic = newPayload.output.generic
            generic.forEach(gen => {
                getResponse(responses, gen)
            })
        }
    }
    return responses
}

function getResponse(responses, gen) {
    var title = '', description = ''
    if (gen.hasOwnProperty('title')) {
        title = gen.title
    }
    if (gen.hasOwnProperty('description')) {
        description = '<div>' + gen.description + '</div>'
    }
    if (gen.response_type === 'image') {
        let img = `<div><img src={'${gen.source}'} width={300}></div>`
        responses.push({
            type: gen.response_type,
            innerhtml: title + description + img,
            data: { img: gen.source, title }
        })
    } else if (gen.response_type === 'text') {
        responses.push({
            type: gen.response_type,
            text: gen.text
        })
    } else if (gen.response_type === 'pause') {
        responses.push({
            type: gen.response_type,
            time: gen.time,
            typing: gen.typing
        })
    } else if (gen.response_type === 'option') {
        var preference = 'text'
        if (gen.hasOwnProperty('preference')) {
            preference = gen.preference;
        }

        let result = getOptions(gen.options, preference)
        let list = result.innerhtml
        responses.push({
            type: gen.response_type,
            innerhtml: title + description + list,
            text: title + gen.description,
            data: result
        })
    }
}

function getOptions(optionsList, preference) {
    let arrOptions = []
    let list = ''
    let i = 0
    if (optionsList !== null) {
        if (preference === 'text') {
            list = '<ul>'
            for (i = 0; i < optionsList.length; i++) {
                if (optionsList[i].value) {
                    list += '<li><div class="options-list" onclick="ConversationPanel.sendMessage(\'' +
                        optionsList[i].value.input.text + '\');" >' + optionsList[i].label + '</div></li>'
                    arrOptions.push({
                        text: optionsList[i].value.input.text,
                        label: optionsList[i].label
                    })
                }
            }
            list += '</ul>'
        } else if (preference === 'button') {
            list = '<br>'
            for (i = 0; i < optionsList.length; i++) {
                if (optionsList[i].value) {
                    var item = '<div class="options-button" onclick="ConversationPanel.sendMessage(\'' +
                        optionsList[i].value.input.text + '\');" >' + optionsList[i].label + '</div>'
                    list += item
                    arrOptions.push({
                        text: optionsList[i].value.input.text,
                        label: optionsList[i].label
                    })
                }
            }
        }
    }
    arrOptions.innerhtml = list
    return arrOptions
}

class Watson {

    createSession(req, res) {
        assistant.createSession({ assistantId: process.env.ASSISTANT_ID }, (err, resp) => {
            if (err) return res.send(err)

            const session = resp.result.session_id
            return res.json({ session })
        })
    }

    sendMessage(req, res) {
        if (req.body.message) {
            mongoUtils.asyncSaveMessage(req.body)
        }

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

            const message = buildMessageElements(data.result)
            return res.json(message)
        })
    }
}

module.exports = new Watson()