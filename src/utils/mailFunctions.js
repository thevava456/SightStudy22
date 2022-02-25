import { format, parseISO } from "date-fns";
import base64 from './base64';
import { getScore, getScoreLimit } from './dbFunctions';
import { getDoctorEmail } from './asyncFunctions';
import { SENDGRID_API_KEY } from './mailApiConfig' //This file is not on github for security reasons 

const CONFIG = {
    SENDGRIDURL: "https://api.sendgrid.com/v3/mail/send"
};

const fromEmail = "noreply.sightstudy@gmail.com";


export const formatDate = date => format(date, "dd/MM/yyyy");


export function showAlert(
    message,
    onPress,
    moreButtons = [],
    title = "Configuration de la tablette"
) {
    Alert.alert(title, message, [
        ...moreButtons,
        {
            text: "OK",
            onPress
        }
    ]);
}

function _buildCsvOne(scores) {
    let csvContent = "";
    if (scores.length > 0) {
        const propertyName = Object.getOwnPropertyNames(scores[0])
        csvContent += propertyName + '\r\n';
        scores.forEach(element => {
            for (const iterator of propertyName) {
                if (iterator === 'date_score') {
                    csvContent += parseISO(element[iterator])
                } else {
                    csvContent += element[iterator]
                }
                if (iterator !== propertyName[propertyName.length - 1]) {
                    csvContent += ','
                }
            }
            csvContent += '\r\n'
        });
    }
    return csvContent;
}

/**
 * 
 * @param {*} users 
 * @returns 
 */
export async function sendUserResults(users) {
    const scores = await getScore(users.id);
    const csvToSend = _buildCsvOne(scores);
    const emailMedecin = await getDoctorEmail();
    const body = 'Bonjour, \n Voici les résultats du patient ' + users.prenom + ' ' + users.nom;
    const fileName = users.prenom + users.nom + '.csv';
    const subject = "Résultats de " + users.prenom + ' ' + users.nom
    return sendGridEmail(emailMedecin, subject, body, csvToSend, fileName);
}

/*
 * Check if score is ok and send an email
 * if it's not sufficient
 * @param {number} userId
 */
export async function checkScoreAndSend(userId, nbLettres, lastScores = null) {
    // compare this score with old ones
    // 2 tests 3 erreurs -- 3 tests 4 erreurs
    lastScores = await getScoreLimit(userId, nbLettres);
    if (lastScores.length < 2) {
        return mailEnum.NOT_ENOUGH_RESULTS;
    }

    if (lastScores.length === 2) {
        const [last, first] = lastScores;
        const [leftDiff, rightDiff] = _compareTwoTests(last, first);
        if (leftDiff <= -3 || rightDiff <= -3) {
            await sendWarningEmail(userId);
            return mailEnum.INSUFFISCIENT;
        }
        return mailEnum.GOOD;
    }

    if (lastScores.length > 2) {
        const [last, second, first] = lastScores;
        let [leftDiff, rightDiff] = _compareTwoTests(last, first);
        if (leftDiff <= -4 || rightDiff <= -4) {
            // send mail
            await sendWarningEmail(userId);
            return mailEnum.INSUFFISCIENT;
        }
        [leftDiff, rightDiff] = _compareTwoTests(last, second);
        if (leftDiff <= -3 || rightDiff <= -3) {
            await sendWarningEmail();
            return mailEnum.INSUFFISCIENT;
        }
    }
    return mailEnum.GOOD;
}

/**
 * Comapare deux tests et retourne la différence pour chaque oeil
 * @param {Object} newTest nouvau test effectué
 * @param {Object} otherTest un test antérieur
 * @returns {Array} différence pour chaque oeil
 */
function _compareTwoTests(newTest, otherTest) {
    const leftDiff = newTest.oeil_gauche - otherTest.oeil_gauche;
    const rightDiff = newTest.oeil_droit - otherTest.oeil_droit;
    return [leftDiff, rightDiff];
}

export const mailEnum = {
    GOOD: 0,
    INSUFFISCIENT: 1,
    NOT_ENOUGH_RESULTS: 2
};


function sendGridEmail(to, subject, body, content, fileName) {
    return sendEmail(SENDGRID_API_KEY, to, fromEmail, subject, body, content, fileName);;
}

function sendEmail(key, to, from, subject, body, content, fileName) {
    return fetch(CONFIG.SENDGRIDURL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + key
        },
        body: JSON.stringify({
            "personalizations": [{
                "to": [{
                    "email": to
                }],
                "subject": subject
            }],
            "from": {
                "email": from
            },
            "content": [{
                "type": 'text/plain',
                "value": body
            }],
            "attachments": [{
                "content": base64.encode(content),
                "type": "text/csv",
                "filename": fileName
            }]
        }),
    }).then((response) => {
        if (response.status != 202) {
            return false
        }
        return true;
    }).catch((error) => {
        console.error(error);
        return false;
    });
}