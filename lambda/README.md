# Qual o Bicho ?



https://lab-workshop.s3-sa-east-1.amazonaws.com/animals/Cqp0aVd8-cow-1.mp3

https://lab-workshop.s3-sa-east-1.amazonaws.com/animals/SDteXbjE-lion.mp3

https://lab-workshop.s3-sa-east-1.amazonaws.com/animals/bZJAR9kZ-cat.mp3


10)

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Bem vindo a qual o bicho, eu faço o som de um bicho e você tenta adivinhar qual é, quer tentar ?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


11)

const HelpIntentHandler = {
const speakOutput = 'Posso fazer um som de bicho pra você. quer tentar?';
};

const CancelAndStopIntentHandler = {
      const speakOutput = 'Até logo!';
};


const IntentReflectorHandler = {
const speakOutput = `Você tentou acionar ${intentName}`;
};

const ErrorHandler = {
	const speakOutput = `Desculpa, Eu não consegui entender o que você disse. Por favor tente outra vez.`;
};


13)

const animals = [
    { 
        'name':"Leão",
        'article':'um',
        'url':"Media/animals/SDteXbjE-lion.mp3"
    },
    {
        'name':'gato',
        'article':'um',
        'url':'Media/animals/bZJAR9kZ-cat.mp3'
    },
    {
        'name':'vaca',
        'article':'uma',
        'url':'Media/animals/Cqp0aVd8-cow-1.mp3'
    }
];


14)

function getAvailableIndex(){
      return Math.floor(Math.random() * 2);
}


15)

const MakeSoundIntentHandler = {
    canHandle(handlerInput) {
         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
             && handlerInput.requestEnvelope.request.intent.name === 'MakeSoundIntent';
    },
    handle(handlerInput) {
        
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            //me da o indice de um dos bichos no array
            let index = getAvailableIndex();
            //me da o bicho
            let currentAnimal = animals[index];
            //magica pra assinar a url que vai chamar o som armazenado no s3
            let currentAnimalURL = Util.getS3PreSignedUrl(currentAnimal.url);
            
            sessionAttributes.currentAnimal = currentAnimal;
            
            let speechText = `Qual o bicho ? <audio src="${Escape(currentAnimalURL)}"/>  Agora você tem que dizer. é um, e o nome do bicho!`;
            
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


16)

const Util = require('util.js');
const Escape = require('./lodash/escape');
const _LOG = 'MEU-LOG: ';


17)

{
  "name": "qual o bicho",
  "version": "1.0.0",
  "description": "alexa utility for quickly building skills",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Amazon Alexa",
  "license": "ISC",
  "dependencies": {
    "ask-sdk-core": "^2.6.0",
    "ask-sdk-model": "^1.18.0",
    "aws-sdk": "^2.326.0",
    "lodash": "^4.17.11"
  }
}


18)

const TheGuessIntentHandler = {
    canHandle(handlerInput) {
         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
             && handlerInput.requestEnvelope.request.intent.name === 'TheGuessIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const guess = slots['guess'].value;
        let speechText = `Você disse ${guess}`;
        let currentAnimal = sessionAttributes.currentAnimal;
        if(currentAnimal.name.toLowerCase() === guess){
            speechText = `Você acertou! é ${currentAnimal.article} ${currentAnimal.name}, quer tentar de novo ?`;
        }else{
            speechText = `Você errou! é ${currentAnimal.article} ${currentAnimal.name}, quer tentar de novo ?`;
        }   
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

