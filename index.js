const Alexa = require('ask-sdk-core');
const Util = require('./util.js');
const Escape = require('lodash/escape');

const _LOG = 'MEU-LOG: ';

const bichos = [
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

function getAvailableIndex(availableGuesses){
      return Math.floor(Math.random() * availableGuesses.length);
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        //session for the available animal guesses 
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.availableGuesses = bichos;
        
        const speakOutput = 'Bem vindo a qual o bicho, eu faço o som de um bicho e você tenta adivinhar qual é. Quer tentar ?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Posso fazer um som de bicho pra você. quer tentar?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Até logo!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Você tentou acionar ${intentName}`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Desculpa, Eu não consegui entender o que você disse. Por favor tente outra vez.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


// INICIO DO MEU CODIGO

const MakeSoundIntentHandler = {
    canHandle(handlerInput) {
         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
             && handlerInput.requestEnvelope.request.intent.name === 'MakeSoundIntent';
    },
    handle(handlerInput) {
        
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            
            let availableGuesses = sessionAttributes.availableGuesses;  
            
            let speechText;
            
            if(availableGuesses.length === 0){
                speechText = 'Desculpa, eu não tenho mais sons de bichos. Quer começar de novo? Ou quer sair do jogo?'
            }else{
    
            	//me da o indice de um dos bichos no array
                let index = getAvailableIndex(availableGuesses);
                //me da o bicho
                let currentAnimal = availableGuesses[index];
                //magica pra assinar a url que vai chamar o som armazenado no s3
                let currentAnimalURL = Util.getS3PreSignedUrl(currentAnimal.url);
                
                
                availableGuesses.splice(index,1);
                
                sessionAttributes.currentAnimal = currentAnimal;
                sessionAttributes.availableGuesses = availableGuesses;
                
                speechText = `Qual o bicho ? <audio src="${Escape(currentAnimalURL)}"/>  Agora você tem que dizer. é um, e o nome do bicho!`;
                
            }
            
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};


const TheGuessIntentHandler = {
    canHandle(handlerInput) {
         return handlerInput.requestEnvelope.request.type === 'IntentRequest'
             && handlerInput.requestEnvelope.request.intent.name === 'TheGuessIntent';
    },
    handle(handlerInput) {
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        //get the guessed animal that the user said
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

// FOM DO MEU CODIGO



// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        MakeSoundIntentHandler,
        TheGuessIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();